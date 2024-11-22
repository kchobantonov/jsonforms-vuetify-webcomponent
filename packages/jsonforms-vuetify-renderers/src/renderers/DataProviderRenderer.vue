<template>
  <template
    v-for="(element, index) in elements"
    :key="`${layout.path}-${index}`"
  >
    <dispatch-renderer
      :schema="layout.schema"
      :uischema="element"
      :path="layout.path"
      :enabled="layout.enabled"
      :renderers="layout.renderers"
      :cells="layout.cells"
    />
  </template>
</template>

<script lang="ts">
import { type Layout } from '@jsonforms/core';
import {
  DispatchRenderer,
  rendererProps,
  useJsonFormsLayout,
  type RendererProps,
} from '@jsonforms/vue';
import { useJsonForms, useVuetifyLayout } from '@jsonforms/vue-vuetify';
import { computed, defineComponent, onMounted, provide, reactive } from 'vue';
import { DataProviderKey, template as templateFn } from '../core';
import { useFormContext } from '../util';

interface DataProviderElement extends Layout {
  type: 'DataProvider';
  /**
   * The remote url to fetch data.
   */
  url: string;
}

const controlRenderer = defineComponent({
  name: 'data-provider-renderer',
  components: {
    DispatchRenderer,
  },
  props: {
    ...rendererProps<Layout>(),
  },
  setup(props: RendererProps<Layout>) {
    const layout = useVuetifyLayout(useJsonFormsLayout(props));

    const jsonforms = useJsonForms();
    const formContext = useFormContext();

    const data = computed(() => jsonforms.core?.data);
    const dataProvider = reactive({
      loading: true,
      data: undefined as any,
      error: undefined as any,
    });

    const url = computed(() => {
      const url = (layout.layout.value.uischema as DataProviderElement).url;
      if (url) {
        return templateFn(url, {
          imports: {
            data: data,
            context: formContext,
            config: layout.layout.value.config,
          },
        })();
      }
      return url;
    });

    const elements = computed(
      () => (layout.layout.value.uischema as DataProviderElement).elements,
    );

    onMounted(async () => {
      try {
        const response = await fetch(url.value);
        dataProvider.data = await response.json();
      } catch (e) {
        dataProvider.error = e;
      } finally {
        dataProvider.loading = false;
      }
    });

    provide(DataProviderKey, dataProvider);

    return {
      ...layout,
      elements,
    };
  },
});

export default controlRenderer;
</script>
