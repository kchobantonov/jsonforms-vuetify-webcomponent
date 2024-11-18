import {
  entry as templateLabelRendererEntry,
  default as TemplateLabelRenderer,
} from './TemplateLabelRenderer.vue';
import {
  entry as templateLayoutRendererEntry,
  default as TemplateLayoutRenderer,
} from './TemplateLayoutRenderer.vue';
import {
  entry as templateRendererEntry,
  default as TemplateRenderer,
} from './TemplateRenderer.vue';
import {
  entry as slotRendererEntry,
  default as SlotRenderer,
} from './SlotRenderer.vue';
import {
  entry as fileRendererEntry,
  default as FileRenderer,
} from './FileRenderer.vue';
import {
  entry as dataProviderRendererEntry,
  default as DataProviderRenderer,
} from './DataProviderRenderer.vue';
import {
  entry as dataProviderSelectRendererEntry,
  default as DataProviderSelectRenderer,
} from './DataProviderSelectRenderer.vue';
import {
  entry as buttonRendererEntry,
  default as ButtonRenderer,
} from './ButtonRenderer.vue';
import {
  entry as monacoRendererEntry,
  default as MonacoRenderer,
} from './MonacoRenderer.vue';

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

const renderers = [
  TemplateLabelRenderer,
  TemplateLayoutRenderer,
  TemplateRenderer,
  SlotRenderer,
  FileRenderer,
  DataProviderRenderer,
  DataProviderSelectRenderer,
  ButtonRenderer,
  MonacoRenderer,
];

// trick to preserve the render function since vite will optimize and remove the render function
// since our components are not registered as components nor used in templates directly
for (const renderer of renderers) {
  if (renderer.render) {
  }
}
