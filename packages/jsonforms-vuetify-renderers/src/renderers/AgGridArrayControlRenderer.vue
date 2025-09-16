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
      <v-ag-grid
        :rowData="control.data"
        v-bind="gridOptions"
        :components="components"
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
      >
      </v-ag-grid>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import VAgGrid from '@/components/VAgGrid/VAgGrid.vue';
import { useIcons } from '@/icons';
import {
  composePaths,
  createDefaultValue,
  mapStateToArrayControlProps,
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
  GetRowIdFunc,
  GridApi,
  GridOptions,
  GridReadyEvent,
  ICellRendererParams,
  RowDragEndEvent,
  RowSelectionOptions,
  SelectionChangedEvent,
  SortChangedEvent,
} from 'ag-grid-community';
import startCase from 'lodash/startCase';
import uniqueId from 'lodash/uniqueId';
import {
  computed,
  defineComponent,
  h,
  nextTick,
  ref,
  shallowRef,
  watch,
  type PropType,
} from 'vue';
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

function isColDef(col: ColDef | ColGroupDef): col is ColDef {
  return !('children' in col);
}

const rowIdSymbol = Symbol('rowId');
function ensureRowId(row: object) {
  if (!(row as any)[rowIdSymbol]) {
    (row as any)[rowIdSymbol] = uniqueId();
  }
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
            control: ReturnType<typeof mapStateToArrayControlProps>;
          }
        >,
        required: true,
      },
    },
    setup({ params }) {
      return () => {
        const { propertyName, node, control } = params;
        const controlWithoutLabel = (scope: string): ControlElement => {
          return { type: 'Control', scope: scope, label: false };
        };

        function resolveUiSchema(propName: string) {
          return control.schema.properties && propName
            ? controlWithoutLabel(`#/properties/${propName}`)
            : controlWithoutLabel('#');
        }

        return h(DispatchRenderer, {
          schema: control.schema,
          uischema: resolveUiSchema(propertyName),
          path: composePaths(control.path, `${node.sourceRowIndex}`),
          enabled: control.enabled,
          renderers: control.renderers,
          cells: control.cells,
        });
      };
    },
    methods: {
      // ag grid will check if we have a refresh function that will return true then it will reuse the renderer instead of recreating it
      refresh(
        _params: ICellRendererParams<any, any, any> & {
          propertyName: string;
        },
      ) {
        return true;
      },
    },
  }),
};

// Define the component with explicit typing
const AgGridArrayControlRenderer = defineComponent({
  name: 'AgGridArrayControlRenderer',
  components: {
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
    VAgGrid,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const icons = useIcons();
    const input = useVuetifyArrayControl(useJsonFormsArrayControl(props));

    const gridApi = shallowRef<GridApi | null>(null);

    const suppressRowDrag = ref(!input.control.value.enabled);

    const schema = ref(input.control.value.schema);
    watch(
      () => input.control.value.schema,
      (newSchema) => {
        schema.value = newSchema;
      },
    );
    const showSortButtons = ref(input.appliedOptions.value.showSortButtons);
    watch(
      () => input.appliedOptions.value.showSortButtons,
      (newValue) => {
        showSortButtons.value = newValue;
      },
    );
    const enabled = ref(input.control.value.enabled);
    watch(
      () => input.control.value.enabled,
      (newValue) => {
        enabled.value = newValue;
      },
    );

    const gridOptions = computed<GridOptions>(() => {
      const baseOptions: GridOptions =
        props.uischema?.options?.agGridOptions || {};

      let haveRowDragColumn = false;
      // Generate columnDefs from schema
      const schemaColumnDefs: ColDef[] = Object.entries(
        schema.value.type === 'object'
          ? schema.value.properties || {}
          : { '': { title: '' } }, // primitive
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
          haveRowDragColumn = true;
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
                        control: input.control.value,
                      },
                    };
              },
              cellRendererParams: {
                deferRender: true,
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

      if (enabled.value && showSortButtons.value && !haveRowDragColumn) {
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

      let getRowId: GetRowIdFunc | undefined = undefined;
      if (schema.value.type === 'object' || schema.value.type === 'array') {
        getRowId = (params) => {
          const data = params.data;
          if (typeof data === 'object' && data !== null) {
            ensureRowId(data);
            return (data as any)[rowIdSymbol];
          } else {
            // fallback
            return String(data);
          }
        };
      }

      return {
        ...baseOptions,
        columnDefs: [...schemaColumnDefsControls, ...schemaColumnDefs],
        selectionColumnDef: {
          cellStyle: {
            display: 'flex',
            alignItems: 'center',
          },
          ...(baseOptions.selectionColumnDef ?? {}),
        },
        defaultColDef: {
          sortable: true,
          filter: true,
          resizable: true,
          ...(baseOptions.defaultColDef ?? {}),
        },
        components,
        suppressRowDrag: baseOptions.suppressRowDrag || suppressRowDrag.value,
        getRowId: getRowId,
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
      const fromIndex = event.node.sourceRowIndex ?? -1;
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
      checkboxes: enabled.value,
      headerCheckbox: enabled.value,
    });

    return {
      ...input,
      onGridReady,
      gridApi,
      dataLength,
      icons,
      gridOptions,
      components,
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
