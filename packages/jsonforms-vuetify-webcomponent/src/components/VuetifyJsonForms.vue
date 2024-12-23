<template>
  <Suspense>
    <div>
      <custom-style type="text/css" id="vuetify-theme-stylesheet">
        {{ vuetifyThemeCss }}
      </custom-style>

      <custom-style type="text/css">
        {{ customStyleToUse }}
      </custom-style>

      <v-locale-provider :rtl="appStore.rtl" :locale="appStore.locale">
        <v-theme-provider :theme="theme">
          <v-defaults-provider :defaults="appStore.defaults">
            <div v-if="error !== undefined">
              <v-container style="height: 400px">
                <v-row
                  class="fill-height"
                  align-content="center"
                  justify="center"
                >
                  <v-col class="text-subtitle-1 text-center error" cols="12">
                    {{ error }}
                  </v-col>
                </v-row>
              </v-container>
            </div>
            <resolved-json-forms
              :state="state"
              :vuetify-config="vuetifyConfig"
              @change="onChange"
            ></resolved-json-forms>
          </v-defaults-provider>
        </v-theme-provider>
      </v-locale-provider>
    </div>
  </Suspense>
</template>

<script lang="ts">
import { useAppStore } from '@/store';
import {
  createTranslator,
  extraVuetifyRenderers,
  type FormContext,
  FormContextKey,
  HandleActionEmitterKey,
  type JsonFormsProps,
  parseAndTransformUISchemaRegistryEntries,
  ResolvedJsonForms,
  type VuetifyConfig,
} from '@chobantonov/jsonforms-vuetify-renderers';
import {
  defaultMiddleware,
  type JsonFormsUISchemaRegistryEntry,
  type Translator,
  type ValidationMode,
} from '@jsonforms/core';
import { type JsonFormsChangeEvent } from '@jsonforms/vue';
import isArray from 'lodash/isArray';
import {
  computed,
  defineComponent,
  h,
  inject,
  type InjectionKey,
  markRaw,
  type PropType,
  reactive,
  type Ref,
  ref,
  toRef,
  watch,
} from 'vue';
import { type ThemeInstance } from 'vuetify';
import {
  VDefaultsProvider,
  VLocaleProvider,
  VThemeProvider,
} from 'vuetify/components';
import { extractAndInjectFonts } from '../util/inject-fonts';

import { extendedVuetifyRenderers } from '@jsonforms/vue-vuetify';

const ThemeSymbol: InjectionKey<ThemeInstance> = Symbol.for('vuetify:theme');

const CustomStyle = defineComponent({
  name: 'custom-style',
  setup(_, { slots }) {
    return () => h('style', slots.default ? slots.default() : []);
  },
});

const vuetifyFormWc = defineComponent({
  components: {
    ResolvedJsonForms,
    VThemeProvider,
    VLocaleProvider,
    VDefaultsProvider,
    CustomStyle,
  },
  emits: ['change'],
  props: {
    data: {
      required: false,
      type: String,
      default: undefined,
      validator: function (value) {
        try {
          if (value === undefined) {
            return true;
          }

          if (typeof value !== 'string') {
            return false;
          }

          JSON.parse(value);

          return true;
        } catch (e) {
          return false;
        }
      },
    },
    schema: {
      required: false,
      type: String,
      validator: function (value) {
        try {
          const schema = typeof value === 'string' ? JSON.parse(value) : value;

          return schema !== undefined && schema !== null;
        } catch (e) {
          return false;
        }
      },
    },
    uischema: {
      required: false,
      type: String,
      validator: function (value) {
        try {
          const uischema =
            typeof value === 'string' ? JSON.parse(value) : value;

          return uischema !== undefined && uischema !== null;
        } catch (e) {
          return false;
        }
      },
    },
    schemaUrl: {
      required: false,
      type: String,
    },
    config: {
      required: false,
      type: String,
      validator: function (value) {
        try {
          const config = typeof value === 'string' ? JSON.parse(value) : value;

          return config !== undefined && config !== null;
        } catch (e) {
          return false;
        }
      },
    },
    readonly: {
      required: false,
      type: Boolean,
      default: false,
    },
    uischemas: {
      required: false,
      type: String,
      validator: function (value) {
        try {
          const uischemas =
            typeof value === 'string' ? JSON.parse(value) : value;

          return (
            uischemas !== undefined && uischemas !== null && isArray(uischemas)
          );
        } catch (e) {
          return false;
        }
      },
    },
    validationMode: {
      required: false,
      type: [String] as PropType<ValidationMode>,
      default: 'ValidateAndShow',
      validator: function (value) {
        return (
          value === 'ValidateAndShow' ||
          value === 'ValidateAndHide' ||
          value === 'NoValidation'
        );
      },
    },
    customStyle: {
      required: false,
      type: String,
    },
    translations: {
      required: false,
      type: String,
      validator: function (value) {
        try {
          const translations =
            typeof value === 'string' ? JSON.parse(value) : value;

          return translations !== null;
        } catch (e) {
          return false;
        }
      },
    },
    additionalErrors: {
      required: false,
      type: String,
      validator: function (value) {
        try {
          const additionalErrors =
            typeof value === 'string' ? JSON.parse(value) : value;

          return (
            additionalErrors !== undefined &&
            additionalErrors !== null &&
            isArray(additionalErrors)
          );
        } catch (e) {
          return false;
        }
      },
    },
    uidata: {
      required: false,
      type: String,
      default: () => {
        return '{}';
      },
      validator: function (value) {
        try {
          const data = typeof value === 'string' ? JSON.parse(value) : value;

          return data !== undefined && data !== null;
        } catch (e) {
          return false;
        }
      },
    },
  },
  async setup(props) {
    const appStore = useAppStore();

    let error = ref<string | undefined>(undefined);

    const getJsonDataType = (value: any): string | null => {
      if (typeof value === 'string') {
        return 'string';
      } else if (typeof value === 'number') {
        return Number.isInteger(value) ? 'integer' : 'number';
      } else if (typeof value === 'boolean') {
        return 'boolean';
      } else if (Array.isArray(value)) {
        return 'array';
      } else if (value === null) {
        return 'null';
      } else if (typeof value === 'object') {
        return 'object';
      }

      return null;
    };

    const toJsonData = (
      prop: string,
      jsonType:
        | 'string'
        | 'integer'
        | 'number'
        | 'boolean'
        | 'array'
        | 'null'
        | 'object'
        | 'any',
      value: string | undefined,
    ) => {
      try {
        const result = typeof value == 'string' ? JSON.parse(value) : undefined;
        if (jsonType !== 'any' && result !== undefined) {
          const resultType = getJsonDataType(result);
          if (resultType !== jsonType) {
            throw new Error(
              `Invalid data type. Expected ${jsonType} but found ${resultType}`,
            );
          }
        }
        return result;
      } catch (e) {
        error.value = `${prop} error: ${e}`;
        console.log(e);

        return undefined;
      }
    };

    let dataToUse = ref(toJsonData('data', 'any', props.data));
    let schemaToUse = ref(toJsonData('schema', 'object', props.schema));
    let schemaUrlToUse = ref(props.schemaUrl);
    let uischemaToUse = ref(toJsonData('uischema', 'object', props.uischema));
    let configToUse = ref(toJsonData('config', 'object', props.config));
    let readonlyToUse = ref(props.readonly);
    let uischemasToUse = ref<JsonFormsUISchemaRegistryEntry[]>([]);
    try {
      uischemasToUse.value = parseAndTransformUISchemaRegistryEntries(
        props.uischemas,
      );
    } catch (e) {
      error.value = `uischemas error: ${e}`;
      console.log(e);
    }
    let validationModeToUse = ref(
      props.validationMode === 'ValidateAndShow' ||
        props.validationMode === 'ValidateAndHide' ||
        props.validationMode === 'NoValidation'
        ? props.validationMode
        : 'ValidateAndShow',
    );
    let additionalErrorsToUse = ref(
      toJsonData('additionalErrors', 'array', props.additionalErrors),
    );
    let translationsToUse = ref(
      toJsonData('translations', 'object', props.translations),
    );
    let customStyleToUse = ref(props.customStyle);
    let uidataToUse = reactive<Record<string, any>>(
      toJsonData('uidata', 'object', props.uidata),
    );

    let i18nToUse = ref({
      locale: appStore.locale,
      translate: createTranslator(appStore.locale, translationsToUse.value),
    });

    // provide the schema $id so that we can refer to it in UI schema rule conditions
    if (schemaToUse.value && !schemaToUse.value.$id) {
      schemaToUse.value.$id = '/';
    }

    const renderers = [...extendedVuetifyRenderers, ...extraVuetifyRenderers];

    const state = reactive<JsonFormsProps>({
      data: dataToUse.value,
      schema: schemaToUse.value,
      schemaUrl: schemaUrlToUse.value,
      uischema: uischemaToUse.value,
      renderers: markRaw(renderers),
      cells: undefined, // not defined
      config: configToUse.value,
      readonly: readonlyToUse.value,
      uischemas: uischemasToUse.value,
      validationMode: validationModeToUse.value,
      i18n: i18nToUse.value,
      additionalErrors: additionalErrorsToUse.value,
      middleware: defaultMiddleware,
    });

    watch(
      () => props.data,
      (value, oldValue) => {
        if (value !== oldValue) {
          dataToUse.value = toJsonData('data', 'any', value);

          state.data = dataToUse.value;
        }
      },
    );
    watch(
      () => props.schema,
      (value, oldValue) => {
        if (value !== oldValue) {
          schemaToUse.value = toJsonData('schema', 'object', value);
          // provide the schema $id so that we can refer to it in UI schema rule conditions
          if (schemaToUse.value && !schemaToUse.value.$id) {
            schemaToUse.value.$id = '/';
          }
          state.schema = schemaToUse.value;
        }
      },
    );
    watch(
      () => props.schemaUrl,
      (value, oldValue) => {
        if (value !== oldValue) {
          schemaUrlToUse.value = value;

          state.schemaUrl = schemaUrlToUse.value;
        }
      },
    );
    watch(
      () => props.uischema,
      (value, oldValue) => {
        if (value !== oldValue) {
          uischemaToUse.value = toJsonData('uischema', 'object', value);

          state.uischema = uischemaToUse.value;
        }
      },
    );
    watch(
      () => props.config,
      (value, oldValue) => {
        if (value !== oldValue) {
          configToUse.value = toJsonData('config', 'object', value);

          state.config = configToUse.value;
        }
      },
    );
    watch(
      () => props.readonly,
      (value, oldValue) => {
        if (value !== oldValue) {
          readonlyToUse.value = value;

          state.readonly = readonlyToUse.value;
        }
      },
    );
    watch(
      () => props.uischemas,
      (value, oldValue) => {
        if (value !== oldValue) {
          try {
            uischemasToUse.value = parseAndTransformUISchemaRegistryEntries(
              props.uischemas,
            );
          } catch (e) {
            error.value = `uischemas error: ${e}`;
            console.log(e);
          }

          state.uischemas = uischemasToUse.value;
        }
      },
    );
    watch(
      () => props.validationMode,
      (value, oldValue) => {
        if (value !== oldValue) {
          validationModeToUse.value =
            value === 'ValidateAndShow' ||
            value === 'ValidateAndHide' ||
            value === 'NoValidation'
              ? value
              : 'ValidateAndShow';

          state.validationMode = validationModeToUse.value;
        }
      },
    );
    watch(
      () => props.additionalErrors,
      (value, oldValue) => {
        if (value !== oldValue) {
          additionalErrorsToUse.value = toJsonData(
            'additionalErrors',
            'object',
            value,
          );

          state.additionalErrors = additionalErrorsToUse.value;
        }
      },
    );
    watch(
      () => props.translations,
      (value, oldValue) => {
        if (value !== oldValue) {
          translationsToUse.value = toJsonData('translations', 'object', value);

          i18nToUse.value = {
            locale: appStore.locale,
            translate: createTranslator(
              appStore.locale,
              translationsToUse.value,
            ) as Translator,
          };

          state.i18n = i18nToUse.value;
        }
      },
    );
    watch(
      () => props.customStyle,
      (customStyle, oldCustomStyle) => {
        if (customStyle !== oldCustomStyle) {
          customStyleToUse.value = customStyle;
        }
      },
    );
    watch(
      () => props.uidata,
      (value, oldValue) => {
        if (value !== oldValue) {
          uidataToUse = reactive<Record<string, any>>(
            toJsonData('uidata', 'object', value),
          );

          context.value.uidata = uidataToUse;
        }
      },
    );
    watch(
      () => appStore.locale,
      (value, oldValue) => {
        if (value !== oldValue) {
          i18nToUse.value = {
            locale: value,
            translate: createTranslator(
              value,
              translationsToUse.value,
            ) as Translator,
          };

          state.i18n = i18nToUse.value;
        }
      },
    );

    const theme = computed(() => {
      return appStore.dark ? 'dark' : 'light';
    });

    const vuetifyConfig = computed<VuetifyConfig>(() => ({
      theme: theme.value,
      rtl: appStore.rtl,
      defaults: appStore.defaults,
    }));

    let context: Ref<FormContext> = ref({
      uidata: uidataToUse,
    });

    return {
      error,
      state,
      uidataToUse,
      translationsToUse,
      context,
      appStore,
      theme,
      customStyleToUse,
      vuetifyConfig,
    };
  },
  provide() {
    return {
      // provide the this.$emit to be used as handleActionEmitter since this emitter is connected to the native web component
      [HandleActionEmitterKey]: this.$root!.$emit,
      [FormContextKey]: toRef(this, 'context'),
    };
  },
  async mounted() {
    extractAndInjectFonts(this.$el.getRootNode());
  },
  computed: {
    vuetifyThemeCss() {
      const theme = inject(ThemeSymbol);

      let css = theme?.styles.value;
      if (css && css.startsWith(':root {')) {
        // change to host if the variable generation is enabled
        css = ':host {' + css.substring(':root {'.length, css.length);
      }
      return css;
    },
  },
  methods: {
    onChange(event: JsonFormsChangeEvent): void {
      this.$emit('change', event);
      this.state.data = event.data;
    },
  },
});

export default vuetifyFormWc;
</script>
