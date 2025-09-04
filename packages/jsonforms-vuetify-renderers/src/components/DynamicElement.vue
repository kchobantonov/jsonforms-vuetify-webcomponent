<script lang="ts">
import { defineComponent, h } from 'vue';

const allowedTags = new Set([
  'div',
  'span',
  'p',
  'section',
  'article',
  'header',
  'footer',
  'main',
  'aside',
  'ul',
  'ol',
  'li',
  'button',
  'a',
  'strong',
  'em',
  'small',
  'label',
  'slot',
  'link',
]);

export default defineComponent({
  name: 'dynamic-element',
  inheritAttrs: false,
  props: {
    tag: {
      type: String,
      required: true,
    },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const tag = props.tag.toLowerCase();

      if (!allowedTags.has(tag)) {
        if (import.meta.env.DEV) {
          console.warn(
            `[DynamicElement] Invalid tag "${props.tag}" was blocked.`,
          );
        }
        return null;
      }

      const safeAttrs: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(attrs)) {
        const lowerKey = key.toLowerCase();
        if (lowerKey === 'innerhtml') continue;
        if (lowerKey.startsWith('on')) continue;
        safeAttrs[key] = val;
      }

      return h(
        tag,
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
