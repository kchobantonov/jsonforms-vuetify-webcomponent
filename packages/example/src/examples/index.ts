import type { ExampleDescription } from '@/core/types';
import { input as allOf } from './allOf';
import { input as allOfWithProps } from './allOf-with-props';
import { input as anyOf } from './anyOf';
import { input as anyOfWithProps } from './anyOf-with-props';
import { input as anyOfSimple } from './anyOf-simple';
import { input as array } from './array';
import { input as arrayRestrict } from './array-restrict';
import { input as arrayWithReorder } from './array-with-reorder';
import { input as basic } from './basic';
import { input as categorization } from './categorization';
import { input as categorizationStepper } from './categorization-stepper';
import { input as categorizationStepperNav } from './categorization-stepper-nav';
import { input as control } from './control';
import { input as controlOptions } from './control-options';
import { input as customRenderer } from './custom-renderer';
import { input as dateExample } from './date';
import { input as dateTimeExample } from './datetime';
import { input as enumExample } from './enum';
import { input as enumInArray } from './enum-in-array';
import { input as groupLayout } from './group-layout';
import { input as horizontalLayout } from './horizontal-layout';
import { input as huge } from './huge';
import { input as ifThenElse } from './if-then-else';
import { input as listWithDetails } from './list-with-details';
import { input as listWithDetailsAndReorder } from './list-with-details-and-reorder';
import { input as listWithDetailsRestrict } from './list-with-details-restrict';
import { input as job } from './job';
import { input as login } from './login';
import { input as main } from './main';
import { input as monacoEditor } from './monaco-editor';
import { input as multiEnum } from './multi-enum';
import { input as nestedArray } from './nested-array';
import { input as nestedArrayRestrict } from './nested-array-restrict';
import { input as nestedArrayWithReorder } from './nested-array-with-reorder';
import { input as nestedLayout } from './nested-layout';
import { input as noSchemas } from './no-schemas';
import { input as noUISchema } from './no-ui-schema';
import { input as object } from './object';
import { input as objectNested } from './object-nested';
import { input as oneOf } from './oneOf';
import { input as oneOfWithProps } from './oneOf-with-props';
import { input as oneOfTab } from './oneOf-tab';
import { input as oneOfRecursive } from './oneOf-recursive';
import { input as radio } from './radio';
import { input as radioGroup } from './radio-group';
import { input as rootObject } from './root-object';
import { input as additionalProperties } from './additionalProperties';
import { input as rule } from './rule';
import { input as templateLayout } from './template-layout';
import { input as templateSlot } from './template-slot';
import { input as timeExample } from './time';
import { input as verticalLayout } from './vertical-layout';
import { input as file } from './file';

export const examples: ExampleDescription[] = [
  {
    name: 'main',
    label: 'Main',
    input: main,
  },
  {
    name: 'basic',
    label: 'Basic',
    input: basic,
  },
  {
    name: 'control',
    label: 'Control',
    input: control,
  },
  {
    name: 'control-options',
    label: 'Control Options',
    input: controlOptions,
  },
  {
    name: 'monaco-editor',
    label: 'Monaco Editor',
    input: monacoEditor,
  },
  {
    name: 'job',
    label: 'Job Application',
    input: job,
  },
  {
    name: 'file',
    label: 'File',
    input: file,
  },
  {
    name: 'datetime',
    label: 'Datetime',
    input: dateTimeExample,
  },
  {
    name: 'date',
    label: 'Date',
    input: dateExample,
  },
  {
    name: 'time',
    label: 'Time',
    input: timeExample,
  },
  {
    name: 'enum',
    label: 'Enum',
    input: enumExample,
  },
  {
    name: 'enum-in-array',
    label: 'Enum In Array',
    input: enumInArray,
  },
  {
    name: 'multi-array',
    label: 'Multi Enum',
    input: multiEnum,
  },
  {
    name: 'categorization',
    label: 'Categorization',
    input: categorization,
  },
  {
    name: 'categorization-stepper',
    label: 'Categorization Stepper',
    input: categorizationStepper,
  },
  {
    name: 'categorization-stepper-nav',
    label: 'Categorization Stepper With Navigation',
    input: categorizationStepperNav,
  },
  {
    name: 'custom-renderer',
    label: 'Custom Renderer',
    input: customRenderer,
  },
  {
    name: 'horizontal-layout',
    label: 'Horizontal Layout',
    input: horizontalLayout,
  },
  {
    name: 'vertical-layout',
    label: 'Vertical Layout',
    input: verticalLayout,
  },
  {
    name: 'group-layout',
    label: 'Group Layout',
    input: groupLayout,
  },
  {
    name: 'nested-layout',
    label: 'Nested Layout',
    input: nestedLayout,
  },
  {
    name: 'template-layout',
    label: 'Template Layout',
    input: templateLayout,
  },
  {
    name: 'template-slot',
    label: 'Template/Slot Layout',
    input: templateSlot,
  },
  {
    name: 'array',
    label: 'Array',
    input: array,
  },
  {
    name: 'array-restrict',
    label: 'Array Min/Max Items',
    input: arrayRestrict,
  },
  {
    name: 'array-with-reorder',
    label: 'Array With Reorder',
    input: arrayWithReorder,
  },
  {
    name: 'nested-array',
    label: 'Nested Array',
    input: nestedArray,
  },
  {
    name: 'nested-array-restrict',
    label: 'Nested Array Min/Max Items',
    input: nestedArrayRestrict,
  },
  {
    name: 'nested-array-with-reorder',
    label: 'Nested Array With Reorder',
    input: nestedArrayWithReorder,
  },
  {
    name: 'rule',
    label: 'Rule',
    input: rule,
  },
  {
    name: 'login',
    label: 'Login',
    input: login,
  },
  {
    name: 'radio',
    label: 'Radio',
    input: radio,
  },
  {
    name: 'radio-group',
    label: 'Radio Group',
    input: radioGroup,
  },
  {
    name: 'object',
    label: 'Object',
    input: object,
  },
  {
    name: 'object-nested',
    label: 'Object (Nested)',
    input: objectNested,
  },
  {
    name: 'root-object',
    label: 'Root Object',
    note: 'Change `return NOT_APPLICABLE;` to `return 1;` in UI Schemas tab, and then save, to see the difference in the Demo tab',
    input: rootObject,
  },
  {
    name: 'additional-properties',
    label: 'Additional Properties',
    input: additionalProperties,
  },
  {
    name: 'no-ui-schema',
    label: 'Generate UI Schema',
    input: noUISchema,
  },
  {
    name: 'no-schemas',
    label: 'Generate Both Schemas',
    input: noSchemas,
  },
  {
    name: 'one-of',
    label: 'Combinators oneOf',
    input: oneOf,
  },
  {
    name: 'one-of-with-props',
    label: 'Combinators oneOf with props',
    input: oneOfWithProps,
  },
  {
    name: 'one-of-tab',
    label: 'Combinators oneOf tab',
    input: oneOfTab,
  },
  {
    name: 'one-of-recursive',
    label: 'Combinators oneOf recursive',
    input: oneOfRecursive,
  },
  {
    name: 'any-of',
    label: 'Combinators anyOf',
    input: anyOf,
  },
  {
    name: 'any-of-with-props',
    label: 'Combinators anyOf with props',
    input: anyOfWithProps,
  },
  {
    name: 'any-of-simple',
    label: 'Combinators anyOf simple',
    input: anyOfSimple,
  },
  {
    name: 'all-of',
    label: 'Combinators allOf',
    input: allOf,
  },
  {
    name: 'all-of-with-props',
    label: 'Combinators allOf with props',
    input: allOfWithProps,
  },
  {
    name: 'list-with-details',
    label: 'List With Details',
    input: listWithDetails,
  },
  {
    name: 'list-with-details-restrict',
    label: 'List With Details Min/Max Items',
    input: listWithDetailsRestrict,
  },
  {
    name: 'list-with-details-reorder',
    label: 'List With Details And Reorder',
    input: listWithDetailsAndReorder,
  },
  {
    name: 'if-then-else',
    label: 'If Then Else',
    input: ifThenElse,
  },
  {
    name: 'huge',
    label: 'Huge',
    input: huge,
  },
];
