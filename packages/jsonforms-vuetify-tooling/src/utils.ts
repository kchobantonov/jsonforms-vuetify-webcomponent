import { readFile } from "fs";
import Ajv from "ajv";
import { promisify } from "util";

export const readFileWithPromise = promisify(readFile);

export enum MessageType {
  Error = "err",
  Warning = "war",
  Information = "info",
}

const ajv = new Ajv();
export const validateSchema = ajv.getSchema("http://json-schema.org/draft-07/schema#")!;

/**
 * Show message within the editor
 * @param {any} editorInstance the instance of the editor
 * @param {string} message the message that should be displayed
 * @param {string} type the optional type of the message
 */
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
