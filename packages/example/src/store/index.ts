import { getExamples } from '@/examples';
import type { ValidationMode } from '@jsonforms/core';
import { useLocalStorage } from '@vueuse/core';
import { markRaw, reactive, ref, watch } from 'vue';

export const appstoreLayouts = ['', 'demo-and-data'] as const;
export type AppstoreLayouts = (typeof appstoreLayouts)[number];

const appstore = reactive({
  examples: markRaw(getExamples()),
  exampleName: useHistoryHash(''),
  rtl: false,
  layout: useLocalStorage('vuetify-example-layout', ''),
  formOnly: useHistoryHashQuery('form-only', false as boolean),
  activeTab: useHistoryHashQuery('active-tab', 0 as number),
  useWebComponentView: useHistoryHashQuery(
    'use-webcomponent',
    false as boolean,
  ),
  dark: useLocalStorage('vuetify-example-dark', false),
  theme: useLocalStorage('vuetify-example-theme', 'light'),
  drawer: useHistoryHashQuery('drawer', true as boolean),
  settings: false,
  variant: useLocalStorage('vuetify-example-variant', ''),
  iconset: useLocalStorage('vuetify-example-iconset', 'mdi'),
  blueprint: useLocalStorage('vuetify-example-blueprint', 'md1'),
  jsonforms: {
    readonly: useHistoryHashQuery('read-only', false as boolean),
    validationMode: 'ValidateAndShow' as ValidationMode,
    config: {
      restrict: true,
      trim: false,
      showUnfocusedDescription: false,
      hideRequiredAsterisk: true,
      collapseNewItems: false,
      breakHorizontal: false,
      initCollapsed: false,
      hideAvatar: false,
      hideArraySummaryValidation: false,
      enableFilterErrorsBeforeTouch: false,
    },
    locale: useLocalStorage('vuetify-example-locale', 'en'),
  },
});

export const useAppStore = () => {
  return appstore;
};

function useHistoryHash(initialValue: string) {
  const data = ref(initialValue);

  // Function to update data based on URL hash
  const updateDataFromHash = () => {
    const hashAndQuery = window.location.hash.slice(1); // Remove the leading '#'
    const [hash, _] = hashAndQuery.split('?'); // Split hash and query string
    if (hash) {
      try {
        data.value = decodeURIComponent(hash);
      } catch (error) {
        console.error('Error parsing hash:', error);
      }
    }
  };

  // Initial update from URL hash
  updateDataFromHash();

  watch(data, (newValue) => {
    const encodedData = encodeURIComponent(newValue);

    const currentHash = window.location.hash.slice(1);
    const [, currentQueryString] = currentHash.split('?'); // Extract the query part after ?

    window.history.replaceState(
      null,
      '',
      `#${encodedData}${currentQueryString ? '?' + currentQueryString : ''}`, // Keep the query parameters intact
    );
  });

  return data;
}

function useHistoryHashQuery<T extends string | boolean | number>(
  queryParam: string,
  initialValue: T,
) {
  const data = ref<T>(initialValue);

  // Function to update data based on URL hash
  const updateDataFromHash = () => {
    const hashAndQuery = window.location.hash.slice(1); // Remove the leading '#'
    const [_, query] = hashAndQuery.split('?'); // Split hash and query string

    const searchParams = new URLSearchParams(query);
    if (searchParams) {
      try {
        const value = searchParams.has(queryParam)
          ? searchParams.get(queryParam)
          : `${initialValue}`;

        // Convert the value based on the type of initialValue
        if (typeof initialValue === 'boolean') {
          // Handle boolean conversion
          data.value = (value === 'true') as T;
        } else if (typeof initialValue === 'number') {
          data.value = value ? (parseFloat(value) as T) : 0;
        } else if (typeof initialValue === 'string') {
          // Handle string conversion
          data.value = value as T;
        }
      } catch (error) {
        console.error('Error parsing hash:', error);
      }
    }
  };

  // Initial update from URL hash
  updateDataFromHash();

  watch(data, (newValue) => {
    const encodedData = encodeURIComponent(newValue);

    const hashAndQuery = window.location.hash.slice(1); // Remove the leading '#'
    const [hash, query] = hashAndQuery.split('?'); // Split hash and query string

    const searchParams = new URLSearchParams(query);

    if (newValue === initialValue) {
      // it is the default value so no need to preserve the query paramter
      searchParams.delete(queryParam);
    } else {
      searchParams.set(queryParam, encodedData);
    }

    window.history.replaceState(
      null,
      '',
      `#${hash}${searchParams.size > 0 ? '?' + searchParams : ''}`, // Keep the query parameters intact
    );
  });

  return data;
}
