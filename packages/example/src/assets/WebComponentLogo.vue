<template>
  <svg
    id="webcomponent-logo"
    data-name="WebComponent Logo"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 161 132"
    :width="width"
    :height="height"
    :class="play ? 'animate' : null"
  >
    <g fill="none" fill-rule="evenodd">
      <path
        :fill="primaryDarkerColor"
        d="M160.6 65.9l-17.4 29.3-24.4-29.7 24.4-28.9z"
      />
      <path
        :fill="secondaryColor"
        d="M141.3 100.2l-26.5-31.7-15.9 26.6 24.7 36.1z"
      />
      <path
        :fill="primaryDarkerColor"
        d="M141 31.4l-26.2 31.8-15.9-26.6L123.6.9z"
      />
      <path :fill="primaryColor" d="M61.1 31.4H141L123.4.9H78.7z" />
      <path :fill="primaryColor" d="M114.8 63.3H159l-15.9-26.8H98.8" />
      <path :fill="secondaryColor" d="M141.3 100.3H61l17.6 30.5h45z" />
      <path
        :fill="onSurfaceColor"
        d="M78.6 130.8L41 65.8 79.1.8H37.9L.4 65.8l37.5 65z"
      />
      <path :fill="secondaryColor" d="M114.8 68.4H159l-15.9 26.8H98.8" />
    </g>
  </svg>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useTheme } from 'vuetify';

const theme = useTheme();
const props = defineProps({
  /**
   * The width of the SVG icon.
   */
  width: {
    type: [String, Number],
    default: 100,
  },
  /**
   * The height of the SVG icon.
   */
  height: {
    type: [String, Number],
    default: 100,
  },
  /**
   * Enables the spinning animation on the logo.
   */
  animate: {
    type: Boolean,
    default: false,
  },
});

// Custom color manipulation functions
function lighten(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
      .toUpperCase()
  );
}

function darken(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = ((num >> 8) & 0x00ff) - amt;
  const B = (num & 0x0000ff) - amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
      .toUpperCase()
  );
}

const primaryColor = computed(() => theme.current.value.colors.primary);
const primaryDarkerColor = computed(() => darken(primaryColor.value, 40));
const secondaryColor = computed(
  () => theme.current.value.colors.secondary || '#b4d44e',
);
const onSurfaceColor = computed(
  () => theme.current.value.colors['on-surface'] || '#000000',
);

const play = ref(props.animate);
if (props.animate) {
  watch(primaryColor, () => {
    play.value = false;
    setTimeout(() => {
      play.value = true;
    }, 10);
  });
}
</script>

<style scoped>
.animate {
  animation: spin 3s ease-in-out infinite;
}

@keyframes spin {
  0% {
    transform: rotateY(0deg);
  }
  100% {
    transform: rotateY(360deg);
  }
}
</style>
