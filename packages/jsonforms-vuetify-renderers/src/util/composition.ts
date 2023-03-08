import {
  composePaths,
  findUISchema,
  getAjv,
  getCells,
  getConfig,
  getData,
  getI18nKeyPrefixBySchema,
  getRenderers,
  getTranslator,
  hasShowRule,
  Internationalizable,
  isInherentlyEnabled,
  isVisible,
  JsonFormsState,
  OwnPropsOfRenderer,
  UISchemaElement,
} from '@jsonforms/core';
import { RendererProps, useControl } from '@jsonforms/vue2';
import { useStyles } from '@jsonforms/vue2-vuetify';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import isPlainObject from 'lodash/isPlainObject';
import merge from 'lodash/merge';
import { computed } from 'vue';

export interface ButtonElement extends UISchemaElement, Internationalizable {
  type: 'Button';
  /**
   * The label of button.
   */
  label: string;
  icon: string;
  color?: string;

  params?: Record<string, any>;
  action: string;
  script: string;
}

export interface OwnPropsOfButton extends OwnPropsOfRenderer {
  uischema: ButtonElement;
}

export const mapStateToButtonProps = (
  state: JsonFormsState,
  ownProps: OwnPropsOfButton
) => {
  const rootData = getData(state);
  const { uischema } = ownProps;
  const visible: boolean =
    ownProps.visible === undefined || hasShowRule(uischema)
      ? isVisible(ownProps.uischema, rootData, ownProps.path!, getAjv(state))
      : ownProps.visible;
  const label = uischema.label;
  const icon = uischema.icon;
  const action = uischema.action;
  const script = uischema.script;
  const color = uischema.color;
  const params = uischema.params;
  const t = getTranslator()(state);
  const i18nKeyPrefix = getI18nKeyPrefixBySchema(undefined, uischema);
  const i18nKey = i18nKeyPrefix ? `${i18nKeyPrefix}.label` : label ?? '';
  const i18nText = t(i18nKey, label, { uischema });

  const config = getConfig(state);
  const enabled: boolean = isInherentlyEnabled(
    state,
    ownProps,
    uischema,
    undefined, // layouts have no associated schema
    rootData,
    config
  );

  return {
    label: i18nText,
    icon,
    action,
    script,
    params,
    visible,
    enabled,
    color,
    config: getConfig(state),
    renderers: ownProps.renderers || getRenderers(state),
    cells: ownProps.cells || getCells(state),
  };
};

export const useJsonFormsButton = (props: RendererProps<ButtonElement>) => {
  const { control, ...other } = useControl(props, mapStateToButtonProps);
  return { button: control, ...other };
};

export const useVuetifyButton = <I extends { button: any }>(input: I) => {
  const styles = useStyles(input.button.value.uischema);
  const appliedOptions = computed(() =>
    merge(
      {},
      cloneDeep(input.button.value.config),
      cloneDeep(input.button.value.uischema.options)
    )
  );
  const vuetifyProps = (path: string) => {
    const props = get(appliedOptions.value?.vuetify, path);

    return props && isPlainObject(props) ? props : {};
  };
  return {
    ...input,
    appliedOptions,
    vuetifyProps,
    styles,
  };
};

export const useElementArrayControl = <I extends { control: any }>(
  input: I
) => {
  const childUiSchema = computed(() =>
    findUISchema(
      input.control.value.uischemas,
      input.control.value.schema,
      input.control.value.uischema.scope,
      input.control.value.path,
      undefined,
      input.control.value.uischema,
      input.control.value.rootSchema
    )
  );

  return {
    ...input,
    childUiSchema,
    composePaths,
  };
};
