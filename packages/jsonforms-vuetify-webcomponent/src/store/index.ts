import { reactive } from 'vue';

const appstore = reactive({
  rtl: false,
  dark: false,
  theme: 'light',
  variant: '',
  iconset: 'mdi',
  blueprint: 'md1',
  locale: 'en',
});

export const useAppStore = () => {
  return appstore;
};
