<template>
  <Suspense>
    <div>
      <!-- Vuetify theme variables -->
      <dynamic-element
        tag="style"
        type="text/css"
        id="vuetify-theme-stylesheet"
      >
        {{ vuetifyThemeCss }}
      </dynamic-element>

      <!-- Custom CSS from prop -->
      <dynamic-element tag="style" type="text/css">
        {{ customStyleToUse }}
      </dynamic-element>
      <dynamic-element tag="slot" name="jsonforms-header">
        <!-- Place custom content inside <div slot="jsonforms-header"></div> within <vuetify-json-forms> to fill this slot -->
      </dynamic-element>

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
              v-else
              :state="state as JsonFormsProps"
              :vuetify-config="vuetifyConfig"
              @change="onChange"
            ></resolved-json-forms>
          </v-defaults-provider>
        </v-theme-provider>
      </v-locale-provider>

      <dynamic-element tag="slot" name="jsonforms-footer">
        <!-- Place custom content inside <div slot="jsonforms-footer"></div> within <vuetify-json-forms> to fill this slot -->
      </dynamic-element>
    </div>
  </Suspense>
</template>

<script lang="ts">
import { useAppStore } from '@/store';
import {
  createTranslator,
  DynamicElement,
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
import { extendedVuetifyRenderers } from '@jsonforms/vue-vuetify';
import isPlainObject from 'lodash/isPlainObject';
import {
  computed,
  defineComponent,
  inject,
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
  VCol,
  VContainer,
  VDefaultsProvider,
  VLocaleProvider,
  VRow,
  VThemeProvider,
} from 'vuetify/components';
import { extractAndInjectFonts } from '../util/inject-fonts';

const ThemeSymbol = Symbol.for('vuetify:theme');

export default defineComponent({
  name: 'VuetifyJsonFormsWebComponent',
  components: {
    ResolvedJsonForms,
    VThemeProvider,
    VLocaleProvider,
    VDefaultsProvider,
    VContainer,
    VRow,
    VCol,
    DynamicElement,
  },
  emits: ['change', 'handle-action'],
  props: {
    data: { type: [Object, String, Number, Boolean, Array, null] as any },
    schema: {
      type: [Object, String] as any,
      validator: (value: any) => {
        try {
          const obj = typeof value === 'string' ? JSON.parse(value) : value;
          return obj == null || isPlainObject(obj);
        } catch {
          return false;
        }
      },
    },
    uischema: {
      type: [Object, String] as any,
      validator: (value: any) => {
        try {
          const obj = typeof value === 'string' ? JSON.parse(value) : value;
          return obj == null || isPlainObject(obj);
        } catch {
          return false;
        }
      },
    },
    schemaUrl: { type: String },
    config: {
      type: [Object, String] as any,
      validator: (value: any) => {
        try {
          const obj = typeof value === 'string' ? JSON.parse(value) : value;
          return obj == null || isPlainObject(obj);
        } catch {
          return false;
        }
      },
    },
    uischemas: {
      type: [Array, String] as any,
      validator: (value: any) => {
        try {
          const obj = typeof value === 'string' ? JSON.parse(value) : value;
          return obj == null || Array.isArray(obj);
        } catch {
          return false;
        }
      },
    },
    translations: {
      type: [Object, String] as any,
      validator: (value: any) => {
        try {
          const obj = typeof value === 'string' ? JSON.parse(value) : value;
          return obj == null || isPlainObject(obj);
        } catch {
          return false;
        }
      },
    },
    additionalErrors: {
      type: [Array, String] as any,
      validator: (value: any) => {
        try {
          const obj = typeof value === 'string' ? JSON.parse(value) : value;
          return obj == null || Array.isArray(obj);
        } catch {
          return false;
        }
      },
    },
    uidata: {
      type: [Object, String] as any,
      validator: (value: any) => {
        try {
          const obj = typeof value === 'string' ? JSON.parse(value) : value;
          return obj == null || isPlainObject(obj);
        } catch {
          return false;
        }
      },
    },
    readonly: { type: Boolean, default: false },
    validationMode: {
      type: String as PropType<ValidationMode>,
      default: 'ValidateAndShow',
      validator: (v: string) =>
        v === 'ValidateAndShow' ||
        v === 'ValidateAndHide' ||
        v === 'NoValidation',
    },
    locale: { type: String, default: 'en' },
    dark: { type: Boolean, default: false },
    rtl: { type: Boolean, default: false },
    vuetifyOptions: {
      type: [Object, String] as any,
      default: () => ({}),
      validator: (value: any) => {
        try {
          const obj = typeof value === 'string' ? JSON.parse(value) : value;
          return obj == null || isPlainObject(obj);
        } catch {
          return false;
        }
      },
    },
    customStyle: {
      type: String,
      default: '.v-application__wrap { min-height: 0px; }',
    },
  },
  setup(props, { emit }) {
    const appStore = useAppStore();
    appStore.rtl = props.rtl ?? false;
    appStore.dark = props.dark ?? false;
    appStore.locale = props.locale ?? 'en';

    const error = ref<string | undefined>(undefined);

    const normalize = (val: any) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    };

    const dataNormalized = computed(() => normalize(props.data));
    const schemaNormalized = computed(() => {
      const s = normalize(props.schema);
      if (s && !s.$id) s.$id = '/';
      return s;
    });
    const uiSchemaNormalized = computed(() => normalize(props.uischema));
    const configNormalized = computed(() => normalize(props.config));
    const translationsNormalized = computed(() =>
      normalize(props.translations),
    );
    const additionalErrorsNormalized = computed(
      () => normalize(props.additionalErrors) || [],
    );
    const uidataNormalized = computed(() => normalize(props.uidata) || {});
    const uischemasNormalized = computed<JsonFormsUISchemaRegistryEntry[]>(() =>
      parseAndTransformUISchemaRegistryEntries(
        normalize(props.uischemas) || [],
      ),
    );

    const i18nToUse = ref<{ locale: string; translate: Translator }>({
      locale: appStore.locale,
      translate: createTranslator(
        appStore.locale,
        translationsNormalized.value,
      ),
    });

    const context: Ref<FormContext> = ref({
      uidata: reactive(uidataNormalized.value),
    });
    const renderers = markRaw([
      ...extendedVuetifyRenderers,
      ...extraVuetifyRenderers,
    ]);

    const state = reactive<JsonFormsProps>({
      data: dataNormalized.value,
      schema: schemaNormalized.value,
      schemaUrl: props.schemaUrl,
      uischema: uiSchemaNormalized.value,
      renderers,
      cells: undefined,
      config: configNormalized.value,
      readonly: props.readonly,
      uischemas: uischemasNormalized.value,
      validationMode: props.validationMode,
      i18n: i18nToUse.value,
      additionalErrors: additionalErrorsNormalized.value,
      middleware: defaultMiddleware,
    });

    const theme = computed(() => (appStore.dark ? 'dark' : 'light'));
    const vuetifyConfig = computed<VuetifyConfig>(() => ({
      theme: theme.value,
      rtl: appStore.rtl,
      defaults: appStore.defaults,
    }));

    const customStyleToUse = computed(() => props.customStyle);
    const themeInstance = inject<ThemeInstance | undefined>(
      ThemeSymbol,
      undefined,
    );
    const vuetifyThemeCss = computed(() => {
      let css = themeInstance?.styles.value ?? '';
      if (css.startsWith(':root {'))
        css = ':host {' + css.slice(':root {'.length);
      return css;
    });

    // ===== Watchers =====
    watch(dataNormalized, (v) => (state.data = v));
    watch(schemaNormalized, (v) => (state.schema = v), { deep: true });
    watch(uiSchemaNormalized, (v) => (state.uischema = v), { deep: true });
    watch(
      () => props.schemaUrl,
      (v) => (state.schemaUrl = v),
    );
    watch(configNormalized, (v) => (state.config = v), { deep: true });
    watch(uischemasNormalized, (v) => (state.uischemas = v), { deep: true });
    watch(
      () => props.readonly,
      (v) => (state.readonly = v),
    );
    watch(
      () => props.validationMode,
      (v) => (state.validationMode = v as ValidationMode),
    );
    watch(
      translationsNormalized,
      (v) => {
        i18nToUse.value = {
          locale: appStore.locale,
          translate: createTranslator(appStore.locale, v),
        };
        state.i18n = i18nToUse.value;
      },
      { deep: true },
    );
    watch(additionalErrorsNormalized, (v) => (state.additionalErrors = v), {
      deep: true,
    });
    watch(uidataNormalized, (v) => (context.value.uidata = reactive(v)), {
      deep: true,
    });

    const onChange = (event: any) => {
      state.data = event.data;
      emit('change', event);
    };

    const updateAppStoreFromVuetifyOptions = (vuetifyOptions: any) => {
      if (!vuetifyOptions) return;
      const options = normalize(vuetifyOptions);
      if (!isPlainObject(options)) return;
      if (options.defaults && isPlainObject(options.defaults))
        appStore.defaults = options.defaults;
      if (options.blueprint) appStore.blueprint = options.blueprint;
      if (options.icons?.defaultSet)
        appStore.iconset = options.icons.defaultSet;
      if (props.dark === undefined && typeof options.theme?.dark === 'boolean')
        appStore.dark = options.theme.dark;
    };
    updateAppStoreFromVuetifyOptions(props.vuetifyOptions);
    watch(
      () => props.vuetifyOptions,
      (v, oldV) => {
        if (v !== oldV) updateAppStoreFromVuetifyOptions(v);
      },
      { deep: true },
    );

    watch(
      () => props.rtl,
      (v) => (appStore.rtl = v ?? false),
    );
    watch(
      () => props.dark,
      (v) => (appStore.dark = v ?? false),
    );
    watch(
      () => props.locale,
      (v) => {
        appStore.locale = v ?? 'en';
        i18nToUse.value = {
          locale: appStore.locale,
          translate: createTranslator(
            appStore.locale,
            translationsNormalized.value,
          ),
        };
        state.i18n = i18nToUse.value;
      },
    );

    return {
      appStore,
      state,
      theme,
      vuetifyConfig,
      customStyleToUse,
      vuetifyThemeCss,
      error,
      onChange,
      context,
    };
  },
  provide() {
    return {
      [HandleActionEmitterKey]: this.$root!.$emit,
      [FormContextKey]: toRef(this, 'context'),
    };
  },
  mounted() {
    extractAndInjectFonts(this.$el.getRootNode());
  },
});
</script>
