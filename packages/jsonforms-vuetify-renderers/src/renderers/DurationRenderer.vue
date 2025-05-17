<template>
  <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :isFocused="isFocused"
    :appliedOptions="appliedOptions"
  >
    <v-text-field
      v-disabled-icon-focus
      :id="control.id + '-input'"
      :class="styles.control.input"
      :disabled="!control.enabled"
      :autofocus="appliedOptions.focus"
      :placeholder="appliedOptions.placeholder"
      :label="computedLabel"
      :hint="control.description"
      :persistent-hint="persistentHint()"
      :required="control.required"
      :error-messages="control.errors"
      v-bind="vuetifyProps('v-text-field')"
      v-model="inputModel"
      :clearable="control.enabled"
      @focus="handleFocus"
      @blur="handleBlur"
      v-maska:[options]="maska"
    >
      <template v-slot:prepend-inner>
        <v-menu
          v-model="showMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          :min-width="290"
          width="auto"
          v-bind="vuetifyProps('v-menu')"
          activator="parent"
          :disabled="!control.enabled"
        >
          <template v-slot:activator="{ props }">
            <v-icon v-bind="props" tabindex="-1">{{ pickerIcon }}</v-icon>
          </template>
          <v-confirm-edit
            v-model="pickerValue"
            :ok-text="okLabel"
            :cancel-text="cancelLabel"
            @cancel="() => (showMenu = false)"
            @save="() => (showMenu = false)"
          >
            <template
              v-slot:default="{ model: proxyModel, save, cancel, actions }"
            >
              <v-card :min-width="mdAndUp ? 600 : 290">
                <v-card-text>
                  <v-row>
                    <v-col>
                      <v-number-input
                        v-disabled-icon-focus
                        v-model="proxyModel.value.weeks"
                        clearable
                        controlVariant="stacked"
                        :label="t('Weeks', 'Weeks')"
                        :min="0"
                        :disabled="
                          (proxyModel.value.years !== undefined &&
                            proxyModel.value.years !== null) ||
                          (proxyModel.value.months !== undefined &&
                            proxyModel.value.months !== null) ||
                          (proxyModel.value.days !== undefined &&
                            proxyModel.value.days !== null) ||
                          (proxyModel.value.hours !== undefined &&
                            proxyModel.value.hours !== null) ||
                          (proxyModel.value.minutes !== undefined &&
                            proxyModel.value.minutes !== null) ||
                          (proxyModel.value.seconds !== undefined &&
                            proxyModel.value.seconds !== null)
                        "
                      ></v-number-input>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" md="4">
                      <v-number-input
                        v-disabled-icon-focus
                        v-model="proxyModel.value.years"
                        clearable
                        controlVariant="stacked"
                        :label="t('Years', 'Years')"
                        :min="0"
                        :disabled="
                          proxyModel.value.weeks !== undefined &&
                          proxyModel.value.weeks !== null
                        "
                      >
                      </v-number-input>
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-number-input
                        v-disabled-icon-focus
                        v-model="proxyModel.value.months"
                        clearable
                        controlVariant="stacked"
                        :label="t('Months', 'Months')"
                        :min="0"
                        :disabled="
                          proxyModel.value.weeks !== undefined &&
                          proxyModel.value.weeks !== null
                        "
                      ></v-number-input>
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-number-input
                        v-disabled-icon-focus
                        v-model="proxyModel.value.days"
                        clearable
                        controlVariant="stacked"
                        :label="t('Days', 'Days')"
                        :min="0"
                        :disabled="
                          proxyModel.value.weeks !== undefined &&
                          proxyModel.value.weeks !== null
                        "
                      ></v-number-input>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" md="4">
                      <v-number-input
                        v-disabled-icon-focus
                        v-model="proxyModel.value.hours"
                        clearable
                        controlVariant="stacked"
                        :label="t('Hours', 'Hours')"
                        :min="0"
                        :disabled="
                          proxyModel.value.weeks !== undefined &&
                          proxyModel.value.weeks !== null
                        "
                      ></v-number-input>
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-number-input
                        v-disabled-icon-focus
                        v-model="proxyModel.value.minutes"
                        clearable
                        controlVariant="stacked"
                        :label="t('Minutes', 'Minutes')"
                        :min="0"
                        :disabled="
                          proxyModel.value.weeks !== undefined &&
                          proxyModel.value.weeks !== null
                        "
                      ></v-number-input>
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-number-input
                        v-disabled-icon-focus
                        v-model="proxyModel.value.seconds"
                        clearable
                        controlVariant="stacked"
                        :label="t('Seconds', 'Seconds')"
                        :min="0"
                        :disabled="
                          proxyModel.value.weeks !== undefined &&
                          proxyModel.value.weeks !== null
                        "
                      ></v-number-input>
                    </v-col>
                  </v-row>
                </v-card-text>

                <v-card-actions class="d-flex justify-end">
                  <v-btn @click="cancel">
                    {{ cancelLabel }}
                  </v-btn>
                  <v-btn color="primary" @click="save">
                    {{ okLabel }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </template>
          </v-confirm-edit>
        </v-menu>
      </template>
    </v-text-field>
  </control-wrapper>
</template>

<script lang="ts">
import { type ControlElement } from '@jsonforms/core';
import {
  rendererProps,
  useJsonFormsControl,
  type RendererProps,
} from '@jsonforms/vue';
import {
  ControlWrapper,
  DisabledIconFocus,
  useTranslator,
  useVuetifyControl,
  type IconValue,
} from '@jsonforms/vue-vuetify';
import {
  vMaska,
  type MaskOptions,
  type MaskTokens,
  type MaskType,
} from 'maska';
import { computed, defineComponent, reactive, ref } from 'vue';
import {
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VCol,
  VConfirmEdit,
  VIcon,
  VMenu,
  VNumberInput,
  VRow,
  VTextField,
} from 'vuetify/components';

import { useDisplay } from 'vuetify';
import { useIcons } from '../icons';

type DurationKeys =
  | 'years'
  | 'months'
  | 'weeks'
  | 'days'
  | 'hours'
  | 'minutes'
  | 'seconds';

function getDurationMaskOptions(): { mask: MaskType; tokens: MaskTokens } {
  // Define custom tokens
  const tokens: MaskTokens = {
    '#': { pattern: /\d/ }, // Allow digits
    P: { pattern: /P/ }, // Allow uppercase 'P'
    Y: { pattern: /Y/ }, // Allow uppercase 'Y'
    M: { pattern: /M/ }, // Allow uppercase 'M'
    W: { pattern: /W/ }, // Allow uppercase 'W'
    D: { pattern: /D/ }, // Allow uppercase 'D'
    T: { pattern: /T/ }, // Allow uppercase 'T'
    H: { pattern: /H/ }, // Allow uppercase 'H'
    S: { pattern: /S/ }, // Allow uppercase 'S'
  };

  function mask(value: string): string {
    const result: string[] = [];
    let expect: MaskTokens = { P: tokens['P'] }; // Initial expectation: 'P'
    let timePart = false;
    let haveMinute = false;

    for (let index = 0; index < value.length; index++) {
      const char = value.charAt(index);
      let matched = false;

      for (const [key, token] of Object.entries(expect)) {
        if (token.pattern.test(char)) {
          result.push(key);
          matched = true;

          switch (key) {
            case 'P':
            case 'Y':
              expect = { '#': tokens['#'], T: tokens['T'] }; // After 'P', 'Y', expect a number or 'T'
              break;
            case 'D':
              expect = { T: tokens['T'] };
              break;
            case 'W':
              // expect = { T: tokens['T'] }; // some validators allow time part after weeks but not ajv since it follows the spec https://datatracker.ietf.org/doc/html/rfc3339#appendix-A
              expect = {};
              break;
            case 'M':
              if (timePart) {
                expect = { '#': tokens['#'] }; // After 'M' in time, expect a number
                haveMinute = true;
              } else {
                expect = { '#': tokens['#'], T: tokens['T'] }; // After 'M' in date, expect a number or 'T'
              }
              break;
            case 'T':
              expect = { '#': tokens['#'] }; // After 'T', expect a number
              timePart = true;
              break;
            case 'H':
              expect = { '#': tokens['#'] }; // After 'H', expect a number
              break;
            case 'S':
              expect = {}; // do not expect anything after S
              break;
            case '#':
              expect = { '#': tokens['#'] }; // Continue expecting digits
              if (!timePart) {
                if (
                  !result.includes('Y') &&
                  !result.includes('M') &&
                  !result.includes('D') &&
                  !result.includes('W')
                ) {
                  expect['Y'] = tokens['Y'];
                }
                if (
                  !result.includes('M') &&
                  !result.includes('D') &&
                  !result.includes('W')
                ) {
                  expect['M'] = tokens['M'];
                }
                if (
                  !result.includes('W') &&
                  !result.includes('Y') &&
                  !result.includes('M') &&
                  !result.includes('D')
                ) {
                  expect['W'] = tokens['W'];
                }
                if (!result.includes('D') && !result.includes('W')) {
                  expect['D'] = tokens['D'];
                }
              } else {
                if (
                  !result.includes('H') &&
                  !haveMinute &&
                  !result.includes('S')
                ) {
                  expect['H'] = tokens['H'];
                }
                if (!haveMinute && !result.includes('S')) {
                  expect['M'] = tokens['M'];
                }
                if (!result.includes('S')) {
                  expect['S'] = tokens['S'];
                }
              }
              break;
          }

          break;
        }
      }

      // If no match found, exit the loop
      if (!matched) break;
    }

    return result.join('');
  }
  return { mask, tokens };
}

const controlRenderer = defineComponent({
  name: 'duration-renderer',
  components: {
    ControlWrapper,
    VBtn,
    VCard,
    VCardActions,
    VCardText,
    VCol,
    VConfirmEdit,
    VIcon,
    VMenu,
    VRow,
    VNumberInput,
    VTextField,
  },
  directives: { DisabledIconFocus, maska: vMaska },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const t = useTranslator();
    const showMenu = ref(false);

    const adaptValue = (value: any) => value || undefined;
    const control = useVuetifyControl(useJsonFormsControl(props), adaptValue);

    const useMask = control.appliedOptions.value.mask !== false;
    const state = computed(() => getDurationMaskOptions());
    const icons = useIcons();

    const maska = reactive({
      masked: '',
      unmasked: '',
      completed: false,
    });
    const options = useMask
      ? computed<MaskOptions>(() => ({
          mask: state.value.mask,
          tokens: state.value.tokens,
          tokensReplace: true,
        }))
      : null;

    const { mdAndUp } = useDisplay();

    return {
      ...control,
      mdAndUp,
      maska,
      showMenu,
      t,
      adaptValue,
      options,
      useMask,
      icons,
    };
  },
  computed: {
    pickerIcon(): IconValue {
      if (typeof this.appliedOptions.pickerIcon === 'string') {
        return this.appliedOptions.pickerIcon;
      }

      return this.icons.current.value.timer;
    },
    inputModel: {
      get(): string | null {
        return this.control.data;
      },
      set(val: string | null): void {
        let value = val;

        if (value == null) {
          // clear
          this.maska.masked = '';
          this.maska.unmasked = '';
          this.maska.completed = false;
        }

        if (this.useMask && value === '' && this.maska.unmasked === '') {
          // once cleared the maska will set the value to ''
          return;
        }

        if (this.adaptValue(value) !== this.control.data) {
          this.onChange(value);
        }
      },
    },
    pickerValue: {
      get(): Record<DurationKeys, number | undefined | null> | undefined {
        return this.parseDuration(this.control.data);
      },
      set(
        val: Record<DurationKeys, number | undefined | null> | undefined,
      ): void {
        const value = this.formatDuration(val);
        if (this.adaptValue(value) !== this.control.data) {
          this.onChange(value);
        }
      },
    },
    cancelLabel(): string {
      const label =
        typeof this.appliedOptions.cancelLabel == 'string'
          ? this.appliedOptions.cancelLabel
          : 'Cancel';

      return this.t(label, label);
    },
    okLabel(): string {
      const label =
        typeof this.appliedOptions.okLabel == 'string'
          ? this.appliedOptions.okLabel
          : 'OK';
      return this.t(label, label);
    },
  },
  methods: {
    parseDuration(duration: string | undefined | null) {
      const result: Record<DurationKeys, number | undefined> = {} as Record<
        DurationKeys,
        number | undefined
      >;

      if (duration === undefined || duration == null) {
        return result;
      }
      const match = duration.match(
        /P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/,
      );

      if (match?.[1]) result.years = Number(match[1]);
      if (match?.[2]) result.months = Number(match[2]);
      if (match?.[3]) result.weeks = Number(match[3]);
      if (match?.[4]) result.days = Number(match[4]);
      if (match?.[5]) result.hours = Number(match[5]);
      if (match?.[6]) result.minutes = Number(match[6]);
      if (match?.[7]) result.seconds = Number(match[7]);

      return result;
    },
    formatDuration(
      parts: Record<DurationKeys, number | undefined | null> | undefined,
    ) {
      if (parts === undefined) {
        return undefined;
      }
      const { years, months, weeks, days, hours, minutes, seconds } = parts;
      if (weeks !== undefined && weeks !== null) {
        return `P${weeks}W`;
      }
      const datePart = [
        years !== undefined && years !== null ? `${years}Y` : '',
        months !== undefined && months !== null ? `${months}M` : '',
        days !== undefined && days !== null ? `${days}D` : '',
      ].join('');
      const timePart = [
        hours !== undefined ? `${hours}H` : '',
        minutes !== undefined ? `${minutes}M` : '',
        seconds !== undefined ? `${seconds}S` : '',
      ].join('');

      if (datePart || timePart) {
        return `P${datePart}${timePart ? `T${timePart}` : ''}`;
      }

      return '';
    },
  },
});

export default controlRenderer;
</script>
