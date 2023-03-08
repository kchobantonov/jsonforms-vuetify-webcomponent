<template>
  <component v-bind:is="determinedRenderer" v-bind="renderer"></component>
</template>

<script lang="ts">
import {
  JsonFormsCellRendererRegistryEntry,
  JsonFormsRendererRegistryEntry,
  JsonSchema,
  UISchemaElement
} from '@jsonforms/core';
import { UnknownRenderer, useJsonFormsRenderer } from '@jsonforms/vue2';
import maxBy from 'lodash/maxBy';
import { defineComponent, PropType, ref, toRef } from 'vue';

export const rendererDataProps = <U = UISchemaElement>() => ({
  schema: {
    required: true as true,
    type: [Object, Boolean] as PropType<JsonSchema>,
  },
  uischema: {
    required: true as true,
    type: Object as PropType<U>,
  },
  path: {
    required: true as true,
    type: String,
  },
  enabled: {
    required: false as false,
    type: Boolean,
    default: undefined,
  },
  renderers: {
    required: false,
    type: Array as PropType<JsonFormsRendererRegistryEntry[]>,
    default: undefined,
  },
  cells: {
    required: false,
    type: Array as PropType<JsonFormsCellRendererRegistryEntry[]>,
    default: undefined,
  },
  config: {
    required: false,
    type: Object,
    default: undefined,
  },
  data: {
    required: true as true,
    type: [Object] as PropType<any>,
  },
});

export default defineComponent({
  name: 'data-dispatch-renderer',
  props: {
    ...rendererDataProps(),
  },
  setup(props) {
    return { ...useJsonFormsRenderer(props), scopeData: ref(props.data) };
  },
  provide() {
    return {
      scopeData: toRef(this, 'scopeData'),
    };
  },
  watch: {
    data: {
      deep: true,
      handler(newData: any, _oldInput: any): void {
        this.scopeData = newData;
      },
    },
  },
  computed: {
    determinedRenderer(): any {
      const testerContext = {
        rootSchema: this.rootSchema,
        config: this.config,
      };

      const renderer = maxBy<JsonFormsRendererRegistryEntry>(
        this.renderer.renderers,
        (r) =>
          r.tester(this.renderer.uischema, this.renderer.schema, testerContext)
      );
      if (
        renderer === undefined ||
        renderer.tester(
          this.renderer.uischema,
          this.renderer.schema,
          testerContext
        ) === -1
      ) {
        return UnknownRenderer;
      } else {
        return renderer.renderer;
      }
    },
  },
});
</script>
