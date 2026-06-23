import Ractive, {
  type Data,
  type DataFn,
  type ParsedTemplate,
  type Partial,
  type Registry,
} from 'ractive';

export interface SlotPlaceholder {
  name: string;
  el: HTMLElement;
}

export class RactiveTemplateController<T extends Ractive<T> = Ractive> {
  private ractive: Ractive | null = null;
  private onMountSlots: (slots: SlotPlaceholder[]) => void;
  private container: HTMLElement | null = null;
  private template: ParsedTemplate | null = null;
  private data: any = null;

  constructor(onMountSlots: (slots: SlotPlaceholder[]) => void) {
    this.onMountSlots = onMountSlots;
  }

  async destroy() {
    if (this.ractive) {
      this.ractive.off();
      await this.ractive.teardown().catch(() => {});
      this.ractive = null;
    }
  }

  updateData(keyPath: string, value: any) {
    if (this.ractive) {
      this.ractive.set(keyPath, value);
    }
  }

  async setup(
    container: HTMLElement,
    template: string,
    data: (Data | DataFn<T>) & { elements?: { name: string }[] },
    visible: boolean,
  ) {
    this.container = container;
    this.template = Ractive.parse(template);
    this.data = data;

    if (!visible) {
      await this.destroy();
      return;
    }

    await this.render();
  }

  async updateVisibility(visible: boolean) {
    if (visible && !this.ractive) {
      await this.render();
    } else if (!visible && this.ractive) {
      await this.destroy();
    }
  }

  private async render() {
    if (!this.container) return;

    await this.destroy();
    this.container.innerHTML = '';

    const partials: Registry<Partial> = {};

    this.data.elements?.forEach((el: any) => {
      partials[el.name] = `<div data-slot="${el.name}"></div>`;
    });

    this.ractive = new Ractive({
      el: this.container,
      template: this.template!,
      partials,
      data: this.data,
      twoway: true,
      lazy: false,
    });

    const runMount = () => {
      const els = this.container!.querySelectorAll('[data-slot]');
      const slots = Array.from(els).map((el) => ({
        name: el.getAttribute('data-slot')!,
        el: el as HTMLElement,
      }));
      this.onMountSlots(slots);
    };

    this.ractive.on('render', runMount);
    this.ractive.on('update', runMount);
    runMount();
  }
}
