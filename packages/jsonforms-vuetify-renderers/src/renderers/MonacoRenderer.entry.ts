import {
  and,
  isStringControl,
  optionIs,
  or,
  rankWith,
  type JsonFormsRendererRegistryEntry,
  type Tester,
  type UISchemaElement,
} from '@jsonforms/core';

import isEmpty from 'lodash/isEmpty';
import monacoRenderer from './MonacoRenderer.vue';

const hasStringValueOption =
  (optionName: string): Tester =>
  (uischema: UISchemaElement): boolean => {
    if (isEmpty(uischema)) {
      return false;
    }
    const options = uischema.options;
    return (
      (options &&
        !isEmpty(options) &&
        typeof options[optionName] === 'string') ||
      false
    );
  };

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: monacoRenderer,
  tester: rankWith(
    2,
    and(
      isStringControl,
      optionIs('format', 'code'),
      or(hasStringValueOption('language'), hasStringValueOption(':language')),
    ),
  ),
};
