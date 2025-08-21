<template>
  <v-splitpanes
    :horizontal="!appliedOptions.horizontal"
    v-if="layout.visible && (layout.uischema as Layout).elements.length > 0"
    v-bind="vuetifyProps('v-splitpanes')"
  >
    <v-pane
      v-for="(element, index) in (layout.uischema as Layout).elements"
      :key="`${layout.path}-${(layout.uischema as Layout).elements.length}-${index}`"
      v-bind="vuetifyProps(`v-pane[${index}]`)"
    >
      <v-sheet v-bind="vuetifyProps(`v-sheet[${index}]`)">
        <dispatch-renderer
          :schema="layout.schema"
          :uischema="element"
          :path="layout.path"
          :enabled="layout.enabled"
          :renderers="layout.renderers"
          :cells="layout.cells"
        />
      </v-sheet>
    </v-pane>
  </v-splitpanes>
</template>

<script lang="ts">
import { type Layout } from '@jsonforms/core';
import {
  DispatchRenderer,
  rendererProps,
  useJsonFormsLayout,
  type RendererProps,
} from '@jsonforms/vue';
import { useVuetifyLayout } from '@jsonforms/vue-vuetify';
import { defineComponent } from 'vue';
import { VSheet } from 'vuetify/components';
import VPane from '../components/VPane.vue';
import VSplitpanes from '../components/VSplitpanes.vue';

const splitLayoutRenderer = defineComponent({
  name: 'split-layout-renderer',
  components: {
    DispatchRenderer,
    VSplitpanes,
    VPane,
    VSheet,
  },
  props: {
    ...rendererProps<Layout>(),
  },
  setup(props: RendererProps<Layout>) {
    return {
      ...useVuetifyLayout(useJsonFormsLayout(props)),
    };
  },
});

export default splitLayoutRenderer;
</script>
