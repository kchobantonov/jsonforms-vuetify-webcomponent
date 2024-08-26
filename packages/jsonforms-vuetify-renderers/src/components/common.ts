import { type JSXComponent, type StyleValue } from 'vue';

export type IconValue =
  | string
  | (string | [path: string, opacity: number])[]
  | JSXComponent;

export const allowedVariants = [
  'underlined',
  'outlined',
  'filled',
  'solo',
  'solo-inverted',
  'solo-filled',
  'plain',
] as const;

export type Variant = (typeof allowedVariants)[number];

export type Density = null | 'default' | 'comfortable' | 'compact';

export type ValidationResult = string | boolean;

export type ValidationRule =
  | ValidationResult
  | PromiseLike<ValidationResult>
  | ((value: any) => ValidationResult)
  | ((value: any) => PromiseLike<ValidationResult>);

export type ValidateOnValue = 'blur' | 'input' | 'submit';

export type EventProp<T extends any[] = any[], F = (...args: T) => void> = F;

export interface RoundedProps {
  rounded?: string | number | boolean | undefined;
  tile?: boolean;
}

export interface DensityProps {
  density?: Density;
}

export interface ThemeProps {
  theme: string;
}

export interface VComponentProps {
  class: any;
  style: StyleValue;
}

export interface ValidationProps {
  disabled: boolean;
  error: boolean;
  errorMessages: string | readonly string[] | null;
  focused: boolean;
  maxErrors: string | number;
  name: string | undefined;
  label: string | undefined;
  readonly: boolean | null;
  rules: readonly ValidationRule[];
  modelValue: any;
  'onUpdate:modelValue': EventProp | undefined;
  validateOn?:
    | ValidateOnValue
    | `${ValidateOnValue} lazy`
    | `lazy ${ValidateOnValue}`
    | 'lazy';
  validationValue: any;
}

export interface VInputProps
  extends VComponentProps,
    DensityProps,
    ThemeProps,
    ValidationProps {
  id?: string;
  appendIcon?: IconValue;
  centerAffix?: boolean;
  prependIcon?: IconValue;
  hideDetails?: boolean | 'auto';
  hideSpinButtons?: boolean;
  hint?: string;
  persistentHint?: boolean;
  messages?: string | readonly string[];
  direction?: 'horizontal' | 'vertical';
  'onClick:prepend': EventProp<[MouseEvent]> | undefined;
  'onClick:append': EventProp<[MouseEvent]> | undefined;

  maxWidth?: number | string;
  minWidth?: number | string;
  width?: number | string;
}

export interface LoaderProps {
  loading?: boolean | string;
}

export interface VFieldProps
  extends VComponentProps,
    LoaderProps,
    RoundedProps,
    ThemeProps {
  appendInnerIcon?: IconValue;
  bgColor?: string;
  clearable?: boolean;
  clearIcon?: IconValue;
  active?: boolean;
  centerAffix?: boolean;
  color?: string;
  baseColor?: string;
  dirty?: boolean;
  disabled: boolean;
  error: boolean;
  flat?: boolean;
  label: string | undefined;
  persistentClear?: boolean;
  prependInnerIcon?: IconValue;
  reverse?: boolean;
  singleLine?: boolean;
  variant: Variant;

  'onClick:clear': EventProp<[MouseEvent]> | undefined;
  'onClick:appendInner': EventProp<[MouseEvent]> | undefined;
  'onClick:prependInner': EventProp<[MouseEvent]> | undefined;
}

export function callEvent<T extends any[]>(
  handler: EventProp<T> | undefined,
  ...args: T
) {
  if (Array.isArray(handler)) {
    for (const h of handler) {
      h(...args);
    }
  } else if (typeof handler === 'function') {
    handler(...args);
  }
}
