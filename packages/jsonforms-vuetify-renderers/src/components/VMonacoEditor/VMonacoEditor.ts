import { PropType, shallowRef } from 'vue';
import { VProgressCircular, VTextarea } from 'vuetify/lib';
import debounce from 'lodash/debounce';

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
      editor: shallowRef<any>(null),
      monaco: shallowRef<any>(null),
      isMonacoLoading: true,
      hasMonacoLoadingError: false,
      isResizing: false,
      lastY: 0,
      debouncedLayout: null as (() => void) | null,
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
      handler(options: any, prevOptions: any) {
        if (this.editor && options !== prevOptions) {
          this.editor?.updateOptions(this.appliedOptions());
        }
      },
    },
    internalValue(newValue) {
      if (this.editor && newValue !== this.editor.getValue()) {
        this.editor?.setValue(newValue ?? '');
      }
    },
    language(language) {
      const model = this.editor?.getModel();
      if (model) {
        this.monaco?.editor?.setModelLanguage(model, language);
      }
    },
    isDark(isDark) {
      const theme = isDark ? 'vs-dark' : 'vs';
      this.monaco?.editor.setTheme(theme);
    },
    disabled() {
      this.editor?.updateOptions(this.appliedOptions());
    },
    style() {
      const { editor } = this;
      editor && this.$nextTick(this.debouncedLayout!);
    },
  },

  async mounted() {
    this.debouncedLayout = debounce(this.editorLayout, 200);
    document.addEventListener('mouseup', this.onMouseUp);
    await this.loadMonaco();
  },
  beforeDestroy() {
    this.editor?.dispose();
    this.editor = null;
    document.removeEventListener('mouseup', this.onMouseUp);
  },
  methods: {
    appliedOptions() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const value = this.internalValue;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const theme = this.isDark ? 'vs-dark' : 'vs';
      const language = this.language;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const readOnly = this.disabled;
      const options = this.options ?? {};
      // Don't pass in the model on update because monaco crashes if we pass the model
      // a second time. See https://github.com/microsoft/monaco-editor/issues/2027
      delete options.model;

      const useShadowDOM = true;

      return {
        value,
        theme,
        language,
        readOnly,
        useShadowDOM,
        ...options,
      };
    },
    genInput() {
      return this.$createElement(
        'div',
        {
          staticClass: 'v-monaco-editor__textarea',
          ref: 'editorTextArea',
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
          this.$createElement(
            'div',
            {
              ref: 'editorContainer',
              staticClass: 'v-monaco-editor__container',
            },
            this.isMonacoLoading
              ? [
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  //@ts-ignore
                  this.$createElement(VProgressCircular, {
                    props: {
                      size: 16,
                      width: 2,
                      indeterminate: true,
                    },
                  }),
                ]
              : []
          ),
        ]
      );
    },
    onEditorWrapperMouseDown(e: MouseEvent) {
      if (e.target === this.$refs.editorTextArea) {
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
      if (this.isResizing && this.$refs.editorTextArea instanceof HTMLElement) {
        const delta = e.clientY - this.lastY;
        const height = this.$refs.editorTextArea.clientHeight;
        this.$refs.editorTextArea.style.height = `${height + delta}px`;
        this.lastY = e.clientY;

        this.debouncedLayout?.();
      }
    },
    editorLayout() {
      this.editor?.layout();
    },
    onEditorWrapperMouseUp() {
      this.onMouseUp();
      document.removeEventListener(
        'mousemove',
        this.onEditorWrapperResize,
        false
      );
    },
    onMouseUp() {
      this.isResizing = false;
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
      this.debouncedLayout?.();
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
      if (this.$refs.editorTextArea instanceof HTMLElement) {
        this.$refs.editorTextArea.style.height = '0';
        const height = this.$refs.editorTextArea.scrollHeight;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const minHeight = parseInt(this.rows, 10) * parseFloat(this.rowHeight);
        // This has to be done ASAP, waiting for Vue
        // to update the DOM causes ugly layout jumping
        this.$refs.editorTextArea.style.height =
          Math.max(minHeight, height) + 'px';
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

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      this.monaco = window.monaco;

      this.editor = this.monaco.editor.create(
        this.$refs.editorContainer,
        this.appliedOptions()
      );

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
      this.editorLayout();
    },
    async loadMonaco() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const monaco = window.monaco;
      // Is Monaco already loaded?
      if (typeof monaco === 'object') {
        // Yes. Generate the monaco editor.
        this.copyCssToShadowDom();
        this.genEditor();
        return;
      }

      // Is it already being loaded by another component?
      if (document.querySelector(`script[src="${this.url}/vs/loader"]`)) {
        // Yes, it's being loaded, so listen for it.
        this.$root.$once('monaco-loaded', () => {
          // instantiate the editor
          this.copyCssToShadowDom();
          this.genEditor();
        });

        return;
      }

      // No. Is the script loader installed?
      if (typeof (this as any).$loadScript === 'undefined') {
        console.error(
          'Please install the $loaderScript to load monaco script dynamically.'
        );
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
        const shadowRoot = this.$el.getRootNode() as ShadowRoot;

        const shadowLinks = Array.prototype.slice.call(
          shadowRoot.querySelectorAll('link'),
          0
        );

        // We must move all CSS inside the shadow root, pick only link tags relevant to the editor
        const monacoLinkTags = Array.prototype.slice
          .call(document.getElementsByTagName('link'), 0)
          .filter((documentLink) => {
            const href = documentLink.getAttribute('href');
            if (
              href &&
              (/vs\/(base|editor|platform)/.test(href) ||
                href.startsWith(this.url))
            ) {
              return (
                shadowLinks.find(
                  (link) => link.getAttribute('href') === href
                ) === undefined
              );
            }
            return false;
          });

        monacoLinkTags.forEach((linkTag: HTMLLinkElement) => {
          const newLink = document.createElement('link');
          Array.from(linkTag.attributes).forEach((attr) => {
            newLink.setAttribute(attr.name, attr.value);
          });
          shadowRoot.appendChild(newLink);
        });
      }
    },
  },
});
