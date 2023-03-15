# JSON Forms Vuetify Tooling

[![Version](https://badgen.net/vs-marketplace/v/kchobantonov.jsonforms-vuetify-tooling)](https://marketplace.visualstudio.com/items?itemName=kchobantonov.jsonforms-vuetify-tooling)
[![Installs](https://badgen.net/vs-marketplace/i/kchobantonov.jsonforms-vuetify-tooling)](https://marketplace.visualstudio.com/items?itemName=kchobantonov.jsonforms-vuetify-tooling)
[![Downloads](https://badgen.net/vs-marketplace/d/kchobantonov.jsonforms-vuetify-tooling)](https://marketplace.visualstudio.com/items?itemName=kchobantonov.jsonforms-vuetify-tooling)

Make it easier for developers to use [JSON Forms Vuetify Renderer Set](https://github.com/eclipsesource/jsonforms-vuetify-renderers)

## Usage

1. Create valid JSON schema file then right click on the file and select `JSONForms Vuetify: Show Preview` to preview the form.
2. To further customize the preview you can create the following files next to the JSON schema file.

| File Name        | Purpose                                                                                                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `actions.js`     | Defines JS functions that are going to be used to handle button actions and also any form change notifications                                                               |
| `config.json`    | Specify the config object that is going to be used by JSON Forms. If not specifid then extension setting `jsonforms-vuetify-tooling.showPreview.config` is going to be used. |
| `data.json`      | Specify the initial data that should be present in the form                                                                                                                  |
| `i18n.json`      | Internationalization form data                                                                                                                                               |
| `preset.json`    | Specify the default Vuetify preset object. If not specifid then extension setting `jsonforms-vuetify-tooling.showPreview.preset` is going to be used.                        |
| `style.css`      | Any custom CSS to be used by the form                                                                                                                                        |
| `uidata.json`    | Defines initial data to be used by TemplateLayout renderers used in the form.                                                                                                |
| `uischema.json`  | Defines the form layout, if not provided a default VerticalLayout is going to be used.                                                                                       |
| `uischemas.json` | Defines reusable uischema snippets                                                                                                                                           |

For example page that uses all features take a look at [Basic Example](https://github.com/kchobantonov/jsonforms-vuetify-webcomponent/tree/master/packages/jsonforms-vuetify-webcomponent/src/examples/basic)

### Note

Files must be named with the same prefix as the JSON schema file. So if the JSON schema file is `index.schema.json` then the UI Schema file have to be `index.uischema.json`. If you want to not prefix the file and have the JSON schema file as `schema.json` then the UI schema for example have to be named `uischema.json`

The preview tool expects the form change notification function to be named `onChange` and the handle action function to be named `onHandleAction`. Those functions can be named differently when using the web component directly.

## JSON Forms Preview Demo

![JSON Forms Preview Demo](https://github.com/kchobantonov/jsonforms-vuetify-webcomponent/blob/master/packages/jsonforms-vuetify-tooling/assets/demo.gif?raw=true)
