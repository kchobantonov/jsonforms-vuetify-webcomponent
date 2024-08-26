import { describe, it, expect, beforeEach } from 'vitest';
import { clearAllIds } from '@jsonforms/core';
import FileRenderer, {
  entry as fileControlRendererEntry,
} from '../../../src/renderers/FileRenderer.vue';
import { mountJsonForms } from '../util';

describe('FileRenderer.vue', () => {
  const renderers = [fileControlRendererEntry];

  const data = true;
  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'string',
    title: 'Image File',
    format: 'binary',
    formatMaximum: '1048576',
    contentMediaType: 'image/*',
    description:
      'File with maximum size of 1MB encoded as data URI and including the file name',
  };
  const uischema = {
    type: 'Control',
    scope: '#',
    options: {
      placeholder: 'file placeholder',
      showUnfocusedDescription: true,
      vuetify: {
        'v-file-input': {
          showSize: true,
        },
      },
    },
  };
  let wrapper: ReturnType<typeof mountJsonForms>;

  beforeEach(() => {
    // clear all ids to guarantee that the snapshots will always be generated with the same ids
    clearAllIds();
    wrapper = mountJsonForms(data, schema, renderers, uischema);
  });

  it('check if child FileRenderer exists', () => {
    expect(wrapper.getComponent(FileRenderer));
  });

  it('renders a file', () => {
    expect(wrapper.find('input[type="file"]').exists()).toBe(true);
  });

  it('renders title as label', () => {
    expect(wrapper.find('label').text()).toEqual('Image File');
  });

  it('should work with accept', () => {
    expect(wrapper.find('input').element.getAttribute('accept')).toBe(
      'image/*',
    );
  });

  it('should have a placeholder', async () => {
    const input = wrapper.find('input[type="file"]');
    await input.trigger('focus');
    const placeholder = input.attributes('placeholder');
    expect(placeholder).toEqual('file placeholder');
  });

  it('should render component and match snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });
});
