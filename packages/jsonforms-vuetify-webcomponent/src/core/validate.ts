import { Actions } from '@kchobantonov/jsonforms-vuetify-renderers';
import Ajv, { ValidateFunction } from 'ajv';
import actionsSchema from './actions.schema.json';
const ajv = new Ajv({
  allErrors: true,
  coerceTypes: false,
  unicode: true,
  useDefaults: true,
});

type validate<T> = ((data: unknown) => data is T) &
  Pick<ValidateFunction, 'errors'>;
export const isActionsParams = ajv.compile(actionsSchema) as validate<Actions>;

export function validateActions(value: unknown): Actions {
  if (isActionsParams(value)) {
    return value;
  } else {
    throw new Error(
      ajv.errorsText(
        isActionsParams.errors?.filter((e: any) => e.keyword !== 'if'),
        { separator: '\n', dataVar: 'data' }
      ) +
        '\n\n' +
        'current input data:\n' +
        (value ? JSON.stringify(value) : value)
    );
  }
}
