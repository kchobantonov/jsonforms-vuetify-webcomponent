<script setup lang="ts">
import {
  defaultMiddleware,
  Generate,
  type JsonFormsCore,
  type JsonSchema,
  type Middleware,
} from '@jsonforms/core';
import { JsonForms, type JsonFormsChangeEvent } from '@jsonforms/vue';
import { normalizeId } from 'ajv/dist/compile/resolve';
import * as JsonRefs from 'json-refs';
import _get from 'lodash/get';
import isFunction from 'lodash/isFunction';
import {
  computed,
  getCurrentInstance,
  inject,
  markRaw,
  onMounted,
  provide,
  reactive,
  ref,
  shallowRef,
  toRefs,
  watch,
  type Ref,
  type SetupContext,
} from 'vue';
import { useTheme } from 'vuetify';
import {
  VAlert,
  VCol,
  VContainer,
  VDefaultsProvider,
  VLocaleProvider,
  VProgressLinear,
  VRow,
  VThemeProvider,
} from 'vuetify/components';
import {
  FormContextKey,
  HandleActionEmitterKey,
  createAjv,
  type ActionEvent,
  type FormContext,
  type JsonFormsProps,
  type ResolvedSchema,
  type VuetifyConfig,
} from '../core';
import { resolveUISchemaValidations } from '../util';
import type Ajv from 'ajv';
import { generateJsonSchema } from './schema';

const props = defineProps<{
  state: JsonFormsProps;
  vuetifyConfig: VuetifyConfig;
}>();

const resolvedSchema = reactive<ResolvedSchema>({
  schema: undefined,
  resolved: false,
  error: undefined,
});

const configToUse = ref(props.state.config);
const resolvedUiSchema = ref(
  resolveUISchemaValidations(props.state.uischema, configToUse),
);

const emits = defineEmits(['change', 'handle-action']);

const onChange = (event: JsonFormsChangeEvent): void => {
  // assign the current data before emitting the event
  // fixes: https://github.com/eclipsesource/jsonforms/pull/2478
  data.value = event.data;

  emits('change', event);
};

watch(
  () => props.state.data,
  (value) => {
    data.value = value;

    if (!props.state.schema) {
      // if we do not update that then at the moment the core will
      // use the previously generated schema since it doesn't update the generated schema upon data changes
      // fixes: https://github.com/eclipsesource/jsonforms/pull/2478
      resolvedSchema.schema = generateJsonSchema(value);
      if (!props.state.uischema) {
        // override the uischema as well so that we can specify some vuetify specific options for container
        resolvedUiSchema.value = Generate.uiSchema(
          resolvedSchema.schema,
          undefined,
          undefined,
          resolvedSchema.schema,
        ) ?? {
          type: 'VerticalLayout',
          elements: [],
        };

        if (resolvedUiSchema.value.type === 'VerticalLayout') {
          resolvedUiSchema.value.options = {
            vuetify: {
              'v-container': {
                fluid: true,
              },
              'v-row': {
                'no-gutters': true,
              },
            },
          };
        }
      }
    } else if (!props.state.uischema) {
      // override the uischema as well so that we can specify some vuetify specific options for container
      resolvedUiSchema.value = Generate.uiSchema(
        resolvedSchema.schema ?? props.state.schema,
        undefined,
        undefined,
        resolvedSchema.schema,
      ) ?? {
        type: 'VerticalLayout',
        elements: [],
      };

      if (resolvedUiSchema.value.type === 'VerticalLayout') {
        resolvedUiSchema.value.options = {
          vuetify: {
            'v-container': {
              fluid: true,
            },
            'v-row': {
              'no-gutters': true,
            },
          },
        };
      }
    }
  },
);
watch(
  () => props.state.schema,
  async (schema) => {
    await resolveSchema(schema, props.state.schemaUrl);
  },
);
watch(
  () => props.state.schemaUrl,
  async (schemaUrl) => {
    await resolveSchema(props.state.schema, schemaUrl);
  },
);
watch(
  () => props.state.readonly,
  (value) => {
    readonly.value = value;
  },
);
watch(
  () => props.state.additionalErrors,
  (value) => {
    additionalErrors.value = value;
  },
);
watch(
  () => props.state.ajv,
  (value) => {
    ajv.value = value ?? createAjv(ajvI18N);
  },
);
watch(
  () => props.state.i18n,
  (value) => {
    ajvI18N.value = value;
  },
);
watch(
  () => props.state.middleware,
  (value) => {
    middleware.value = createMiddlewareWrapper(value ?? defaultMiddleware);
  },
);

watch(
  () => props.state.config,
  (config) => {
    configToUse.value = config;
  },
  { deep: true },
);

watch(
  () => props.state.uischema,
  (uischema) => {
    resolvedUiSchema.value = resolveUISchemaValidations(uischema, configToUse);
  },
  { deep: true },
);

watch(
  () => props.vuetifyConfig,
  (vuetifyConfig) => {
    Object.assign(vuetifyConfigToUse, vuetifyConfig);
    vuetifyConfigToUse.dark =
      vuetifyTheme.themes.value[vuetifyConfigToUse.theme]?.dark ?? false;
  },
  { deep: true },
);

const resolveSchema = async (schema?: JsonSchema, schemaUrl?: string) => {
  resolvedSchema.schema = undefined;
  resolvedSchema.resolved = false;
  resolvedSchema.error = undefined;

  if (schema) {
    // have custom filter
    // if not using resolve ref  then the case
    //   { "$ref": "#/definitions/state" }
    //   "definitions": {
    //    "state": { "type": "string", "enum": ["CA", "NY", "FL"] }
    //   }
    // then state won't be renderer automatically - needs to have a specified control
    //
    // if using a resolve ref but then it points to definition with $id if we resolve those then we will get
    // Error: reference "{ref}" resolves to more than one schema
    const refFilter = (refDetails: any, _path: string): boolean => {
      if (refDetails.type === 'local') {
        let uri: string | undefined = refDetails?.uriDetails?.fragment;
        uri = uri ? uri.replace(/\//g, '.') : uri;
        if (uri?.startsWith('.')) {
          uri = uri.substring(1);
        }
        if (uri && (_get(schema, uri) as any)?.$id) {
          // do not resolve ref that points to def with $id
          return false;
        }
      }
      return true;
    };

    try {
      const resolveResult = await JsonRefs.resolveRefs(schema, {
        location: schemaUrl,
        filter: refFilter,
      });

      resolvedSchema.schema = resolveResult.resolved;

      resolvedSchema.resolved = true;
    } catch (err) {
      resolvedSchema.resolved = true;
      resolvedSchema.error = err instanceof Error ? err.message : String(err);
    }
  } else {
    // nothing to resolve
    resolvedSchema.resolved = true;
  }
};

onMounted(async () => {
  await resolveSchema(props.state.schema, props.state.schemaUrl);
});

const resolvingSchemaMessage = computed(() => {
  const message = 'Resolving Schema...';
  if (props.state.i18n?.translate) {
    return props.state.i18n.translate(message, message);
  }
  return message;
});

const createMiddlewareWrapper = (wrappedFunction: Middleware): Middleware => {
  return (state, action, defaultReducer) => {
    // Delegate the call to the wrapped function
    const core = wrappedFunction(state, action, defaultReducer);
    jsonformsCore.value = core;
    return core;
  };
};

const errorMessage = computed(() => {
  const message = 'Error resolving schema';
  if (props.state.i18n?.translate) {
    return props.state.i18n.translate(message, message);
  }
  return message;
});

const currentInstance = getCurrentInstance();
const jsonformsCore = ref<JsonFormsCore | undefined>(undefined);

const vuetifyTheme = useTheme();
const vuetifyConfigToUse = reactive({
  ...props.vuetifyConfig,
  dark: vuetifyTheme.themes.value[props.vuetifyConfig?.theme]?.dark ?? false,
});

const readonly = ref(props.state.readonly);
const data = ref(props.state.data);
const additionalErrors = ref(props.state.additionalErrors);
const ajvI18N = ref(props.state.i18n);
const ajv = shallowRef(props.state.ajv ?? createAjv(ajvI18N));
const middleware = shallowRef(
  createMiddlewareWrapper(props.state.middleware ?? defaultMiddleware),
);

const defaultContext: Ref<FormContext> = ref({
  schemaUrl: props.state.schemaUrl,
  uidata: reactive({}),

  vuetify: vuetifyConfigToUse,
  config: computed(() => properties.value.config),
  readonly: readonly,
  locale: computed(() => properties.value.i18n?.locale),
  translate: computed(() => properties.value.i18n?.translate),
  data: data,
  schema: computed(() => jsonformsCore.value?.schema),
  uischema: computed(() => jsonformsCore.value?.uischema),
  errors: computed(() => jsonformsCore.value?.errors),
  additionalErrors: additionalErrors,

  fireActionEvent: async <TypeEl extends Element = any>(
    action: string,
    params: any,
    el: TypeEl,
  ) => {
    const source: ActionEvent = {
      action: action,
      context: context.value,
      // the action parameters passes from the UI schema
      params: params ? { ...params } : {},
      $el: el ?? currentInstance?.proxy?.$el,
    };

    // fire event
    (handleActionEmitter ?? emits)('handle-action', source);

    // check if we have a callback to call
    if (isFunction(source.callback)) {
      await source.callback(source);
    } else {
      console.log('action [' + action + '] is not handled');
    }
  },
});

const properties = computed(() => ({
  ...props.state,
  readonly: readonly.value,
  data: data.value,
  additionalErrors: additionalErrors.value,

  uischema: resolvedUiSchema.value,
  config: configToUse.value,
  schema: resolvedSchema.schema ?? props.state.schema,
  renderers: props.state.renderers
    ? markRaw(props.state.renderers)
    : props.state.renderers,
  cells: props.state.cells ? markRaw(props.state.cells) : props.state.cells,
  ajv: ajv.value,
  middleware: middleware.value,
}));

const registerCurrentSchema = (schema: JsonSchema | undefined, ajv: Ajv) => {
  // register the current schema using $id equal to '/' so that it can be used by condition schema rules
  const currentSchemaId = '/';
  // remove the previously current schema
  ajv.removeSchema(currentSchemaId);

  if (schema) {
    // clear previous schemas in AVJ - schema with key or id "${id}" already exists
    const { schemaId } = ajv.opts;
    let id = (schema as any)[schemaId];
    if (id) {
      id = normalizeId(id);
      if (
        id &&
        !id.startsWith('#') &&
        'http://json-schema.org/draft-07/schema' !== id
      ) {
        if (ajv.getSchema(id)) {
          // schema exists and we are going to add it again so clear it before it throws schema already exists
          ajv.removeSchema(id);
        }
      }
    }

    // register the current schema using $id equal to '/' so that it can be used by condition schema rules
    const registeredSchema = { ...schema, [schemaId]: currentSchemaId };
    ajv.addSchema(registeredSchema);
  }
};

watch(
  () => properties.value.schema,
  (schema) => {
    registerCurrentSchema(schema, properties.value.ajv);
  },
);
watch(
  () => properties.value.ajv,
  (ajv) => {
    registerCurrentSchema(properties.value.schema, ajv);
  },
);

watch(
  () => vuetifyConfigToUse.dark,
  (dark, oldDark) => {
    if (dark !== oldDark) {
      let newTheme = dark
        ? vuetifyConfigToUse.theme.replace('light', 'dark')
        : vuetifyConfigToUse.theme.replace('dark', 'light');
      if (!vuetifyTheme.themes.value[newTheme]) {
        newTheme = dark ? 'dark' : 'light';
      }
      vuetifyConfigToUse.theme = newTheme;
    }
  },
);

const overrideContext = inject<Ref<FormContext> | undefined>(
  FormContextKey,
  undefined,
);

const context = overrideContext
  ? ref({
      ...toRefs(defaultContext.value),
      ...toRefs(overrideContext.value),
    })
  : defaultContext;

provide(FormContextKey, context);

const handleActionEmitter = inject<SetupContext['emit'] | undefined>(
  HandleActionEmitterKey,
  undefined,
);
if (!handleActionEmitter) {
  provide(HandleActionEmitterKey, emits as SetupContext['emit']);
}
</script>

<template>
  <v-locale-provider
    :rtl="vuetifyConfigToUse.rtl"
    :locale="properties.i18n?.locale"
  >
    <v-theme-provider :theme="vuetifyConfigToUse.theme">
      <v-defaults-provider :defaults="vuetifyConfigToUse.defaults">
        <json-forms
          v-if="resolvedSchema.resolved && resolvedSchema.error === undefined"
          v-bind="properties"
          @change="onChange"
        >
        </json-forms>
        <v-container v-else style="height: 400px">
          <v-row
            v-if="!resolvedSchema.resolved"
            class="fill-height"
            align-content="center"
            justify="center"
          >
            <v-col class="text-subtitle-1 text-center" cols="12">
              {{ resolvingSchemaMessage }}
            </v-col>
            <v-col cols="6">
              <v-progress-linear
                indeterminate
                rounded
                height="6"
              ></v-progress-linear>
            </v-col>
          </v-row>
          <v-row
            v-else-if="resolvedSchema.error !== undefined"
            class="fill-height"
            align-content="center"
            justify="center"
          >
            <v-col class="text-subtitle-1 text-center" cols="12">
              <v-alert color="red" dark>
                {{ errorMessage }}: {{ resolvedSchema.error }}
              </v-alert>
            </v-col>
          </v-row>
        </v-container>
      </v-defaults-provider>
    </v-theme-provider>
  </v-locale-provider>
</template>
