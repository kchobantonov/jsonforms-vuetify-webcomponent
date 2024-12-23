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
        :style="{
          height: props.height ?? undefined,
          minHeight: props.minHeight ?? undefined,
        }"
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

  height?: number | string;
  minHeight?: number | string;

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

function onFocus() {
  editor.value?.focus();

  if (!isFocused.value) isFocused.value = true;
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

// Props
const props = defineProps<MonacoEditorProps>();

const { modelValue: _, ...inputProps } = VInput.filterProps(props);
const { ...fieldProps } = VField.filterProps(props);

const isPlainOrUnderlined = computed(() =>
  ['plain', 'underlined'].includes(props.variant),
);

// Emit
const emit = defineEmits([
  'update:modelValue',
  'focus',
  'blur',
  'click:control',
  'mousedown:control',
]);

const editor = shallowRef<monaco.editor.IStandaloneCodeEditor | undefined>(
  undefined,
);
const containerRef = ref<HTMLElement | null>(null);
const isActive = computed(
  () => props.persistentPlaceholder || isFocused.value || props.active,
);
const isFocused = ref(false);

// Use Vuetify theme
const vuetifyTheme = useTheme();

const model = ref(props.modelValue);

// Watch focused prop and focus the editor if needed
watch(
  () => props.focused,
  (newFocused) => {
    if (editor.value) {
      if (newFocused) {
        editor.value.focus();
      }
    }
  },
);

watch(
  () => props.modelValue,
  (value) => {
    model.value = value;
    if (editor.value && editor.value.getValue() !== model.value) {
      editor.value.setValue(model.value || '');
    }
  },
);

// Watch disabled and readonly props and update the editor's options if needed
watch(
  [() => props.disabled, () => props.readonly],
  ([newDisabled, newReadonly]) => {
    if (editor.value) {
      editor.value.updateOptions({
        readOnly: newDisabled || newReadonly || undefined,
      });
    }
  },
);

// Watch Vuetify theme and update Monaco Editor theme
watch(
  () => vuetifyTheme.current.value.dark,
  (isDark) => {
    if (editor.value) {
      const monacoTheme = isDark ? 'vs-dark' : 'vs';
      monaco.editor.setTheme(monacoTheme);
    }
  },
);

// Watch options prop and update the editor if there are changes
watch(
  () => props.options,
  (newOptions) => {
    if (editor.value) {
      const { value, language, readOnly, ...restOptions } = newOptions || {}; // Handle null or undefined
      // Apply only restOptions from props.options, excluding value, language, and readOnly
      editor.value.updateOptions({ ...restOptions });
    }
  },
);

watch(
  () => props.language,
  (language, prev) => {
    if (editor.value && language !== prev && language) {
      const model = editor.value.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  },
);

// Monaco Editor Setup
onMounted(() => {
  if (containerRef.value) {
    editor.value = monaco.editor.create(containerRef.value!, {
      ...(props.options ?? {}),
      value: model.value ?? undefined,
      language: props.language,
      readOnly: props.disabled || props.readonly || undefined,
      automaticLayout: true,
      theme: vuetifyTheme.current.value.dark ? 'vs-dark' : 'vs',
    });

    editor.value?.onDidChangeModelContent(() => {
      model.value = editor.value!.getValue();
      emit('update:modelValue', model.value);
    });

    editor.value?.onDidFocusEditorWidget(() => {
      isFocused.value = true;
      emit('focus');
    });

    editor.value?.onDidBlurEditorWidget(() => {
      isFocused.value = false;
      emit('blur');
    });

    if (props.initActions && props.initActions.length > 0) {
      nextTick(() => {
        if (props.initActions) {
          for (const action of props.initActions) {
            editor.value?.getAction(action)?.run();
          }
        }
      });
    }
  }
});

onBeforeUnmount(() => {
  editor.value?.dispose();
});
</script>

<script lang="ts">
import { Intersect } from 'vuetify/directives';

export default {
  directives: {
    intersect: Intersect,
  },
};
</script>

<style scoped>
.v-monaco-editor {
  position: relative;
}

.v-field__input {
  width: calc(100% - 28px);
  overflow: auto;
  resize: vertical;
}

.v-monaco-editor.v-monaco-editor--no-resize .v-field__input {
  resize: none;
}

/* Optional: Add styles for handles to show they are resizeable */
.v-monaco-editor:not(.v-monaco-editor--no-resize) > .v-field__input::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  cursor: ns-resize;
}
</style>
