<template>
  <Suspense>
    <vuetify-json-forms
      :data="data"
      :schema="schema"
      :schemaUrl="schemaUrl"
      :uischema="uischema"
      :config="config"
      :readonly="readonly"
      :uischemas="uischemas"
      :validationMode="validationMode"
      :customStyle="customStyle"
      :translations="translations"
      :additionalErrors="additionalErrors"
      :uidata="uidata"
      @change="onChange"
    ></vuetify-json-forms>
  </Suspense>
</template>

<script lang="ts">
import { useAppStore } from '@/store';
import { type ValidationMode } from '@jsonforms/core';
import { type JsonFormsChangeEvent } from '@jsonforms/vue';
import isPlainObject from 'lodash/isPlainObject';
import {
  defineAsyncComponent,
  defineComponent,
  watch,
  type PropType,
} from 'vue';

const VuetifyJsonForms = defineAsyncComponent(
  () => import('../components/VuetifyJsonForms.vue'),
);

const vuetifyFormWc = defineComponent({
  components: {
    VuetifyJsonForms,
  },
  emits: ['change', 'handle-action'],
  props: {
    data: {
      type: String,
      validator: function (value) {
        try {
          const data = typeof value == 'string' ? JSON.parse(value) : value;

          return data !== undefined && data !== null;
        } catch (e) {
          return false;
        }
      },
    },
    schema: {
      type: String,
      validator: function (value) {
        try {
          const schema = typeof value == 'string' ? JSON.parse(value) : value;

          return schema !== undefined && schema !== null;
        } catch (e) {
          return false;
        }
      },
    },
    schemaUrl: {
      type: String,
    },
    uischema: {
      type: String,
      validator: function (value) {
        try {
          const uischema = typeof value == 'string' ? JSON.parse(value) : value;

          return uischema !== undefined && uischema !== null;
        } catch (e) {
          return false;
        }
      },
    },
    config: {
      type: String,
      validator: function (value) {
        try {
          const config = typeof value == 'string' ? JSON.parse(value) : value;

          return config !== undefined && config !== null;
        } catch (e) {
          return false;
        }
      },
    },
    readonly: {
      required: false,
      type: Boolean,
      default: undefined,
    },
    uischemas: {
      type: String,
      validator: function (value) {
        try {
          const uischemas =
            typeof value == 'string' ? JSON.parse(value) : value;

          return (
            uischemas !== undefined &&
            uischemas !== null &&
            Array.isArray(uischemas)
          );
        } catch (e) {
          return false;
        }
      },
    },
    validationMode: {
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
    locale: {
      required: false,
      type: String,
      default: undefined,
    },
    customStyle: {
      type: String,
      default: '.v-application__wrap { min-height: 0px; }',
    },
    translations: {
      type: String,
      validator: function (value) {
        try {
          const translations =
            typeof value == 'string' ? JSON.parse(value) : value;

          return translations !== null;
        } catch (e) {
          return false;
        }
      },
    },
    additionalErrors: {
      type: String,
      validator: function (value) {
        try {
          const additionalErrors =
            typeof value == 'string' ? JSON.parse(value) : value;

          return (
            additionalErrors !== undefined &&
            additionalErrors !== null &&
            Array.isArray(additionalErrors)
          );
        } catch (e) {
          return false;
        }
      },
    },
    dark: {
      required: false,
      type: Boolean,
      default: undefined,
    },
    rtl: {
      required: false,
      type: Boolean,
      default: undefined,
    },
    uidata: {
      type: String,
      default: () => {
        return '{}';
      },
      validator: function (value) {
        try {
          const data = typeof value == 'string' ? JSON.parse(value) : value;

          return data !== undefined && data !== null;
        } catch (e) {
          return false;
        }
      },
    },
    vuetifyOptions: {
      type: String,
      default: () => {
        return '{}';
      },
      validator: function (value) {
        try {
          const options = typeof value == 'string' ? JSON.parse(value) : value;

          return (
            options !== undefined && options !== null && isPlainObject(options)
          );
        } catch (e) {
          return false;
        }
      },
    },
  },
  methods: {
    onChange(event: JsonFormsChangeEvent): void {
      this.$emit('change', event);
    },
  },
  setup(props) {
    const appStore = useAppStore();
    appStore.rtl = props.rtl !== undefined ? props.rtl : false;
    appStore.dark = props.dark !== undefined ? props.dark : false;
    appStore.locale = props.locale !== undefined ? props.locale : 'en';

    const updateAppStore = (vuetifyOptions: string | undefined | object) => {
      if (vuetifyOptions === undefined) {
        return;
      }
      try {
        const options =
          typeof vuetifyOptions === 'string'
            ? JSON.parse(vuetifyOptions)
            : vuetifyOptions;

        if (isPlainObject(options)) {
          appStore.defaults = options.defaults;
          appStore.blueprint = options.blueprint;

          if (options.icons?.defaultSet) {
            appStore.iconset = options.icons.defaultSet;
          }

          if (
            props.dark === undefined &&
            typeof options.theme?.dark === 'boolean'
          ) {
            appStore.dark = options.theme.dark;
          }
        }
      } catch (e) {
        console.log('vuetify-options error:', e);
      }
    };

    updateAppStore(props.vuetifyOptions);

    watch(
      () => props.rtl,
      (value, oldValue) => {
        if (value !== oldValue) {
          appStore.rtl = value !== undefined ? value : false;
        }
      },
    );
    watch(
      () => props.dark,
      (value, oldValue) => {
        if (value !== oldValue) {
          appStore.dark = value !== undefined ? value : false;
        }
      },
    );
    watch(
      () => props.locale,
      (value, oldValue) => {
        if (value !== oldValue) {
          appStore.locale = value !== undefined ? value : 'en';
        }
      },
    );
    watch(
      () => props.vuetifyOptions,
      (value, oldValue) => {
        if (value !== oldValue) {
          if (value) {
            updateAppStore(value);
          } else {
            updateAppStore({
              defaults: {},
              blueprint: 'md1',
              iconset: 'mdi',
            });
          }
        }
      },
    );

    return {
      appStore,
    };
  },
});

export default vuetifyFormWc;
</script>
