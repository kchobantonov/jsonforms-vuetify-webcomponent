import { NOT_APPLICABLE } from '@jsonforms/core';

export default [
  {
    tester: (jsonSchema, schemaPath, path) => {
      return jsonSchema.$id === '#/definitions/address' &&
        schemaPath !== '#/properties/home_address'
        ? 2
        : NOT_APPLICABLE;
    },
    uischema: {
      type: 'HorizontalLayout',
      elements: [
        {
          type: 'Control',
          scope: '#/properties/street_address',
        },
        {
          type: 'Control',
          scope: '#/properties/city',
        },
        {
          type: 'Control',
          scope: '#/properties/state',
        },
      ],
    },
  },
];
