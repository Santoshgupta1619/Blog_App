import { NodeViewWrapper } from "@tiptap/react";
import Moveable from "react-moveable";
import { useRef, useState } from "react";
import "./ResizableImage.css";

const ResizableImage = ({
  node,
  selected,
  updateAttributes,
}) => {
  const imageRef = useRef(null);
  const [target, setTarget] = useState(null);
  
  return (
    <NodeViewWrapper className="resizable-image-wrapper">

      {selected && (
        <div className="floating-toolbar">

          <button
            type="button"
            onClick={() => updateAttributes({ align: "left" })}
          >
            <i className="bi bi-align-start"></i>
          </button>

          <button
            type="button"
            onClick={() => updateAttributes({ align: "center" })}
          >
            <i className="bi bi-align-center"></i>
          </button>

          <button
            type="button"
            onClick={() => updateAttributes({ align: "right" })}
          >
            <i className="bi bi-align-end"></i>
          </button>

        </div>
      )}

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