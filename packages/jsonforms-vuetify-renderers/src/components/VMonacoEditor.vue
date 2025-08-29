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
    :style="style"
    v-bind="inputProps"
    :focused="isFocused"
    #default="{ id, isDisabled, isDirty, isValid }"
  >
    <VField
      ref="vFieldRef"
      :style="{ '--v-monaco-editor-control-height': controlHeight }"
      :onClick="onControlClick"
      :onMousedown="onControlMousedown"
      :onClick:clear="onClear"
      :onClick:prependInner="props['onClick:prependInner']"
      :onClick:appendInner="props['onClick:appendInner']"
      v-bind="fieldProps"
      :id="id.value"
      :active="isActive || isDirty.value"
      :dirty="isDirty.value || props.dirty"
      :disabled="isDisabled.value"
      :focused="isFocused"
      :error="isValid.value === false"
      :loading="props.loading"
      #default="{ props: { class: fieldClass } }"
    >
      <span v-if="props.prefix" class="v-text-field__prefix">
        {{ props.prefix }}
      </span>

      <div
        ref="containerRef"
        :class="[fieldClass]"
        :style="{ height: controlHeight }"
        v-intersect="[{ handler: onIntersect }, null, ['once']]"
        role="textbox"
        aria-multiline="true"
        :aria-label="props.label || 'Code editor'"
      ></div>

      <span v-if="props.suffix" class="v-text-field__suffix">
        {{ props.suffix }}
      </span>
    </VField>
  </VInput>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  watch,
} from 'vue';
import { useTheme } from 'vuetify';
import { VField, VInput } from 'vuetify/components';
import debounce from 'lodash/debounce';

import { callEvent, type VFieldProps, type VInputProps } from './common';
import('../util/monaco-setup');

interface MonacoEditorProps extends VInputProps, VFieldProps {
  autofocus?: boolean;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  persistentPlaceholder?: boolean;
  noResize?: boolean;

  autoGrow?: boolean;
  rows?: number | string;
  maxRows?: number | string;

  modelValue: string | null;
  language?: string;
  options?: Record<string, any>;
  initActions?: string[];
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
});

function toNumber(
  val: number | string | undefined,
  fallback: number | string | undefined,
) {
  const n = parseFloat(val as any);
  return isNaN(n) ? fallback : n;
}

const rows = computed(() => toNumber(props.rows, 5)!);
const maxRows = computed(() => toNumber(props.maxRows, undefined));

const { modelValue: _, ...inputProps } = VInput.filterProps(props);
const { ...fieldProps } = VField.filterProps(props);

const emit = defineEmits([
  'update:modelValue',
  'focus',
  'blur',
  'click:control',
  'mousedown:control',
  'validation',
]);

const editor = shallowRef<monaco.editor.IStandaloneCodeEditor | undefined>();
const containerRef = ref<HTMLElement | null>(null);
const vFieldRef = ref<InstanceType<typeof VField> | null>(null);

const isFocused = ref(false);
const model = ref(props.modelValue);
const controlHeight = ref('');
const isPlainOrUnderlined = computed(() =>
  ['plain', 'underlined'].includes(props.variant),
);

const isActive = computed(
  () => props.persistentPlaceholder || isFocused.value || props.active,
);

const vuetifyTheme = useTheme();
const getVuetifyFont = () =>
  containerRef.value?.parentElement
    ? getComputedStyle(containerRef.value.parentElement).fontFamily
    : 'Roboto, sans-serif';

// Focus / Control handlers
function onFocus() {
  if (editor.value) {
    editor.value.focus();
    isFocused.value = true;
  }
}

function onControlMousedown(e: MouseEvent) {
  emit('mousedown:control', e);
  if (e.target === containerRef.value) return;
  onFocus();
  e.preventDefault();
}

function onControlClick(e: MouseEvent) {
  onFocus();
  emit('click:control', e);
}

function onClear(e: MouseEvent) {
  e.stopPropagation();
  onFocus();
  nextTick(() => {
    model.value = null;
    if (editor.value && editor.value.getValue() !== model.value) {
      editor.value.setValue(model.value || '');
      emit('update:modelValue', model.value);
    }
    callEvent(props['onClick:clear'], e);
  });
}

// Auto-grow using sizer
function calculateInputHeightImpl(force = false) {
  if (!containerRef.value || !vFieldRef.value || (!props.autoGrow && !force))
    return;

  nextTick(() => {
    const style = getComputedStyle(containerRef.value!);
    const fieldStyle = getComputedStyle(vFieldRef.value!.$el);

    const padding =
      parseFloat(style.getPropertyValue('--v-field-padding-top')) +
      parseFloat(style.getPropertyValue('--v-input-padding-top')) +
      parseFloat(style.getPropertyValue('--v-field-padding-bottom'));

    const lineHeight =
      editor.value?.getOption(monaco.editor.EditorOption.lineHeight) || 20;

    let newHeight: number;

    if (props.autoGrow) {
      const lineCount = editor.value?.getModel()?.getLineCount() || 1;
      const minHeight = Math.max(
        parseFloat(String(rows.value)) * lineHeight + padding,
        parseFloat(fieldStyle.getPropertyValue('--v-input-control-height')),
      );
      const maxHeight =
        (maxRows.value
          ? parseFloat(maxRows.value as string) * lineHeight + padding
          : Infinity) || Infinity;
      const contentHeight = lineCount * lineHeight + padding;

      newHeight = clamp(contentHeight, minHeight, maxHeight);
    } else if (force) {
      newHeight = parseFloat(String(rows.value)) * lineHeight + padding;
    } else {
      return;
    }

    if (convertToUnit(newHeight) === controlHeight.value) return; // bail if no change
    controlHeight.value = convertToUnit(newHeight);
    editor.value?.layout();
  });
}

const calculateInputHeight = debounce(calculateInputHeightImpl, 100);

// Watchers
watch(
  () => props.modelValue,
  (val) => {
    model.value = val;
    if (editor.value && editor.value.getValue() !== val) {
      editor.value.setValue(val || '');
    }
    if (props.autoGrow) calculateInputHeight();
  },
);

watch(
  () => props.rows,
  () => {
    if (!props.autoGrow) calculateInputHeight(true); // reset if rows changes
  },
);
watch(
  () => props.maxRows,
  () => {
    if (props.autoGrow) calculateInputHeight();
  },
);

function onManualResize() {
  if (!containerRef.value) return;
  controlHeight.value = convertToUnit(containerRef.value.offsetHeight);
}

let resizeObserver: ResizeObserver | undefined;
watch(containerRef, (val) => {
  if (val) {
    resizeObserver = new ResizeObserver(onManualResize);
    resizeObserver.observe(containerRef.value!);
  } else {
    resizeObserver?.disconnect();
  }
});

// Monaco setup
onMounted(() => {
  if (!containerRef.value) return;

  if (props.autofocus) {
    nextTick(() => onFocus());
  }

  const updateOptions = props.options ?? {};
  editor.value = monaco.editor.create(containerRef.value, {
    // default props
    fontFamily: updateOptions.fontFamily ?? getVuetifyFont(),
    lineHeight: 20,
    minimap: { enabled: false },
    scrollbar: { vertical: 'auto', horizontal: 'auto' },
    ...updateOptions,
    // props that should not be updated by options
    value: model.value ?? undefined,
    language: props.language,
    readOnly: props.disabled || props.readonly || undefined,
    automaticLayout: true,
    fixedOverflowWidgets: true,
  });

  updateMonacoTheme();
  calculateInputHeight(true); // initial height
  setupValidationListener(editor.value);

  editor.value.onDidChangeModelContent(() => {
    model.value = editor.value!.getValue();
    emit('update:modelValue', model.value);
    if (props.autoGrow) {
      requestAnimationFrame(() => {
        calculateInputHeightImpl(); // no debounce here
      });
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
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();

  if (editor.value) {
    const model = editor.value.getModel();
    model?.dispose();
    editor.value.dispose();
  }
});

// Monaco theme
function updateMonacoTheme() {
  if (!editor.value || !containerRef.value) return;

  const themeName = props.theme;
  const theme =
    themeName && vuetifyTheme.themes.value[themeName]
      ? vuetifyTheme.themes.value[themeName]
      : vuetifyTheme.current.value;

  const monacoContainer =
    containerRef.value.querySelector<HTMLElement>('.monaco-editor');
  if (!monacoContainer) return;

  const isCustomTheme =
    theme !== vuetifyTheme.themes.value.light &&
    theme !== vuetifyTheme.themes.value.dark;

  if (isCustomTheme) {
    const cssVars: Record<string, string> = {};

    // Backgrounds
    if (theme.colors.surface) {
      cssVars['--vscode-editor-background'] = theme.colors.surface;
      cssVars['--vscode-menu-background'] = theme.colors.surface;
      cssVars['--vscode-editorWidget-background'] =
        theme.colors['surface-light'] ?? theme.colors.surface;
      cssVars['--vscode-editorGutter-background'] =
        theme.colors['surface-variant'] ?? theme.colors.surface;
      cssVars['--vscode-minimapSlider-background'] =
        theme.colors['surface-light'] ?? theme.colors.surface;
      cssVars['--vscode-editorLineHighlight-background'] =
        theme.colors['surface-light'] ?? theme.colors.surface;
      cssVars['--vscode-scrollbarSlider-background'] =
        theme.colors['surface-light'] ?? theme.colors.surface;
      cssVars['--vscode-scrollbarSlider-hoverBackground'] =
        theme.colors['surface-bright'] ?? theme.colors.surface;
      cssVars['--vscode-scrollbarSlider-activeBackground'] =
        theme.colors.primary ?? theme.colors.surface;
    }

    // Foregrounds / text
    if (theme.colors['on-surface']) {
      cssVars['--vscode-editor-foreground'] = theme.colors['on-surface'];
      cssVars['--vscode-menu-foreground'] = theme.colors['on-surface'];
      cssVars['--vscode-editorWidget-foreground'] = theme.colors['on-surface'];
      cssVars['--vscode-editorLineNumber-foreground'] =
        theme.colors['on-surface-variant'] ?? theme.colors['on-surface'];
    }

    if (theme.colors.primary) {
      cssVars['--vscode-editorCursor-foreground'] = theme.colors.primary;
      cssVars['--vscode-editorLineNumber-activeForeground'] =
        theme.colors.primary;
      cssVars['--vscode-scrollbarSlider-activeBackground'] =
        theme.colors.primary;
    }

    if (theme.colors['on-primary']) {
      cssVars['--vscode-editor-selectionForeground'] =
        theme.colors['on-primary'];
    }

    if (theme.colors.primary) {
      // Example selection background with transparency
      cssVars['--vscode-editor-selectionBackground'] =
        theme.colors.primary + '33'; // 20% opacity
    }

    // Apply CSS variables
    Object.entries(cssVars).forEach(([key, value]) => {
      monacoContainer.style.setProperty(key, value);
    });
  } else {
    // Remove previously set variables when reverting to base theme
    [
      '--vscode-editor-background',
      '--vscode-menu-background',
      '--vscode-editorWidget-background',
      '--vscode-editorGutter-background',
      '--vscode-minimapSlider-background',
      '--vscode-editorLineHighlight-background',
      '--vscode-scrollbarSlider-background',
      '--vscode-scrollbarSlider-hoverBackground',
      '--vscode-scrollbarSlider-activeBackground',
      '--vscode-editor-foreground',
      '--vscode-menu-foreground',
      '--vscode-editorWidget-foreground',
      '--vscode-editorLineNumber-foreground',
      '--vscode-editorLineNumber-activeForeground',
      '--vscode-editorCursor-foreground',
      '--vscode-editor-selectionForeground',
      '--vscode-editor-selectionBackground',
    ].forEach((key) => monacoContainer.style.removeProperty(key));
  }

  // Update Monaco base theme (vs / vs-dark)
  editor.value.updateOptions({
    fontFamily: (props.options ?? {}).fontFamily ?? getVuetifyFont(),
    theme: theme.dark ? 'vs-dark' : 'vs',
  });
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

watch(() => vuetifyTheme.current.value, updateMonacoTheme, { deep: true });
watch(() => props.theme, updateMonacoTheme);
watch(
  () => props.options,
  (options) => {
    if (!editor.value || !options) return;

    const { value, language, readOnly, automaticLayout, ...updatedOptions } =
      options;

    if (Object.keys(updatedOptions).length) {
      editor.value.updateOptions({ ...updatedOptions });
    }
  },
  { deep: true },
);

// setup validation listeners
function setupValidationListener(editor: monaco.editor.IStandaloneCodeEditor) {
  const model = editor.getModel();
  if (!model) return;

  // Listen for marker changes for this model
  const disposable = monaco.editor.onDidChangeMarkers((uris) => {
    if (!uris.find((uri) => uri.toString() === model.uri.toString())) return;

    // Get markers for this model
    const markers = monaco.editor.getModelMarkers({ resource: model.uri });

    // Map to a simple structure
    const errors = markers.map((m) => ({
      severity: m.severity, // monaco.MarkerSeverity.Error / Warning / Info
      message: m.message,
      startLineNumber: m.startLineNumber,
      startColumn: m.startColumn,
      endLineNumber: m.endLineNumber,
      endColumn: m.endColumn,
    }));

    // Emit a custom event
    emit('validation', errors);
  });

  onBeforeUnmount(() => {
    disposable.dispose();
  });
}
</script>

<script lang="ts">
import { Intersect } from 'vuetify/directives';
import { clamp, convertToUnit } from 'vuetify/lib/util/helpers.mjs';
export default { directives: { intersect: Intersect } };
</script>

<style scoped>
.v-monaco-editor {
  position: relative;
}

.v-field__input {
  width: calc(100% - 28px);
  overflow: auto;
  resize: vertical;
  background-color: var(--v-theme-surface);
  color: var(--v-theme-on-surface);
  font-family: inherit;
}

.v-monaco-editor.v-monaco-editor--no-resize .v-field__input {
  resize: none;
}
</style>
