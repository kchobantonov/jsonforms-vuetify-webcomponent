<script setup lang="ts">
import type { ExampleDescription, ExampleInputDescription } from '@/core/types';
import {
  createTranslator,
  FormContextKey,
  parseAndTransformUISchemaRegistryEntries,
  ResolvedJsonForms,
  TemplateComponentsKey,
  type ActionEvent,
  type JsonFormsProps,
  type VuetifyConfig,
} from '@chobantonov/jsonforms-vuetify-renderers';
import type { JsonFormsChangeEvent } from '@jsonforms/vue';
import {
  defaultStyles,
  extendedVuetifyRenderers,
  mergeStyles,
  ValidationIcon,
} from '@jsonforms/vue-vuetify';
import type { ErrorObject } from 'ajv';
import cloneDeep from 'lodash/cloneDeep';
import find from 'lodash/find';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { Pane, Splitpanes } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import {
  computed,
  inject,
  markRaw,
  onMounted,
  provide,
  ref,
  shallowReactive,
  shallowRef,
  unref,
  watch,
  type InjectionKey,
  type Ref,
  type ShallowRef,
} from 'vue';
import type { DefaultsInstance, VuetifyOptions } from 'vuetify';
import MonacoEditor from '../components/MonacoEditor.vue';
import VuetifyJsonFormsWrapper from '../components/VuetifyJsonFormsWrapper.vue';
import {
  configureDataValidation,
  configureJsonSchemaValidation,
  configureUISchemaValidation,
  getMonacoModelForUri,
} from '../core/jsonSchemaValidation';
import type { MonacoApi } from '../core/monaco';
import { useAppStore } from '../store';

import { useAppTheme } from '@/plugins/vuetify';
import { extraVuetifyRenderers } from '@chobantonov/jsonforms-vuetify-renderers';

import type {
  JsonFormsUISchemaRegistryEntry,
  UISchemaElement,
} from '@jsonforms/core';

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
const configModel = shallowRef<monaco.editor.ITextModel | undefined>(undefined);

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
    config: { ...appStore.jsonforms.config, ...(example.input.config ?? {}) },
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

const state = shallowReactive<JsonFormsProps>(initialState(props.example));

const onChange = (event: JsonFormsChangeEvent): void => {
  if (props.example.name) {
    dataModel.value = getMonacoModelForUri(
      monaco.Uri.parse(toDataUri(props.example.name)),
      event.data !== undefined ? JSON.stringify(event.data, null, 2) : '',
    );
    state.data = event.data;
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
    appStore.examples,
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
    (modelValue) => {
      state.schema = JSON.parse(modelValue);
    },
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
    appStore.examples,
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
    (modelValue) => {
      state.uischema = modelValue ? JSON.parse(modelValue) : undefined;
    },
    'New UI schema applied',
  );
};

const reloadMonacoUiSchemas = () => {
  const example = find(
    appStore.examples,
    (example) => example.name === appStore.exampleName,
  );

  if (example) {
    uischemasModel.value = getMonacoModelForUri(
      monaco.Uri.parse(toUiSchemasUri(example.name)),
      example.input.uischemas
        ? JSON.stringify(
            example.input.uischemas.map((item) => ({
              ...item,
              tester: item.tester.toString(),
            })),
            null,
            2,
          )
        : '',
    );
    toast('Original example UI schemas loaded. Apply it to take effect.');
  }
};

const saveMonacoUiSchemas = () => {
  saveMonacoModel(
    uischemasModel,
    (modelValue) => {
      state.uischemas = modelValue
        ? parseAndTransformUISchemaRegistryEntries(modelValue)
        : undefined;
    },
    'New UI schemas applied',
  );
};

const reloadMonacoData = () => {
  const example = find(
    appStore.examples,
    (example) => example.name === appStore.exampleName,
  );

  if (example) {
    dataModel.value = getMonacoModelForUri(
      monaco.Uri.parse(toDataUri(example.name)),
      example.input.data !== undefined
        ? JSON.stringify(example.input.data, null, 2)
        : '',
    );
    toast('Original example data loaded. Apply it to take effect.');
  }
};

const saveMonacoData = () => {
  saveMonacoModel(
    dataModel,
    (modelValue) => {
      state.data = modelValue === '' ? undefined : JSON.parse(modelValue);
    },
    'New data applied',
  );
};

const reloadMonacoI18N = () => {
  const example = find(
    appStore.examples,
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
    (modelValue) => {
      state.i18n = {
        locale: appStore.jsonforms.locale,
        translate: createTranslator(
          appStore.jsonforms.locale,
          modelValue ? JSON.parse(modelValue) : {},
        ),
        translations: modelValue ? JSON.parse(modelValue) : {},
      };
    },
    'New i18n applied',
  );
};

const reloadMonacoConfig = () => {
  const example = find(
    appStore.examples,
    (example) => example.name === appStore.exampleName,
  );

  if (example) {
    configModel.value = getMonacoModelForUri(
      monaco.Uri.parse(toConfigUri(example.name)),
      example.input.config ? JSON.stringify(example.input.config, null, 2) : '',
    );
    toast('Original example config loaded. Apply it to take effect.');
  }
};

const saveMonacoConfig = () => {
  saveMonacoModel(
    configModel,
    (modelValue) => {
      state.config = modelValue ? JSON.parse(modelValue) : {};
    },
    'New config applied',
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
  for (const example of appStore.examples) {
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
      ? JSON.stringify(
          example.input.uischemas.map((item) => ({
            ...item,
            tester: item.tester.toString(),
          })),
          null,
          2,
        )
      : '',
  );

  dataModel.value = getMonacoModelForUri(
    monaco.Uri.parse(toDataUri(example.name)),
    example.input.data !== undefined
      ? JSON.stringify(example.input.data, null, 2)
      : '',
  );

  i18nModel.value = getMonacoModelForUri(
    monaco.Uri.parse(toI18NUri(example.name)),
    example.input.i18n ? JSON.stringify(example.input.i18n, null, 2) : '',
  );

  configModel.value = getMonacoModelForUri(
    monaco.Uri.parse(toConfigUri(example.name)),
    example.input.config ? JSON.stringify(example.input.config, null, 2) : '',
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
const toConfigUri = (id: string): string => {
  return `${id}.config.json`;
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
  (jsonforms) => {
    Object.assign(state, {
      config: jsonforms.config,
      readonly: jsonforms.readonly,
      validationMode: jsonforms.validationMode,
      i18n: {
        locale: jsonforms.locale,
        translate: createTranslator(jsonforms.locale, state.i18n?.translations),
        translations: state.i18n?.translations,
      },
    });
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

type Action = NonNullable<ExampleInputDescription['actions']>[number];

const handleAction = (action: Action) => {
  if (action) {
    const newState = action.apply(state);
    if (newState) {
      Object.assign(state, newState);
    }
  }
};

const DefaultsSymbol: InjectionKey<Ref<DefaultsInstance>> =
  Symbol.for('vuetify:defaults');

const IconSymbol: InjectionKey<VuetifyOptions['icons']> =
  Symbol.for('vuetify:icons');

const vuetifyDefaults = inject(DefaultsSymbol);
const vuetifyIcons = inject(IconSymbol);

const vuetifyOptions = computed(() => {
  return JSON.stringify({
    defaults: unref(vuetifyDefaults),
    blueprint: appStore.blueprint,
    icons: {
      defaultSet: vuetifyIcons?.defaultSet,
    },
  } as Partial<VuetifyOptions>);
});

const theme = useAppTheme();

const vuetifyConfig = computed<VuetifyConfig>(() => ({
  theme: theme.value,
  rtl: appStore.rtl,
  defaults: {},
}));

const uischemaString = computed<string | undefined>(() => {
  let uischema = state.uischema;
  if (uischema) {
    const transformNode = (node: UISchemaElement): UISchemaElement => {
      const transformed = { ...node } as UISchemaElement;

      if (
        'rule' in transformed &&
        transformed.rule?.condition &&
        typeof transformed.rule.condition === 'object' &&
        'validate' in transformed.rule.condition &&
        typeof transformed.rule.condition.validate === 'function'
      ) {
        (transformed.rule.condition.validate as unknown) =
          transformed.rule.condition.validate.toString();
      }

      if ('elements' in transformed && Array.isArray(transformed.elements)) {
        transformed.elements = transformed.elements.map(transformNode);
      }

      return transformed;
    };

    uischema = transformNode(uischema);
  }

  return uischema ? JSON.stringify(uischema) : undefined;
});

const uischemasString = computed<string | undefined>(() => {
  let uischemas:
    | (
        | JsonFormsUISchemaRegistryEntry
        | { tester: string; uischema: UISchemaElement }
      )[]
    | undefined = state.uischemas;
  if (uischemas) {
    uischemas = uischemas.map((item) => ({
      ...item,
      tester: item.tester.toString(),
    }));
  }

  return uischemas ? JSON.stringify(uischemas) : undefined;
});
</script>

<template>
  <div>
    <v-container fluid class="demo" v-if="!appStore.formOnly">
      <v-card style="overflow: visible">
        <v-card-title>{{ example.label }}</v-card-title>
        <v-card-text>
          <v-tabs v-model="appStore.activeTab">
            <v-tab :key="0"
              >{{ appStore.layout == 'demo-and-data' ? 'Demo and Data' : 'Demo'
              }}<validation-icon
                v-if="errors"
                :errors="errors"
              ></validation-icon
            ></v-tab>
            <v-spacer expand />
            <v-tab :key="1">Schema</v-tab>
            <v-tab :key="2">UI Schema</v-tab>
            <v-tab :key="3">UI Schemas</v-tab>
            <v-tab :key="4">Internationalization</v-tab>
            <v-tab :key="5">Config</v-tab>
            <v-tab v-if="appStore.layout !== 'demo-and-data'" :key="6"
              >Data</v-tab
            >
          </v-tabs>
        </v-card-text>
        <v-window v-model="appStore.activeTab" style="overflow: visible">
          <v-window-item :key="0">
            <v-card style="overflow: visible">
              <v-card-title>
                <v-toolbar flat>
                  <v-toolbar-title>JSONForm</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-toolbar-items v-if="example.input.actions">
                    <v-btn
                      v-for="(action, index) in example.input.actions"
                      :key="index"
                      @click="() => handleAction(action)"
                      >{{ action.label }}</v-btn
                    >
                  </v-toolbar-items>
                </v-toolbar>
              </v-card-title>
              <v-divider class="mx-4"></v-divider>
              <div class="json-forms">
                <splitpanes
                  :class="['default-theme', 'splitpanes-vuetify']"
                  :rtl="appStore.rtl"
                  v-if="appStore.layout === 'demo-and-data'"
                >
                  <pane min-size="20" style="overflow: visible">
                    <v-card style="overflow: visible">
                      <v-card-title>
                        <v-toolbar flat>
                          <v-toolbar-title>Demo</v-toolbar-title>
                          <v-spacer></v-spacer>
                        </v-toolbar>
                      </v-card-title>
                      <v-divider class="mx-4"></v-divider>
                      <vuetify-json-forms-wrapper
                        v-if="appStore.useWebComponentView"
                        :custom-style="`.v-application__wrap { min-height: 0px; }`"
                        :data="
                          state.data ? JSON.stringify(state.data) : undefined
                        "
                        :schema="
                          state.schema
                            ? JSON.stringify(state.schema)
                            : undefined
                        "
                        :uischema="uischemaString"
                        :uischemas="uischemasString"
                        :config="
                          state.config
                            ? JSON.stringify(state.config)
                            : undefined
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
                        :vuetify-options="vuetifyOptions"
                        @change="onWebComponentChange"
                        @handleAction="onWebComponentHandleAction"
                      ></vuetify-json-forms-wrapper>
                      <resolved-json-forms
                        v-else
                        :state="state as JsonFormsProps"
                        :vuetify-config="vuetifyConfig"
                        @change="onChange"
                        @handleAction="onHandleAction"
                      ></resolved-json-forms>
                    </v-card>
                  </pane>
                  <pane>
                    <v-card>
                      <v-card-title>
                        <v-toolbar flat>
                          <v-toolbar-title>Data</v-toolbar-title>
                          <v-spacer></v-spacer>
                          <v-tooltip bottom>
                            <template v-slot:activator="{ props }">
                              <v-btn
                                icon
                                @click="reloadMonacoData"
                                v-bind="props"
                              >
                                <v-icon>$reload</v-icon>
                              </v-btn>
                            </template>
                            {{ `Reload Example Data` }}
                          </v-tooltip>
                          <v-tooltip bottom>
                            <template v-slot:activator="{ props }">
                              <v-btn
                                icon
                                @click="saveMonacoData"
                                v-bind="props"
                              >
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
                  </pane>
                </splitpanes>
                <div v-else>
                  <vuetify-json-forms-wrapper
                    v-if="appStore.useWebComponentView"
                    :custom-style="`.v-application__wrap { min-height: 0px; }`"
                    :data="state.data ? JSON.stringify(state.data) : undefined"
                    :schema="
                      state.schema ? JSON.stringify(state.schema) : undefined
                    "
                    :uischema="uischemaString"
                    :uischemas="uischemasString"
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
                    :vuetify-options="vuetifyOptions"
                    @change="onWebComponentChange"
                    @handleAction="onWebComponentHandleAction"
                  ></vuetify-json-forms-wrapper>
                  <resolved-json-forms
                    v-else
                    :state="state as JsonFormsProps"
                    :vuetify-config="vuetifyConfig"
                    @change="onChange"
                    @handleAction="onHandleAction"
                  ></resolved-json-forms>
                </div>
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
                    {{ `Apply Change To Example Internationalization` }}
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
          <v-window-item :key="5">
            <v-card>
              <v-card-title>
                <v-toolbar flat>
                  <v-toolbar-title>Config</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ props }">
                      <v-btn icon @click="reloadMonacoConfig" v-bind="props">
                        <v-icon>$reload</v-icon>
                      </v-btn>
                    </template>
                    {{ `Reload Example Config` }}
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template v-slot:activator="{ props }">
                      <v-btn icon @click="saveMonacoConfig" v-bind="props">
                        <v-icon>$save</v-icon>
                      </v-btn>
                    </template>
                    {{ `Apply Change To Example Config` }}
                  </v-tooltip>
                </v-toolbar>
              </v-card-title>
              <v-divider class="mx-4"></v-divider>
              <monaco-editor
                language="json"
                v-model="configModel"
                style="height: calc(100vh - 100px)"
                :editorBeforeMount="registerValidations"
              ></monaco-editor>
            </v-card>
          </v-window-item>
          <v-window-item :key="6">
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
        :uischema="uischemaString"
        :uischemas="uischemasString"
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
        :vuetify-options="vuetifyOptions"
        @change="onWebComponentChange"
        @handleAction="onWebComponentHandleAction"
      ></vuetify-json-forms-wrapper>

      <resolved-json-forms
        v-else
        :state="state as JsonFormsProps"
        :vuetify-config="vuetifyConfig"
        @change="onChange"
        @handleAction="onHandleAction"
      ></resolved-json-forms>
    </div>
  </div>
</template>
<style lang="scss" scoped>
:deep(.default-theme) {
  &.splitpanes--vertical > .splitpanes__splitter,
  .splitpanes--vertical > .splitpanes__splitter {
    border-left: 1px solid rgb(var(--v-theme-on-surface-variant));
  }

  &.splitpanes--horizontal > .splitpanes__splitter,
  .splitpanes--horizontal > .splitpanes__splitter {
    border-top: 1px solid rgb(var(--v-theme-on-surface-variant));
  }

  .splitpanes__splitter {
    background-color: rgb(var(--v-theme-surface));
    &:before,
    &:after {
      background-color: rgb(var(--v-theme-on-surface-variant));
    }
    &:hover:before,
    &:hover:after {
      background-color: rgb(var(--v-theme-on-surface-variant));
    }
  }

  .splitpanes__pane {
    background-color: rgb(var(--v-theme-surface));
  }
}
</style>
