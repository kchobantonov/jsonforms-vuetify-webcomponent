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
import { getLightDarkTheme } from '@/util';

type StyleValue =
  | string
  | CSSProperties
  | Array<string | CSSProperties>
  | undefined;

type PropsWithVuetifyTheme<TData> = Omit<Props<TData>, 'theme'> & {
  theme?: string;
};

const attrs = useAttrs();
const props = withDefaults(defineProps<PropsWithVuetifyTheme<TData>>(), {
  ...getProps(),
});
const style = (attrs.style as StyleValue) || {};
const vuetifyTheme = useTheme();

const themeClasses = computed(() => {
  const classes = ['v-ag-grid'];
  classes.push(
    selectedTheme.value.dark ? 'ag-theme-quartz-dark' : 'ag-theme-quartz',
  );
  classes.push(`v-theme--${selectedTheme.value.name}`);
  return classes;
});

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

const selectedTheme = computed(() => {
  const themeName = props.theme;
  let theme = vuetifyTheme.current.value;

  if (themeName && vuetifyTheme.themes.value[themeName]) {
    const computedTheme = getLightDarkTheme(
      vuetifyTheme.current.value.dark,
      themeName,
      (themeName) => vuetifyTheme.themes.value[themeName] !== undefined,
    );
    theme = vuetifyTheme.themes.value[computedTheme];
    return { name: computedTheme, ...theme };
  } else {
    // Try to find a matching theme by reference
    const matchingEntry = Object.entries(vuetifyTheme.themes.value).find(
      ([, t]) => t === theme,
    );
    if (matchingEntry) {
      const [name] = matchingEntry;
      return { name, ...theme };
    }
  }

  // Fallback name
  const fallbackName = theme.dark ? 'dark' : 'light';
  return { name: fallbackName, ...theme };
});

const propsWithoutTheme = computed(() => {
  const { theme, ...rest } = props;
  return rest;
});
</script>

<template>
  <Suspense>
    <template #default>
      <ag-grid-vue
        ref="gridRef"
        v-bind="{ ...propsWithoutTheme, ...attrs }"
        :class="themeClasses"
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
