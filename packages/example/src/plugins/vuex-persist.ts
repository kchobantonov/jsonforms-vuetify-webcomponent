import { RootState } from '@/store/types';
import VuexPersistence from 'vuex-persist';

type DeepPartial<T> = T extends any[]
  ? T
  : T extends Record<string, any>
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
// Set up vuex-persist to store state in window.localStorage
export default new VuexPersistence({
  key: 'jsonforms-vuetify-webcomponent', // The key to store the state on in the storage provider.
  storage: window.localStorage,
  strictMode: process.env.NODE_ENV !== 'production',
  reducer: (state: RootState): DeepPartial<RootState> => ({
    app: {
      vuetify: {
        theme: {
          dark: state.app.vuetify.theme.dark,
        },
      },
    },
  }),
  modules: ['app'],
  filter: (mutation) => {
    //only save app module state
    return mutation.type.indexOf('app/') === 0;
  },
});
