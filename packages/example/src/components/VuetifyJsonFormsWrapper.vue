<script lang="ts">
import { useScriptTag } from '@vueuse/core';
import {
  defineComponent,
  h,
  isRef,
  nextTick,
  ref,
  toRaw,
  unref,
  useAttrs,
  watch,
} from 'vue';
import { VProgressLinear } from 'vuetify/components';

const simpleProps = [
  'readonly',
  'validationMode',
  'locale',
  'dark',
  'rtl',
  'customStyle',
  'schemaUrl',
];
const complexProps = [
  'data',
  'schema',
  'uischema',
  'config',
  'uischemas',
  'translations',
  'additionalErrors',
  'uidata',
  'vuetifyOptions',
  'onChange',
  'onHandleAction',
];

export default defineComponent({
  name: 'VuetifyJsonFormsWrapper',
  components: { VProgressLinear },
  setup(_, { slots }) {
    const attrs = useAttrs(); // collect all props/attrs
    const loading = ref(true);
    const elRef = ref<HTMLElement | null>(null);

    const normalize = (val: any) => {
      if (isRef(val)) return unref(val);
      if (typeof val === 'object' && val !== null) return toRaw(val);
      return val;
    };

    // Helper: assign props to the web component only if they differ
    const assignProps = (el: HTMLElement, props: Record<string, any>) => {
      Object.entries(props).forEach(([key, value]) => {
        const raw = normalize(value);
        if ((el as any)[key] !== raw) {
          (el as any)[key] = raw;
        }
      });
    };

    // Load the web component dynamically using useScriptTag
    useScriptTag(
      './js/vuetify-json-forms.js',
      async () => {
        loading.value = false;

        // Wait for DOM update to ensure the web component is mounted
        await nextTick();

        if (elRef.value) {
          assignProps(elRef.value, attrs);
        }
      },
      { type: 'module' },
    );

    [...simpleProps, ...complexProps].forEach((propKey) => {
      watch(
        () => (attrs as any)[propKey],
        (newVal) => {
          if (!elRef.value) return;

          let raw = normalize(newVal);
          if (raw && complexProps.includes(propKey)) {
            if (Array.isArray(raw)) {
              raw = [...raw];
            } else if (typeof raw === 'object') {
              raw = { ...raw };
            }
          }
          (elRef.value as any)[propKey] = raw;
        },
        { deep: true },
      );
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
        { ref: elRef },
        Object.keys(slots).length
          ? Object.fromEntries(
              Object.entries(slots).map(([name, slotFn]) => [name, slotFn]),
            )
          : undefined,
      );
    };
  },
});
</script>
