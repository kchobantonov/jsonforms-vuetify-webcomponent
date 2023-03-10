<template>
  <component :is="compiled" v-if="compiled">
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
import { DispatchRenderer, useJsonFormsLayout } from '@jsonforms/vue2';
import merge from 'lodash/merge';
import Vue, { defineComponent, PropType, unref } from 'vue';
import { CompiledResultFunctions } from 'vue-template-compiler';
import { DirectiveFunction, DirectiveOptions } from 'vue/types/umd';
import { ComputedOptions, MethodOptions } from 'vue/types/v3-component-options';
import {
  Components,
  NamedUISchemaElement,
} from '../core/types';
const compileToFunctions = () =>
  import('vue-template-compiler').then((module) => {
    const { compileToFunctions } = module;
    return compileToFunctions;
  });

type LayoutType = ReturnType<typeof useJsonFormsLayout>['layout'];

const templateCompiler = defineComponent({
  name: 'template-compiler',
  components: {
    DispatchRenderer,
  },
  inheritAttrs: false,

  props: {
    parent: {
      type: [Object] as PropType<Vue>,
    },

    template: {
      type: String,
      default: '<div></div>',
    },

    layout: {
      type: Object as PropType<LayoutType>,
      required: true,
    },

    componentDirectives: {
      type: [Object] as PropType<
        Record<string, DirectiveFunction | DirectiveOptions>
      >,
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
      type: [Object] as PropType<Components>,
    },

    elements: {
      type: [Array] as PropType<NamedUISchemaElement[]>,
    },
  },
  data() {
    return {
      compiled: null as CompiledResultFunctions | null,
    };
  },

  computed: {
    componentProps() {
      const data = [
        this.parentData,
        this.parentProps,
        (this.parentComponent as any)._provided,
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

    parentComponent(): Vue {
      return (this.parent as Vue) || this.$parent;
    },

    parentData() {
      return (this.parentComponent as any as Vue).$data || {};
    },

    parentProps() {
      return (this.parentComponent as any as Vue).$props || {};
    },

    defaultElement(): NamedUISchemaElement | undefined {
      return this.elements !== undefined && this.elements.length == 1
        ? this.elements[0]
        : undefined;
    },
  },
  async created() {
    await this.compile();
  },
  methods: {
    async compile() {
      const compile = await compileToFunctions();
      const component = compile(this.template);
      const compiled = merge(component, unref(this.componentProps));
      this.compiled = compiled;
    },
  },
});

export default templateCompiler;
</script>
