import jvrCss from '@chobantonov/jsonforms-vuetify-renderers/lib/jsonforms-vuetify-renderers.css?inline';
import jvvCss from '@jsonforms/vue-vuetify/lib/jsonforms-vue-vuetify.css?inline';
import materialDesignStyles from '@mdi/font/css/materialdesignicons.css?inline';
import vuetifyStyles from 'vuetify/dist/vuetify.min.css?inline';
import vuetifyLabsStyles from 'vuetify/dist/vuetify-labs.min.css?inline';
import monacoStyles from 'monaco-editor/min/vs/editor/editor.main.css?inline';

const vuetifyCssResetForShadowRoot = `
:host {
  box-sizing: border-box;
  overflow-y: scroll;
  /* All browsers without overlaying scrollbars */
  -webkit-text-size-adjust: 100%;
  /* Prevent adjustments of font size after orientation changes in iOS */
  word-break: normal;
  tab-size: 4;
}

:host {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  font-family: Roboto, sans-serif;
  font-size: 1rem;
  line-height: 1.5;
  overflow-x: hidden;
}

:host(.overflow-y-hidden) {
  overflow-y: hidden !important;
}

:host(.v-overlay-scroll-blocked) {
  position: fixed;
  top: var(--v-body-scroll-y);
  left: var(--v-body-scroll-x);
  width: 100%;
  height: 100%;
}

:host {
  --v-theme-background: #fff;
  --v-theme-on-background: #000;
  --v-theme-surface: #fff;
  --v-theme-on-surface: #000;
  --v-theme-overlay-multiplier: 1;
  --v-scrollbar-offset: 0px;
}`;

export const styles = [
  vuetifyCssResetForShadowRoot,
  vuetifyStyles,
  vuetifyLabsStyles,
  materialDesignStyles,
  jvvCss,
  jvrCss,
  monacoStyles,
];
