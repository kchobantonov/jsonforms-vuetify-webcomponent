<script lang="ts" setup generic="TData = any">
import type { GridApi } from 'ag-grid-community';
import {
  computed,
  defineAsyncComponent,
  nextTick,
  onMounted,
  ref,
  useAttrs,
  type CSSProperties,
  type Ref,
} from 'vue';
import { useRtl, useTheme } from 'vuetify';
import type { Props } from './utils';
import { getProps } from './utils';

import 'ag-grid-community/styles/ag-grid.css';
import './VAgGrid.scss';

type StyleValue =
  | string
  | CSSProperties
  | Array<string | CSSProperties>
  | undefined;

const attrs = useAttrs();
const props = withDefaults(defineProps<Props<TData>>(), { ...getProps() });
const style = (attrs.style as StyleValue) || {};
const theme = useTheme();

const themeClass = computed(() =>
  theme.current.value.dark ? 'ag-theme-quartz-dark' : 'ag-theme-quartz',
);

// RTL support
const rtl = useRtl();

// AG Grid API ref
const api: Ref<GridApi | undefined> = ref(undefined);
const gridRef = ref<any>(null);

// Async load AG Grid Vue + modules
const AgGridVue = defineAsyncComponent(() =>
  Promise.all([import('ag-grid-vue3'), import('ag-grid-community')]).then(
    ([vueModule, gridModule]) => {
      const { ModuleRegistry, AllCommunityModule } = gridModule;

      ModuleRegistry.registerModules([AllCommunityModule]);

      return vueModule.AgGridVue;
    },
  ),
);

// Expose API
defineExpose({
  api,
});

// Bind the grid instance API once mounted
onMounted(() => {
  nextTick(() => {
    if (gridRef.value?.api) {
      api.value = gridRef.value.api;
    }
  });
});
</script>

<template>
  <Suspense>
    <template #default>
      <ag-grid-vue
        ref="gridRef"
        v-bind="{ ...props, ...attrs }"
        class="v-ag-grid"
        :class="themeClass"
        :enableRtl="rtl.isRtl.value"
        theme="legacy"
      />
    </template>

    <template #fallback>
      <div class="d-flex align-center justify-center" :style="style">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>
    </template>
  </Suspense>
</template>
