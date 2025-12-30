import {
  and,
  isStringControl,
  optionIs,
  or,
  rankWith,
  uiTypeIs,
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
    3,
    and(
      optionIs('format', 'code'),
      or(
        and(
          isStringControl,
          or(
            hasStringValueOption('language'),
            hasStringValueOption(':language'),
          ),
        ),
        // if the language is set to 'json' we can use the monaco editor for any type
        and(
          and(uiTypeIs('Control')),
          optionIs('language', 'json'),
          optionIs('convertJson', true),
        ),
      ),
    ),
  ),
};
