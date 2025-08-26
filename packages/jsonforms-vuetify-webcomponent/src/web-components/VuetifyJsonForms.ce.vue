<template>
  <Suspense>
    <div>
      <dynamic-element tag="style" type="text/css" :id="stylesheetId">
        {{ vuetifyThemeCss }}
      </dynamic-element>

      <dynamic-element tag="style" type="text/css">
        {{ customStyleToUse }}
      </dynamic-element>
      <dynamic-element tag="slot" name="jsonforms-header">
        <!-- Place custom content inside <div slot="jsonforms-header"></div> within <vuetify-json-forms> to fill this slot -->
      </dynamic-element>

      <v-locale-provider :rtl="appStore.rtl" :locale="appStore.locale">
        <v-theme-provider :theme="theme">
          <v-defaults-provider :defaults="appStore.vuetifyOptions.defaults">
            <v-sheet>
              <v-container style="height: 400px" v-if="error !== undefined">
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

              <resolved-json-forms
                v-else
                :state="state as JsonFormsProps"
                :vuetify-config="vuetifyConfig"
                @change="onChange"
              ></resolved-json-forms>
            </v-sheet>
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
import { isValidVuetifyOptions, type VuetifyOptions } from '@/plugins/options';
import buildVuetify from '@/plugins/vuetify';
import { useAppStore } from '@/store';
import {
  createTranslator,
  DynamicElement,
  extraVuetifyRenderers,
  type FormContext,
  FormContextKey,
  getLightDarkTheme,
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
import { useMediaQuery } from '@vueuse/core';
import isPlainObject from 'lodash/isPlainObject';
import {
  computed,
  defineComponent,
  getCurrentInstance,
  markRaw,
  type PropType,
  reactive,
  type Ref,
  ref,
  toRef,
  watch,
} from 'vue';
import { useTheme } from 'vuetify';
import {
  VCol,
  VContainer,
  VDefaultsProvider,
  VLocaleProvider,
  VRow,
  VSheet,
  VThemeProvider,
} from 'vuetify/components';
import { extractAndInjectFonts } from '../util/inject-fonts';

const ThemeSymbol = Symbol.for('vuetify:theme');

export default defineComponent({
  name: 'VuetifyJsonForms',
  components: {
    ResolvedJsonForms,
    VThemeProvider,
    VLocaleProvider,
    VDefaultsProvider,
    VContainer,
    VRow,
    VCol,
    VSheet,
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
    dark: { type: Boolean, default: undefined },
    rtl: { type: Boolean, default: false },
    vuetifyOptions: {
      type: [Object as PropType<VuetifyOptions>, String] as any,
      validator: isValidVuetifyOptions,
    },
    customStyle: {
      type: String,
      default: '.v-application__wrap { min-height: 0px; }',
    },
  },
  setup(props, { emit }) {
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

    const app = getCurrentInstance()?.appContext.app;
    const vuetifyOptions: VuetifyOptions | null | undefined = normalize(
      props.vuetifyOptions,
    );
    const appStore = useAppStore({
      vuetifyOptions: vuetifyOptions ?? {},
    });

    // Configure Vuetify and other plugins here
    app!.use(buildVuetify(appStore));

    appStore.rtl = props.rtl ?? false;
    appStore.dark = props.dark ?? false;
    appStore.locale = props.locale ?? vuetifyOptions?.locale?.locale ?? 'en';

    const error = ref<string | undefined>(undefined);

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

    const themeInstance = useTheme();
    const isPreferredDark = useMediaQuery('(prefers-color-scheme: dark)');

    const theme = ref('light');
    watch(
      () => appStore.dark,
      (dark) => {
        const exists = (themeName: string) =>
          themeName in themeInstance.themes.value;

        theme.value = getLightDarkTheme(
          dark ?? isPreferredDark.value,
          theme.value,
          exists,
        );
      },
      { immediate: true },
    );

    const stylesheetId =
      typeof appStore.vuetifyOptions.theme === 'object'
        ? (appStore.vuetifyOptions.theme.stylesheetId ??
          'vuetify-theme-stylesheet')
        : 'vuetify-theme-stylesheet';

    const customStyleToUse = computed(() => props.customStyle);
    const vuetifyThemeCss = computed(() => {
      let css = themeInstance?.styles.value ?? '';
      if (css.startsWith(':root {'))
        css = ':host {' + css.slice(':root {'.length);
      return css;
    });

    const vuetifyConfig = computed<VuetifyConfig>(() => ({
      components: appStore.vuetifyOptions.components ?? {},
      directives: appStore.vuetifyOptions.directives ?? {},
      defaults: appStore.vuetifyOptions.defaults ?? {},
      theme: theme.value,
      rtl: appStore.rtl,
    }));

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
      emit('change', event);
    };

    watch(
      () => props.rtl,
      (v) => (appStore.rtl = v ?? false),
    );
    watch(
      () => props.dark,
      (v) => (appStore.dark = v),
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
      stylesheetId,
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
