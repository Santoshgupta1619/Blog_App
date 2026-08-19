import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import CustomImage from "../editor/CustomImage";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
// import TextStyle from "@tiptap/extension-text-style";
// import Color from "@tiptap/extension-color";
// import CharacterCount from "@tiptap/extension-character-count";
import { useEffect } from "react";
import "../styles/RichTextEditor.css";
import { uploadImage } from "../api/uploadApi";

const RichTextEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
  StarterKit,
  CustomImage,
  Placeholder.configure({
    placeholder: "Start writing your article...",
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // console.log(editor.getHTML());
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor) return null;
  const handleEditorImage = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      const res = await uploadImage(file);

      editor
        .chain()
        .focus()
        .setImage({
          src: res.data.imageUrl,
        })
        .run();
    } catch (err) {
      console.error(err);
      alert("Image upload failed");
    }
  };

  return (
    <>
      <div className="editor-toolbar">
        <div className="toolbar-group">
            <button
          type="button"
          className={editor.isActive("heading", { level: 1 }) ? "active" : ""}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <i className="bi bi-type-h1"></i>
        </button>

        <button
          type="button"
          className={editor.isActive("heading", { level: 2 }) ? "active" : ""}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <i className="bi bi-type-h2"></i>
        </button>

        <button
          type="button"
          className={editor.isActive("heading", { level: 3 }) ? "active" : ""}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          H3
        </button>
        </div>

          <div className="toolbar-divider"></div>

<div className="toolbar-group">
    <button
          type="button"
          className={editor.isActive("bold") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <i className="bi bi-type-bold"></i>
        </button>

        <button
          type="button"
          className={editor.isActive("italic") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <i className="bi bi-type-italic"></i>
        </button>
        <button
          type="button"
          className={editor.isActive("underline") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <i className="bi bi-type-underline"></i>
        </button>
</div>
        
          <div className="toolbar-divider"></div>

<div className="toolbar-group">
    <button
          type="button"
          className={editor.isActive("bulletList") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <i className="bi bi-list-ul"></i>
        </button>

        <button
          type="button"
          className={editor.isActive("orderedList") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <i className="bi bi-list-ol"></i>
        </button>

        <button
          type="button"
          className={editor.isActive("blockquote") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <i className="bi bi-blockquote-left"></i>
        </button>
</div>

  <div className="toolbar-divider"></div>

<div className="toolbar-group">
    <button
          type="button"
          onClick={() => {
            const url = prompt("Enter URL");

            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
        >
          <i className="bi bi-link-45deg"></i>
        </button>
        <button
          type="button"
          onClick={() => document.getElementById("editor-image-upload").click()}
        >
          <i className="bi bi-image"></i>
        </button>
</div>
        

        
      </div>

      <input
        id="editor-image-upload"
        type="file"
        accept="image/*"
        hidden
        onChange={handleEditorImage}
      />

      <EditorContent editor={editor} className="editor-content" />

      {/* <div className="text-end mt-2">
        Characters: {editor.storage.characterCount.characters()}
      </div> */}
    </>
  );
};

export default RichTextEditor;
