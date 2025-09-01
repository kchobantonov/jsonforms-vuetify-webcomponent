<template>
  <VInput
    v-model="model"
    :class="[
      'v-monaco-editor v-text-field',
      {
        'v-monaco-editor--prefixed': props.prefix,
        'v-monaco-editor--suffixed': props.suffix,
        'v-text-field--prefixed': props.prefix,
        'v-text-field--suffixed': props.suffix,
        'v-monaco-editor--auto-grow': props.autoGrow,
        'v-monaco-editor--no-resize': props.noResize || props.autoGrow,
        'v-input--plain-underlined': isPlainOrUnderlined,
      },
      props.class,
    ]"
    :style="props.style"
    v-bind="{ ...rootAttrs, ...inputProps }"
    :centerAffix="rows === 1 && !isPlainOrUnderlined"
    :focused="isFocused"
  >
    <template
      #default="{ id, isDisabled, isDirty, isReadonly, isValid, hasDetails }"
    >
      <VField
        ref="vFieldRef"
        :style="{ '--v-monaco-editor-control-height': controlHeight }"
        @click="onControlClick"
        @mousedown="onControlMousedown"
        @click:clear="onClear"
        @click:prependInner="props['onClick:prependInner']"
        @click:appendInner="props['onClick:appendInner']"
        v-bind="fieldProps"
        :id="id.value"
        :active="isActive || isDirty.value"
        :centerAffix="rows === 1 && !isPlainOrUnderlined"
        :dirty="isDirty.value || props.dirty"
        :disabled="isDisabled.value"
        :focused="isFocused"
        :details="hasDetails.value"
        :error="isValid.value === false"
      >
        <template #default="{ props: { class: fieldClass, ...slotProps } }">
          <template v-if="props.prefix">
            <span class="v-text-field__prefix">{{ props.prefix }}</span>
          </template>

          <div
            ref="containerRef"
            :class="[fieldClass]"
            v-intersect="[{ handler: onIntersect }, null, ['once']]"
            role="textbox"
            aria-multiline="true"
            :aria-label="props.label || 'Code editor'"
            v-bind="{ ...slotProps, ...inputAttrs }"
          ></div>

          <template v-if="props.suffix">
            <span class="v-text-field__suffix">{{ props.suffix }}</span>
          </template>
        </template>
      </VField>
    </template>
    <template v-if="hasDetails" #details="slotProps">
      <slot name="details" v-bind="slotProps" />

      <template v-if="hasCounter">
        <span />

        <VCounter
          :active="props.persistentCounter || isFocused"
          :value="counterValue"
          :max="max"
          :disabled="props.disabled"
        >
          <template #default>
            <slot name="counter" />
          </template>
        </VCounter>
      </template>
    </template>
  </VInput>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor';
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  useAttrs,
  useSlots,
  watch,
  watchEffect,
} from 'vue';
import { useTheme } from 'vuetify';
import { VField, VInput } from 'vuetify/components';

import { callEvent, type VFieldProps, type VInputProps } from '../common';
import('../../util/monaco-setup');

interface MonacoEditorProps extends VInputProps, VFieldProps {
  autoGrow?: boolean;
  autofocus?: boolean;
  counter: boolean | number | string;
  counterValue?: (value: any) => number;
  prefix?: string;
  placeholder?: string;
  persistentPlaceholder?: boolean;
  persistentCounter?: boolean;
  noResize?: boolean;
  rows?: number | string;
  maxRows?: number | string;
  suffix?: string;
  modelValue: string | monaco.editor.ITextModel | null;
  language?: string;
  options?: Record<string, any>;
  initActions?: string[];
  useGlobalTheme?: boolean; // new flag: global theme vs CSS vars
}

function onIntersect(
  isIntersecting: boolean,
  _entries: IntersectionObserverEntry[],
) {
  if (!props.autofocus || !isIntersecting) return;
  onFocus();
}

// Props
const props = withDefaults(defineProps<MonacoEditorProps>(), {
  rows: 5,
  useGlobalTheme: false,
});
const attrs = useAttrs();
const slots = useSlots();
const emit = defineEmits([
  'update:modelValue',
  'focus',
  'blur',
  'click:control',
  'mousedown:control',
  'update:rows',
  'validation',
]);

function isMonacoModel(val: any): val is monaco.editor.ITextModel {
  return (
    val &&
    typeof val.getValue === 'function' &&
    typeof val.setValue === 'function'
  );
}

const model = useProxiedModel(props, 'modelValue');
const counterValue = computed(() => {
  return typeof props.counterValue === 'function'
    ? props.counterValue(
        isMonacoModel(model.value) ? model.value.getValue() : model.value,
      )
    : isMonacoModel(model.value)
      ? model.value.getValueLength()
      : (model.value || '').toString().length;
});
const max = computed(() => {
  if (attrs.maxlength) return attrs.maxlength as string | number;

  if (
    !props.counter ||
    (typeof props.counter !== 'number' && typeof props.counter !== 'string')
  )
    return undefined;

  return props.counter;
});

const hasCounter = computed(
  () => !!(slots.counter || props.counter || props.counterValue),
);
const hasDetails = computed(() => !!(hasCounter.value || slots.details));
const filteredAttrs = computed(() => filterInputAttrs(attrs));
const rootAttrs = computed(() => filteredAttrs.value[0]);
const inputAttrs = computed(() => filteredAttrs.value[1]);
const inputProps = computed(() => {
  const { modelValue: _, ...rest } = VInput.filterProps(props);
  return rest;
});
const fieldProps = computed(() => ({ ...VField.filterProps(props) }));

const editor = shallowRef<monaco.editor.IStandaloneCodeEditor | undefined>();
const vFieldRef = ref<InstanceType<typeof VField> | null>(null);
const controlHeight = shallowRef('');
const containerRef = ref<HTMLElement | null>(null);
const isActive = computed(
  () => props.persistentPlaceholder || isFocused.value || props.active,
);

function onFocus() {
  if (editor.value) {
    editor.value.focus();
    isFocused.value = true;
  }
}

function onControlClick(e: MouseEvent) {
  onFocus();
  emit('click:control', e);
}

function onControlMousedown(e: MouseEvent) {
  emit('mousedown:control', e);
  if (e.target === containerRef.value) return;
  onFocus();
  e.preventDefault();
}

function onClear(e: MouseEvent) {
  e.stopPropagation();
  onFocus();
  nextTick(() => {
    if (isMonacoModel(model.value)) {
      model.value.setValue('');
    } else {
      model.value = '';
    }
    callEvent(props['onClick:clear'], e);
  });
}

const isFocused = ref(false);
const rows = ref(Number(props.rows));

const isPlainOrUnderlined = computed(() =>
  ['plain', 'underlined'].includes(props.variant),
);
watchEffect(() => {
  if (!props.autoGrow) rows.value = Number(props.rows);
});

function calculateInputHeight(force = false) {
  if (!containerRef.value || (!props.autoGrow && !force)) return;

  nextTick(() => {
    const style = getComputedStyle(containerRef.value!);

    const padding =
      parseFloat(style.getPropertyValue('--v-field-padding-top')) +
      parseFloat(style.getPropertyValue('--v-input-padding-top')) +
      parseFloat(style.getPropertyValue('--v-field-padding-bottom'));

    const lineHeight =
      editor.value!.getOption(monaco.editor.EditorOption.lineHeight) || 20;

    let newHeight: number;

    if (props.autoGrow) {
      if (!vFieldRef.value) return;

      const fieldStyle = getComputedStyle(vFieldRef.value.$el);

      const lineCount = editor.value?.getModel()?.getLineCount() || 1;
      const minHeight = Math.max(
        parseFloat(props.rows as any) * lineHeight + padding,
        parseFloat(fieldStyle.getPropertyValue('--v-input-control-height')),
      );
      const maxHeight = props.maxRows
        ? parseFloat(props.maxRows as any) * lineHeight + padding
        : Infinity;
      const contentHeight = lineCount * lineHeight + padding;

      newHeight = clamp(contentHeight, minHeight, maxHeight);
      rows.value = Math.floor((newHeight - padding) / lineHeight);
    } else {
      newHeight = parseFloat(String(rows.value)) * lineHeight + padding;
    }

    controlHeight.value = convertToUnit(newHeight);
    if (editor.value) {
      const { height, width } = editor.value?.getLayoutInfo();
      if (newHeight - padding !== height) {
        editor.value.layout({ height: newHeight - padding, width });
      }
    }
  });
}

const vuetifyTheme = useTheme();

// selected theme based on the props.theme won't be able to change the mode (dark/light) dynamically
// but it will allow selecting a specific theme from Vuetify themes
// if props.theme is not set it will use the current theme from Vuetify
const selectedTheme = computed(() => {
  const themeName = props.theme;
  let theme = vuetifyTheme.current.value;

  if (themeName && vuetifyTheme.themes.value[themeName]) {
    const computedTheme = getLightDarkTheme(
      vuetifyTheme.current.value.dark,
      themeName,
      (themeName) => vuetifyTheme.themes.value[themeName] !== undefined,
    );
    theme = vuetifyTheme.themes.value[computedTheme];
    return { name: computedTheme, ...theme };
  } else {
    // Try to find a matching theme by reference
    const matchingEntry = Object.entries(vuetifyTheme.themes.value).find(
      ([, t]) => t === theme,
    );
    if (matchingEntry) {
      const [name] = matchingEntry;
      return { name, ...theme };
    }
  }

  // Fallback name
  const fallbackName = theme.dark ? 'dark' : 'light';
  return { name: fallbackName, ...theme };
});

const getParentStyle = () =>
  containerRef.value?.parentElement
    ? getComputedStyle(containerRef.value.parentElement)
    : undefined;

watch(model, () => {
  if (props.autoGrow) calculateInputHeight();
});
watch(
  () => model.externalValue,
  (newValue) => {
    if (isMonacoModel(newValue)) {
      if (editor.value?.getModel() !== newValue) {
        editor.value?.setModel(newValue);
      }
    } else {
      const stringValue = newValue ?? '';
      if (stringValue !== editor.value?.getValue()) {
        editor.value?.setValue(stringValue);
      }
    }
  },
);
watch(
  () => props.rows,
  () => calculateInputHeight(true),
);
watch(
  () => props.maxRows,
  () => calculateInputHeight(),
);
watch(
  () => props.density,
  () => calculateInputHeight(),
);
watch(rows, (val) => {
  emit('update:rows', val);
});

onBeforeUnmount(() => {
  if (!isMonacoModel(model.externalValue)) {
    // dispose the model only if it was created by this instance
    editor.value?.getModel()?.dispose();
  }
  editor.value?.dispose();
});

// Monaco setup
onMounted(() => {
  if (!containerRef.value) return;

  if (props.autofocus) {
    nextTick(() => onFocus());
  }

  const updateOptions = props.options ?? {};
  const parentStyle = getParentStyle();
  editor.value = monaco.editor.create(containerRef.value, {
    // default props
    fontFamily: updateOptions.fontFamily ?? parentStyle?.fontFamily,
    fontSize: updateOptions.fontFamily ?? parentStyle?.fontSize,
    lineHeight: updateOptions.lineHeight ?? parentStyle?.lineHeight,
    letterSpacing: updateOptions.letterSpacing ?? parentStyle?.letterSpacing,
    minimap: { enabled: false },
    scrollbar: { vertical: 'auto', horizontal: 'auto' },
    ...updateOptions,
    // props that should not be updated by options
    useShadowDOM: true,
    value: !isMonacoModel(model.value) ? (model.value ?? undefined) : undefined,
    model: isMonacoModel(model.value) ? model.value : undefined,
    language: props.language,
    readOnly: props.disabled || props.readonly || undefined,
    automaticLayout: true,
    fixedOverflowWidgets: false,
    theme: props.useGlobalTheme
      ? selectedTheme.value.name
      : selectedTheme.value.dark
        ? 'vs-dark'
        : 'vs',
    extraEditorClassName: `v-monaco-theme-${selectedTheme.value.name}`,
  });

  calculateInputHeight(true);

  setupValidationListener(editor.value);

  editor.value.onDidChangeModelContent(() => {
    if (isMonacoModel(model.value)) {
      model.value = editor.value!.getModel();
    } else {
      model.value = editor.value!.getValue();
    }
  });

  editor.value.onDidFocusEditorWidget(() => {
    isFocused.value = true;
    emit('focus');
  });

  editor.value.onDidBlurEditorWidget(() => {
    isFocused.value = false;
    emit('blur');
  });

  if (props.initActions?.length) {
    nextTick(() => {
      if (props.initActions) {
        for (const action of props.initActions) {
          editor.value?.getAction(action)?.run();
        }
      }
    });
  }

  const vm = getCurrentInstance();
  setupVuetifyMonacoThemes(vm?.proxy?.$el.getRootNode());
});

function setupVuetifyMonacoThemes(rootNode?: Element) {
  const createStyleElement = () => {
    const shadowRoot = rootNode instanceof ShadowRoot ? rootNode : null;
    const styleId = 'v-monaco-editor-colors';

    let styleEl: HTMLStyleElement | null = null;

    if (shadowRoot) {
      styleEl = shadowRoot.querySelector<HTMLStyleElement>(`#${styleId}`);
    } else {
      styleEl = document.querySelector<HTMLStyleElement>(`#${styleId}`);
    }

    if (!(styleEl instanceof HTMLStyleElement)) {
      styleEl = document.createElement('style');
      styleEl.type = 'text/css';
      styleEl.id = styleId;

      if (shadowRoot) {
        shadowRoot.appendChild(styleEl);
      } else {
        document.head.appendChild(styleEl);
      }
    }

    return styleEl;
  };

  const defineAllThemes = () => {
    const themes: Record<string, monaco.editor.IStandaloneThemeData> = {};

    Object.entries(vuetifyTheme.themes.value).forEach(
      ([themeName, themeObj]) => {
        const monacoTheme = createMonacoThemeFromVuetify(
          themeObj.colors,
          themeObj.dark,
        );
        themes[themeName] = monacoTheme;
      },
    );

    if (props.useGlobalTheme) {
      // https://github.com/Microsoft/monaco-editor/issues/338 - themes are global and will affect all editor instances on the page
      // Global theme approach - works with Shadow DOM
      Object.entries(themes).forEach(([themeName, monacoTheme]) =>
        monaco.editor.defineTheme(themeName, monacoTheme),
      );
    } else {
      // CSS variables approach - need to inject into shadow DOM if it exists
      const styleEl: HTMLStyleElement = createStyleElement();
      let css = '';

      Object.entries(themes).forEach(([themeName, monacoTheme]) => {
        if (themeName === 'light' || themeName === 'dark') {
          // Skip base themes
          return;
        }
        const cssVars = monacoThemeToCssVars(monacoTheme);

        css += `
        .monaco-editor.v-monaco-theme-${themeName},
        .monaco-diff-editor.v-monaco-theme-${themeName},
        .monaco-component.v-monaco-theme-${themeName} {
          ${Object.entries(cssVars)
            .map(([key, value]) => `${key}: ${value};`)
            .join('\n')}
        }
        `;
      });

      styleEl.innerHTML = css;
    }
  };

  // Initial theme setup
  if (props.useGlobalTheme || !props.options?.useShadowDOM) {
    defineAllThemes();
  } else {
    nextTick(() => setTimeout(defineAllThemes, 100));
  }

  // Watch for changes in Vuetify themes
  watch(
    () => vuetifyTheme.themes.value,
    () => {
      if (props.useGlobalTheme || !props.options?.useShadowDOM) {
        defineAllThemes();
      } else {
        setTimeout(defineAllThemes, 50);
      }
    },
    { deep: true },
  );
}

/**
 * Create a Monaco theme from Vuetify theme colors
 * Includes editor, gutter, widgets, scrollbars, minimap, command palette, etc.
 */
function createMonacoThemeFromVuetify(
  vuetifyColors: Record<string, string>,
  dark = false,
): monaco.editor.IStandaloneThemeData {
  const colors: Record<string, string> = {};

  const mapping: Record<string, string | undefined> = {
    // Editor text and background
    'editor.background': vuetifyColors.surface,
    'editor.foreground': vuetifyColors['on-surface'],
    'editor.lineHighlightBackground': vuetifyColors['surface-light'],
    'editor.lineHighlightBorder': vuetifyColors['surface-bright'],

    // Line numbers
    'editorLineNumber.foreground': vuetifyColors['on-surface-variant'],
    'editorLineNumber.activeForeground': vuetifyColors.primary,

    // Cursor & selection
    'editorCursor.foreground': vuetifyColors.primary,
    'editor.selectionBackground': vuetifyColors.primary + '33',
    'editor.selectionHighlightBackground': vuetifyColors.primary + '22',

    // Editor gutter (breakpoints, modified lines)
    'editorGutter.background': vuetifyColors['surface-light'],
    'editorGutter.modifiedBackground': vuetifyColors.secondary,
    'editorGutter.addedBackground': vuetifyColors.primary,
    'editorGutter.deletedBackground': vuetifyColors.error,

    // Editor widgets (command palette, hover, suggestions)
    'editorWidget.background': vuetifyColors['surface-light'],
    'editorWidget.border': vuetifyColors['surface-bright'],
    'editorSuggestWidget.background': vuetifyColors.surface,
    'editorSuggestWidget.border': vuetifyColors['surface-bright'],
    'editorSuggestWidget.selectedBackground': vuetifyColors['surface-light'],
    'editorHoverWidget.background': vuetifyColors.surface,
    'editorHoverWidget.border': vuetifyColors['surface-bright'],

    // Scrollbar
    'scrollbarSlider.background': vuetifyColors['surface-light'],
    'scrollbarSlider.hoverBackground': vuetifyColors['surface-bright'],
    'scrollbarSlider.activeBackground': vuetifyColors.primary,

    // Minimap
    'minimap.background': vuetifyColors.surface,
    'minimap.selectionHighlight': vuetifyColors.primary + '33',
    'minimap.findMatchHighlight': vuetifyColors.primary + '22',
    'minimapSlider.background': vuetifyColors['surface-light'],
    'minimapSlider.hoverBackground': vuetifyColors['surface-bright'],
    'minimapSlider.activeBackground': vuetifyColors.primary,

    // Overview ruler (error/warning markers)
    'editorOverviewRuler.border': vuetifyColors['surface-bright'],
    'editorOverviewRuler.errorForeground': vuetifyColors.error,
    'editorOverviewRuler.warningForeground': vuetifyColors.warning,
    'editorOverviewRuler.infoForeground': vuetifyColors.info,

    // Other UI (context menu, menu selections)
    'menu.background': vuetifyColors.surface,
    'menu.selectionBackground': vuetifyColors['surface-light'],
    'menu.selectionForeground': vuetifyColors['on-surface'],
  };

  // Only include defined colors
  Object.entries(mapping).forEach(([key, value]) => {
    if (value !== undefined) colors[key] = value;
  });

  return {
    base: dark ? 'vs-dark' : 'vs',
    inherit: true,
    rules: [],
    colors,
  };
}

function monacoThemeToCssVars(theme: monaco.editor.IStandaloneThemeData) {
  const cssVars: Record<string, string> = {};
  Object.entries(theme.colors ?? {}).forEach(([key, value]) => {
    if (!value) return;
    const cssVar = `--vscode-${key.replace(/\./g, '-')}`;
    cssVars[cssVar] = value!;
  });
  return cssVars;
}

// Watch for language changes
watch(
  () => props.language,
  (language) => {
    if (editor.value && language) {
      const model = editor.value.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  },
);

watch(
  () => props.readonly ?? props.disabled,
  (ro) => {
    if (editor.value) {
      editor.value.updateOptions({ readOnly: !!ro });
    }
  },
);

watch(
  () => selectedTheme.value.name,
  () => {
    const theme = props.useGlobalTheme
      ? selectedTheme.value.name
      : selectedTheme.value.dark
        ? 'vs-dark'
        : 'vs';
    editor.value?.updateOptions({
      theme: theme,
      extraEditorClassName: `v-monaco-theme-${selectedTheme.value.name}`,
    });
  },
);

watch(
  () => props.options,
  (options) => {
    if (!editor.value || !options) return;

    const {
      value,
      model,
      language,
      readOnly,
      automaticLayout,
      fixedOverflowWidgets,
      theme,
      useShadowDOM,
      extraEditorClassName,
      ...updatedOptions
    } = options;
    if (Object.keys(updatedOptions).length) {
      editor.value.updateOptions({ ...updatedOptions });
    }
  },
  { deep: true },
);

// setup validation listeners
function setupValidationListener(editor: monaco.editor.IStandaloneCodeEditor) {
  const disposable = monaco.editor.onDidChangeMarkers((uris) => {
    const model = editor.getModel();
    if (!model) return;

    if (!uris.find((uri) => uri.toString() === model.uri.toString())) return;

    const markers = monaco.editor.getModelMarkers({ resource: model.uri });
    const errors = markers.map((m) => ({
      severity: m.severity,
      message: m.message,
      startLineNumber: m.startLineNumber,
      startColumn: m.startColumn,
      endLineNumber: m.endLineNumber,
      endColumn: m.endColumn,
    }));

    emit('validation', errors);
  });

  onBeforeUnmount(() => {
    disposable.dispose();
  });
}
</script>

<script lang="ts">
import { getLightDarkTheme } from '@/util';
import { Intersect } from 'vuetify/directives';
import { useProxiedModel } from 'vuetify/lib/composables/proxiedModel.mjs';
import {
  clamp,
  convertToUnit,
  filterInputAttrs,
} from 'vuetify/lib/util/helpers.mjs';
import './VMonacoEditor.sass';

export default { directives: { intersect: Intersect } };
</script>
