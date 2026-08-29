import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getWriterArticles,
  getWriterCategories,
} from "../api/user";

import { updateArticle } from "../api/articleApi";
import { uploadImage } from "../api/uploadApi";

import RichTextEditor from "../components/RichTextEditor";

import "./WriterEditArticle.css";

const WriterEditArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [categories, setCategories] = useState([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const [status, setStatus] = useState("draft");
  const [scheduledAt, setScheduledAt] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // LOAD ARTICLE + WRITER CATEGORIES
  // ======================================================

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [articlesResponse, categoriesResponse] =
        await Promise.all([
          getWriterArticles(),
          getWriterCategories(),
        ]);

      const articles =
        articlesResponse.data.articles || [];

      const writerArticle = articles.find(
        (item) => String(item.id) === String(id)
      );

      if (!writerArticle) {
        setError(
          "Article not found or you are not allowed to edit it."
        );
        return;
      }

      setArticle(writerArticle);

      setTitle(writerArticle.title || "");
      setContent(writerArticle.content || "");
      setImageUrl(writerArticle.image_url || "");

      setTags(
        Array.isArray(writerArticle.tags)
          ? writerArticle.tags
          : []
      );

      setStatus(
        writerArticle.status || "draft"
      );

      if (writerArticle.scheduled_at) {
        const date = new Date(
          writerArticle.scheduled_at
        );

        const localDate = new Date(
          date.getTime() -
            date.getTimezoneOffset() * 60000
        );

        setScheduledAt(
          localDate.toISOString().slice(0, 16)
        );
      }

      setCategories(
        categoriesResponse.data || []
      );

      // Try to match article category with
      // approved writer category.
      const matchingCategory =
        (categoriesResponse.data || []).find(
          (category) =>
            String(category.id) ===
              String(writerArticle.category_id) ||
            category.name ===
              writerArticle.category
        );

      if (matchingCategory) {
        setCategoryId(
          String(matchingCategory.id)
        );
      }
    } catch (err) {
      console.error(
        "LOAD WRITER ARTICLE ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load article."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // TAGS
  // ======================================================

  const addTags = (value) => {
    const newTags = value
      .split(/[,;\n|]+/)
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (!newTags.length) return;

    setTags((previous) => {
      const updated = [...previous];

      newTags.forEach((tag) => {
        if (!updated.includes(tag)) {
          updated.push(tag);
        }
      });

      return updated;
    });
  };

  const handleTagKeyDown = (e) => {
    if (
      e.key === "Enter" &&
      tagInput.trim()
    ) {
      e.preventDefault();

      addTags(tagInput);
      setTagInput("");
    }
  };

  const handleTagPaste = (e) => {
    const text =
      e.clipboardData.getData("text");

    if (/[,;\n|]/.test(text)) {
      e.preventDefault();

      addTags(text);
      setTagInput("");
    }
  };

  const removeTag = (tag) => {
    setTags((previous) =>
      previous.filter(
        (item) => item !== tag
      )
    );
  };

  // ======================================================
  // IMAGE UPLOAD
  // ======================================================

  const handleImageUpload = async () => {
    if (!image) {
      alert("Please select an image first.");
      return;
    }

    try {
      setUploading(true);

      const response =
        await uploadImage(image);

      setImageUrl(
        response.data.imageUrl
      );

      alert(
        "Image uploaded successfully."
      );
    } catch (err) {
      console.error(
        "IMAGE UPLOAD ERROR:",
        err
      );

      alert(
        err.response?.data?.error ||
          "Image upload failed."
      );
    } finally {
      setUploading(false);
    }
  };

  // ======================================================
  // SAVE ARTICLE
  // ======================================================

  const handleSave = async () => {
    try {
      if (!title.trim()) {
        alert("Please enter a title.");
        return;
      }

      if (!content.trim()) {
        alert("Please enter article content.");
        return;
      }

      if (!categoryId) {
        alert(
          "Please select an approved category."
        );
        return;
      }

      if (
        status === "scheduled" &&
        !scheduledAt
      ) {
        alert(
          "Please select a schedule date and time."
        );
        return;
      }

      if (status === "scheduled") {
        const selectedDate =
          new Date(scheduledAt);

        if (selectedDate <= new Date()) {
          alert(
            "Scheduled date and time must be in the future."
          );
          return;
        }
      }

      setSaving(true);

      await updateArticle(id, {
        title: title.trim(),
        content,
        image_url: imageUrl || null,
        category_id: categoryId,
        tags,
        status,
        scheduled_at:
          status === "scheduled"
            ? new Date(
                scheduledAt
              ).toISOString()
            : null,
      });

      alert(
        "Article updated successfully."
      );

      navigate(
        "/dashboard/writer/articles"
      );
    } catch (err) {
      console.error(
        "UPDATE WRITER ARTICLE ERROR:",
        err
      );

      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to update article."
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <section className="writer-edit-page">
        <div className="writer-edit-shell">
          <p>Loading article...</p>
        </div>
      </section>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <section className="writer-edit-page">
        <div className="writer-edit-shell">

          <div className="writer-edit-error">
            {error}
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/dashboard/writer/articles"
              )
            }
          >
            Back to My Articles
          </button>

        </div>
      </section>
    );
  }

  if (!article) {
    return null;
  }

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <section className="writer-edit-page">

      <div className="writer-edit-shell">

        <div className="writer-edit-header">

          <div>
            <p>WRITER EDITOR</p>

            <h2>Edit Article</h2>

            <span>
              Update your article and save
              your changes.
            </span>
          </div>

          <button
            type="button"
            className="writer-back-btn"
            onClick={() =>
              navigate(
                "/dashboard/writer/articles"
              )
            }
          >
            ← My Articles
          </button>

        </div>

        {/* TITLE */}

        <div className="writer-edit-group">

          <label>Title</label>

          <input
            type="text"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            placeholder="Enter article title"
          />

        </div>

        {/* IMAGE */}

        <div className="writer-edit-group">

          <label>Article Image</label>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(
                e.target.files[0]
              )
            }
          />

          <button
            type="button"
            className="writer-upload-btn"
            onClick={
              handleImageUpload
            }
            disabled={uploading}
          >
            {uploading
              ? "Uploading..."
              : "Upload New Image"}
          </button>

          {imageUrl && (
            <div className="writer-current-image">

              <p>Current Image</p>

              <img
                src={imageUrl}
                alt={title}
              />

            </div>
          )}

        </div>

        {/* CONTENT */}

        <div className="writer-edit-group">

          <label>Content</label>

          <RichTextEditor
            value={content}
            onChange={setContent}
          />

        </div>

        {/* CATEGORY */}

        <div className="writer-edit-group">

          <label>
            Approved Category
          </label>

          <select
            value={categoryId}
            onChange={(e) =>
              setCategoryId(
                e.target.value
              )
            }
          >

            <option value="">
              Select category
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              )
            )}

          </select>

        </div>

        {/* TAGS */}

        <div className="writer-edit-group">

          <label>Tags</label>

          <div className="writer-edit-tags">

            {tags.map((tag) => (
              <span
                key={tag}
                className="writer-edit-tag"
              >
                {tag}

                <button
                  type="button"
                  onClick={() =>
                    removeTag(tag)
                  }
                >
                  ×
                </button>

              </span>
            ))}

          </div>

          <input
            type="text"
            placeholder="Type a tag and press Enter"
            value={tagInput}
            onChange={(e) =>
              setTagInput(
                e.target.value
              )
            }
            onKeyDown={
              handleTagKeyDown
            }
            onPaste={
              handleTagPaste
            }
          />

        </div>

        {/* STATUS */}

        <div className="writer-edit-group">

          <label>
            Publishing Status
          </label>

          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value
              )
            }
          >

            <option value="draft">
              Save as Draft
            </option>

            <option value="published">
              Publish Now
            </option>

            <option value="scheduled">
              Schedule
            </option>

          </select>

        </div>

        {/* SCHEDULE */}

        {status === "scheduled" && (
          <div className="writer-edit-group">

            <label>
              Schedule Date & Time
            </label>

            <input
              type="datetime-local"
              value={scheduledAt}
              min={new Date()
                .toISOString()
                .slice(0, 16)}
              onChange={(e) =>
                setScheduledAt(
                  e.target.value
                )
              }
            />

          </div>
        )}

        {/* SAVE */}

        <button
          type="button"
          className="writer-save-btn"
          onClick={handleSave}
          disabled={
            saving ||
            uploading
          }
        >
          {saving
            ? "Saving..."
            : "Save Changes"}
        </button>

      </div>

    </section>
  );
};

export default WriterEditArticle;