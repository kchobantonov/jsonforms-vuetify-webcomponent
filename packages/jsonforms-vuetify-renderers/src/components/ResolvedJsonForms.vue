<script setup lang="ts">
import type { JsonFormsSubStates, JsonSchema } from '@jsonforms/core';
import { JsonForms, type JsonFormsChangeEvent } from '@jsonforms/vue';
import type { Ajv } from 'ajv';
import { normalizeId } from 'ajv/dist/compile/resolve';
import * as JsonRefs from 'json-refs';
import _get from 'lodash/get';
import {
  computed,
  inject,
  onMounted,
  provide,
  reactive,
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

const jsonforms = inject<JsonFormsSubStates | undefined>(
  'jsonforms',
  undefined,
);

const defaultContext: FormContext = {
  schemaUrl: props.state.schemaUrl,

  jsonforms: jsonforms,
  locale: jsonforms?.i18n?.locale,
  translate: jsonforms?.i18n?.translate,

  data: jsonforms?.core?.data,
  schema: jsonforms?.core?.schema,
  uischema: jsonforms?.core?.uischema,
  errors: jsonforms?.core?.errors,
  additionalErrors: jsonforms?.core?.additionalErrors,
};

const properties = computed<JsonFormsProps & { ajv: Ajv }>(() => ({
  ...props.state,
  schema: resolvedSchema.schema ?? props.state.schema,
  ajv: props.state.ajv ?? createAjv(props.state.i18n?.locale),
}));

watch(
  () => jsonforms,
  (newJsonforms) => {
    if (newJsonforms) {
      defaultContext.value = {
        schemaUrl: props.state.schemaUrl,
        jsonforms: newJsonforms,
        locale: newJsonforms.i18n?.locale,
        translate: newJsonforms.i18n?.translate,
        data: newJsonforms.core?.data,
        schema: newJsonforms.core?.schema,
        uischema: newJsonforms.core?.uischema,
        errors: newJsonforms.core?.errors,
        additionalErrors: newJsonforms.core?.additionalErrors,
      };
    }
  },
  { immediate: true },
);

const overrideContext = inject<Ref<FormContext> | undefined>(
  FormContextKey,
  undefined,
);

const context = computed(() =>
  overrideContext
    ? {
        ...defaultContext,
        ...overrideContext.value,
      }
    : defaultContext,
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
    ></json-forms>
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
