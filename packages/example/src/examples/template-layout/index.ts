import type { ExampleInputDescription } from '@/core/types';
import data from './data.json';
import i18n from './i18n.json';
import schema from './schema.json';
import uischema from './uischema.json';
import { onHandleAction } from './actions';

export const input: ExampleInputDescription = {
  schema,
  uischema,
  data,
  i18n,
  onHandleAction,
};
