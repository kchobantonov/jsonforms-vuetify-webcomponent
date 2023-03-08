<template>
  <data-provider :url="expandedUrl" v-if="expandedUrl">
    <div slot-scope="{ fetch }">
      <template v-for="(element, index) in elements">
        <data-dispatch-renderer
          :key="`${layout.path}-${index}`"
          :schema="layout.schema"
          :uischema="element"
          :path="layout.path"
          :enabled="layout.enabled"
          :renderers="layout.renderers"
          :cells="layout.cells"
          :data="fetch"
        />
      </template>
    </div>
  </data-provider>
</template>

<script lang="ts">
import {
  JsonFormsRendererRegistryEntry,
  JsonFormsSubStates,
  Layout,
  rankWith,
  UISchemaElement,
  uiTypeIs,
} from '@jsonforms/core';
import {
  rendererProps,
  RendererProps,
  useJsonFormsLayout,
} from '@jsonforms/vue2';
import { useTranslator, useVuetifyLayout } from '@jsonforms/vue2-vuetify';
import { defineComponent, inject, unref, ref } from 'vue';
import DataProvider from '../components/DataProvider.vue';
import { template as templateFn } from '../core/template';
import { FormContext } from '../core/types';
import DataDispatchRenderer from './DataDispatchRenderer.vue';

interface DataProviderElement extends Layout {
  type: 'DataProvider';
  /**
   * The remote url to fetch data.
   */
  url: string;
}

const dataProviderRenderer = defineComponent({
  name: 'data-provider-renderer',
  components: {
    DataDispatchRenderer,
    DataProvider,
  },
  props: {
    ...rendererProps<Layout>(),
  },
  setup(props: RendererProps<Layout>) {
    const t = useTranslator();
    const layout = useVuetifyLayout(useJsonFormsLayout(props));

    const jsonforms = inject<JsonFormsSubStates>('jsonforms');
    if (!jsonforms) {
      throw new Error(
        "'jsonforms' couldn't be injected. Are you within JsonForms?"
      );
    }

    const formContext = inject<FormContext>('formContext');

    if (!formContext) {
      throw new Error(
        "'formContext' couldn't be injected. Are you within JsonForms?"
      );
    }

    const templateError = ref<string | null>(null);

    return {
      ...layout,
      t,
      jsonforms,
      parentComponent: this,
      templateError,
      formContext,
    };
  },
  computed: {
    data(): any {
      return this.jsonforms.core?.data;
    },
    context(): FormContext {
      return unref(this.formContext);
    },
    expandedUrl(): string | undefined {
      const url = (this.layout.uischema as DataProviderElement).url;
      if (url) {
        return templateFn(url, {
          imports: {
            data: this.data,
            context: this.context,
            config: this.config,
          },
        })();
      }
      return url;
    },
    elements(): UISchemaElement[] {
      return (this.layout.uischema as DataProviderElement).elements;
    },
  },
});

export default dataProviderRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: dataProviderRenderer,
  tester: rankWith(1, uiTypeIs('DataProvider')),
};
</script>
