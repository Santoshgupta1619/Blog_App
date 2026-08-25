import { NodeViewWrapper } from "@tiptap/react";
import Moveable from "react-moveable";
import { useRef, useState } from "react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Unlink,
} from "lucide-react";
import "./ResizableImage.css";

const ResizableImage = ({
  node,
  selected,
  updateAttributes,
}) => {
  const imageRef = useRef(null);
  const [target, setTarget] = useState(null);

  // ==============================
  // ALIGN IMAGE
  // ==============================
  const handleAlign = (align) => {
    updateAttributes({ align });
  };

  // ==============================
  // ADD / EDIT IMAGE LINK
  // ==============================
  const handleImageLink = () => {
    const currentLink = node.attrs.link || "";

    const url = window.prompt(
      "Enter URL for this image:",
      currentLink
    );

    // User clicked Cancel
    if (url === null) {
      return;
    }

    const trimmedUrl = url.trim();

    // Empty URL = remove existing link
    if (!trimmedUrl) {
      updateAttributes({
        link: null,
      });

      return;
    }

    updateAttributes({
      link: trimmedUrl,
    });
  };

  // ==============================
  // REMOVE IMAGE LINK
  // ==============================
  const handleRemoveLink = () => {
    updateAttributes({
      link: null,
    });
  };

  return (
    <NodeViewWrapper className="resizable-image-wrapper">

      {/* ==============================
          IMAGE FLOATING TOOLBAR
      ============================== */}
      {selected && (
        <div className="floating-toolbar">

          {/* LEFT */}
          <button
            type="button"
            className={
              node.attrs.align === "left"
                ? "image-tool-btn active"
                : "image-tool-btn"
            }
            onClick={() => handleAlign("left")}
            title="Align left"
          >
            <AlignLeft size={17} strokeWidth={2} />
          </button>

          {/* CENTER */}
          <button
            type="button"
            className={
              node.attrs.align === "center"
                ? "image-tool-btn active"
                : "image-tool-btn"
            }
            onClick={() => handleAlign("center")}
            title="Align center"
          >
            <AlignCenter size={17} strokeWidth={2} />
          </button>

          {/* RIGHT */}
          <button
            type="button"
            className={
              node.attrs.align === "right"
                ? "image-tool-btn active"
                : "image-tool-btn"
            }
            onClick={() => handleAlign("right")}
            title="Align right"
          >
            <AlignRight size={17} strokeWidth={2} />
          </button>

          {/* DIVIDER */}
          <span className="toolbar-separator"></span>

          {/* ADD / EDIT LINK */}
          <button
            type="button"
            className={
              node.attrs.link
                ? "image-tool-btn active link-active"
                : "image-tool-btn"
            }
            onClick={handleImageLink}
            title={
              node.attrs.link
                ? "Edit image link"
                : "Add link to image"
            }
          >
            <LinkIcon size={17} strokeWidth={2} />
          </button>

          {/* REMOVE LINK */}
          {node.attrs.link && (
            <button
              type="button"
              className="image-tool-btn unlink-btn"
              onClick={handleRemoveLink}
              title="Remove image link"
            >
              <Unlink size={17} strokeWidth={2} />
            </button>
          )}

        </div>
      )}

      {/* ==============================
          IMAGE
      ============================== */}
      <img
        ref={imageRef}
        src={node.attrs.src}
        alt={node.attrs.alt || ""}
        title={node.attrs.title || ""}
        style={{
          width: `${node.attrs.width}px`,
          height: "auto",
          display: "block",

          marginLeft:
            node.attrs.align === "center"
              ? "auto"
              : node.attrs.align === "right"
                ? "auto"
                : "0",

          marginRight:
            node.attrs.align === "center"
              ? "auto"
              : node.attrs.align === "left"
                ? "auto"
                : "0",
        }}
        onClick={() => setTarget(imageRef.current)}
        draggable={false}
      />

      {/* ==============================
          RESIZE HANDLES
      ============================== */}
      {selected && target && (
        <Moveable
          target={target}
          origin={false}
          edge={false}
          resizable
          keepRatio
          onResize={({ target, width }) => {
            target.style.width = `${width}px`;

            updateAttributes({
              width,
            });
          }}
        />
      )}

    </NodeViewWrapper>
  );
};

export default ResizableImage;