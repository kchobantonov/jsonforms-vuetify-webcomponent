<script setup lang="ts">
import type { JsonFormsChangeEvent } from '@jsonforms/vue';
import type { ErrorObject } from 'ajv';
import cloneDeep from 'lodash/cloneDeep';
import find from 'lodash/find';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {
  markRaw,
  onMounted,
  provide,
  reactive,
  ref,
  shallowRef,
  watch,
  type Reactive,
  type ShallowRef,
} from 'vue';
import {
  ValidationIcon,
  defaultStyles,
  mergeStyles,
} from '@jsonforms/vue-vuetify';
import MonacoEditor from '../components/MonacoEditor.vue';
import {
  configureDataValidation,
  configureJsonSchemaValidation,
  configureUISchemaValidation,
  getMonacoModelForUri,
} from '../core/jsonSchemaValidation';
import type { MonacoApi } from '../core/monaco';
import { examples } from '../examples';
import { useAppStore } from '../store';
import {
  createTranslator,
  ResolvedJsonForms,
  type JsonFormsProps,
  TemplateComponentsKey,
  FormContextKey,
  type ActionEvent,
} from '@chobantonov/jsonforms-vuetify-renderers';
import type { ExampleDescription } from '@/core/types';
import VuetifyJsonFormsWrapper from '../components/VuetifyJsonFormsWrapper.vue';

// dynamically import renderers so vite vue will not do tree shaking and removing the renderer functions from our components in production mode
const { extendedVuetifyRenderers } = await import('@jsonforms/vue-vuetify');

// dynamically import renderers so vite vue will not do tree shaking and removing the renderer functions from our components in production mode
const { extraVuetifyRenderers } = await import(
  '@chobantonov/jsonforms-vuetify-renderers'
);

const vuetifyRenderers = [
  ...extendedVuetifyRenderers,
  ...extraVuetifyRenderers,
];

const props = defineProps<{
  example: ExampleDescription;
}>();

const appStore = useAppStore();

const myStyles = mergeStyles(defaultStyles, {
  control: { root: 'my-control' },
});

provide('styles', myStyles);

const activeTab = ref(0);
const errors = ref<
  ErrorObject<string, Record<string, any>, unknown>[] | undefined
>(undefined);
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarTimeout = ref(3000);

const renderers = markRaw(vuetifyRenderers);

const schemaModel = shallowRef<monaco.editor.ITextModel | undefined>(undefined);
const uischemaModel = shallowRef<monaco.editor.ITextModel | undefined>(
  undefined,
);
const uischemasModel = shallowRef<monaco.editor.ITextModel | undefined>(
  undefined,
);
const dataModel = shallowRef<monaco.editor.ITextModel | undefined>(undefined);
const i18nModel = shallowRef<monaco.editor.ITextModel | undefined>(undefined);

provide(TemplateComponentsKey, { MonacoEditor });
provide(
  FormContextKey,
  ref({
    appStore: appStore,
    getMonacoDataModel: () => dataModel.value,
  }),
);

const initialState = (exampleProp: ExampleDescription): JsonFormsProps => {
  const example = cloneDeep(exampleProp);

  return {
    data: example.input.data,
    schema: example.input.schema,
    uischema: example.input.uischema,
    renderers: renderers,
    cells: undefined, // not defined
    config: appStore.jsonforms.config,
    readonly: appStore.jsonforms.readonly,
    uischemas: example.input.uischemas,
    validationMode: appStore.jsonforms.validationMode,
    i18n: {
      locale: appStore.jsonforms.locale,
      translate: createTranslator(
        appStore.jsonforms.locale,
        example.input.i18n,
      ),
      translations: example.input.i18n,
    },
    additionalErrors: undefined,
    middleware: undefined,
  };
};

const reloadState = (state: Reactive<JsonFormsProps>): JsonFormsProps => {
  return {
    data: state.data,
    schema: state.schema,
    uischema: state.uischema,
    renderers: renderers,
    cells: undefined, // not defined
    config: appStore.jsonforms.config,
    readonly: appStore.jsonforms.readonly,
    uischemas: state.uischemas,
    validationMode: appStore.jsonforms.validationMode,
    i18n: {
      locale: appStore.jsonforms.locale,
      translate: createTranslator(
        appStore.jsonforms.locale,
        state.i18n?.translations,
      ),
      translations: state.i18n?.translations,
    },
    additionalErrors: undefined,
    middleware: undefined,
  };
};

const state = reactive<JsonFormsProps>(initialState(props.example));

const onChange = (event: JsonFormsChangeEvent): void => {
  if (props.example.name) {
    dataModel.value = getMonacoModelForUri(
      monaco.Uri.parse(toDataUri(props.example.name)),
      event.data ? JSON.stringify(event.data, null, 2) : '',
    );
  }
  errors.value = event.errors;
};

const onHandleAction = (event: ActionEvent): void => {
  if (props.example.input.onHandleAction) {
    props.example.input.onHandleAction(event);
  }
};

const onWebComponentChange = (customEvent: CustomEvent): void => {
  const details = customEvent.detail as any[];
  if (details && details.length > 0) {
    const event: JsonFormsChangeEvent = details[0];

    onChange(event);
  }
};

const onWebComponentHandleAction = (customEvent: CustomEvent): void => {
  const details = customEvent.detail as any[];
  if (details && details.length > 0) {
    const event: ActionEvent = details[0];

    onHandleAction(event);
  }
};

const reloadMonacoSchema = () => {
  const example = find(
    examples,
    (example) => example.name === appStore.exampleName,
  );

  if (example) {
    schemaModel.value = getMonacoModelForUri(
      monaco.Uri.parse(toSchemaUri(example.name)),
      example.input.schema ? JSON.stringify(example.input.schema, null, 2) : '',
    );
    toast('Original example schema loaded. Apply it to take effect.');
  }
};

const saveMonacoSchema = () => {
  saveMonacoModel(
    schemaModel,
    (modelValue) => (state.schema = JSON.parse(modelValue)),
    'New schema applied',
  );

  if (state.schema) {
    configureDataValidation(
      monaco,
      `inmemory://${toSchemaUri(props.example.name)}`,
      toDataUri(props.example.name),
      cloneDeep(state.schema),
    );
  }
};

const reloadMonacoUiSchema = () => {
  const example = find(
    examples,
    (example) => example.name === appStore.exampleName,
  );

  if (example) {
    uischemaModel.value = getMonacoModelForUri(
      monaco.Uri.parse(toUiSchemaUri(example.name)),
      example.input.uischema
        ? JSON.stringify(example.input.uischema, null, 2)
        : '',
    );
    toast('Original example UI schema loaded. Apply it to take effect.');
  }
};

const saveMonacoUiSchema = () => {
  saveMonacoModel(
    uischemaModel,
    (modelValue) =>
      (state.uischema = modelValue ? JSON.parse(modelValue) : undefined),
    'New UI schema applied',
  );
};

const reloadMonacoUiSchemas = () => {
  const example = find(
    examples,
    (example) => example.name === appStore.exampleName,
  );

  if (example) {
    uischemasModel.value = getMonacoModelForUri(
      monaco.Uri.parse(toUiSchemasUri(example.name)),
      example.input.uischemas
        ? JSON.stringify(example.input.uischemas, null, 2)
        : '',
    );
    toast('Original example UI schemas loaded. Apply it to take effect.');
  }
};

const saveMonacoUiSchemas = () => {
  saveMonacoModel(
    uischemasModel,
    (modelValue) =>
      (state.uischemas = modelValue ? JSON.parse(modelValue) : undefined),
    'New UI schemas applied',
  );
};

const reloadMonacoData = () => {
  const example = find(
    examples,
    (example) => example.name === appStore.exampleName,
  );

  if (example) {
    dataModel.value = getMonacoModelForUri(
      monaco.Uri.parse(toDataUri(example.name)),
      example.input.data ? JSON.stringify(example.input.data, null, 2) : '',
    );
    toast('Original example data loaded. Apply it to take effect.');
  }
};

const saveMonacoData = () => {
  saveMonacoModel(
    dataModel,
    (modelValue) => {
      if (state.schema?.type === 'number' || state.schema?.type === 'integer') {
        try {
          state.data = parseFloat(modelValue);
        } catch {
          // not able to convert the value - invalid data
          state.data = modelValue;
        }
      } else if (state.schema?.type === 'boolean') {
        state.data = modelValue == 'true';
      } else if (
        state.schema?.type === 'object' ||
        state.schema?.type === 'array'
      ) {
        try {
          state.data = JSON.parse(modelValue);
        } catch {
          // not able to convert the value - invalid data
          state.data = modelValue;
        }
      } else {
        state.data = modelValue;
      }
    },
    'New data applied',
  );
};

const reloadMonacoI18N = () => {
  const example = find(
    examples,
    (example) => example.name === appStore.exampleName,
  );

  if (example) {
    i18nModel.value = getMonacoModelForUri(
      monaco.Uri.parse(toI18NUri(example.name)),
      example.input.i18n ? JSON.stringify(example.input.i18n, null, 2) : '',
    );
    toast('Original example i18n loaded. Apply it to take effect.');
  }
};

const saveMonacoI18N = () => {
  saveMonacoModel(
    i18nModel,
    (modelValue) =>
      (state.i18n = {
        locale: appStore.jsonforms.locale,
        translate: createTranslator(
          appStore.jsonforms.locale,
          modelValue ? JSON.parse(modelValue) : {},
        ),
        translations: modelValue ? JSON.parse(modelValue) : {},
      }),
    'New i18n applied',
  );
};

const saveMonacoModel = (
  model: ShallowRef<monaco.editor.ITextModel | undefined>,
  apply: (value: string) => void,
  successToast: string,
) => {
  if (model.value) {
    const modelValue = model.value.getValue();

    try {
      apply(modelValue);
      toast(successToast);
    } catch (error) {
      toast(`Error: ${error}`);
    }
  }
};

const registerValidations = (editor: MonacoApi) => {
  configureJsonSchemaValidation(editor, ['*.schema.json']);
  configureUISchemaValidation(editor, ['*.uischema.json']);
  for (const example of examples) {
    const schema = {
      ...example.input.schema,
      title: example.label,
    };

    if (example && example.input.schema) {
      configureDataValidation(
        editor,
        `inmemory://${toSchemaUri(example.name)}`,
        toDataUri(example.name),
        schema,
      );
    }
  }
};

const updateMonacoModels = (example: ExampleDescription) => {
  schemaModel.value = getMonacoModelForUri(
    monaco.Uri.parse(toSchemaUri(example.name)),
    example.input.schema ? JSON.stringify(example.input.schema, null, 2) : '',
  );

  uischemaModel.value = getMonacoModelForUri(
    monaco.Uri.parse(toUiSchemaUri(example.name)),
    example.input.uischema
      ? JSON.stringify(example.input.uischema, null, 2)
      : '',
  );

  uischemasModel.value = getMonacoModelForUri(
    monaco.Uri.parse(toUiSchemasUri(example.name)),
    example.input.uischemas
      ? JSON.stringify(example.input.uischemas, null, 2)
      : '',
  );

  dataModel.value = getMonacoModelForUri(
    monaco.Uri.parse(toDataUri(example.name)),
    Array.isArray(example.input.data) || typeof example.input.data === 'object'
      ? JSON.stringify(example.input.data, null, 2)
      : `${example.input.data}`,
  );

  i18nModel.value = getMonacoModelForUri(
    monaco.Uri.parse(toI18NUri(example.name)),
    example.input.i18n ? JSON.stringify(example.input.i18n, null, 2) : '',
  );
};

const toSchemaUri = (id: string): string => {
  return `${id}.schema.json`;
};
const toUiSchemaUri = (id: string): string => {
  return `${id}.uischema.json`;
};
const toUiSchemasUri = (id: string): string => {
  return `${id}.uischemas.json`;
};
const toDataUri = (id: string): string => {
  return `${id}.data.json`;
};
const toI18NUri = (id: string): string => {
  return `${id}.i18n.json`;
};
const toast = (message: string): void => {
  snackbar.value = true;
  snackbarText.value = message;
};

onMounted(() => {
  updateMonacoModels(props.example);
});

watch(
  () => props.example,
  (value) => {
    updateMonacoModels(props.example);
    // reset state when example changes
    Object.assign(state, initialState(value));
  },
);

watch(
  () => appStore.jsonforms,
  (value) => {
    // reset state when store jsonforms changes
    Object.assign(state, reloadState(state));
  },
  { deep: true },
);

watch(
  () => appStore.formOnly,
  (value) => {
    if (!value) {
      // we need to show the wrapper so make sure that the monaco models are updated
      updateMonacoModels(props.example);
    }
  },
);
</script>

<template>
  <div>
    <v-container fluid class="demo" v-if="!appStore.formOnly">
      <v-card>
        <v-card-title>{{ example.label }}</v-card-title>
        <v-card-text>
          <v-tabs v-model="activeTab">
            <v-tab :key="0"
              >Demo<validation-icon
                v-if="errors"
                :errors="errors"
              ></validation-icon
            ></v-tab>
            <v-spacer expand />
            <v-tab :key="1">Schema</v-tab>
            <v-tab :key="2">UI Schema</v-tab>
            <v-tab :key="3">UI Schemas</v-tab>
            <v-tab :key="4">Data</v-tab>
            <v-tab :key="5">Internationalization</v-tab>
          </v-tabs>
        </v-card-text>
        <v-window v-model="activeTab">
          <v-window-item :key="0">
            <v-card>
              <v-card-title>
                <v-toolbar flat>
                  <v-toolbar-title>JSONForm</v-toolbar-title>
                </v-toolbar>
              </v-card-title>
              <v-divider class="mx-4"></v-divider>
              <div class="json-forms">
                <vuetify-json-forms-wrapper
                  v-if="appStore.useWebComponentView"
                  :custom-style="`.v-application__wrap { min-height: 0px; }`"
                  :data="state.data ? JSON.stringify(state.data) : undefined"
                  :schema="
                    state.schema ? JSON.stringify(state.schema) : undefined
                  "
                  :uischema="
                    state.uischema ? JSON.stringify(state.uischema) : undefined
                  "
                  :uischemas="
                    state.uischemas
                      ? JSON.stringify(state.uischemas)
                      : undefined
                  "
                  :config="
                    state.config ? JSON.stringify(state.config) : undefined
                  "
                  :validationMode="state.validationMode"
                  :readonly="state.readonly"
                  :locale="state.i18n?.locale ?? 'en'"
                  :rtl="appStore.rtl"
                  :dark="appStore.dark"
                  :translations="
                    state.i18n?.translations
                      ? JSON.stringify(state.i18n?.translations)
                      : '{}'
                  "
                  @change="onWebComponentChange"
                  @handleAction="onWebComponentHandleAction"
                ></vuetify-json-forms-wrapper>
                <ResolvedJsonForms
                  v-else
                  :state="state as JsonFormsProps"
                  @change="onChange"
                  @handleAction="onHandleAction"
                />
              </div>
            </v-card>
          </v-window-item>
          <v-window-item :key="1">
            <v-card>
              <v-card-title>
                <v-toolbar flat>
                  <v-toolbar-title>Schema</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ props }">
                      <v-btn icon @click="reloadMonacoSchema" v-bind="props">
                        <v-icon>$reload</v-icon>
                      </v-btn>
                    </template>
                    {{ `Reload Example Schema` }}
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ props }">
                      <v-btn icon @click="saveMonacoSchema" v-bind="props">
                        <v-icon>$save</v-icon>
                      </v-btn>
                    </template>
                    {{ `Apply Change To Example Schema` }}
                  </v-tooltip>
                </v-toolbar>
              </v-card-title>
              <v-divider class="mx-4"></v-divider>
              <monaco-editor
                :language="`json`"
                v-model="schemaModel"
                style="height: calc(100vh - 100px)"
                :editorBeforeMount="registerValidations"
              ></monaco-editor>
            </v-card>
          </v-window-item>
          <v-window-item :key="2">
            <v-card>
              <v-card-title>
                <v-toolbar flat>
                  <v-toolbar-title>UI Schema</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ props }">
                      <v-btn icon @click="reloadMonacoUiSchema" v-bind="props">
                        <v-icon>$reload</v-icon>
                      </v-btn>
                    </template>
                    {{ `Reload Example UI Schema` }}
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ props }">
                      <v-btn icon @click="saveMonacoUiSchema" v-bind="props">
                        <v-icon>$save</v-icon>
                      </v-btn>
                    </template>
                    {{ `Apply Change To Example UI Schema` }}
                  </v-tooltip>
                </v-toolbar>
              </v-card-title>
              <v-divider class="mx-4"></v-divider>
              <monaco-editor
                language="json"
                v-model="uischemaModel"
                style="height: calc(100vh - 100px)"
                :editorBeforeMount="registerValidations"
              ></monaco-editor>
            </v-card>
          </v-window-item>
          <v-window-item :key="3">
            <v-card>
              <v-card-title>
                <v-toolbar flat>
                  <v-toolbar-title>UI Schemas</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ props }">
                      <v-btn icon @click="reloadMonacoUiSchemas" v-bind="props">
                        <v-icon>$reload</v-icon>
                      </v-btn>
                    </template>
                    {{ `Reload Example UI Schemas` }}
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ props }">
                      <v-btn icon @click="saveMonacoUiSchemas" v-bind="props">
                        <v-icon>$save</v-icon>
                      </v-btn>
                    </template>
                    {{ `Apply Change To Example UI Schemas` }}
                  </v-tooltip>
                </v-toolbar>
              </v-card-title>
              <v-divider class="mx-4"></v-divider>
              <monaco-editor
                language="json"
                v-model="uischemasModel"
                style="height: calc(100vh - 100px)"
                :editorBeforeMount="registerValidations"
              ></monaco-editor>
            </v-card>
          </v-window-item>
          <v-window-item :key="4">
            <v-card>
              <v-card-title>
                <v-toolbar flat>
                  <v-toolbar-title>Data</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ props }">
                      <v-btn icon @click="reloadMonacoData" v-bind="props">
                        <v-icon>$reload</v-icon>
                      </v-btn>
                    </template>
                    {{ `Reload Example Data` }}
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ props }">
                      <v-btn icon @click="saveMonacoData" v-bind="props">
                        <v-icon>$save</v-icon>
                      </v-btn>
                    </template>
                    {{ `Apply Change To Example Data` }}
                  </v-tooltip>
                </v-toolbar>
              </v-card-title>
              <v-divider class="mx-4"></v-divider>
              <monaco-editor
                language="json"
                v-model="dataModel"
                style="height: calc(100vh - 100px)"
                :editorBeforeMount="registerValidations"
              ></monaco-editor>
            </v-card>
          </v-window-item>
          <v-window-item :key="5">
            <v-card>
              <v-card-title>
                <v-toolbar flat>
                  <v-toolbar-title>Internationalization</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ props }">
                      <v-btn icon @click="reloadMonacoI18N" v-bind="props">
                        <v-icon>$reload</v-icon>
                      </v-btn>
                    </template>
                    {{ `Reload Example Internationalization` }}
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ props }">
                      <v-btn icon @click="saveMonacoI18N" v-bind="props">
                        <v-icon>$save</v-icon>
                      </v-btn>
                    </template>
                    {{ `Apply Change To Example Data` }}
                  </v-tooltip>
                </v-toolbar>
              </v-card-title>
              <v-divider class="mx-4"></v-divider>
              <monaco-editor
                language="json"
                v-model="i18nModel"
                style="height: calc(100vh - 100px)"
                :editorBeforeMount="registerValidations"
              ></monaco-editor>
            </v-card>
          </v-window-item>
        </v-window>
      </v-card>
      <v-snackbar v-model="snackbar" :timeout="snackbarTimeout">
        {{ snackbarText }}
        <template v-slot:actions>
          <v-btn variant="text" @click="snackbar = false"> Close </v-btn>
        </template>
      </v-snackbar>
    </v-container>
    <div class="json-forms" v-else>
      <vuetify-json-forms-wrapper
        v-if="appStore.useWebComponentView"
        :custom-style="`.v-application__wrap { min-height: 0px; }`"
        :data="state.data ? JSON.stringify(state.data) : undefined"
        :schema="state.schema ? JSON.stringify(state.schema) : undefined"
        :uischema="state.uischema ? JSON.stringify(state.uischema) : undefined"
        :uischemas="
          state.uischemas ? JSON.stringify(state.uischemas) : undefined
        "
        :config="state.config ? JSON.stringify(state.config) : undefined"
        :validationMode="state.validationMode"
        :readonly="state.readonly"
        :locale="state.i18n?.locale ?? 'en'"
        :rtl="appStore.rtl"
        :dark="appStore.dark"
        :translations="
          state.i18n?.translations
            ? JSON.stringify(state.i18n?.translations)
            : '{}'
        "
        @change="onWebComponentChange"
        @handleAction="onWebComponentHandleAction"
      ></vuetify-json-forms-wrapper>

      <ResolvedJsonForms
        v-else
        :state="state as JsonFormsProps"
        @change="onChange"
        @handleAction="onHandleAction"
      />
    </div>
  </div>
</template>
