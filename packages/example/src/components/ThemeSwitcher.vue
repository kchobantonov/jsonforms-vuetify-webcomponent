<script setup lang="ts">
import { useAppStore } from '@/store';
import { computed } from 'vue';
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
        colorPreview: [colors.primary, colors.secondary, colors.accent].filter(
          Boolean,
        ),
      };
    });
});

const appStore = useAppStore();

const darkModeValue = computed({
  get: () => {
    if (appStore.dark === undefined) return 'system';
    return appStore.dark ? 'dark' : 'light';
  },

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
            icon
            variant="text"
            rounded="circle"
            size="48"
            v-bind="{ ...menuProps, ...tooltipProps }"
            :model-value="appStore.dark"
          >
            <v-icon color="primary">$palette</v-icon>
          </v-btn>
        </template>
        {{ 'Change Theme' }}
      </v-tooltip>
    </template>

    <v-card min-width="280">
      <v-card-title class="text-subtitle-1">
        <v-icon class="mr-2">$palette</v-icon>
        {{ 'Theme Settings' }}
      </v-card-title>

      <v-card-text>
        <div class="mb-4">
          <v-label class="text-caption mb-2">{{ 'Theme Mode' }}</v-label>
          <v-btn-toggle
            v-model="darkModeValue"
            density="compact"
            class="d-flex"
          >
            <v-btn :value="'light'" size="small">
              <v-icon>$light</v-icon>
              <span class="ml-1 d-none d-sm-inline">{{ 'Light' }}</span>
            </v-btn>
            <v-btn :value="'dark'" size="small">
              <v-icon>$dark</v-icon>
              <span class="ml-1 d-none d-sm-inline">{{ 'Dark' }}</span>
            </v-btn>
            <v-btn :value="'system'" size="small">
              <v-icon>$lightdark</v-icon>
              <span class="ml-1 d-none d-sm-inline">{{ 'System' }}</span>
            </v-btn>
          </v-btn-toggle>
        </div>

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
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-right: 3px;
  display: inline-block;
  border: 1px solid rgba(0, 0, 0, 0.12); /* Better contrast */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1); /* Subtle depth */
}
</style>
