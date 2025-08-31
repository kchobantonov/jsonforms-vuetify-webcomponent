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
        ><v-row align="center" justify="center" dense>
          <JsonFormsLogo width="40" height="40"></JsonFormsLogo>
          <v-col>JSON Forms </v-col>
        </v-row>
      </v-container>
    </v-toolbar-title>
    <v-toolbar-items>
      <v-container fill-height fluid justify-end
        ><v-row dense>
          <v-col>
            <v-tooltip bottom>
              <template v-slot:activator="{ props }">
                <v-btn-toggle
                  density="compact"
                  v-bind="props"
                  :model-value="appStore.formOnly"
                  v-if="appStore.exampleName"
                >
                  <v-btn
                    :value="true"
                    @click="appStore.formOnly = !appStore.formOnly"
                  >
                    <v-icon size="30" color="primary">{{
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
          <v-col>
            <v-tooltip bottom>
              <template v-slot:activator="{ props }">
                <v-btn-toggle
                  density="compact"
                  v-bind="props"
                  :model-value="appStore.useWebComponentView"
                  v-if="appStore.exampleName"
                >
                  <v-btn
                    :value="true"
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
          <v-col>
            <theme-switcher></theme-switcher>
          </v-col>
          <v-col>
            <v-tooltip bottom>
              <template v-slot:activator="{ props }">
                <v-btn
                  large
                  icon
                  dark
                  v-bind="props"
                  @click="appStore.settings = !appStore.settings"
                >
                  <v-icon size="30" color="primary">$settings</v-icon>
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
