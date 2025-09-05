<script lang="ts">
import { defineComponent, h, type PropType } from 'vue';

const allowedTags = [
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
  'style',
] as const;

type AllowedTag = (typeof allowedTags)[number];
function isAllowedTag(value: any): value is AllowedTag {
  return allowedTags.includes(
    (typeof value === 'string' ? value.toLowerCase() : value) as AllowedTag,
  );
}

export default defineComponent({
  name: 'dynamic-element',
  inheritAttrs: false,
  props: {
    tag: {
      type: String as PropType<AllowedTag>,
      required: true,
      validator: (value: any) => isAllowedTag(value),
    },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const tag =
        typeof props.tag === 'string' ? props.tag.toLowerCase() : props.tag;

      if (!isAllowedTag(tag)) {
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
