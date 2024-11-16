import { watch } from "chokidar";
import { existsSync } from "fs";
import { join } from "path";
import {
  MessageType,
  readFileWithPromise,
  showMessage,
  validateSchema,
} from "./utils";

type Files = {
  schema: { path: string; data?: string };
  uischema: { path?: string; data?: string };
  uischemas: { path?: string; data?: string };
  data: { path?: string; data?: string };
  config: { path?: string; data?: string };
  i18n: { path?: string; data?: string };
  style: { path?: string; data?: string };
  uidata: { path?: string; data?: string };
  preset: { path?: string; data?: string };
  actions: { path?: string; data?: string };
};

export const showPreview = async (
  editorInstance: any,
  schemaPath: any,
  extensionPath: string
) => {
  if (!existsSync(schemaPath)) {
    try {
      const fileUri = await editorInstance.window.showOpenDialog(
        (editorInstance.OpenDialogOptions = {
          canSelectMany: false,
          canSelectFolders: false,
          canSelectFiles: true,
          openLabel: "Select schema",
          filters: {
            "Json Files": ["json"],
          },
        })
      );

      if (fileUri && fileUri[0]) {
        schemaPath = fileUri[0].fsPath;
      } else {
        return;
      }
    } catch (err) {
      showMessage(
        editorInstance,
        "Please select a schema file",
        MessageType.Error
      );
      return;
    }
  }

  try {
    const schemaContent = await readFileWithPromise(schemaPath, "utf8");
    const parsedSchemaContent = JSON.parse(schemaContent);
    const validSchema = await validateSchema(parsedSchemaContent);
    if (!validSchema) {
      showMessage(
        editorInstance,
        "Select valid JSON schema draft-07 file",
        MessageType.Error
      );
      return;
    }
  } catch (err: any) {
    showMessage(editorInstance, err.message, MessageType.Error);
    return;
  }

  showWebview(
    editorInstance,
    "preview",
    "JSONForms Vuetify Preview",
    extensionPath,
    schemaPath
  );
};

const showWebview = async (
  editorInstance: any,
  id: string,
  name: string,
  extensionPath: string,
  schemaPath: string
) => {
  const webView = editorInstance.window.createWebviewPanel(
    "view-" + id,
    name,
    editorInstance.ViewColumn.Two,
    { enableScripts: true }
  );

  const pathPrefix = schemaPath.endsWith("/schema.json") // no prefix if the file is called schema.json
    ? schemaPath.substring(0, schemaPath.length - "schema.json".length)
    : schemaPath.endsWith(".schema.json")
      ? schemaPath.substring(0, schemaPath.length - "schema.json".length)
      : schemaPath.substring(0, schemaPath.length - "json".length);

  const uischemaPath = pathPrefix + "uischema.json";
  const uischemasPath = pathPrefix + "uischemas.json";
  const dataPath = pathPrefix + "data.json";
  const configPath = pathPrefix + "config.json";
  const i18nPath = pathPrefix + "i18n.json";
  const stylePath = pathPrefix + "style.css";
  const uidataPath = pathPrefix + "uidata.json";
  const presetPath = pathPrefix + "preset.json";
  const actionsPath = pathPrefix + "actions.js";

  let files: Files = {
    schema: { path: schemaPath },
    uischema: { path: existsSync(uischemaPath) ? uischemaPath : "" },
    uischemas: { path: existsSync(uischemasPath) ? uischemasPath : "" },
    data: { path: existsSync(dataPath) ? dataPath : "" },
    config: { path: existsSync(configPath) ? configPath : "" },
    i18n: { path: existsSync(i18nPath) ? i18nPath : "" },
    style: { path: existsSync(stylePath) ? stylePath : "" },
    uidata: { path: existsSync(uidataPath) ? uidataPath : "" },
    preset: { path: existsSync(presetPath) ? presetPath : "" },
    actions: { path: existsSync(actionsPath) ? actionsPath : "" },
  };

  let html = await preparePreview(
    webView,
    editorInstance,
    extensionPath,
    files
  );
  webView.webview.html = html;

  const watchPaths = Object.values(files)
    .filter((file) => file.path)
    .map((file) => file.path!);

  watch(watchPaths).on("change", async (_path: any, _stats: any) => {
    files = {
      schema: { path: schemaPath },
      uischema: { path: existsSync(uischemaPath) ? uischemaPath : "" },
      uischemas: { path: existsSync(uischemasPath) ? uischemasPath : "" },
      data: { path: existsSync(dataPath) ? dataPath : "" },
      config: { path: existsSync(configPath) ? configPath : "" },
      i18n: { path: existsSync(i18nPath) ? i18nPath : "" },
      style: { path: existsSync(stylePath) ? stylePath : "" },
      uidata: { path: existsSync(uidataPath) ? uidataPath : "" },
      preset: { path: existsSync(presetPath) ? presetPath : "" },
      actions: { path: existsSync(actionsPath) ? actionsPath : "" },
    };

    html = await preparePreview(webView, editorInstance, extensionPath, files);
    webView.webview.html = html;
  });
};

const preparePreview = async (
  webView: any,
  editorInstance: any,
  extensionPath: string,
  files: Files
) => {
  // Read json files and load html for webview
  let file: keyof Files;
  for (file in files) {
    try {
      const path = files[file].path;
      if (path) {
        files[file].data = await readFileWithPromise(path, "utf8");
      }
    } catch (err: any) {
      showMessage(editorInstance, err.message, MessageType.Error);
      return;
    }
  }
  const previewFolder = join(extensionPath, "dist", "js");
  const scriptPathOnDisk = editorInstance.Uri.file(
    join(previewFolder, "vuetify-json-forms.js")
  );

  const webcomponentScriptPath = webView.webview.asWebviewUri(scriptPathOnDisk);

  const showPreviewConfig = editorInstance.workspace.getConfiguration(
    "jsonforms-vuetify-tooling.showPreview"
  );
  if (
    !files.config.data &&
    showPreviewConfig &&
    showPreviewConfig.config &&
    typeof showPreviewConfig.config === "object"
  ) {
    files.config = {};
    files.config.data = JSON.stringify(showPreviewConfig.config);
  }
  if (
    !files.preset.data &&
    showPreviewConfig &&
    showPreviewConfig.preset &&
    typeof showPreviewConfig.preset === "object"
  ) {
    files.preset = {};
    files.preset.data = JSON.stringify(showPreviewConfig.preset);
  }

  const html = getPreviewHTML(webcomponentScriptPath, files);
  return html;
};

const getPreviewHTML = (webcomponentScriptPath: any, files: Files) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <title>JSONForms Vuetify Preview</title>
  <script type="module" src="${webcomponentScriptPath}"></script>
  <style>
    body {
      padding: 0;
    }
    #root {
      padding: 20px;
      overflow-x: hidden;
    }
    .loading {
      width: 100vw;
      height: 100vh;
      background: #333333;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin: -20px;
    }
    .loader,
    .loader:after {
      border-radius: 50%;
      width: 10em;
      height: 10em;
    }
    .loader {
      margin: 60px auto;
      font-size: 10px;
      position: relative;
      text-indent: -9999em;
      border-top: 1.1em solid rgba(255, 255, 255, 0.2);
      border-right: 1.1em solid rgba(255, 255, 255, 0.2);
      border-bottom: 1.1em solid rgba(255, 255, 255, 0.2);
      border-left: 1.1em solid #ffffff;
      -webkit-transform: translateZ(0);
      -ms-transform: translateZ(0);
      transform: translateZ(0);
      -webkit-animation: load8 1.1s infinite linear;
      animation: load8 1.1s infinite linear;
    }
    @-webkit-keyframes load8 {
      0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
      }
      100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }
    @keyframes load8 {
      0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
      }
      100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }
  </style>
</head>

<body>
  <!--
  <div id="root">
    <div class="loading">
      <div class="loader"></div>
      <h3>The preview is now loading. When loading for the first time, this process takes a while.</h3>
    </div>
  </div>
  -->
  <vuetify-json-forms id="vuetify-json-forms">
  </vuetify-json-forms>

  <script type="text/javascript">
    var style = ${
      files.style && files.style.data
        ? JSON.stringify(files.style.data).replace(/\//g, "\\/")
        : "''"
    };
    var data = ${
      files.data && files.data.data
        ? JSON.stringify(files.data.data).replace(/\//g, "\\/")
        : "''"
    };
    var schema = ${
      files.schema && files.schema.data
        ? JSON.stringify(files.schema.data).replace(/\//g, "\\/")
        : "''"
    };
    var uischema = ${
      files.uischema && files.uischema.data
        ? JSON.stringify(files.uischema.data).replace(/\//g, "\\/")
        : "''"
    };
    var uischemas = ${
      files.uischemas && files.uischemas.data
        ? JSON.stringify(files.uischemas.data).replace(/\//g, "\\/")
        : "''"
    };
    var uidata = ${
      files.uidata && files.uidata.data
        ? JSON.stringify(files.uidata.data).replace(/\//g, "\\/")
        : "''"
    };
    var config = ${
      files.config && files.config.data
        ? JSON.stringify(files.config.data).replace(/\//g, "\\/")
        : "''"
    };
    var i18n = ${
      files.i18n && files.i18n.data
        ? JSON.stringify(files.i18n.data).replace(/\//g, "\\/")
        : "''"
    };
    var preset = ${
      files.preset && files.preset.data
        ? JSON.stringify(files.preset.data).replace(/\//g, "\\/")
        : "''"
    };
    var onChange = null;
    var onHandleAction = null;
    ${
      files.actions && files.actions.data ? files.actions.data : "// no actions"
    };

    
    let form = document.getElementById('vuetify-json-forms');
    if (style) {
      form.setAttribute('custom-style', style);
    }
    if (data) {
      form.setAttribute('data', data);
    }
    if (schema) {
      form.setAttribute('schema', schema);
    }
    if (uischema) {
      form.setAttribute('uischema', uischema);
    }
    if (uischemas) {
      form.setAttribute('uischemas', uischemas);
    }
    if (uidata) {
      form.setAttribute('uidata', uidata);
    }
    if (config) {
      form.setAttribute('config', config);
    }
    if (i18n) {
      form.setAttribute('translations', i18n);
    }
    if (preset) {
      form.setAttribute('vuetify-options', preset);
    }
    if (onChange) {
      form.addEventListener('change', onChange);
    }
    if (onHandleAction) {
      form.addEventListener('handle-action', onHandleAction);
    }

  </script>
</body>
</html>`;
};
