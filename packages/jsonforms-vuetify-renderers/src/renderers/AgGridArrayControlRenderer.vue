<template>
  <v-card
    v-if="control.visible"
    :class="styles.arrayList.root"
    elevation="0"
    v-bind="vuetifyProps('v-card')"
  >
    <v-card-title
      :class="styles.arrayList.title"
      v-bind="vuetifyProps('v-card-title')"
    >
      <v-toolbar
        flat
        :class="styles.arrayList.toolbar"
        v-bind="vuetifyProps('v-toolbar')"
      >
        <v-toolbar-title :class="styles.arrayList.label">{{
          computedLabel
        }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <validation-icon
          v-if="control.childErrors.length > 0"
          :errors="control.childErrors"
        />
        <v-tooltip bottom>
          <template v-slot:activator="{ props }">
            <v-btn
              icon
              variant="text"
              elevation="0"
              small
              :aria-label="control.translations.addAriaLabel"
              v-bind="props"
              :class="styles.arrayList.addButton"
              :disabled="
                !control.enabled ||
                (appliedOptions.restrict &&
                  control.arraySchema !== undefined &&
                  control.arraySchema.maxItems !== undefined &&
                  dataLength >= control.arraySchema.maxItems)
              "
              @click="addButtonClick"
            >
              <v-icon>{{ icons.current.value.itemAdd }}</v-icon>
            </v-btn>
          </template>
          {{ control.translations.addTooltip }}
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              variant="text"
              elevation="0"
              small
              :aria-label="control.translations.removeAriaLabel"
              :class="styles.arrayList.itemDelete"
              :disabled="
                !control.enabled ||
                selectedIndexes.length === 0 ||
                (appliedOptions.restrict &&
                  control.arraySchema !== undefined &&
                  control.arraySchema.minItems !== undefined &&
                  dataLength - selectedIndexes.length <=
                    control.arraySchema.minItems)
              "
              @click="removeItemsClick"
            >
              <v-icon class="notranslate">{{
                icons.current.value.itemDelete
              }}</v-icon>
            </v-btn>
          </template>
          {{ control.translations.removeTooltip }}
        </v-tooltip>
      </v-toolbar>
    </v-card-title>

    <v-card-text v-bind="vuetifyProps('v-card-text')">
      <Suspense>
        <template #default>
          <ag-grid-vue
            :data-ag-theme-mode="dark ? 'dark' : 'light'"
            :rowData="control.data"
            v-bind="gridOptions"
            :components="components"
            :theme="agTheme"
            :enableRtl="rtl.isRtl.value"
            :rowSelection="rowSelection"
            @grid-ready="onGridReady"
            @selection-changed="onSelectionChanged"
            @filter-changed="onFilterChanged"
            @sort-changed="onSortChanged"
            @row-drag-end="onRowDragEnd"
            :style="{
              width: appliedOptions.gridWidth || '100%',
              height: appliedOptions.gridHeight || '400px',
            }"
          />
        </template>
        <template #fallback>
          <div class="d-flex align-center justify-center" style="height: 400px">
            <v-progress-circular indeterminate color="primary" size="48" />
          </div>
        </template>
      </Suspense>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { useIcons } from '@/icons';
import {
  composePaths,
  createDefaultValue,
  type ControlElement,
} from '@jsonforms/core';
import {
  DispatchRenderer,
  rendererProps,
  useJsonFormsArrayControl,
  type RendererProps,
} from '@jsonforms/vue';
import { useVuetifyArrayControl, ValidationIcon } from '@jsonforms/vue-vuetify';
import type {
  CellRendererSelectorResult,
  ColDef,
  ColGroupDef,
  FilterChangedEvent,
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
  RowDragEndEvent,
  RowSelectionOptions,
  SelectionChangedEvent,
  SortChangedEvent,
  Theme,
} from 'ag-grid-community';
import startCase from 'lodash/startCase';
import {
  computed,
  defineAsyncComponent,
  defineComponent,
  h,
  nextTick,
  ref,
  shallowRef,
  watch,
  type PropType,
} from 'vue';
import { useRtl, useTheme } from 'vuetify';
import {
  VBtn,
  VCard,
  VCardText,
  VCardTitle,
  VIcon,
  VProgressCircular,
  VSpacer,
  VToolbar,
  VToolbarTitle,
  VTooltip,
} from 'vuetify/components';

const agTheme = ref<Theme | undefined>(undefined);

const AgGridVue = defineAsyncComponent(() =>
  Promise.all([import('ag-grid-vue3'), import('ag-grid-community')]).then(
    ([vueModule, gridModule]) => {
      const {
        ClientSideRowModelModule,
        ColumnApiModule,
        DateEditorModule,
        DateFilterModule,
        NumberEditorModule,
        NumberFilterModule,
        RowAutoHeightModule,
        RowDragModule,
        RowSelectionModule,
        TextEditorModule,
        TextFilterModule,
        ValidationModule,
        ModuleRegistry,
        themeQuartz,
        colorSchemeVariable,
      } = gridModule;

      ModuleRegistry.registerModules([
        ClientSideRowModelModule,
        ColumnApiModule,
        DateEditorModule,
        DateFilterModule,
        NumberEditorModule,
        NumberFilterModule,
        RowAutoHeightModule,
        RowDragModule,
        RowSelectionModule,
        TextEditorModule,
        TextFilterModule,
        ValidationModule,
      ]);

      agTheme.value = themeQuartz.withPart(colorSchemeVariable);

      return vueModule.AgGridVue;
    },
  ),
);

function isColDef(col: ColDef | ColGroupDef): col is ColDef {
  return !('children' in col);
}

const components = {
  DispatchRendererCell: defineComponent({
    name: 'DispatchRendererCell',
    components: { DispatchRenderer },
    props: {
      params: {
        type: Object as PropType<
          ICellRendererParams & {
            propertyName: string;
            input: ReturnType<typeof useVuetifyArrayControl> &
              ReturnType<typeof useJsonFormsArrayControl>;
          }
        >,
        required: true,
      },
    },
    setup({ params }) {
      return () => {
        const { propertyName, node, input } = params;

        const control = input.control;
        const controlWithoutLabel = (scope: string): ControlElement => {
          return { type: 'Control', scope: scope, label: false };
        };

        function resolveUiSchema(propName: string) {
          return control.value.schema.properties && propName
            ? controlWithoutLabel(`#/properties/${propName}`)
            : controlWithoutLabel('#');
        }

        return h(DispatchRenderer, {
          schema: control.value.schema,
          uischema: resolveUiSchema(propertyName),
          path: composePaths(control.value.path, `${node.rowIndex}`),
          enabled: control.value.enabled,
          renderers: control.value.renderers,
          cells: control.value.cells,
        });
      };
    },
  }),
};

// Define the component with explicit typing
const AgGridArrayControlRenderer = defineComponent({
  name: 'AgGridArrayControlRenderer',
  components: {
    AgGridVue,
    VBtn,
    VCard,
    VCardText,
    VCardTitle,
    VIcon,
    VProgressCircular,
    VSpacer,
    VToolbar,
    VToolbarTitle,
    VTooltip,
    ValidationIcon,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const icons = useIcons();
    const input = useVuetifyArrayControl(useJsonFormsArrayControl(props));

    const theme = useTheme();
    const rtl = useRtl();

    const gridApi = shallowRef<GridApi | null>(null);

    const dark = ref(theme.current.value.dark);

    watch(
      () => theme.current.value.dark,
      (isDark) => {
        dark.value = isDark;
      },
    );

    const suppressRowDrag = ref(!input.control.value.enabled);

    const gridOptions = computed<GridOptions>(() => {
      const baseOptions: GridOptions =
        props.uischema?.options?.agGridOptions || {};

      const showSortButtons = ref(input.appliedOptions.value.showSortButtons);
      // Generate columnDefs from schema
      const schemaColumnDefs: ColDef[] = Object.entries(
        input.control.value.schema.properties || {},
      ).map(([propertyName, propertySchema]: [string, any]) => {
        const baseDef: ColDef = {
          headerName: propertySchema.title ?? startCase(propertyName),
          field: propertyName,
          autoHeight: true,
        };

        // Merge optional UI schema column overrides if present
        const extraDef =
          baseOptions.columnDefs?.find(
            (c) => isColDef(c) && c.field === propertyName,
          ) || {};

        if (isColDef(extraDef) && extraDef.rowDrag) {
          // another column is designated as reordering column
          showSortButtons.value = false;
        }

        const cellDef = isColDef(extraDef)
          ? {
              editable: false,
              cellRendererSelector: (
                params: ICellRendererParams,
              ): CellRendererSelectorResult | undefined => {
                return params.node.group
                  ? undefined
                  : {
                      component: 'DispatchRendererCell',
                      params: {
                        propertyName,
                        input: input,
                      },
                    };
              },
            }
          : {};

        return {
          ...baseDef,
          ...extraDef,
          ...cellDef,
        };
      });

      const schemaColumnDefsControls: ColDef[] = [];

      if (input.control.value.enabled && showSortButtons.value) {
        schemaColumnDefsControls.push({
          headerName: '',
          rowDrag: true,
          suppressMovable: true,
          sortable: false,
          filter: false,
          resizable: false,
          width: 36,
        });
      }

      delete baseOptions.rowData;
      return {
        ...baseOptions,
        columnDefs: [...schemaColumnDefsControls, ...schemaColumnDefs],
        defaultColDef: {
          sortable: true,
          filter: true,
          resizable: true,
          ...(baseOptions.defaultColDef ?? {}),
        },
        components,
        suppressRowDrag: baseOptions.suppressRowDrag || suppressRowDrag.value,
      };
    });

    const dataLength = computed(() => input.control.value.data?.length || 0);
    const onGridReady = (event: GridReadyEvent) => {
      gridApi.value = event.api;
    };

    const selectedIndexes = ref<number[]>([]);
    const sortedGrid = ref(false);
    const filteredGrid = ref(false);

    const onSelectionChanged = (event: SelectionChangedEvent) => {
      selectedIndexes.value =
        event.selectedNodes?.map((rowNode) => rowNode.sourceRowIndex) ?? [];
    };

    const onSortChanged = (event: SortChangedEvent) => {
      sortedGrid.value =
        event.api.getColumnState().filter((col) => col.sort).length > 0;

      suppressRowDrag.value = filteredGrid.value || sortedGrid.value;
    };

    const onFilterChanged = (event: FilterChangedEvent) => {
      filteredGrid.value = Object.keys(event.api.getFilterModel()).length > 0;

      suppressRowDrag.value = filteredGrid.value || sortedGrid.value;
    };

    const onRowDragEnd = (event: RowDragEndEvent) => {
      const fromIndex = event.node.rowIndex ?? -1;
      const toIndex = event.overIndex;
      if (fromIndex === -1 || event.overIndex === -1 || fromIndex === toIndex) {
        return;
      }

      if (fromIndex > toIndex) {
        const numberOfMoves = fromIndex - toIndex;
        for (let i = 0; i < numberOfMoves; i++) {
          input.moveUp?.(input.control.value.path, fromIndex - i)();
        }
      } else {
        const numberOfMoves = toIndex - fromIndex;
        for (let i = 0; i < numberOfMoves; i++) {
          input.moveDown?.(input.control.value.path, fromIndex + i)();
        }
      }

      event.api.clearFocusedCell();
    };

    const rowSelection = ref<RowSelectionOptions | 'single' | 'multiple'>({
      mode: 'multiRow',
      checkboxes: input.control.value.enabled,
      headerCheckbox: input.control.value.enabled,
    });

    return {
      ...input,
      rtl,
      dark,
      onGridReady,
      gridApi,
      dataLength,
      icons,
      gridOptions,
      components,
      agTheme,
      selectedIndexes,
      rowSelection,
      onSelectionChanged,
      onFilterChanged,
      onSortChanged,
      onRowDragEnd,
    };
  },
  methods: {
    composePaths,
    createDefaultValue,
    addButtonClick() {
      this.addItem(
        this.control.path,
        createDefaultValue(this.control.schema, this.control.rootSchema),
      )();
    },
    removeItemsClick(): void {
      this.removeItems?.(this.control.path, this.selectedIndexes)();
      nextTick(() => {
        this.gridApi?.deselectAll();
        this.gridApi?.redrawRows();
      });
    },
  },
});

export default AgGridArrayControlRenderer;
</script>
