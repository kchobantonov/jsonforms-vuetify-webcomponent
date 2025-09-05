<script lang="ts">
import { defineComponent, h } from 'vue';

const allowedSlotAttributes = new Set([
  'name', // Primary slot attribute
  'slot', // For slot assignment
  'id', // For targeting
  'class', // For styling
  'style', // Safe for slots since they're just placeholders
  'title', // For accessibility
  'aria-label',
  'aria-describedby',
  'role',
]);

export default defineComponent({
  name: 'slot-element',
  inheritAttrs: false,
  setup(props, { attrs, slots }) {
    return () => {
      const safeAttrs: Record<string, unknown> = {};

      for (const [key, val] of Object.entries(attrs)) {
        const lowerKey = key.toLowerCase();

        // Block event handlers
        if (lowerKey.startsWith('on')) {
          if (import.meta.env.DEV) {
            console.warn(`[SlotElement] Event handler "${key}" was blocked.`);
          }
          continue;
        }

        // Only allow slot-relevant attributes
        if (!allowedSlotAttributes.has(lowerKey)) {
          if (import.meta.env.DEV) {
            console.warn(
              `[SlotElement] Irrelevant attribute "${key}" was blocked.`,
            );
          }
          continue;
        }

        safeAttrs[key] = val;
      }

      return h(
        'slot',
        safeAttrs,
        Object.keys(slots).length
          ? Object.fromEntries(
              Object.entries(slots).map(([name, slotFn]) => [name, slotFn]),
            )
          : undefined,
      );
    };
  },
});
</script>
