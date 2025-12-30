<template>
  <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :isFocused="isFocused"
    :appliedOptions="appliedOptions"
  >
    <div
      :class="['monaco-wrapper', { 'monaco-wrapper--maximized': isMaximized }]"
    >
      <v-monaco-editor
        v-disabled-icon-focus
        :id="control.id + '-input'"
        :class="styles.control.input"
        :disabled="!control.enabled"
        :autofocus="appliedOptions.focus"
        :placeholder="appliedOptions.placeholder"
        :label="computedLabel"
        :hint="control.description"
        :persistent-hint="persistentHint()"
        :required="control.required"
        :error-messages="control.errors"
        :model-value="adaptModelToEditorValue(control.data)"
        v-bind="vuetifyProps('v-monaco-editor')"
        :language="language"
        @update:model-value="onChange"
        @focus="handleFocus"
        @blur="handleBlur"
      >
        <template #append-inner>
          <v-icon v-show="isFocused" @click="toggleMaximize">{{
            isMaximized
              ? icons.current.value.window_restore
              : icons.current.value.window_maximize
          }}</v-icon>
        </template>
      </v-monaco-editor>

      <!-- Fullscreen dialog -->
      <v-dialog v-model="isMaximized" fullscreen hide-overlay persistent>
        <v-card class="fill-height">
          <v-toolbar flat>
            <v-btn icon @click="isMaximized = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title>{{ computedLabel }}</v-toolbar-title>
          </v-toolbar>

          <v-card-text class="fill-height pa-0">
            <v-monaco-editor
              v-disabled-icon-focus
              :id="control.id + '-input'"
              :class="styles.control.input"
              :disabled="!control.enabled"
              :placeholder="appliedOptions.placeholder"
              :required="control.required"
              :error-messages="control.errors"
              :model-value="adaptModelToEditorValue(control.data)"
              v-bind="vuetifyProps('v-monaco-editor')"
              :language="language"
              @update:model-value="onChange"
              @focus="handleFocus"
              @blur="handleBlur"
              style="width: 100%; height: 100%"
            >
            </v-monaco-editor>
          </v-card-text>
        </v-card>
      </v-dialog>
    </div>
  </control-wrapper>
</template>

<script lang="ts">
import { useIcons } from '@/icons';
import { type ControlElement, Resolve } from '@jsonforms/core';
import {
  type RendererProps,
  rendererProps,
  useJsonFormsControl,
} from '@jsonforms/vue';
import {
  ControlWrapper,
  determineClearValue,
  DisabledIconFocus,
  useJsonForms,
  useVuetifyControl,
} from '@jsonforms/vue-vuetify';
import { defineComponent, ref, nextTick, watch } from 'vue';
import { computed } from 'vue';
import { defineAsyncComponent } from 'vue';
import {
  VBtn,
  VCard,
  VCardText,
  VDialog,
  VIcon,
  VToolbar,
  VToolbarTitle,
} from 'vuetify/components';

const VMonacoEditor = defineAsyncComponent(() =>
  import('../components/VMonacoEditor').then((m) => m.VMonacoEditor),
);

const controlRenderer = defineComponent({
  name: 'monaco-control-renderer',
  components: {
    ControlWrapper,
    VMonacoEditor,
    VCard,
    VDialog,
    VToolbar,
    VToolbarTitle,
    VBtn,
    VIcon,
    VCardText,
  },
  directives: { DisabledIconFocus },
  props: { ...rendererProps<ControlElement>() },
  setup(props: RendererProps<ControlElement>) {
    const jsonforms = useJsonForms();
    const isMaximized = ref(false);
    const editorRef = ref<any>(null);

    const clearValue = determineClearValue('');

    const control = useJsonFormsControl(props);
    const language = computed(() => {
      const langOption = control.control.value.uischema.options?.[':language'];
      if (langOption) {
        const rootData = jsonforms.core?.data;
        return Resolve.data(rootData, langOption);
      }
      return control.control.value.uischema.options?.language;
    });

    const convertJson = computed(
      () => control.control.value.uischema.options?.convertJson ?? false,
    );

    const adaptModelToEditorValue = (value: any): string => {
      if (language.value === 'json' && convertJson.value) {
        return value != undefined ? JSON.stringify(value, null, 2) : '';
      }

      if (value === undefined || value === null) {
        return '';
      }

      return typeof value === 'string' ? value : String(value);
    };

    const vuetifyControl = useVuetifyControl(control, (v) => v, 300);

    const onChange = (value: string) => {
      let model = value || clearValue;

      if (language.value === 'json' && convertJson.value) {
        try {
          model = JSON.parse(value);
        } catch {
          // do not update the model if JSON is invalid
          return;
        }
      }

      vuetifyControl.onChange(model);
    };

    const toggleMaximize = () => {
      isMaximized.value = !isMaximized.value;
      nextTick(() => {
        if (editorRef.value?.editor) editorRef.value.editor.layout();
      });
    };

    watch(isMaximized, () => {
      nextTick(() => {
        if (editorRef.value?.editor) editorRef.value.editor.layout();
      });
    });

    const icons = useIcons();

    return {
      ...vuetifyControl,
      onChange,
      jsonforms,
      icons,
      isMaximized,
      editorRef,
      toggleMaximize,
      language,
      adaptModelToEditorValue,
    };
  },
});

export default controlRenderer;
</script>

<style lang="scss" scoped>
.monaco-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;

  &--maximized {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    background: var(--v-surface);
    padding: 16px;

    .v-monaco-editor {
      height: 100% !important;
    }
  }

  // Align append-inner buttons to the right
  .v-input__append-inner {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
}
</style>
