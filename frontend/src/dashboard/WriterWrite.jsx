
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import RichTextEditor from "../components/RichTextEditor";

import { getWriterCategories } from "../api/user";
import { createArticle } from "../api/articleApi";
import { uploadImage } from "../api/uploadApi";

import "./WriterWrite.css";

const getLocalDateTimeString = () => {
  const now = new Date();

  const offset = now.getTimezoneOffset();

  const localDate = new Date(
    now.getTime() - offset * 60 * 1000
  );

  return localDate.toISOString().slice(0, 16);
};

const WriterWrite = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [status, setStatus] = useState("published");
const [scheduledAt, setScheduledAt] = useState("");

  // ======================================================
  // LOAD APPROVED WRITER CATEGORIES
  // ======================================================

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);

        const response = await getWriterCategories();

        setCategories(response.data || []);
      } catch (err) {
        console.error("GET WRITER CATEGORIES ERROR:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load your approved categories."
        );
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // ======================================================
  // TAGS
  // ======================================================

  const addTags = (value) => {
    const newTags = value
      .split(/[,;\n|]+/)
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "");

    if (newTags.length === 0) return;

    setTags((previousTags) => {
      const updatedTags = [...previousTags];

      newTags.forEach((tag) => {
        if (!updatedTags.includes(tag)) {
          updatedTags.push(tag);
        }
      });

      return updatedTags;
    });
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();

      addTags(tagInput);
      setTagInput("");
    }
  };

  const handleTagPaste = (e) => {
    const pastedText = e.clipboardData.getData("text");

    if (/[,;\n|]/.test(pastedText)) {
      e.preventDefault();

      addTags(pastedText);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags((previousTags) =>
      previousTags.filter((tag) => tag !== tagToRemove)
    );
  };

  // ======================================================
  // IMAGE UPLOAD
  // ======================================================

  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image first.");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const response = await uploadImage(image);

      setImageUrl(response.data.imageUrl);

      alert("Image uploaded successfully.");
    } catch (err) {
      console.error("WRITER IMAGE UPLOAD ERROR:", err);

      setError(
        err.response?.data?.error ||
          "Image upload failed."
      );
    } finally {
      setUploading(false);
    }
  };

  // ======================================================
  // SUBMIT ARTICLE
  // ======================================================

  const handleSubmit = async (selectedStatus) => {
  setError("");

  // TITLE
  if (!title.trim()) {
    setError("Please enter an article title.");
    return;
  }

  // CONTENT
  if (!content.trim()) {
    setError("Please write some content.");
    return;
  }

  // CATEGORY
  if (!category) {
    setError("Please select an approved category.");
    return;
  }

  // SCHEDULE VALIDATION
  if (selectedStatus === "scheduled") {
    if (!scheduledAt) {
      setError("Please select a schedule date and time.");
      return;
    }

    const selectedDate = new Date(scheduledAt);
    const currentDate = new Date();

    if (selectedDate <= currentDate) {
      setError(
        "Scheduled date and time must be in the future."
      );
      return;
    }
  }

  try {
    setSubmitting(true);

    const response = await createArticle({
      title: title.trim(),
      content,
      image_url: imageUrl || null,
      category_id: category,
      tags,
      status: selectedStatus,
      scheduled_at:
        selectedStatus === "scheduled"
          ? new Date(scheduledAt).toISOString()
          : null,
    });

    console.log(
      "WRITER ARTICLE CREATED:",
      response.data
    );

    if (selectedStatus === "draft") {
      alert("Article saved as draft.");
    } else if (selectedStatus === "scheduled") {
      alert("Article scheduled successfully.");
    } else {
      alert("Article published successfully.");
    }

    navigate("/dashboard/writer/articles");

  } catch (err) {
    console.error(
      "WRITER CREATE ARTICLE ERROR:",
      err
    );

    setError(
      err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to create article."
    );
  } finally {
    setSubmitting(false);
  }
};

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="writer-write-page">

      <div className="writer-write-header">
        <p>WRITER</p>

        <h2>Write an Article</h2>

        <span>
          Create and submit your next story.
        </span>
      </div>

      {error && (
        <div className="writer-write-error">
          {error}
        </div>
      )}

      {/* ==================================================
          ARTICLE TITLE
      ================================================== */}

      <div className="writer-write-card">

        <label className="form-label">
          Article Title
        </label>

        <input
          type="text"
          className="form-control"
          placeholder="Enter your article title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={submitting}
        />

      </div>

      {/* ==================================================
          FEATURED IMAGE
      ================================================== */}

      <div className="writer-write-card">

        <label className="form-label">
          Featured Image
        </label>

        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={(e) =>
            setImage(e.target.files?.[0] || null)
          }
          disabled={uploading || submitting}
        />

        <button
          type="button"
          className="writer-upload-btn" 
          id="upload-btn"
          onClick={handleUpload}
          disabled={!image || uploading || submitting}
        >
          {uploading ? "Uploading..." : "Upload Image"}
        </button>

        {imageUrl && (
          <div className="writer-image-preview">

            <p>Image Preview</p>

            <img
              src={imageUrl}
              alt="Article preview"
            />

          </div>
        )}

      </div>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="writer-write-card">

        <label className="form-label">
          Article Content
        </label>

        <RichTextEditor
          value={content}
          onChange={setContent}
        />

      </div>

      {/* ==================================================
          CATEGORY
      ================================================== */}

      <div className="writer-write-card">

        <label className="form-label">
          Category
        </label>

        {loadingCategories ? (
          <p className="writer-muted">
            Loading your approved categories...
          </p>
        ) : categories.length === 0 ? (
          <div className="writer-no-category">
            <p>
              You don't have any approved categories yet.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/dashboard/writer/profile")
              }
            >
              Request a Category
            </button>
          </div>
        ) : (
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={submitting}
          >
            <option value="">
              Select an approved category
            </option>

            {categories.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>
            ))}
          </select>
        )}

      </div>

      {/* ==================================================
          TAGS
      ================================================== */}

      <div className="writer-write-card">

        <label className="form-label">
          Tags
        </label>

        {tags.length > 0 && (
          <div className="writer-tags">

            {tags.map((tag) => (
              <span
                key={tag}
                className="writer-tag"
              >
                {tag}

                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  disabled={submitting}
                >
                  ×
                </button>
              </span>
            ))}

          </div>
        )}

        <input
          type="text"
          className="form-control"
          placeholder="Type a tag and press Enter"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          onPaste={handleTagPaste}
          disabled={submitting}
        />

        <small className="writer-muted">
          You can separate multiple tags using comma, semicolon,
          or Enter.
        </small>

      </div>

      {/* ==================================================
    PUBLISHING STATUS
================================================== */}

<div className="writer-write-card">

  <label className="form-label">
    Publishing Status
  </label>

  <select
    className="form-select"
    value={status}
    onChange={(e) => {
      setStatus(e.target.value);

      if (e.target.value !== "scheduled") {
        setScheduledAt("");
      }
    }}
    disabled={submitting}
  >
    <option value="published">
      Publish Now
    </option>

    <option value="draft">
      Save as Draft
    </option>

    <option value="scheduled">
      Schedule
    </option>
  </select>

</div>

{status === "scheduled" && (
  <div className="writer-write-card">

    <label className="form-label">
      Schedule Date & Time
    </label>

    <input
      type="datetime-local"
      className="form-control"
      value={scheduledAt}
      min={getLocalDateTimeString()}
      onChange={(e) =>
        setScheduledAt(e.target.value)
      }
      disabled={submitting}
    />

    <small className="writer-muted">
      Choose a future date and time for automatic publishing.
    </small>

  </div>
)}

      {/* ==================================================
          ACTIONS
      ================================================== */}

      <div className="writer-write-actions">

  <button
    type="button"
    className="writer-submit-btn"
    onClick={() => handleSubmit(status)}
    disabled={
      submitting ||
      uploading ||
      loadingCategories ||
      categories.length === 0
    }
  >
    {submitting
      ? "Saving..."
      : status === "draft"
      ? "Save Draft"
      : status === "scheduled"
      ? "Schedule Article"
      : "Publish Article"}
  </button>

</div>

    </div>
  );
};

export default WriterWrite;

