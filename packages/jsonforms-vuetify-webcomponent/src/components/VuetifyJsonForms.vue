<template>
  <Suspense>
    <div ref="root">
      <custom-style type="text/css" id="vuetify-theme-stylesheet">
        {{ vuetifyThemeCss }}
      </custom-style>

      <custom-style type="text/css">
        {{ customStyle }}
      </custom-style>

      <v-locale-provider :rtl="appStore.rtl" :locale="appStore.locale">
        <v-theme-provider :theme="appStore.dark ? 'dark' : 'light'">
          <v-app>
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
              @change="onChange"
            ></resolved-json-forms>
          </v-app>
        </v-theme-provider>
      </v-locale-provider>
    </div>
  </Suspense>
</template>

<script lang="ts">
import { useAppStore } from '@/store';
import {
  createTranslator,
  FormContext,
  JsonFormsProps,
  ResolvedJsonForms,
  TemplateComponentsKey,
  TemplateContextKey,
  VMonacoEditor,
  extraVuetifyRenderers,
} from '@chobantonov/jsonforms-vuetify-renderers';
import {
  defaultMiddleware,
  JsonFormsUISchemaRegistryEntry,
  NOT_APPLICABLE,
  Translator,
  UISchemaElement,
  UISchemaTester,
  ValidationMode,
} from '@jsonforms/core';
import { JsonFormsChangeEvent } from '@jsonforms/vue';
import { ErrorObject } from 'ajv';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isPlainObject from 'lodash/isPlainObject';
import * as shadyCss from 'shady-css-parser';
import {
  defineComponent,
  h,
  inject,
  type InjectionKey,
  markRaw,
  PropType,
  reactive,
  Ref,
  ref,
  toRef,
} from 'vue';
import { type ThemeInstance } from 'vuetify';
import { VApp, VLocaleProvider, VThemeProvider } from 'vuetify/components';

import { extendedVuetifyRenderers } from '@jsonforms/vue-vuetify';

const ThemeSymbol: InjectionKey<ThemeInstance> = Symbol.for('vuetify:theme');

const CustomStyle = defineComponent({
  name: 'custom-style',
  setup(_, { slots }) {
    return () => h('style', slots.default ? slots.default() : []);
  },
});

const transformUISchemas = (
  uischemas?: string,
): JsonFormsUISchemaRegistryEntry[] => {
  const uischemasMap: {
    tester: string;
    uischema: UISchemaElement;
  }[] = typeof uischemas === 'string' ? JSON.parse(uischemas) : [];

  return uischemasMap
    .map((elem, index) => {
      if (elem.tester) {
        const action: UISchemaTester = (jsonSchema, schemaPath, path) => {
          try {
            const tester = new Function(
              'jsonSchema, schemaPath, path',
              `const NOT_APPLICABLE = -1; const tester = ${elem.tester}; return tester(jsonSchema, schemaPath, path);`,
            );
            const result = tester(jsonSchema, schemaPath, path);
            if (typeof result !== 'number') {
              console.error(
                `Error at uischema tester[${index}]: invalid result type, expected number but got ${typeof result}`,
              );
            }
            return typeof result === 'number' ? result : NOT_APPLICABLE;
          } catch (e) {
            console.error(`Error at uischema tester[${index}]: ${e}`);
            return NOT_APPLICABLE;
          }
        };
        return {
          tester: action,
          uischema: elem.uischema,
        };
      }
      return null;
    })
    .filter((x) => !!x) as JsonFormsUISchemaRegistryEntry[];
};

const vuetifyFormWc = defineComponent({
  components: {
    ResolvedJsonForms,
    VApp,
    VThemeProvider,
    VLocaleProvider,
    CustomStyle,
  },
  emits: ['change'],
  props: {
    data: {
      required: true,
      type: String,
    },
    schema: {
      required: false,
      type: String,
      default: undefined,
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
      default: undefined,
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
      default: undefined,
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
      type: String,
      default: 'false',
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
      default: '.v-application__wrap { min-height: 0px; }',
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

    let error: any = undefined;

    let dataToUse: any = undefined;
    let schemaToUse: Record<string, any> | undefined = undefined;
    let schemaUrlToUse: string | undefined = undefined;
    let uischemaToUse: UISchemaElement | undefined = undefined;
    let configToUse: Record<string, any> | undefined = undefined;
    let readonlyToUse = false;
    let uischemasToUse: JsonFormsUISchemaRegistryEntry[] = [];
    let validationModeToUse: ValidationMode = 'ValidateAndShow';
    let additionalErrorsToUse: ErrorObject[] = [];
    let translationsToUse: Record<string, any> = {};

    let uidataToUse: Record<string, any> = {};

    try {
      try {
        dataToUse =
          typeof props.data == 'string' ? JSON.parse(props.data) : undefined;
      } catch (e) {
        error = `Data Error: ${e}`;
        console.log(e);
      }
      try {
        schemaToUse =
          typeof props.schema == 'string'
            ? JSON.parse(props.schema)
            : undefined;
      } catch (e) {
        error = `Schema Error: ${e}`;
        console.log(e);
      }
      schemaUrlToUse =
        typeof props.schemaUrl == 'string' ? props.schemaUrl : undefined;
      try {
        uischemaToUse =
          typeof props.uischema == 'string'
            ? JSON.parse(props.uischema)
            : undefined;
      } catch (e) {
        error = `UISchema Error: ${e}`;
        console.log(e);
      }

      try {
        configToUse =
          typeof props.config == 'string'
            ? JSON.parse(props.config)
            : undefined;
      } catch (e) {
        error = `Config Error: ${e}`;
        console.log(e);
      }

      readonlyToUse = props.readonly == 'true';

      validationModeToUse =
        props.validationMode === 'ValidateAndShow' ||
        props.validationMode === 'ValidateAndHide' ||
        props.validationMode === 'NoValidation'
          ? props.validationMode
          : 'ValidateAndShow';

      try {
        translationsToUse =
          typeof props.translations == 'string'
            ? JSON.parse(props.translations)
            : undefined;
      } catch (e) {
        error = `Translations Error: ${e}`;
        console.log(e);
      }

      try {
        uischemasToUse = transformUISchemas(props.uischemas);
      } catch (e) {
        error = `UISchemas Error: ${e}`;
        console.log(e);
      }

      try {
        additionalErrorsToUse =
          typeof props.additionalErrors == 'string'
            ? JSON.parse(props.additionalErrors)
            : undefined;
      } catch (e) {
        error = `Additional Errors Error: ${e}`;
        console.log(e);
      }

      try {
        uidataToUse =
          typeof props.uidata === 'string' ? JSON.parse(props.uidata) : {};
      } catch (e) {
        error = `UIData Error: ${e}`;
        console.log(e);
      }
    } catch (e) {
      error = `Error: ${e}`;
      console.log(e);
    }
    let context: Ref<FormContext & { uidata: Record<string, any> }> = ref({
      uidata: uidataToUse,
    });

    // provide the schema $id so that we can refer to it in UI schema rule conditions
    if (schemaToUse && !schemaToUse.$id) {
      schemaToUse.$id = '/';
    }

    const renderers = markRaw([
      ...extendedVuetifyRenderers,
      ...extraVuetifyRenderers,
    ]);

    const state = reactive<JsonFormsProps>({
      data: dataToUse,
      schema: schemaToUse,
      schemaUrl: schemaUrlToUse,
      uischema: uischemaToUse,
      renderers: renderers,
      cells: undefined, // not defined
      config: configToUse,
      readonly: readonlyToUse,
      uischemas: uischemasToUse,
      validationMode: validationModeToUse,
      i18n: {
        locale: appStore.locale,
        translate: createTranslator(appStore.locale, translationsToUse),
      },
      additionalErrors: additionalErrorsToUse,
      middleware: defaultMiddleware,
    });

    return {
      error,
      state,
      uidataToUse,
      translationsToUse,
      context,
      appStore,
    };
  },
  provide() {
    return {
      // demo how we can extend the template layout components that we can use.
      [TemplateComponentsKey]: {
        VMonacoEditor,
      },
      [TemplateContextKey]: toRef(this, 'context'),
      formContext: toRef(this, 'context'),
    };
  },
  watch: {
    data: {
      handler(value?: string, oldValue?: string) {
        if (value !== oldValue) {
          const data =
            typeof value === 'string' ? JSON.parse(value) : undefined;
          this.state.data = data;
          this.$forceUpdate();
        }
      },
    },
    schema: {
      handler(value?: string, oldValue?: string) {
        if (value !== oldValue) {
          const schema =
            typeof value === 'string' ? JSON.parse(value) : undefined;
          this.state.schema = schema;
          this.$forceUpdate();
        }
      },
    },
    schemaUrl: {
      handler(value?: string, oldValue?: string) {
        if (value !== oldValue) {
          const schemaUrl = typeof value === 'string' ? value : undefined;
          this.state.schemaUrl = schemaUrl;
          this.$forceUpdate();
        }
      },
    },
    uischema: {
      handler(value?: string, oldValue?: string) {
        if (value !== oldValue) {
          const uischema =
            typeof value === 'string' ? JSON.parse(value) : undefined;
          this.state.uischema = uischema;
          this.$forceUpdate();
        }
      },
    },
    config: {
      handler(value?: string, oldValue?: string) {
        if (value !== oldValue) {
          const config =
            typeof value === 'string' ? JSON.parse(value) : undefined;
          this.state.config = config;
          this.$forceUpdate();
        }
      },
    },
    readonly: {
      handler(value?: string, oldValue?: string) {
        if (value !== oldValue) {
          this.state.readonly = value == 'true';
          this.$forceUpdate();
        }
      },
    },
    uischemas: {
      handler(value?: string, oldValue?: string) {
        if (value !== oldValue) {
          this.state.uischemas = transformUISchemas(value);
          this.$forceUpdate();
        }
      },
    },
    validationMode: {
      handler(value?: string, oldValue?: string) {
        if (value !== oldValue) {
          this.state.validationMode =
            value === 'ValidateAndShow' ||
            value === 'ValidateAndHide' ||
            value === 'NoValidation'
              ? value
              : 'ValidateAndShow';
          this.$forceUpdate();
        }
      },
    },
    translations: {
      handler(value?: string, oldValue?: string) {
        if (value !== oldValue) {
          this.translationsToUse =
            typeof value === 'string' ? JSON.parse(value) : {};

          this.state.i18n = {
            locale: this.appStore.locale,
            translate: createTranslator(
              this.appStore.locale,
              this.translationsToUse,
            ) as Translator,
          };
          this.$forceUpdate();
        }
      },
    },
    'appStore.locale': {
      handler(value: string, oldValue?: string) {
        if (value !== oldValue) {
          this.state.i18n = {
            locale: value,
            translate: createTranslator(
              value,
              this.translationsToUse,
            ) as Translator,
          };
          this.$forceUpdate();
        }
      },
    },
    additionalErrors: {
      handler(value?: string, oldValue?: string) {
        if (value !== oldValue) {
          this.state.additionalErrors =
            typeof value === 'string' ? JSON.parse(value) : [];
          this.$forceUpdate();
        }
      },
    },
    uidata: {
      handler(value?: string, oldValue?: string) {
        if (value !== oldValue) {
          this.uidataToUse = typeof value === 'string' ? JSON.parse(value) : {};
          this.context.uidata = this.uidataToUse;
          this.$forceUpdate();
        }
      },
    },
  },
  async mounted() {
    this.injectShadowFontsInDocument();
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
    // include the fonts outside the webcomponent for now - https://github.com/google/material-design-icons/issues/1165
    injectShadowFontsInDocument(): void {
      const root = this.$el.getRootNode();
      if (root instanceof ShadowRoot && root.hasChildNodes()) {
        const parser = new shadyCss.Parser();
        class FaceFontStringifier extends shadyCss.Stringifier {
          insideFontFace = false;
          visit(node: shadyCss.Node): string | undefined {
            if (node.type === shadyCss.nodeType.stylesheet) {
              return super.visit(node);
            }
            if (
              node.type === shadyCss.nodeType.atRule &&
              node.name === 'font-face'
            ) {
              try {
                this.insideFontFace = true;
                return super.visit(node);
              } finally {
                this.insideFontFace = false;
              }
            }
            return this.insideFontFace ? super.visit(node) : '';
          }
        }
        const faceFontStringifier = new FaceFontStringifier();

        // we have css with scope so we should have unique id
        const rootTemplate = this.$refs['root'] as Element;
        const dataAttrNames = rootTemplate
          .getAttributeNames()
          .filter((an) => an.startsWith('data-v-'));
        const uniqueId =
          dataAttrNames && dataAttrNames.length > 0 ? dataAttrNames[0] : '';

        let children = root.childNodes;
        for (let i = 0; i < children.length; i++) {
          const node = children[i];
          if (node.nodeName.toLowerCase() === 'style' && node.textContent) {
            try {
              const id = `vuetify-json-forms-${uniqueId}-ff-${i}`;
              let el = document.querySelector(`style[id="${id}"]`);
              if (!el) {
                el = document.createElement('style');
                el.id = id;
                const ast = parser.parse(node.textContent);
                el.textContent = faceFontStringifier.stringify(ast);
                document.head.appendChild(el);
              }
            } catch (e) {
              console.log(e);
            }
          }
        }
      }
    },
    onChange(event: JsonFormsChangeEvent): void {
      this.$emit('change', event);
    },
    vuetifyProps(
      options: Record<string, any>,
      path: string,
    ): Record<string, any> {
      const props = get(options?.vuetify, path);

      return props && isPlainObject(props) ? props : {};
    },
  },
});

export default vuetifyFormWc;
</script>

<style scoped></style>
