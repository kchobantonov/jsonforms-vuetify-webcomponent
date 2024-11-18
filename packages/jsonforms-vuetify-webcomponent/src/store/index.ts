import { reactive } from 'vue';

type DefaultsInstance =
  | undefined
  | {
      [key: string]: undefined | Record<string, unknown>;
      global?: Record<string, unknown>;
    };
type DefaultsOptions = Partial<DefaultsInstance>;

const appstore = reactive({
  rtl: false,
  dark: false,
  iconset: 'mdi',
  blueprint: 'md1',
  locale: 'en',
  defaults: {} as DefaultsOptions,
});

export const useAppStore = () => {
  return appstore;
};
