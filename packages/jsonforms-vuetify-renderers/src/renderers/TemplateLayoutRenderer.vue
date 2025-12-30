<template>
  <v-defaults-provider
    :disabled="!vuetifyProps('defaults')"
    :defaults="vuetifyProps('defaults')"
  >
    <v-alert
      v-if="templateError !== null"
      :title="errorTitle"
      :text="templateError"
      type="error"
    />

    <div ref="templateRoot" style="display: contents"></div>

    <slot-host
      v-for="{ name, el } in slotPlaceholders"
      :key="name"
      :mount-to="el"
    >
      <dispatch-renderer
        v-if="namedElementMap[name]"
        :schema="layout.schema"
        :uischema="namedElementMap[name]"
        :path="layout.path"
        :enabled="layout.enabled"
        :renderers="layout.renderers"
        :cells="layout.cells"
      />
    </slot-host>
  </v-defaults-provider>
</template>

<script lang="ts">
import { type Layout } from '@jsonforms/core';
import {
  DispatchRenderer,
  rendererProps,
  useJsonFormsLayout,
  type RendererProps,
} from '@jsonforms/vue';
import {
  useJsonForms,
  useTranslator,
  useVuetifyLayout,
} from '@jsonforms/vue-vuetify';
import {
  computed,
  defineComponent,
  h,
  markRaw,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue';
import { VDefaultsProvider } from 'vuetify/components/VDefaultsProvider';
import { VAlert } from 'vuetify/components';
import { type NamedUISchemaElement } from '../core/types';
import { useFormContext, type TemplateLayout } from '../util';
import {
  RactiveTemplateController,
  type SlotPlaceholder,
} from '../util/ractive-template-controller';

const SlotHost = defineComponent({
  name: 'SlotHost',
  props: {
    mountTo: {
      type: Object as () => HTMLElement,
      required: true,
    },
  },
  setup(props, { slots }) {
    const root = ref<HTMLElement | null>(null);

    onMounted(() => {
      if (root.value && props.mountTo) {
        props.mountTo.appendChild(root.value);
      }
    });

    onBeforeUnmount(() => {
      if (root.value && root.value.parentNode) {
        root.value.parentNode.removeChild(root.value);
      }
    });

    return () =>
      h(
        'div',
        {
          ref: root,
          style: { display: 'contents' },
        },
        slots.default ? slots.default() : [],
      );
  },
});

export default defineComponent({
  name: 'template-layout-renderer',
  inheritAttrs: false,
  components: {
    VDefaultsProvider,
    VAlert,
    DispatchRenderer,
    SlotHost,
  },
  props: { ...rendererProps<TemplateLayout>() },

  setup(props: RendererProps<TemplateLayout>) {
    const t = useTranslator();
    const input = useVuetifyLayout(useJsonFormsLayout(props));
    const jsonforms = useJsonForms();
    const context = useFormContext();

    const templateRoot = ref<HTMLElement | null>(null);
    const templateError = ref<string | null>(null);

    const slotPlaceholders = ref<SlotPlaceholder[]>([]);

    const layout = computed(() => input.layout.value);
    const data = computed(() => jsonforms.core?.data);
    const errors = computed(() => jsonforms.core?.errors);

    const template = computed(
      () => (layout.value.uischema as TemplateLayout).template,
    );

    const namedElements = computed((): NamedUISchemaElement[] => {
      const uischema = layout.value.uischema as TemplateLayout;
      return (uischema.elements || []).map((element, index) => ({
        ...element,
        name: (element as any).name ?? `${index}`,
      }));
    });

    const namedElementMap = computed<Record<string, NamedUISchemaElement>>(() =>
      Object.fromEntries(namedElements.value.map((e) => [e.name, e])),
    );

    const controller = markRaw(
      new RactiveTemplateController((slots) => {
        slotPlaceholders.value = slots;
      }),
    );

    const isVisible = computed(() => input.layout.value.visible);
    watch(isVisible, (visible) => {
      controller.updateVisibility(visible);
    });

    const initializeRactive = async () => {
      await nextTick();
      if (!template.value || !templateRoot.value) return;

      templateError.value = null;

      try {
        await controller.setup(
          templateRoot.value,
          template.value,
          {
            data: data.value,
            errors: errors.value,
            context: context.value,
            elements: namedElements.value,
            translate: (k: string, d?: string) => t.value(k, d || ''),
          },
          isVisible.value,
        );
      } catch (e: any) {
        templateError.value = e?.message ?? String(e);
      }
    };

    watch(template, initializeRactive);

    watch(data, (v) => controller.updateData('data', v), { deep: true });
    watch(errors, (v) => controller.updateData('errors', v), { deep: true });
    watch(context, (v) => controller.updateData('context', v), { deep: true });
    watch(namedElements, (v) => controller.updateData('elements', v), {
      deep: true,
    });
    watch(t, () => {
      // Force Ractive to rerender by updating a reactive key
      controller.updateData('translate', (k: string, d?: string) =>
        t.value(k, d || ''),
      );
    });

    onMounted(initializeRactive);

    onBeforeUnmount(async () => {
      await controller.destroy();
      slotPlaceholders.value = [];
    });

    const errorTitle = computed(() =>
      t.value('TemplateLayoutRenderer.template_error_title', 'Template Error'),
    );

    return {
      ...input,
      layout,
      templateRoot,
      templateError,
      errorTitle,
      slotPlaceholders,
      namedElementMap,
      vuetifyProps: input.vuetifyProps,
    };
  },
});
</script>
