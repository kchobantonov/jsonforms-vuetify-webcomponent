import { default as ButtonRenderer } from './ButtonRenderer.vue';
import { default as DataProviderRenderer } from './DataProviderRenderer.vue';
import { default as DataProviderSelectRenderer } from './DataProviderSelectRenderer.vue';
import { default as DurationRenderer } from './DurationRenderer.vue';
import { default as FileRenderer } from './FileRenderer.vue';
import { default as MonacoRenderer } from './MonacoRenderer.vue';
import { default as NullControlRenderer } from './NullControlRenderer.vue';
import { default as SlotRenderer } from './SlotRenderer.vue';
import { default as TemplateLabelRenderer } from './TemplateLabelRenderer.vue';
import { default as VueTemplateLayoutRenderer } from './VueTemplateLayoutRenderer.vue';
import { default as TemplateLayoutRenderer } from './TemplateLayoutRenderer.vue';
import { default as TemplateRenderer } from './TemplateRenderer.vue';
import { default as SplitLayoutRenderer } from './SplitLayoutRenderer.vue';
import { default as AgGridArrayControlRenderer } from './AgGridArrayControlRenderer.vue';

import { entry as buttonRendererEntry } from './ButtonRenderer.entry';
import { entry as dataProviderRendererEntry } from './DataProviderRenderer.entry';
import { entry as dataProviderSelectRendererEntry } from './DataProviderSelectRenderer.entry';
import { entry as durationRendererEntry } from './DurationRenderer.entry';
import { entry as fileRendererEntry } from './FileRenderer.entry';
import { entry as monacoRendererEntry } from './MonacoRenderer.entry';
import { entry as nullControlRendererEntry } from './NullControlRenderer.entry';
import { entry as slotRendererEntry } from './SlotRenderer.entry';
import { entry as templateLabelRendererEntry } from './TemplateLabelRenderer.entry';
import { entry as vueTemplateLayoutRendererEntry } from './VueTemplateLayoutRenderer.entry';
import { entry as templateLayoutRendererEntry } from './TemplateLayoutRenderer.entry';
import { entry as templateRendererEntry } from './TemplateRenderer.entry';
import { entry as splitLayoutRendererEntry } from './SplitLayoutRenderer.entry';
import { entry as agGridArrayControlRendererEntry } from './AgGridArrayControlRenderer.entry';

export const extraVuetifyRenderers = [
  buttonRendererEntry,
  dataProviderRendererEntry,
  dataProviderSelectRendererEntry,
  durationRendererEntry,
  fileRendererEntry,
  monacoRendererEntry,
  nullControlRendererEntry,
  slotRendererEntry,
  templateLabelRendererEntry,
  vueTemplateLayoutRendererEntry,
  templateLayoutRendererEntry,
  templateRendererEntry,
  splitLayoutRendererEntry,
  agGridArrayControlRendererEntry,
];

export {
  ButtonRenderer,
  DataProviderRenderer,
  DataProviderSelectRenderer,
  DurationRenderer,
  FileRenderer,
  MonacoRenderer,
  NullControlRenderer,
  SlotRenderer,
  TemplateLabelRenderer,
  VueTemplateLayoutRenderer,
  TemplateLayoutRenderer,
  TemplateRenderer,
  SplitLayoutRenderer,
  AgGridArrayControlRenderer,
};
