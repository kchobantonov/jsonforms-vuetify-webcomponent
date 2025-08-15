<script lang="ts">
import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'dynamic-element',
  inheritAttrs: false, // so we can forward attrs manually
  props: {
    tag: {
      type: String,
      required: true,
    },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        props.tag,
        {
          ...attrs, // forward all HTML attributes and event listeners
        },
        slots.default ? slots.default() : undefined, // render children if any
      );
  },
});
</script>
