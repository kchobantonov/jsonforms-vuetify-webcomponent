# JSON Forms Vuetify WebComponent

This is a monorepo containing the JSON Forms extended Vuetify renderers, webcomponent, VS Code extension and an example application.

See [jsonforms-vuetify-webcomponent.netlify.app](https://jsonforms-vuetify-webcomponent.netlify.app) for the deployed example application.

The example application is based on [JSON Forms Vuetify Renderers](https://github.com/eclipsesource/jsonforms-vuetify-renderers) example project but adds more examples to demonstrate the additioanal renderers that are included in the webcomponent, like [TemplateLayout Renderer](https://jsonforms-vuetify-webcomponent.netlify.app/#/example/template-layout)

## JSON Forms

See [jsonforms.io](https://jsonforms.io/) and the [main repository](https://github.com/eclipsesource/jsonforms) for more information about JSON Forms.

## Vue2 Vuetify renderer set

See the [README](https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/README.md) of the Vue 2 Vuetify renderer set for detailed instructions on how to consume and use the JSON Forms Vue 2 Vuetify renderer set.

## Developer documentation

Use Node 14.x

### Initial setup

- Install monorepo dependencies: `npm ci`
- Hook up dependencies between packages: `npm run init`

### Scripts

- Build all: `npm run build`
- Build and watch the extended renderer set: `npm run renderers:watch`
- Run webcomponent demo: `npm run wcserve`
- Run example app: `npm run example:serve`
- Build example app for production: `npm run example:build`
- Build VS Code extension: `npm run tooling:build`
- Create VSIX VS Code extension package for local deployment: `npm run tooling:vsix`

Recommendations:

- For development use `npm run renderers:watch` combined with `npm run example:serve`.
- For webcomponent development use `npm run renderers:watch` combined with `npm run wc:serve`.
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

### Rebuild package-lock.json

```bash
rm -f package-lock.json packages/jsonforms-vuetify-tooling/package-lock.json
docker run --rm -v $(pwd):/usr/src/app -w /usr/src/app node:14.21.3 sh -c "npm install && npm run init && cd packages/jsonforms-vuetify-tooling && npm install"
```

### Continuous Integration

The JSON Forms Vuetify WebComponent project is built and tested via Github actions on Linux.

Current status: ![Build status](https://github.com/kchobantonov/jsonforms-vuetify-webcomponent/actions/workflows/ci.yml/badge.svg?branch=master)
