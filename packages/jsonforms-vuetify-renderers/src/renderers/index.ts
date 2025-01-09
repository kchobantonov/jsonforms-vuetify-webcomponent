import { default as ButtonRenderer } from './ButtonRenderer.vue';
import { default as DataProviderRenderer } from './DataProviderRenderer.vue';
import { default as DataProviderSelectRenderer } from './DataProviderSelectRenderer.vue';
import { default as DurationRenderer } from './DurationRenderer.vue';
import { default as FileRenderer } from './FileRenderer.vue';
import { default as MonacoRenderer } from './MonacoRenderer.vue';
import { default as NullControlRenderer } from './NullControlRenderer.vue';
import { default as SlotRenderer } from './SlotRenderer.vue';
import { default as TemplateLabelRenderer } from './TemplateLabelRenderer.vue';
import { default as TemplateLayoutRenderer } from './TemplateLayoutRenderer.vue';
import { default as TemplateRenderer } from './TemplateRenderer.vue';

import { entry as buttonRendererEntry } from './ButtonRenderer.entry';
import { entry as dataProviderRendererEntry } from './DataProviderRenderer.entry';
import { entry as dataProviderSelectRendererEntry } from './DataProviderSelectRenderer.entry';
import { entry as durationRendererEntry } from './DurationRenderer.entry';
import { entry as fileRendererEntry } from './FileRenderer.entry';
import { entry as monacoRendererEntry } from './MonacoRenderer.entry';
import { entry as nullControlRendererEntry } from './NullControlRenderer.entry';
import { entry as slotRendererEntry } from './SlotRenderer.entry';
import { entry as templateLabelRendererEntry } from './TemplateLabelRenderer.entry';
import { entry as templateLayoutRendererEntry } from './TemplateLayoutRenderer.entry';
import { entry as templateRendererEntry } from './TemplateRenderer.entry';

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
  templateLayoutRendererEntry,
  templateRendererEntry,
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
  TemplateLayoutRenderer,
  TemplateRenderer,
};
