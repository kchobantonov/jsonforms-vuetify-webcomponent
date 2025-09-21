<script lang="ts">
import type {
  JsonFormsUISchemaRegistryEntry,
  JsonSchema,
  UISchemaElement,
  ValidationMode,
} from '@jsonforms/core';
import type { MaybeReadonly } from '@jsonforms/vue';
import { useScriptTag } from '@vueuse/core';
import type { ErrorObject } from 'ajv';
import isPlainObject from 'lodash/isPlainObject';
import {
  defineComponent,
  h,
  isRef,
  nextTick,
  onBeforeUnmount,
  ref,
  toRaw,
  unref,
  useAttrs,
  watch,
  type PropType,
} from 'vue';
import type { VuetifyOptions } from 'vuetify';
import { VProgressLinear } from 'vuetify/components';

export default defineComponent({
  name: 'VuetifyJsonFormsWrapper',
  components: { VProgressLinear },
  emits: ['change', 'handle-action'],
  props: {
    data: { type: [String, Number, Boolean, Array, Object] as PropType<any> },
    schema: { type: [Object, Boolean] as PropType<JsonSchema> },
    uischema: { type: Object as PropType<UISchemaElement> },
    schemaUrl: { type: String },
    config: {
      type: Object as PropType<Record<string, unknown>>,
      validator: validateObj,
    },
    uischemas: {
      type: Array as PropType<MaybeReadonly<JsonFormsUISchemaRegistryEntry[]>>,
    },
    translations: {
      type: Object as PropType<Record<string, unknown>>,
      validator: validateObj,
    },
    additionalErrors: { type: Array as PropType<ErrorObject[]> },
    uidata: {
      type: Object as PropType<Record<string, unknown>>,
      validator: validateObj,
    },
    readonly: { type: Boolean, default: false },
    validationMode: {
      type: String as PropType<ValidationMode>,
      default: 'ValidateAndShow',
      validator: (v: string) =>
        ['ValidateAndShow', 'ValidateAndHide', 'NoValidation'].includes(v),
    },
    locale: { type: String, default: 'en' },
    dark: { type: Boolean, default: undefined },
    rtl: { type: Boolean, default: false },
    vuetifyOptions: {
      type: Object as PropType<Partial<VuetifyOptions>>,
      validator: validateObj,
    },
    customStyle: { type: String },
  },
  setup(props, { slots, emit }) {
    const attrs = useAttrs();
    const loading = ref(true);
    const elRef = ref<HTMLElement | null>(null);

    const normalize = (val: any) => {
      if (isRef(val)) return unref(val);
      if (typeof val === 'object' && val !== null) return toRaw(val);
      return val;
    };

    const assignProp = (el: HTMLElement, key: string, value: any) => {
      const raw = normalize(value);
      if ((el as any)[key] !== raw) {
        (el as any)[key] = raw;
      }
    };

    const assignAll = (el: HTMLElement, obj: Record<string, any>) => {
      Object.entries(obj).forEach(([k, v]) => assignProp(el, k, v));
    };

    const handleChange = (e: Event) => {
      const details = (e as CustomEvent).detail as any[];
      emit('change', details[0]);
    };
    const handleAction = (e: Event) => {
      const details = (e as CustomEvent).detail as any[];
      emit('handle-action', details[0]);
    };

    // Load the web component
    useScriptTag(
      './js/vuetify-json-forms.js',
      async () => {
        loading.value = false;

        await nextTick();
        if (elRef.value) {
          assignAll(elRef.value, { ...attrs, ...props });

          elRef.value.addEventListener('change', handleChange);
          elRef.value.addEventListener('handle-action', handleAction);
        }
      },
      { type: 'module' },
    );

    // Watch each prop individually
    Object.keys(props).forEach((key) => {
      watch(
        () => (props as any)[key],
        (val, oldVal) => {
          if (
            'data' === key &&
            JSON.stringify(val) === JSON.stringify(oldVal)
          ) {
            return;
          }

          let raw = normalize(val);
          if (raw != null && typeof raw === 'object') {
            raw = Array.isArray(raw) ? [...raw] : { ...raw };
          }

          if (elRef.value) assignProp(elRef.value, key, raw);
        },
        { deep: true },
      );
    });

    // Watch attrs as a group (attrs is shallow, no individual keys)
    watch(
      () => ({ ...attrs }),
      (newAttrs) => {
        if (elRef.value) assignAll(elRef.value, newAttrs);
      },
      { deep: true },
    );

    onBeforeUnmount(() => {
      if (!elRef.value) return;
      elRef.value.removeEventListener('change', handleChange);
      elRef.value.removeEventListener('handle-action', handleAction);
    });

    return () => {
      if (loading.value) {
        return h(VProgressLinear, {
          indeterminate: true,
          rounded: true,
          height: 6,
        });
      }

      return h(
        'vuetify-json-forms',
        {
          ref: elRef,
        },
        Object.keys(slots).length
          ? Object.fromEntries(Object.entries(slots))
          : undefined,
      );
    };
  },
});

function validateObj(value: any) {
  try {
    const obj = typeof value === 'string' ? JSON.parse(value) : value;
    return obj == null || isPlainObject(obj);
  } catch {
    return false;
  }
}
</script>
