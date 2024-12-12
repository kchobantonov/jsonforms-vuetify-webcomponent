<script setup lang="ts">
import type { JsonSchema } from '@jsonforms/core';
import { JsonForms, type JsonFormsChangeEvent } from '@jsonforms/vue';
import { useJsonForms } from '@jsonforms/vue-vuetify';
import type { Ajv } from 'ajv';
import { normalizeId } from 'ajv/dist/compile/resolve';
import * as JsonRefs from 'json-refs';
import _get from 'lodash/get';
import isFunction from 'lodash/isFunction';
import {
  computed,
  getCurrentInstance,
  inject,
  onMounted,
  provide,
  reactive,
  ref,
  watch,
  type Ref,
  type SetupContext,
} from 'vue';
import {
  VAlert,
  VCol,
  VContainer,
  VProgressLinear,
  VRow,
} from 'vuetify/components';
import {
  FormContextKey,
  HandleActionEmitterKey,
  createAjv,
  type ActionEvent,
  type FormContext,
  type JsonFormsProps,
  type ResolvedSchema,
} from '../core';

const props = defineProps<{
  state: JsonFormsProps;
}>();

const resolvedSchema = reactive<ResolvedSchema>({
  schema: undefined,
  resolved: false,
  error: undefined,
});

const emits = defineEmits(['change', 'handle-action']);

const onChange = (event: JsonFormsChangeEvent): void => {
  emits('change', event);
};

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

const errorMessage = computed(() => {
  const message = 'Error resolving schema';
  if (props.state.i18n?.translate) {
    return props.state.i18n.translate(message, message);
  }
  return message;
});

const currentInstance = getCurrentInstance();

const defaultContext: Ref<FormContext> = ref({
  schemaUrl: props.state.schemaUrl,

  jsonforms: computed(() => useJsonForms()),

  locale: computed(() => useJsonForms().i18n?.locale),
  translate: computed(() => useJsonForms().i18n?.translate),
  data: computed(() => useJsonForms().core?.data),
  schema: computed(() => useJsonForms().core?.schema),
  uischema: computed(() => useJsonForms().core?.uischema),
  errors: computed(() => useJsonForms().core?.errors),
  additionalErrors: computed(() => useJsonForms().core?.additionalErrors),

  fireActionEvent: async <TypeEl extends Element = any>(
    action: string,
    params: any,
    el: TypeEl,
  ) => {
    const source: ActionEvent = {
      action: action,
      jsonforms: context.value.jsonforms!,
      context: context.value,
      // the action parameters passes from the UI schema
      params: params ? { ...params } : {},
      $el: el || currentInstance?.proxy?.$el,
    };

    (handleActionEmitter || emits)('handle-action', source);
    if (isFunction(source.callback)) {
      await source.callback(source);
    } else {
      console.log('action [' + action + '] is not handled');
    }
  },
  uidata: reactive({}),
});

const properties = computed<JsonFormsProps & { ajv: Ajv }>(() => ({
  ...props.state,
  schema: resolvedSchema.schema ?? props.state.schema,
  ajv: props.state.ajv ?? createAjv(props.state.i18n),
}));

watch(
  () => properties.value.schema,
  (schema) => {
    if (schema) {
      // clear previous schemas in AVJ - schema with key or id "${id}" already exists
      const { schemaId } = properties.value.ajv.opts;
      let id = (schema as any)[schemaId];
      if (id) {
        id = normalizeId(id);
        if (id && !id.startsWith('#')) {
          if (properties.value.ajv.getSchema(id)) {
            // schema exists and we are going to add it again so clear it before it throws schema already exists
            properties.value.ajv.removeSchema(id);
          }
        }
      }

      // register the current schema using $id equal to '/' so that it can be used by condition schema rules
      const currentSchemaId = '/';
      // remove the previously current schema
      properties.value.ajv.removeSchema(currentSchemaId);

      const registeredSchema = { ...schema, [schemaId]: currentSchemaId };
      properties.value.ajv.addSchema(registeredSchema);
    }
  },
);

const overrideContext = inject<Ref<FormContext> | undefined>(
  FormContextKey,
  undefined,
);

const context = computed(() =>
  overrideContext
    ? {
        ...defaultContext.value,
        ...overrideContext.value,
      }
    : defaultContext.value,
);

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
  <div>
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
  </div>
</template>
