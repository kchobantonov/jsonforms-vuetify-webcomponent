export { default as TemplateLabelRenderer } from './TemplateLabelRenderer.vue';
export { default as TemplateLayoutRenderer } from './TemplateLayoutRenderer.vue';
export { default as TemplateRenderer } from './TemplateRenderer.vue';
export { default as SlotRenderer } from './SlotRenderer.vue';
export { default as FileRenderer } from './FileRenderer.vue';
export { default as DataProviderRenderer } from './DataProviderRenderer.vue';
export { default as DataProviderSelectRenderer } from './DataProviderSelectRenderer.vue';
export { default as ButtonRenderer } from './ButtonRenderer.vue';
export { default as MonacoRenderer } from './MonacoRenderer.vue';

import { entry as templateLabelRendererEntry } from './TemplateLabelRenderer.vue';
import { entry as templateLayoutRendererEntry } from './TemplateLayoutRenderer.vue';
import { entry as templateRendererEntry } from './TemplateRenderer.vue';
import { entry as slotRendererEntry } from './SlotRenderer.vue';
import { entry as fileRendererEntry } from './FileRenderer.vue';
import { entry as dataProviderRendererEntry } from './DataProviderRenderer.vue';
import { entry as dataProviderSelectRendererEntry } from './DataProviderSelectRenderer.vue';
import { entry as buttonRendererEntry } from './ButtonRenderer.vue';
import { entry as monacoRendererEntry } from './MonacoRenderer.vue';

import { extendedVuetifyRenderers } from '@jsonforms/vue2-vuetify';

export const vuetifyRenderers = [
  buttonRendererEntry,
  monacoRendererEntry,
  templateLabelRendererEntry,
  templateLayoutRendererEntry,
  templateRendererEntry,
  slotRendererEntry,
  fileRendererEntry,
  dataProviderRendererEntry,
  dataProviderSelectRendererEntry,
  ...extendedVuetifyRenderers,
];
