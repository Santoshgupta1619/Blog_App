import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer, mergeAttributes } from "@tiptap/react";
import ResizableImage from "./ResizableImage";

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),

      width: {
        default: 500,
      },

      align: {
        default: "center",
      },

      // NEW: URL attached to the image
      link: {
        default: null,
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const {
      src,
      alt,
      title,
      width,
      align,
      link,
      ...rest
    } = HTMLAttributes;

    const imageHTML = [
      "img",
      mergeAttributes(rest, {
        src,
        alt,
        title,
        width,
        "data-align": align,
        align,
      }),
    ];

    // If image has a link, wrap it inside <a>
    if (link) {
      return [
        "a",
        {
          href: link,
          target: "_blank",
          rel: "noopener noreferrer",
        },
        imageHTML,
      ];
    }

    // Normal image without a link
    return imageHTML;
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImage);
  },
});

export default CustomImage;