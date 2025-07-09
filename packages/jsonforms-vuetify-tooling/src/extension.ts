import * as vscode from "vscode";
import { showPreview } from "./preview";

export function activate(context: vscode.ExtensionContext) {
  const outputChannel = vscode.window.createOutputChannel("JSONForms Vuetify");

  const showPreviewCommand = vscode.commands.registerCommand(
    "jsonforms-vuetify-tooling.showPreview",
    (args: any) => {
      if (args === undefined) {
        args = { fsPath: null };
      }
      showPreview(vscode, args.fsPath, context.extensionPath, outputChannel);
    }
  );

  context.subscriptions.push(outputChannel);
  context.subscriptions.push(showPreviewCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
