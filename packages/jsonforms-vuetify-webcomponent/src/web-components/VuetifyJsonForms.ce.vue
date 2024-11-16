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
    ></vuetify-json-forms
  ></Suspense>
</template>

<script lang="ts">
import { useAppStore } from '@/store';
import { HandleActionEmitterKey } from '@chobantonov/jsonforms-vuetify-renderers';
import { type ValidationMode } from '@jsonforms/core';
import { type JsonFormsChangeEvent } from '@jsonforms/vue';
import { defineComponent, watch, type PropType } from 'vue';
import VuetifyJsonForms from '../components/VuetifyJsonForms.vue';
import isPlainObject from 'lodash/isPlainObject';

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
      type: Boolean,
      default: false,
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
      type: String,
      default: 'en',
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
      type: Boolean,
      default: false,
    },
    rtl: {
      type: Boolean,
      default: false,
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
  provide() {
    return {
      // provide the this.$emit to be used as handleActionEmitter since this emitter is connected to the native web component
      [HandleActionEmitterKey]: this.$emit,
    };
  },
  methods: {
    onChange(event: JsonFormsChangeEvent): void {
      this.$emit('change', event);
    },
  },
  setup(props) {
    const appStore = useAppStore();
    appStore.rtl = props.rtl;
    appStore.dark = props.dark;
    appStore.locale = props.locale;
    if (props.vuetifyOptions) {
      try {
        const options = JSON.parse(props.vuetifyOptions);
        if (isPlainObject(options)) {
          appStore.defaults = options.defaults;
          appStore.blueprint = options.blueprint;
        }
      } catch (e) {}
    }

    watch(
      () => props.rtl,
      (value) => {
        appStore.rtl = value;
      },
    );
    watch(
      () => props.dark,
      (value) => {
        appStore.dark = value;
      },
    );
    watch(
      () => props.locale,
      (value) => {
        appStore.locale = value;
      },
    );
    watch(
      () => props.vuetifyOptions,
      (value) => {
        if (value) {
          try {
            const options = JSON.parse(value);
            if (isPlainObject(options)) {
              appStore.defaults = options.defaults;
              appStore.blueprint = options.blueprint;
              if (options.icons?.defaultSet) {
                appStore.iconset = options.icons.defaultSet;
              }
            }
          } catch (e) {}
        } else {
          appStore.defaults = {};
          appStore.blueprint = 'md1';
          appStore.iconset = 'mdi';
        }
      },
    );

    return appStore;
  },
});

export default vuetifyFormWc;
</script>
