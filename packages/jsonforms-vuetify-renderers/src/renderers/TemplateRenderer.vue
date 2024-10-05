<template>
  <dispatch-renderer
    v-if="templateUISchema"
    :visible="layout.visible"
    :enabled="layout.enabled"
    :schema="layout.schema"
    :uischema="templateUISchema"
    :path="layout.path"
    :renderers="layout.renderers"
    :cells="layout.cells"
  />
</template>

<script lang="ts">
import {
  and,
  type JsonFormsRendererRegistryEntry,
  type Layout,
  rankWith,
  type UISchemaElement,
  uiTypeIs,
} from '@jsonforms/core';
import {
  DispatchRenderer,
  rendererProps,
  type RendererProps,
  useJsonFormsLayout,
} from '@jsonforms/vue';
import { useJsonForms, useVuetifyLayout } from '@jsonforms/vue-vuetify';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import {
  computed,
  defineComponent,
  inject,
  provide,
  unref,
  type ComputedRef,
} from 'vue';
import { TemplateRenderSlotContentsKey } from '../core';

const templateRenderer = defineComponent({
  name: 'template-renderer',
  components: {
    DispatchRenderer,
  },
  props: {
    ...rendererProps<Layout>(),
  },
  setup(props: RendererProps<Layout>) {
    const layout = useVuetifyLayout(useJsonFormsLayout(props));

    const jsonforms = useJsonForms();

    const elementTemplates = computed(() => {
      const elements =
        (unref(layout.layout).uischema as Layout)?.elements || [];

      return elements.reduce(
        function (result, element) {
          const name: string = (element as any).name;
          if (name) {
            result[name] = element;
          }
          return result;
        },
        {} as Record<string, UISchemaElement>,
      );
    });

    const parentSlotContents = inject<
      ComputedRef<Record<string, UISchemaElement>> | undefined
    >(TemplateRenderSlotContentsKey, undefined);

    const slotContents = computed(() =>
      parentSlotContents
        ? { ...parentSlotContents.value, ...elementTemplates.value }
        : elementTemplates.value,
    );

    provide(TemplateRenderSlotContentsKey, slotContents);

    return {
      ...layout,
      jsonforms,
    };
  },
  computed: {
    name(): string {
      return (this.layout.uischema as any).name;
    },
    templateUISchema(): UISchemaElement | undefined {
      const uischemas = this.jsonforms.uischemas;

      return uischemas
        ? find(uischemas, (entry) => (entry.uischema as any).name === this.name)
            ?.uischema
        : undefined;
    },
  },
});

export default templateRenderer;

export const hasName = (uischema: any) =>
  !isEmpty(uischema) && typeof uischema.name === 'string';

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: templateRenderer,
  tester: rankWith(10, and(uiTypeIs('Template'), hasName)),
};
</script>
