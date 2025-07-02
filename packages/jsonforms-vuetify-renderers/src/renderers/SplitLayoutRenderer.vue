<template>
  <splitpanes
    :horizontal="!appliedOptions.vertical"
    :rtl="rtl.isRtl.value"
    :class="['default-theme', 'splitpanes-vuetify']"
    v-if="layout.visible && (layout.uischema as Layout).elements.length > 0"
    v-bind="vuetifyProps('splitpanes')"
  >
    <pane
      v-for="(element, index) in (layout.uischema as Layout).elements"
      :key="`${layout.path}-${(layout.uischema as Layout).elements.length}-${index}`"
      v-bind="vuetifyProps(`pane[${index}]`)"
    >
      <v-sheet>
        <dispatch-renderer
          :schema="layout.schema"
          :uischema="element"
          :path="layout.path"
          :enabled="layout.enabled"
          :renderers="layout.renderers"
          :cells="layout.cells"
      /></v-sheet>
    </pane>
  </splitpanes>
</template>

<script lang="ts">
import { type Layout } from '@jsonforms/core';
import {
  DispatchRenderer,
  rendererProps,
  useJsonFormsLayout,
  type RendererProps,
} from '@jsonforms/vue';
import { defineComponent } from 'vue';
import { useRtl } from 'vuetify';
import { Pane, Splitpanes } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import { useVuetifyLayout } from '@jsonforms/vue-vuetify';
import { VSheet } from 'vuetify/components';

const splitLayoutRenderer = defineComponent({
  name: 'split-layout-renderer',
  components: {
    DispatchRenderer,
    Splitpanes,
    Pane,
    VSheet,
  },
  props: {
    ...rendererProps<Layout>(),
  },
  setup(props: RendererProps<Layout>) {
    const rtl = useRtl();

    return {
      rtl,
      ...useVuetifyLayout(useJsonFormsLayout(props)),
    };
  },
});

export default splitLayoutRenderer;
</script>
