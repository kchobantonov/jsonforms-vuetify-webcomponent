// we need this patch until https://github.com/vuetifyjs/vuetify/issues/16076 is fixed
const fs = require('fs');
const replace = require('replace-in-file');

const node_modules_path = '../../node_modules';

(async () => {
  await replace({
    files: `${node_modules_path}/vuetify/lib/mixins/detachable/index.js`,
    from: "target = document.querySelector('[data-app]');",
    to: "target = this.$el && this.$el.getRootNode() instanceof ShadowRoot ? this.$el.getRootNode().querySelector('[data-app]') : document.querySelector('[data-app]');",
  });
  await replace({
    files: `${node_modules_path}/vuetify/lib/mixins/detachable/index.js`,
    from: 'target = document.querySelector(this.attach);',
    to: 'target = this.$el && this.$el.getRootNode() instanceof ShadowRoot ? this.$el.getRootNode().querySelector(this.attach) : document.querySelector(this.attach);',
  });

  await replace({
    files: `${node_modules_path}/vuetify/lib/mixins/overlayable/index.js`,
    from: "const parent = this.absolute ? this.$el.parentNode : document.querySelector('[data-app]');",
    to: "const parent = this.absolute ? this.$el.parentNode : this.$el.getRootNode() instanceof ShadowRoot ? this.$el.getRootNode().querySelector('[data-app]') : document.querySelector('[data-app]');",
  });

  await replace({
    files: `${node_modules_path}/vuetify/lib/components/VSlider/VSlider.js`,
    from: "this.app = document.querySelector('[data-app]')",
    to: "this.app = (this.$el && this.$el.getRootNode() instanceof ShadowRoot ? this.$el.getRootNode().querySelector('[data-app]') : document.querySelector('[data-app]'))",
  });
})();
