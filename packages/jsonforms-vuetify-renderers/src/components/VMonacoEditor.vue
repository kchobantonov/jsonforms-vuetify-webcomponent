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
        'v-monaco-editor--no-resize': props.noResize,
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
      :style="{ '--v-monaco-editor-control-height': controlHeight }"
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
  type CSSProperties,
} from 'vue';
import { useTheme } from 'vuetify';
import { VField, VInput } from 'vuetify/components';

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
  'update:rows',
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

const sizerStyle = computed<CSSProperties>(() => ({
  position: 'absolute',
  visibility: 'hidden',
  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word',
  width: containerRef.value?.offsetWidth + 'px',
  fontFamily: getVuetifyFont(),
  fontSize: '14px',
  lineHeight: '20px',
}));

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
function calculateInputHeight() {
  if (!containerRef.value || !vFieldRef.value) return;

  nextTick(() => {
    const style = getComputedStyle(containerRef.value!);
    const fieldStyle = getComputedStyle(vFieldRef.value!.$el);

    const padding =
      parseFloat(style.getPropertyValue('--v-field-padding-top')) +
      parseFloat(style.getPropertyValue('--v-input-padding-top')) +
      parseFloat(style.getPropertyValue('--v-field-padding-bottom'));

    const lineHeight =
      editor.value?.getOption(monaco.editor.EditorOption.lineHeight) || 20;

    if (props.autoGrow) {
      // Auto-grow logic using actual line count
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

      const newHeight = clamp(contentHeight ?? 0, minHeight, maxHeight);
      controlHeight.value = convertToUnit(newHeight);
    } else {
      // Respect `rows` even when autoGrow is not set
      controlHeight.value = convertToUnit(
        parseFloat(String(rows.value)) * lineHeight + padding,
      );
    }

    editor.value?.layout();
  });
}

// Watchers
watch(
  () => props.modelValue,
  (val) => {
    model.value = val;
    if (editor.value && editor.value.getValue() !== val) {
      editor.value.setValue(val || '');
    }
    calculateInputHeight();
  },
);

watch(model, calculateInputHeight);
watch(() => props.rows, calculateInputHeight);
watch(() => props.maxRows, calculateInputHeight);

// Monaco setup
onMounted(() => {
  if (!containerRef.value) return;

  editor.value = monaco.editor.create(containerRef.value, {
    ...(props.options ?? {}),
    value: model.value ?? undefined,
    language: props.language,
    readOnly: props.disabled || props.readonly || undefined,
    automaticLayout: true,
    fontFamily: getVuetifyFont(),
    lineHeight: 20,
    minimap: { enabled: false },
    scrollbar: { vertical: 'auto', horizontal: 'auto' },
  });

  updateMonacoTheme();
  calculateInputHeight();

  editor.value.onDidChangeModelContent(() => {
    model.value = editor.value!.getValue();
    emit('update:modelValue', model.value);
    calculateInputHeight();
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

onBeforeUnmount(() => editor.value?.dispose());

// Monaco theme
function updateMonacoTheme() {
  if (!editor.value || !containerRef.value) return;

  const theme = vuetifyTheme.current.value;
  const isDark = theme.dark;
  const font = getVuetifyFont();

  monaco.editor.defineTheme(isDark ? 'vuetify-dark' : 'vuetify-light', {
    base: isDark ? 'vs-dark' : 'vs',
    inherit: true,
    rules: [],
    colors: {
      ...(theme.colors.surface && {
        'editor.background': theme.colors.surface,
      }),
      ...(theme.colors['on-surface'] && {
        'editor.foreground': theme.colors['on-surface'],
      }),
      ...(theme.colors.primary && {
        'editorCursor.foreground': theme.colors.primary,
      }),
      ...(theme.colors['surface-light'] && {
        'editor.lineHighlightBackground': theme.colors['surface-light'],
      }),
      ...(theme.colors['on-primary'] && {
        'editor.selectionForeground': theme.colors['on-primary'],
      }),
    },
  });

  editor.value.updateOptions({ fontFamily: font });
  monaco.editor.setTheme(isDark ? 'vuetify-dark' : 'vuetify-light');
}

watch(() => vuetifyTheme.current.value, updateMonacoTheme, { deep: true });
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
