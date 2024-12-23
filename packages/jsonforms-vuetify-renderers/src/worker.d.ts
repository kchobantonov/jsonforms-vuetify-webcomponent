// src/worker.d.ts
declare class MonacoWorker extends Worker {
  constructor();
}

declare module 'monaco-editor/esm/vs/editor/editor.worker?worker' {
  export = MonacoWorker;
}

declare module 'monaco-editor/esm/vs/language/json/json.worker?worker' {
  export = MonacoWorker;
}

declare module 'monaco-editor/esm/vs/language/css/css.worker?worker' {
  export = MonacoWorker;
}

declare module 'monaco-editor/esm/vs/language/html/html.worker?worker' {
  export = MonacoWorker;
}

declare module 'monaco-editor/esm/vs/language/typescript/ts.worker?worker' {
  export = MonacoWorker;
}
