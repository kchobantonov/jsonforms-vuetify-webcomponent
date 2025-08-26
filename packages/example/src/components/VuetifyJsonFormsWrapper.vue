<script lang="ts">
import {
  defineComponent,
  ref,
  h,
  useAttrs,
  watch,
  nextTick,
  computed,
  isRef,
  unref,
  toRaw,
} from 'vue';
import { VProgressLinear } from 'vuetify/components';
import { useScriptTag } from '@vueuse/core';

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

    // Watch for prop changes and update the web component dynamically
    watch(
      () => ({ ...attrs }),
      (newAttrs) => {
        if (!elRef.value) return;
        assignProps(elRef.value, newAttrs);
      },
      { deep: true },
    );

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
