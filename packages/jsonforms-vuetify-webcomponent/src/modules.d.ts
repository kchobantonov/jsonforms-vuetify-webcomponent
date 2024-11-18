// make vue-tsc happy by providing the typescript information

declare module 'monaco-editor/esm/vs/editor/editor.worker?worker' {
  const worker: any; // You can define a more specific type if necessary
  export default worker;
}

declare module 'monaco-editor/esm/vs/language/json/json.worker?worker' {
  const worker: any;
  export default worker;
}

declare module 'monaco-editor/esm/vs/language/css/css.worker?worker' {
  const worker: any;
  export default worker;
}

declare module 'monaco-editor/esm/vs/language/html/html.worker?worker' {
  const worker: any;
  export default worker;
}

declare module 'monaco-editor/esm/vs/language/typescript/ts.worker?worker' {
  const worker: any;
  export default worker;
}

// Declarations for CSS files with ?url suffix
declare module '@chobantonov/jsonforms-vuetify-renderers/lib/jsonforms-vuetify-renderers.css?url';
declare module '@jsonforms/vue-vuetify/lib/jsonforms-vue-vuetify.css?url';
declare module '@mdi/font/css/materialdesignicons.css?url';
declare module '@fortawesome/fontawesome-free/css/all.css?url';
declare module 'vuetify/dist/vuetify.css?url';
declare module 'vuetify/dist/vuetify-labs.css?url';
declare module 'monaco-editor/min/vs/editor/editor.main.css?url';
