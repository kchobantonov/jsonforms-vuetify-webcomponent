# JSON Forms Vuetify WebComponent

This is a monorepo containing the JSON Forms extended Vuetify renderers, webcomponent, VS Code extension and an example application.

See [jsonforms-vuetify-webcomponent.netlify.app](https://jsonforms-vuetify-webcomponent.netlify.app) for the deployed example application.

The example application is based on [JSON Forms Vuetify Renderers](https://github.com/eclipsesource/jsonforms-vuetify-renderers) example project but adds more examples to demonstrate the additioanal renderers that are included in the webcomponent, like [TemplateLayout Renderer](https://jsonforms-vuetify-webcomponent.netlify.app/#/example/template-layout)

## JSON Forms

See [jsonforms.io](https://jsonforms.io/) and the [main repository](https://github.com/eclipsesource/jsonforms) for more information about JSON Forms.

## Vue Vuetify renderer set

See the [README](https://github.com/eclipsesource/jsonforms/blob/master/packages/vue-vuetify/README.md) of the Vue Vuetify renderer set for detailed instructions on how to consume and use the JSON Forms Vue Vuetify renderer set.

## Developer documentation

Use Node 18.x

### Initial setup

- Install dependencies: `pnpm i --frozen-lockfile`

### Scripts

- Build (all packages): `pnpm run build`
- Build and watch the extended renderer set: `pnpm run renderers:watch`
- Run webcomponent demo: `pnpm run wc:dev`
- Run example app: `pnpm run example:dev`
- Build example app for production: `pnpm run example:build`
- Build VS Code extension: `pnpm run tooling:build`
- Create VSIX VS Code extension package for local deployment: `pnpm run tooling:vsix`

Recommendations:

- For development use `npm run renderers:watch` combined with `npm run example:dev`.
- For webcomponent development use `npm run renderers:watch` combined with `npm run wc:dev`.
- To test production use `npm run build` combined with `npm run example:build`.
  Then serve the built application from `example/dist` with a web server of your choice, e.g. `npx http-server example/dist`.

### VS Code Extension

The webcomponent is used in the VS Code extension project and it is available for preview from the [VisualStudio Marketplace](https://marketplace.visualstudio.com/items?itemName=kchobantonov.jsonforms-vuetify-tooling)

### Docker

Build a nginx image that hosts the jsonforms vuetify webcomponent and its demo HTML page.

```bash
git clone https://github.com/kchobantonov/jsonforms-vuetify-webcomponent.git
docker build -f Dockerfile -t jsonforms-vuetify-webcomponent:latest .
docker run --rm -p 8080:80 jsonforms-vuetify-webcomponent:latest
```

Open <http://localhost:8080/demo.html>

### Loading from CDN

For example if we use version `3.1.0-alpha.3` of the webcomponent then using the below HTML snippet we can renders the demo form.

```html
<vuetify-json-forms id="vuetify-json-forms"></vuetify-json-forms>

<script>
  let demo = {
    properties: {
      firstName: {
        type: "string",
        description: "The person's first name.",
      },
      lastName: {
        type: "string",
        description: "The person's last name.",
      },
      age: {
        description:
          "Age in years which must be equal to or greater than zero.",
        type: "integer",
        minimum: 0,
      },
    },
  };

  var form = document.getElementById("vuetify-json-forms");
  form.setAttribute("schema", JSON.stringify(demo));
</script>

<script
  type="text/javascript"
  src="https://cdn.jsdelivr.net/npm/@chobantonov/jsonforms-vuetify-webcomponent@3.1.0-alpha.3/dist/vuetify-json-forms.min.js"
></script>
```

### Continuous Integration

The JSON Forms Vuetify WebComponent project is built and tested via Github actions on Linux.

Current status: ![Build status](https://github.com/kchobantonov/jsonforms-vuetify-webcomponent/actions/workflows/ci.yml/badge.svg?branch=master)
