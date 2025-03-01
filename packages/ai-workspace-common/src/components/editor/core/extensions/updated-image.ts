import Image from '@tiptap/extension-image';

const UpdatedImage = Image.extend({
  name: 'image',
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: '',
        parseHTML: (element) => element.getAttribute('src') || '',
        renderHTML: (attributes) => ({
          src: attributes.src || '',
        }),
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
    };
  },
});

export default UpdatedImage;
