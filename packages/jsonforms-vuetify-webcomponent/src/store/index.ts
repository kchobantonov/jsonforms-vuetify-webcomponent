import { defaultVuetifyOptions, type VuetifyOptions } from '../plugins/options';
import { reactive } from 'vue';

export interface AppStore {
  rtl: boolean;
  dark: boolean | undefined;
  locale: string;

  vuetifyOptions: VuetifyOptions;
}

const defaultAppStore: AppStore = {
  rtl: false,
  dark: undefined as boolean | undefined,
  locale: 'en',

  vuetifyOptions: defaultVuetifyOptions,
};

let appstore: any = null;

export const useAppStore = (overrides?: Partial<AppStore>): AppStore => {
  if (!appstore) {
    // Initialize with defaults merged with any overrides
    appstore = reactive({
      ...defaultAppStore,
      ...(overrides || {}),
    });
  }
  return appstore;
};
