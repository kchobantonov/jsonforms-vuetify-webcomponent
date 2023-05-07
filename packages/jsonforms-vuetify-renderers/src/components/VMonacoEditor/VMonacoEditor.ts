import { PropType } from 'vue';
import { VProgressCircular, VTextarea } from 'vuetify/lib';

// Styles
import './VMonacoEditor.sass';

export default VTextarea.extend({
  name: 'v-monaco-editor',

  props: {
    url: {
      type: String,
      default: 'https://unpkg.com/monaco-editor@latest/min',
    },
    language: {
      type: String,
      default: 'javascript',
    },
    options: {
      type: Object,
      default: null,
    },
    initActions: {
      type: Array as PropType<string[]>,
    },
  },

  data() {
    return {
      editor: null as any,
      monaco: null as any,
      isMonacoLoading: true,
      hasMonacoLoadingError: false,
      isResizing: false,
      lastY: 0,
      editorTextArea: null as HTMLDivElement | null,
    };
  },

  computed: {
    classes() {
      return {
        'v-monaco-editor': true,
        'v-monaco-editor--no-resize':
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          VTextarea.options.computed.noResizeHandle.call(this),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        ...VTextarea.options.computed.classes.call(this),
      };
    },
  },

  watch: {
    options: {
      deep: true,
      handler(options) {
        this.editor?.updateOptions(this.appliedOptions(options));
      },
    },
    internalValue(newValue) {
      if (this.editor && newValue !== this.editor.getValue()) {
        this.editor?.setValue(newValue ?? '');
      }
    },
    language(newVal) {
      this.editor?.updateOptions(this.appliedOptions({ language: newVal }));
    },
    isDark(isDark) {
      this.editor?.updateOptions(
        this.appliedOptions({ theme: isDark ? 'vs-dark' : 'vs' })
      );
    },
    disabled(val) {
      this.editor?.updateOptions(this.appliedOptions({ readOnly: val }));
    },
    style() {
      const { editor } = this;
      editor &&
        this.$nextTick(() => {
          editor.layout();
        });
    },
  },

  async mounted() {
    await this.loadMonaco();
  },

  methods: {
    appliedOptions(options: Record<string, any>) {
      return {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        value: this.internalValue,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        theme: this.isDark ? 'vs-dark' : 'vs',
        language: this.language,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        readOnly: this.disabled,
        //automaticLayout: true,
        useShadowDOM: this.$el.getRootNode() instanceof ShadowRoot,
        ...options,
      };
    },
    genDefaultSlot() {
      return this.isMonacoLoading
        ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          this.$createElement(VProgressCircular, {
            props: {
              size: 16,
              width: 2,
              indeterminate: true,
            },
          })
        : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          VTextarea.options.methods.genDefaultSlot.call(this);
    },
    genInput() {
      if (this.hasMonacoLoadingError) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        return VTextarea.options.methods.genInput.call(this);
      }

      const input = this.$createElement(
        'div',
        {
          staticClass: 'v-monaco-editor__textarea',
          on: {
            mousedown: this.onEditorWrapperMouseDown,
            mouseup: this.onEditorWrapperMouseUp,
          },
          directives: [
            {
              name: 'resize',
              modifiers: { quiet: true },
              value: this.onResize,
            },
          ],
        },
        [
          this.$createElement('div', {
            staticClass: 'v-monaco-editor__container',
          }),
        ]
      );

      return input;
    },
    onEditorWrapperMouseDown(e: MouseEvent) {
      if (e.target === this.editorTextArea) {
        e.preventDefault();
        this.lastY = e.clientY;
        this.isResizing = true;
        document.addEventListener(
          'mousemove',
          this.onEditorWrapperResize,
          false
        );
      }
    },
    onEditorWrapperResize(e: MouseEvent) {
      if (this.isResizing && this.editorTextArea) {
        const delta = e.clientY - this.lastY;
        const height = this.editorTextArea.clientHeight;
        this.editorTextArea.style.height = `${height + delta}px`;
        this.lastY = e.clientY;
        this.editor?.layout();
        this.$emit('onResize');
      }
    },
    onEditorWrapperMouseUp(_e: MouseEvent) {
      this.isResizing = false;
      document.removeEventListener(
        'mousemove',
        this.onEditorWrapperResize,
        false
      );
    },
    onClick() {
      if (this.editor) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        if (this.isFocused || this.isDisabled) return;

        this.editor.focus();
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        VTextarea.options.methods.onResize.call(this);
      }
    },
    onResize() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      VTextarea.options.methods.onResize.call(this);
      this.editor?.layout();
    },
    onFocus(e?: Event) {
      if (this.editor) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        if (this.isFocused || this.isDisabled) return;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        if (!this.isFocused) {
          this.editor.focus();

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          this.isFocused = true;
          e && this.$emit('focus', e);
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        VTextarea.options.methods.onFocus.call(this);
      }
    },
    calculateInputHeight() {
      if (this.editorTextArea) {
        this.editorTextArea.style.height = '0';
        const height = this.editorTextArea.scrollHeight;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const minHeight = parseInt(this.rows, 10) * parseFloat(this.rowHeight);
        // This has to be done ASAP, waiting for Vue
        // to update the DOM causes ugly layout jumping
        this.editorTextArea.style.height = Math.max(minHeight, height) + 'px';
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        VTextarea.options.methods.calculateInputHeight.call(this);
      }
    },
    tryAutofocus() {
      if (this.editor) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        if (!this.autofocus || typeof document === 'undefined') return false;

        this.editor.focus();

        return true;
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        return VTextarea.options.methods.tryAutofocus.call(this);
      }
    },
    genEditor() {
      this.isMonacoLoading = false;
      this.hasMonacoLoadingError = false;

      this.$nextTick(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        this.monaco = window.monaco;
        this.editorTextArea = this.$el.querySelector(
          '.v-monaco-editor__textarea'
        );
        const domElement = this.$el.querySelector(
          '.v-monaco-editor__container'
        );

        const options = this.appliedOptions(this.options);
        this.editor = this.monaco.editor.create(domElement, options);

        this.$emit('editorDidMount', this.editor);
        this.editor.onDidChangeModelContent((_event: Event) => {
          const value = this.editor.getValue();
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          if (this.internalValue !== value) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            this.internalValue = value;
          }
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        this.editor.onDidBlurEditorText(this.onBlur.bind(this));
        this.editor.onDidFocusEditorText(this.onFocus.bind(this));

        if (this.initActions && this.initActions.length > 0) {
          const actions = this.initActions;
          this.$nextTick(() => {
            for (const action of actions) {
              this.editor?.getAction(action)?.run();
            }
          });
        }
        this.calculateInputHeight();
        this.editor.layout();
      });
    },
    async loadMonaco() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const monaco = window.monaco;
      // Is Monaco already loaded?
      if (typeof monaco === 'object') {
        // Yes. Generate the monaco editor.
        this.genEditor();
        return;
      }

      // Is it already being loaded by another component?
      if (document.querySelector(`script[src="${this.url}/vs/loader"]`)) {
        // Yes, it's being loaded, so listen for it.
        this.$root.$once('monaco-loaded', () => {
          // instantiate the editor
          this.genEditor();
        });

        return;
      }

      // No. Is the script loader installed?
      if (typeof (this as any).$loadScript === 'undefined') {
        // No.
        this.isMonacoLoading = false;
        this.hasMonacoLoadingError = true;

        return;
      }

      try {
        await (this as any).$loadScript(`${this.url}/vs/loader`);
        (window as any).require.config({
          paths: {
            vs: `${this.url}/vs`,
          },
        });

        const workerUrlData = `
        self.MonacoEnvironment = {
          baseUrl: '${this.url}'
        };
        importScripts('${this.url}/vs/base/worker/workerMain.js');`;
        const workerUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(
          workerUrlData
        )}`;

        // Cross domain workaround - https://github.com/Microsoft/monaco-editor/blob/master/docs/integrate-amd-cross.md
        (window as any).MonacoEnvironment = {
          getWorkerUrl() {
            return workerUrl;
          },
        };

        (window as any).require(['vs/editor/editor.main'], () => {
          this.copyCssToShadowDom();
          this.$root.$emit('monaco-loaded');
          this.genEditor();
        });
      } catch (_error) {
        this.isMonacoLoading = false;
        this.hasMonacoLoadingError = true;
      }
    },
    copyCssToShadowDom() {
      if (this.$el.getRootNode() instanceof ShadowRoot) {
        const shadowRoot = this.$el.getRootNode();
        // We must move all CSS inside the shadow root, pick only link tags relevant to the editor
        const documentLinks = Array.prototype.slice
          .call(document.getElementsByTagName('link'), 0)
          .filter((documentLink) => {
            if (
              /vs\/(base|editor|platform)/.test(
                documentLink.getAttribute('href')
              )
            ) {
              return true;
            }
            return true;
          });
        documentLinks.forEach((documentLink) =>
          shadowRoot.appendChild(documentLink)
        );
      }
    },
  },
});
