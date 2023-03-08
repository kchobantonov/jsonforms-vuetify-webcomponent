<script lang="ts">
import { defineComponent } from "vue";

const dataProvider = defineComponent({
  name: 'data-provider',
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    data: null as any,
    loaded: false,
    error: undefined as any,
  }),
  async created() {
    try {
      const response = await fetch(`${this.url}`);
      this.data = await response.json();
    } catch (e) {
      this.error = e;
    } finally {
      this.loaded = true;
    }
  },
  render(): any {
    const slot = this.$scopedSlots.default!({
      fetch: {
        loading: !this.loaded,
        data: this.data,
        error: this.error,
      },
    });

    return Array.isArray(slot) ? slot[0] : slot;

  },
});

export default dataProvider;
</script>
