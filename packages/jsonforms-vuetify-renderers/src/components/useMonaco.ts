import loader from '@monaco-editor/loader';
import { onMounted, onUnmounted, shallowRef, ref } from 'vue';

function useMonaco(
  path = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.46.0/min/vs',
) {
  const monaco = shallowRef(loader.__getMonacoInstance());
  const loaded = ref(!!monaco.value);
  const error = ref(undefined);

  onMounted(() => {
    let cancelable: ReturnType<typeof loader.init>;

    if (!monaco.value) {
      loader.config({ paths: { vs: path } });
      cancelable = loader.init();

      cancelable
        .then((instance) => {
          monaco.value = instance;
          loaded.value = true;
        })
        .catch((err) => {
          if (err?.type !== 'cancelation') {
            error.value = err;
          }
        })
        .finally(() => {
          loaded.value = true;
        });
    } else {
      loaded.value = true;
    }

    onUnmounted(() => {
      if (cancelable && cancelable.cancel) {
        cancelable.cancel();
      }
    });
  });

  return { monaco, loaded, error };
}

export default useMonaco;
