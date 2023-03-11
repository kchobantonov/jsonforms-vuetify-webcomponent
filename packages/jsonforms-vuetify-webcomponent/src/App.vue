<template>
  <div>
    <div class="container-fluid" v-if="!example">
      <div class="row">
        <div class="col">
          <h4>Select Example:</h4>
          <select
            @change="onExampleChange($event)"
            v-model="exampleId"
            class="form-select"
          >
            <option v-if="!exampleId">Select Demo</option>
            <option
              v-for="option in examples"
              :key="option.id"
              :value="option.id"
            >
              {{ option.title }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <vuetify-json-forms
      v-if="example"
      :custom-style="style"
      :schema="JSON.stringify(example.input.schema)"
      :uischema="JSON.stringify(example.input.uischema)"
      :data="JSON.stringify(example.input.data)"
      :uidata="JSON.stringify(example.input.uidata)"
      :config="JSON.stringify(example.input.config)"
      :default-preset="JSON.stringify(example.input.preset)"
      :uischemas="JSON.stringify(example.input.uischemas)"
      :translations="JSON.stringify(example.input.i18n)"
      :actions="JSON.stringify(actions)"
      @change="onChange"
    >
    </vuetify-json-forms>
  </div>
</template>

<script lang="ts">
import wrap from '@vue/web-component-wrapper';
import Vue, { defineComponent, ref } from 'vue';
import { examples } from './examples';
import find from 'lodash/find';

import VuetifyJsonForms from './web-components/VuetifyJsonForms.vue';
import {
  JsonFormsUISchemaRegistryEntry,
  JsonSchema,
  UISchemaElement,
} from '@jsonforms/core';
import { VuetifyPreset } from 'vuetify';

window.customElements.define(
  'vuetify-json-forms',
  wrap(Vue, VuetifyJsonForms) as any
);

export default defineComponent({
  name: 'App',
  data() {
    // emulate the css since the VuetifyJsonForms are not build as actual web component that includes css during npm run serve
    const style = `
      @import url('//fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900');
      @import url('//cdn.jsdelivr.net/npm/@mdi/font@6.x/css/materialdesignicons.min.css');
      @import url('//cdn.jsdelivr.net/npm/vuetify@2.6.12/dist/vuetify.min.css');
    `;

    const exampleId = ref<string | null>(null);

    return {
      style,
      exampleId,
      examples,
    };
  },
  methods: {
    onExampleChange(event: any) {
      this.exampleId = event.target.value;
    },
    onChange(customEvent: any): void {
      if (
        this.example &&
        this.example.input.actions &&
        this.example.input.actions.onChange
      ) {
        this.example.input.actions.onChange(customEvent);
      }
    },
  },

  computed: {
    example():
      | {
          id: string;
          title: string;
          input: {
            actions?: any;
            config?: any;
            data: any;
            i18n?: any;
            preset?: Partial<VuetifyPreset>;
            schema?: JsonSchema;
            uidata?: any;
            uischema?: UISchemaElement;
            uischemas?: JsonFormsUISchemaRegistryEntry[];
            style?: string;
          };
        }
      | undefined {
      if (this.exampleId && this.examples) {
        return find(this.examples, (example) => example.id === this.exampleId);
      }
      return undefined;
    },
    customStyle(): string {
      return this.style + this.example?.input.style;
    },
    actions() {
      const actions: { [id: string]: string } = {};
      if (this.example?.input.actions) {
        Object.keys(this.example?.input.actions).forEach((key) => {
          actions[key] = this.example?.input.actions[key].toString();
        });
      }
      return actions;
    },
  },
});
</script>

<style>
@import url('//cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css');
</style>
