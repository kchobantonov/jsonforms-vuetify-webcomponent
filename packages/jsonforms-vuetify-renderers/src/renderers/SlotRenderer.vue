<template>
  <dispatch-renderer
    v-if="slotUISchema"
    :visible="layout.visible"
    :enabled="layout.enabled"
    :schema="layout.schema"
    :uischema="slotUISchema"
    :path="layout.path"
    :renderers="layout.renderers"
    :cells="layout.cells"
  />
</template>

<script lang="ts">
import { type Layout, type UISchemaElement } from '@jsonforms/core';
import {
  DispatchRenderer,
  rendererProps,
  type RendererProps,
  useJsonFormsLayout,
} from '@jsonforms/vue';
import { useVuetifyLayout } from '@jsonforms/vue-vuetify';
import { computed, defineComponent, inject, type ComputedRef } from 'vue';
import { TemplateRenderSlotContentsKey } from '../core';

const controlRenderer = defineComponent({
  name: 'slot-renderer',
  components: {
    DispatchRenderer,
  },
  props: {
    ...rendererProps<Layout>(),
  },
  setup(props: RendererProps<Layout>) {
    const layout = useVuetifyLayout(useJsonFormsLayout(props));

    const slotContents = inject<ComputedRef<Record<string, UISchemaElement>>>(
      TemplateRenderSlotContentsKey,
      computed(() => ({})),
    );

    return {
      ...layout,
      slotContents,
    };
  },
  computed: {
    name(): string {
      return (this.uischema as any).name;
    },
    defaultSlot(): UISchemaElement | undefined {
      const elements = (this.layout.uischema as Layout).elements;
      return elements && elements.length > 0 ? elements[0] : undefined;
    },
    slotUISchema(): UISchemaElement | undefined {
      const slotContent = this.slotContents[this.name];
      return slotContent ?? this.defaultSlot;
    },
  },
});

export default controlRenderer;
</script>
