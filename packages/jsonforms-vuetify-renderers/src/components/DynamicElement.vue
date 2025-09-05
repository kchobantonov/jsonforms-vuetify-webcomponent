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

const dangerousAttributes = new Set([
  // HTML injection
  'innerhtml',
  'outerhtml',
  'srcdoc',

  // Form manipulation
  'action',
  'formaction',
  'formenctype',
  'formmethod',
  'formtarget',

  // CSS injection
  'style',

  // Import/module related
  'import',
  'importmap',

  // Meta refresh
  'http-equiv',

  // Sandbox escaping
  'sandbox',
]);

type AllowedTag = (typeof allowedTags)[number];

function isAllowedTag(value: any): value is AllowedTag {
  return allowedTags.includes(
    (typeof value === 'string' ? value.toLowerCase() : value) as AllowedTag,
  );
}

function isSafeUrl(url: string): boolean {
  const lower = url.toLowerCase().trim();

  if (lower.startsWith('javascript:') || lower.startsWith('data:')) {
    return false;
  }

  return (
    lower.startsWith('/') ||
    lower.startsWith('./') ||
    lower.startsWith('../') ||
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('mailto:') ||
    lower.startsWith('tel:') ||
    lower.startsWith('#')
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
        if (dangerousAttributes.has(lowerKey)) {
          if (import.meta.env.DEV) {
            console.warn(
              `[DynamicElement] Dangerous attribute "${key}" was blocked.`,
            );
          }
          continue;
        }
        if (lowerKey.startsWith('on')) {
          if (import.meta.env.DEV) {
            console.warn(
              `[DynamicElement] Event handler "${key}" was blocked.`,
            );
          }
          continue;
        }
        if (
          (lowerKey === 'href' || lowerKey === 'src') &&
          typeof val === 'string'
        ) {
          if (!isSafeUrl(val)) {
            if (import.meta.env.DEV) {
              console.warn(`[DynamicElement] Unsafe URL blocked: ${val}`);
            }
            continue;
          }
        }
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
