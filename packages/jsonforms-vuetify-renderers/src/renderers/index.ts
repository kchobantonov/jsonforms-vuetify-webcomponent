import { default as TemplateLabelRenderer } from './TemplateLabelRenderer.vue';
import { default as TemplateLayoutRenderer } from './TemplateLayoutRenderer.vue';
import { default as TemplateRenderer } from './TemplateRenderer.vue';
import { default as SlotRenderer } from './SlotRenderer.vue';
import { default as FileRenderer } from './FileRenderer.vue';
import { default as DataProviderRenderer } from './DataProviderRenderer.vue';
import { default as DataProviderSelectRenderer } from './DataProviderSelectRenderer.vue';
import { default as ButtonRenderer } from './ButtonRenderer.vue';
import { default as MonacoRenderer } from './MonacoRenderer.vue';

import { entry as templateLabelRendererEntry } from './TemplateLabelRenderer.entry';
import { entry as templateLayoutRendererEntry } from './TemplateLayoutRenderer.entry';
import { entry as templateRendererEntry } from './TemplateRenderer.entry';
import { entry as slotRendererEntry } from './SlotRenderer.entry';
import { entry as fileRendererEntry } from './FileRenderer.entry';
import { entry as dataProviderRendererEntry } from './DataProviderRenderer.entry';
import { entry as dataProviderSelectRendererEntry } from './DataProviderSelectRenderer.entry';
import { entry as buttonRendererEntry } from './ButtonRenderer.entry';
import { entry as monacoRendererEntry } from './MonacoRenderer.entry';

export const extraVuetifyRenderers = [
  buttonRendererEntry,
  monacoRendererEntry,
  templateLabelRendererEntry,
  templateLayoutRendererEntry,
  templateRendererEntry,
  slotRendererEntry,
  fileRendererEntry,
  dataProviderRendererEntry,
  dataProviderSelectRendererEntry,
];

export {
  TemplateLabelRenderer,
  TemplateLayoutRenderer,
  TemplateRenderer,
  SlotRenderer,
  FileRenderer,
  DataProviderRenderer,
  DataProviderSelectRenderer,
  ButtonRenderer,
  MonacoRenderer,
};
