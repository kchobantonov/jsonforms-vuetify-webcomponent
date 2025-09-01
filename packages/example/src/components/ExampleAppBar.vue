<script setup lang="ts">
import { useAppStore } from '../store';
import JsonFormsLogo from '../assets/JsonFormsLogo.vue';
import WebComponentLogo from '../assets/WebComponentLogo.vue';

import ThemeSwitcher from './ThemeSwitcher.vue';

const appStore = useAppStore();
</script>

<template>
  <v-app-bar app>
    <v-app-bar-nav-icon
      aria-label="Toggle Navigation Drawer"
      @click="appStore.drawer = !appStore.drawer"
    />
    <v-toolbar-title>
      <v-container fill-height fluid
        ><v-row align="center" justify="center">
          <v-tooltip bottom>
            <template v-slot:activator="{ props }">
              <JsonFormsLogo
                @click="appStore.exampleName = ''"
                v-bind="props"
                height="40"
                width="40"
                style="outline: none; cursor: pointer"
              ></JsonFormsLogo>
            </template>
            <div class="text-center">
              <div class="font-weight-medium">JSON Forms</div>
            </div>
          </v-tooltip>
          <v-col>JSON Forms </v-col>
        </v-row>
      </v-container>
    </v-toolbar-title>
    <v-toolbar-items>
      <v-container fill-height fluid justify-end class="pa-0"
        ><v-row align="center" no-gutters class="fill-height">
          <v-col class="d-flex justify-center align-center">
            <v-tooltip bottom>
              <template v-slot:activator="{ props }">
                <v-btn-toggle
                  v-bind="props"
                  :model-value="appStore.formOnly"
                  v-if="appStore.exampleName"
                  class="d-flex align-center"
                >
                  <v-btn
                    :value="true"
                    variant="text"
                    rounded="circle"
                    size="48"
                    @click="appStore.formOnly = !appStore.formOnly"
                  >
                    <v-icon size="24" color="primary">{{
                      appStore.formOnly
                        ? '$iconFormWrapperShow'
                        : '$iconFormWrapperHide'
                    }}</v-icon>
                  </v-btn>
                </v-btn-toggle>
              </template>
              {{ appStore.formOnly ? `Show full app` : `Show form only` }}
            </v-tooltip>
          </v-col>
          <v-col class="d-flex justify-center align-center">
            <v-tooltip bottom>
              <template v-slot:activator="{ props }">
                <v-btn-toggle
                  v-bind="props"
                  :model-value="appStore.useWebComponentView"
                  v-if="appStore.exampleName"
                  class="d-flex align-center"
                >
                  <v-btn
                    :value="true"
                    variant="text"
                    rounded="circle"
                    size="48"
                    @click="
                      appStore.useWebComponentView =
                        !appStore.useWebComponentView
                    "
                  >
                    <WebComponentLogo height="24" width="24"></WebComponentLogo>
                  </v-btn>
                </v-btn-toggle>
              </template>
              {{
                appStore.useWebComponentView
                  ? `Do not use webcomponent`
                  : `Use webcomponent`
              }}
            </v-tooltip>
          </v-col>
          <v-col class="d-flex justify-center align-center">
            <v-tooltip bottom>
              <template v-slot:activator="{ props }">
                <v-btn
                  icon
                  variant="text"
                  rounded="circle"
                  size="48"
                  href="https://github.com/kchobantonov/jsonforms-vuetify-webcomponent"
                  rel="noopener"
                  target="_blank"
                  v-bind="props"
                >
                  <v-icon color="primary">$github</v-icon>
                </v-btn>
              </template>
              GitHub
            </v-tooltip>
          </v-col>
          <v-col class="d-flex justify-center align-center">
            <theme-switcher></theme-switcher>
          </v-col>
          <v-col class="d-flex justify-center align-center">
            <v-tooltip bottom>
              <template v-slot:activator="{ props }">
                <v-btn
                  icon
                  variant="text"
                  rounded="circle"
                  size="48"
                  v-bind="props"
                  @click="appStore.settings = !appStore.settings"
                >
                  <v-icon color="primary">$settings</v-icon>
                </v-btn>
              </template>
              Settings
            </v-tooltip>
          </v-col>
        </v-row>
      </v-container>
    </v-toolbar-items>
  </v-app-bar>
</template>
