import { watch } from "chokidar";
import { existsSync, readFile } from "fs";
import { join } from "path";
import { promisify } from "util";

export const readFileWithPromise = promisify(readFile);

export const showPreview = async (
  editorInstance: any,
  schemaPath: any,
  extensionPath: string
) => {
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
  const schemaExists = !schemaPath || existsSync(schemaPath);
  if (!schemaExists) {
    try {
      const path = await editorInstance.window.showOpenDialog(
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
      schemaPath = path.fsPath;
    } catch (err) {
      showMessage(
        editorInstance,
        "Please select a schema file",
        MessageType.Error
      );
      return;
    }
  }

  const webView = editorInstance.window.createWebviewPanel(
    "view-" + id,
    name,
    editorInstance.ViewColumn.Two,
    { enableScripts: true }
  );

  const pathPrefix = schemaPath.endsWith(".schema.json")
    ? schemaPath.substring(0, schemaPath.length - ".schema.json".length)
    : schemaPath.substring(0, schemaPath.length - ".json".length);
  const uischemaPath = pathPrefix + ".uischema.json";
  const i18nPath = pathPrefix + ".i18n.json";
  const dataPath = pathPrefix + ".data.json";

  let paths: {
    schemaPath: string;
    uischemaPath?: string;
    i18nPath?: string;
    dataPath?: string;
  } = {
    schemaPath: schemaPath,
    uischemaPath: !uischemaPath || existsSync(uischemaPath) ? uischemaPath : "",
    i18nPath: !i18nPath || existsSync(i18nPath) ? i18nPath : "",
    dataPath: !dataPath || existsSync(dataPath) ? dataPath : "",
  };

  let html = await preparePreview(
    webView,
    editorInstance,
    extensionPath,
    paths
  );
  webView.webview.html = html;

  const watchPaths = Object.values(paths).filter((path) => path);

  watch(watchPaths).on("change", async (path: any, stats: any) => {
    console.log("Data inside " + path + " changed");
    paths = {
      schemaPath: schemaPath,
      uischemaPath:
        !uischemaPath || existsSync(uischemaPath) ? uischemaPath : "",
      i18nPath: !i18nPath || existsSync(i18nPath) ? i18nPath : "",
      dataPath: !dataPath || existsSync(dataPath) ? dataPath : "",
    };

    html = await preparePreview(webView, editorInstance, extensionPath, paths);
    webView.webview.html = html;
  });
};

export enum MessageType {
  Error = "err",
  Warning = "war",
  Information = "info",
}

export const showMessage = async (
  editorInstance: any,
  message: string,
  type?: string
) => {
  let result = null;
  switch (type) {
    case MessageType.Error:
      result = editorInstance.window.showErrorMessage(message);
      break;
    case MessageType.Warning:
      result = editorInstance.window.showWarningMessage(message);
      break;
    default:
      result = editorInstance.window.showInformationMessage(message);
      break;
  }
  return result;
};

const preparePreview = async (
  webView: any,
  editorInstance: any,
  extensionPath: string,
  paths: {
    schemaPath: string;
    uischemaPath?: string;
    i18nPath?: string;
    dataPath?: string;
  }
) => {
  // Read json files and load html for webview
  let schema = "";
  try {
    schema = await readFileWithPromise(paths.schemaPath, "utf8");
  } catch (err: any) {
    showMessage(editorInstance, err.message, MessageType.Error);
    return;
  }

  let uiSchema = "";
  if (paths.uischemaPath) {
    try {
      uiSchema = await readFileWithPromise(paths.uischemaPath, "utf8");
    } catch (err: any) {
      showMessage(editorInstance, err.message, MessageType.Error);
      return;
    }
  }

  let i18n = "";
  if (paths.i18nPath) {
    try {
      i18n = await readFileWithPromise(paths.i18nPath, "utf8");
    } catch (err: any) {
      showMessage(editorInstance, err.message, MessageType.Error);
      return;
    }
  }

  let data = "";
  if (paths.dataPath) {
    try {
      data = await readFileWithPromise(paths.dataPath, "utf8");
    } catch (err: any) {
      showMessage(editorInstance, err.message, MessageType.Error);
      return;
    }
  }

  const previewFolder = join(extensionPath, "dist", "js");
  const scriptPathOnDisk = editorInstance.Uri.file(
    join(previewFolder, "vuetify-json-forms.min.js")
  );

  const webcomponentScriptPath = webView.webview.asWebviewUri(scriptPathOnDisk);

  const html = getPreviewHTML(
    webcomponentScriptPath,
    schema,
    uiSchema,
    i18n,
    data
  );
  return html;
};

const getPreviewHTML = (
  webcomponentScriptPath: any,
  schema: string,
  uischema: string,
  i18n: string,
  data: string
) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <title>JSONForms Vuetify Preview</title>
  <script src="${webcomponentScriptPath}"></script>
  <style>
    body {
      background: #fff;
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
    var schema = ${schema ? JSON.stringify(schema) : "''"};
    var uischema = ${uischema ? JSON.stringify(uischema) : "''"};
    var i18n = ${i18n ? JSON.stringify(i18n) : "''"};
    var data = ${data ? JSON.stringify(data) : "''"};

    var onChange = function(event) {
      var [data] = event.detail;
      console.log('Form state changed:' + JSON.stringify(data));
    };
    
    let form = document.getElementById('vuetify-json-forms');
    if (schema) {
      form.setAttribute('schema', schema);
    }
    if (uischema) {
      form.setAttribute('uischema', uischema);
    }
    if (i18n) {
      form.setAttribute('translations', i18n);
    }
    if (data) {
      form.setAttribute('data', data);
    }

    //form.setAttribute('custom-style', style);
    //form.setAttribute('data', JSON.stringify(data));
    //form.setAttribute('schema', JSON.stringify(schema));
    //form.setAttribute('uischema', JSON.stringify(uischema));
    //form.setAttribute('uischemas', JSON.stringify(uischemas));        
    //form.setAttribute('uidata', JSON.stringify(uidata));
    //form.setAttribute('config', JSON.stringify(config));
    //form.setAttribute('translations', JSON.stringify(i18n));
    //form.setAttribute('default-preset', JSON.stringify(preset));
    //form.setAttribute('actions', JSON.stringify(actionsAsString));

    form.addEventListener('change', onChange);

  </script>
</body>
</html>`;
};
