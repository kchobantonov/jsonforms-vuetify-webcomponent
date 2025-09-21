<template>
  <Suspense>
    <div>
      <dynamic-element
        tag="style"
        type="text/css"
        :id="stylesheetId"
        :nonce="stylesheetNonce"
      >
        {{ vuetifyThemeCss }}
      </dynamic-element>

      <slot-element name="styles"></slot-element>

      <dynamic-element tag="style" type="text/css" :nonce="stylesheetNonce">
        {{ customStyleToUse }}
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

              <template v-else>
                <slot-element name="form-header">
                  <!-- Place custom content inside <div slot="form-header"></div> within <vuetify-json-forms> to fill this slot -->
                </slot-element>

                <resolved-json-forms
                  part="json-forms"
                  :state="state as JsonFormsProps"
                  :vuetify-config="vuetifyConfig"
                  @change="onChange"
                ></resolved-json-forms>

                <slot-element name="form-footer">
                  <!-- Place custom content inside <div slot="form-footer"></div> within <vuetify-json-forms> to fill this slot -->
                </slot-element>
              </template>
            </v-sheet>
          </v-defaults-provider>
        </v-theme-provider>
      </v-locale-provider>
    </div>
  </Suspense>
</template>

<script lang="ts">
import {
  defaultVuetifyOptions,
  isValidVuetifyOptions,
  type VuetifyOptions,
} from '@/plugins/options';
import buildVuetify from '@/plugins/vuetify';
import { useAppStore } from '@/store';
import {
  createTranslator,
  DynamicElement,
  SlotElement,
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
  onMounted,
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
import { createTheme } from 'vuetify/lib/composables/theme.mjs';

const DANGEROUS_TAGS = [
  'SCRIPT',
  'IFRAME',
  'OBJECT',
  'EMBED',
  'APPLET',
  'CANVAS', // Can be used for fingerprinting/malicious drawing
  'META', // Can redirect or change document behavior
  'BASE', // Can redirect or change document behavior
];

type SlotRules = {
  readonly [K in 'styles' | 'form-header' | 'form-footer']: {
    readonly allow?: readonly string[];
    readonly deny?: readonly string[];
  };
};
const slotRules: SlotRules = {
  styles: {
    allow: ['STYLE', 'LINK'],
  },
  'form-header': {
    deny: ['STYLE', 'LINK'],
  },
  'form-footer': {
    deny: ['STYLE', 'LINK'],
  },
};

const toBoolean = (val: any): boolean | undefined => {
  if (typeof val === 'string') {
    return val === 'true';
  }

  if (typeof val === 'boolean') {
    return val;
  }

  return undefined;
};

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
    SlotElement,
  },
  emits: ['change', 'handle-action'],
  props: {
    data: { type: [Object, String, Number, Array, null] as any }, // remove Boolean since it is a specially treated by the webcomponent
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
    readonly: { type: String, default: 'false' },
    validationMode: {
      type: String as PropType<ValidationMode>,
      default: 'ValidateAndShow',
      validator: (v: string) =>
        v === 'ValidateAndShow' ||
        v === 'ValidateAndHide' ||
        v === 'NoValidation',
    },
    locale: { type: String, default: 'en' },
    dark: { type: String, default: undefined },
    rtl: { type: String, default: 'false' },
    vuetifyOptions: {
      type: [Object as PropType<VuetifyOptions>, String] as any,
      validator: isValidVuetifyOptions,
    },
    customStyle: {
      type: String,
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

    let dark: boolean | undefined = toBoolean(props.dark);

    if (dark === undefined) {
      // if dark is not yet defined by the props then check the vuetifyOptions
      const colorSchema = vuetifyOptions?.['color-schema'];

      if (colorSchema === 'dark') {
        dark = true;
      } else if (colorSchema === 'light') {
        dark = false;
      }
    }

    const appStore = useAppStore({
      dark,
      vuetifyOptions: vuetifyOptions ?? {},
    });

    // Configure Vuetify and other plugins here
    app!.use(buildVuetify(appStore));

    appStore.rtl = toBoolean(props.rtl) ?? false;
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
      readonly: toBoolean(props.readonly),
      uischemas: uischemasNormalized.value,
      validationMode: props.validationMode,
      i18n: i18nToUse.value,
      additionalErrors: additionalErrorsNormalized.value,
      middleware: defaultMiddleware,
    });

    const themeInstance = useTheme();
    const isPreferredDark = useMediaQuery('(prefers-color-scheme: dark)');

    const theme = computed(() => {
      // add props as deps as well
      if (typeof props.vuetifyOptions === 'object') {
        const opts = props.vuetifyOptions as VuetifyOptions;
        if (typeof opts.theme === 'object') {
          // add defaultTheme as deps, only touching is needed
          opts.theme.defaultTheme;
        }
      }

      let dark = appStore.dark ?? isPreferredDark.value;
      let defaultTheme = dark ? 'dark' : 'light';
      if (
        typeof appStore.vuetifyOptions.theme === 'object' &&
        appStore.vuetifyOptions.theme.defaultTheme
      ) {
        defaultTheme = appStore.vuetifyOptions.theme.defaultTheme;
      }

      if (defaultTheme === 'system') {
        defaultTheme = isPreferredDark.value ? 'dark' : 'light';
      }
      const exists = (themeName: string) =>
        themeName in themeInstance.themes.value;

      return getLightDarkTheme(dark, defaultTheme, exists);
    });

    const stylesheetId = computed(() =>
      typeof appStore.vuetifyOptions.theme === 'object'
        ? (appStore.vuetifyOptions.theme.stylesheetId ??
          'vuetify-theme-stylesheet')
        : 'vuetify-theme-stylesheet',
    );

    const stylesheetNonce = computed(() =>
      typeof appStore.vuetifyOptions.theme === 'object'
        ? appStore.vuetifyOptions.theme.cspNonce
        : undefined,
    );

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
      (v) => (state.readonly = toBoolean(v)),
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
      (v) => (appStore.rtl = toBoolean(v) ?? false),
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

    watch(
      () => props.dark,
      (dark, oldDark) => {
        if (dark !== oldDark) {
          let newDark = toBoolean(dark);
          if (newDark === undefined) {
            // check the vuetify options
            if (props.vuetifyOptions?.['color-schema']) {
              const colorSchema = vuetifyOptions?.['color-schema'];

              if (colorSchema === 'dark') {
                newDark = true;
              } else if (colorSchema === 'light') {
                newDark = false;
              }
            }
          }

          appStore.dark = newDark;
        }
      },
    );
    watch(
      () => props.vuetifyOptions,
      (vuetifyOptions, oldVuetifyOptions) => {
        if (vuetifyOptions?.locale !== oldVuetifyOptions?.locale) {
          appStore.locale =
            props.locale ?? vuetifyOptions?.locale?.locale ?? 'en';
        }

        if (
          toBoolean(props.dark) === undefined &&
          vuetifyOptions?.['color-schema'] !==
            oldVuetifyOptions?.['color-schema']
        ) {
          const colorSchema = vuetifyOptions?.['color-schema'];

          if (colorSchema === 'dark') {
            appStore.dark = true;
          } else if (colorSchema === 'light') {
            appStore.dark = false;
          }
        }

        appStore.vuetifyOptions = {
          ...defaultVuetifyOptions,
          ...vuetifyOptions,
        };

        if (vuetifyOptions.theme) {
          const newThemeInstance = createTheme(appStore.vuetifyOptions.theme);

          themeInstance.themes.value = newThemeInstance.themes.value;
          themeInstance.global.name.value = theme.value;
        }
      },
      { deep: true },
    );
    const injectFontsStyle = (root: Node) => {
      // Inject all @font-face rules from component's styles and Vuetify theme
      extractAndInjectFonts(root, 'vuetify-json-forms-fonts');
    };

    const injectCustomFontsStyle = (css: string) => {
      extractAndInjectFonts(css, 'vuetify-json-forms-fonts-custom');
    };

    onMounted(() => {
      const vm = getCurrentInstance();

      const shadowRoot = vm?.vnode?.el?.getRootNode();

      injectFontsStyle(shadowRoot);
      if (customStyleToUse.value) {
        injectCustomFontsStyle(customStyleToUse.value);
      }

      shadowRoot.addEventListener('slotchange', (e: Event) => {
        const slot = e.target;

        if (slot instanceof HTMLSlotElement && slot.name in slotRules) {
          const rules = slotRules[slot.name as keyof SlotRules];
          slot.assignedElements().forEach((el) => {
            if (DANGEROUS_TAGS.includes(el.tagName)) {
              console.error(
                `Security violation: <${el.tagName.toLowerCase()}> is not allowed in any slot. Element removed.`,
              );
              el.remove();
              return; // Skip further validation for this element
            }

            // Deny list check (highest priority)
            if (rules.deny && rules.deny.includes(el.tagName)) {
              console.error(
                `Denied: <${el.tagName.toLowerCase()}> removed from "${slot.name}".`,
              );
              el.remove();
              return;
            }

            if (rules.allow && !rules.allow.includes(el.tagName)) {
              console.error(
                `Consider using ${rules.allow.join(', ')} tags for ${slot.name} slot`,
              );
              el.remove();
              return;
            }
          });
        }
      });
    });

    watch(customStyleToUse, (newCss) => {
      if (newCss) injectCustomFontsStyle(newCss);
    });

    return {
      appStore,
      state,
      theme,
      stylesheetId,
      stylesheetNonce,
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
});
</script>
