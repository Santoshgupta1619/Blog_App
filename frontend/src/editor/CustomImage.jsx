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
    };
  },

  renderHTML({ HTMLAttributes }) {
  return [
    "img",
    mergeAttributes(HTMLAttributes, {
      width: HTMLAttributes.width,
      "data-align": HTMLAttributes.align,
      align: HTMLAttributes.align,
    }),
  ];
},

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImage);
  },
});

export default CustomImage;