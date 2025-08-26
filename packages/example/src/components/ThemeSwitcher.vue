<script setup lang="ts">
import { useAppStore } from '@/store';
import { computed, watch } from 'vue';
import { useTheme } from 'vuetify';

// Define interfaces for type safety
interface ThemeInfo {
  name: string;
  displayName: string;
  colorPreview: string[];
}

const theme = useTheme();

// Current theme info
const isDark = computed(() => theme.current.value.dark);

// Available themes filtered by current dark/light mode
const availableThemes = computed<ThemeInfo[]>(() => {
  const themes = theme.themes.value;

  return Object.keys(themes)
    .filter((name) => themes[name].dark === isDark.value) // filter by dark mode
    .map((name) => {
      const colors = themes[name].colors;
      return {
        name,
        displayName: name.charAt(0).toUpperCase() + name.slice(1),
        colorPreview: [colors.primary, colors.secondary, colors.success].filter(
          Boolean,
        ),
      };
    });
});

const appStore = useAppStore();

const darkModeValue = computed({
  get: () =>
    appStore.dark === undefined ? 'system' : appStore.dark ? 'dark' : 'light',
  set: (value) => {
    appStore.dark = value === 'system' ? undefined : value === 'dark';
  },
});

// Switch theme function
function switchTheme(themeName: string) {
  theme.change(themeName);
  appStore.theme = themeName;
}
</script>

<template>
  <v-menu offset-y>
    <template v-slot:activator="{ props: menuProps }">
      <v-tooltip bottom>
        <template v-slot:activator="{ props: tooltipProps }">
          <v-btn
            large
            icon
            dark
            v-bind="{ ...menuProps, ...tooltipProps }"
            :model-value="appStore.dark"
          >
            <v-icon size="30" color="primary">mdi-palette</v-icon>
          </v-btn>
        </template>
        {{ 'Change Theme' }}
      </v-tooltip>
    </template>

    <v-card min-width="280">
      <v-card-title class="text-subtitle-1">
        <v-icon class="mr-2">mdi-palette</v-icon>
        {{ 'Theme Settings' }}
      </v-card-title>

      <v-card-text>
        <!-- Theme Mode Toggle -->
        <div class="mb-4">
          <v-label class="text-caption mb-2">{{ 'Theme Mode' }}</v-label>
          <v-btn-toggle
            v-model="darkModeValue"
            density="compact"
            class="d-flex"
          >
            <v-btn :value="'light'" size="small">
              <v-icon>mdi-weather-sunny</v-icon>
              <span class="ml-1 d-none d-sm-inline">{{ 'Light' }}</span>
            </v-btn>
            <v-btn :value="'dark'" size="small">
              <v-icon>mdi-weather-night</v-icon>
              <span class="ml-1 d-none d-sm-inline">{{ 'Dark' }}</span>
            </v-btn>
            <v-btn :value="'system'" size="small">
              <v-icon>mdi-theme-light-dark</v-icon>
              <span class="ml-1 d-none d-sm-inline">{{ 'System' }}</span>
            </v-btn>
          </v-btn-toggle>
        </div>

        <!-- Available Themes (only if multiple themes exist) -->
        <div v-if="availableThemes.length > 2">
          <v-label class="text-caption mb-2">{{ 'Available Themes' }}</v-label>
          <v-list density="compact" class="py-0">
            <v-list-item
              v-for="theme in availableThemes"
              :key="theme.name"
              :active="appStore.theme === theme.name"
              @click="switchTheme(theme.name)"
              density="compact"
            >
              <template v-slot:prepend>
                <div class="d-flex align-center">
                  <div
                    v-for="color in theme.colorPreview.slice(0, 3)"
                    :key="color"
                    class="theme-preview-dot"
                    :style="{ backgroundColor: color }"
                  ></div>
                </div>
              </template>

              <v-list-item-title class="text-body-2">
                {{ theme.displayName }}
              </v-list-item-title>

              <template v-slot:append>
                <v-icon
                  v-if="appStore.theme === theme.name"
                  size="small"
                  color="primary"
                >
                  mdi-check-circle
                </v-icon>
              </template>
            </v-list-item>
          </v-list>
        </div>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<style scoped>
.theme-preview-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 4px;
  display: inline-block;
}
</style>
