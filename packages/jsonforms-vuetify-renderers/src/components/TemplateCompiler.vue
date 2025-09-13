<template>
  <component v-if="component" :is="component" :="$attrs">
    <template v-if="defaultElement" v-slot:default>
      <slot>
        <dispatch-renderer
          :key="`${layout.path}-${0}`"
          :schema="layout.schema"
          :uischema="defaultElement"
          :path="layout.path"
          :enabled="layout.enabled"
          :renderers="layout.renderers"
          :cells="layout.cells"
      /></slot>
    </template>

    <template v-for="(element, index) in elements" v-slot:[`${element.name}`]>
      <slot :name="element.name">
        <dispatch-renderer
          :key="`${layout.path}-${index}`"
          :schema="layout.schema"
          :uischema="element"
          :path="layout.path"
          :enabled="layout.enabled"
          :renderers="layout.renderers"
          :cells="layout.cells"
        />
      </slot>
    </template>
  </component>
</template>

<script lang="ts">
import { DispatchRenderer, type LayoutProps } from '@jsonforms/vue';
import merge from 'lodash/merge';
import {
  defineComponent,
  unref,
  type Component,
  type ComponentPublicInstance,
  type ComputedOptions,
  type Directive,
  type MethodOptions,
  type PropType,
  markRaw,
  compile,
} from 'vue';
import type { NamedUISchemaElement } from '../core/types';

const templateCompiler = defineComponent({
  name: 'template-compiler',
  components: {
    DispatchRenderer,
  },
  inheritAttrs: false,

  props: {
    parent: {
      type: [Object] as PropType<ComponentPublicInstance>,
    },

    template: {
      type: String,
      default: '<div></div>',
    },

    layout: {
      type: Object as PropType<LayoutProps>,
      required: true,
    },

    componentDirectives: {
      type: [Object] as PropType<Record<string, Directive>>,
    },

    componentComputed: {
      type: [Object] as PropType<ComputedOptions>,
    },

    componentMethods: {
      type: [Object] as PropType<MethodOptions>,
    },

    componentFilters: {
      type: [Object] as PropType<MethodOptions>,
    },

    componentComponents: {
      type: [Object] as PropType<Component>,
    },

    elements: {
      type: [Array] as PropType<NamedUISchemaElement[]>,
    },
  },
  data() {
    return {
      component: null as Component | null,
    };
  },

  computed: {
    componentProps() {
      const data: any[] = [
        //this.parentData,
        //this.parentProps,
        //(this.parentComponent as any)._provided,
      ];
      const computed: any = this.componentComputed || {};
      const directives: any = this.componentDirectives || {};
      const methods: any = this.componentMethods || {};
      const filters: any = this.componentFilters || {};
      const components: any = this.componentComponents || {};
      return {
        components: components,
        directives: directives,
        computed: computed,
        filters: filters,
        methods: methods,
        data: () => merge({}, ...data),
      };
    },

    parentComponent(): ComponentPublicInstance | null {
      return this.parent || this.$parent;
    },

    parentData() {
      return this.parentComponent?.$data || {};
    },

    parentProps() {
      return this.parentComponent?.$props || {};
    },

    defaultElement(): NamedUISchemaElement | undefined {
      return this.elements !== undefined && this.elements.length == 1
        ? this.elements[0]
        : undefined;
    },
  },
  created() {
    const render = compile(this.template);

    this.component = markRaw(
      defineComponent(
        merge(
          {
            render: render,
          },
          unref(this.componentProps),
        ),
      ),
    );
  },
});

export default templateCompiler;
</script>
