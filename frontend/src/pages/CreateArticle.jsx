import { useState } from "react";
import { createArticle } from "../api/articleApi";
import { uploadImage } from "../api/uploadApi";
import { useNavigate } from "react-router-dom";
import "./CreateArticle.css";

const CreateArticle = () => {
  const navigate = useNavigate();

  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");


  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);


  const [category, setCategory] = useState("");

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");


  const [status, setStatus] = useState("published");
  const [scheduledAt, setScheduledAt] = useState("");

  const [submitting, setSubmitting] = useState(false);


  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();

      const newTag = tagInput.trim();

      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }

      setTagInput("");
    }
  };


  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };


  const handleUpload = async () => {
    if (!image) {
      alert("Please select an image first.");
      return;
    }

    try {
      setUploading(true);

      const res = await uploadImage(image);

      setImageUrl(res.data.imageUrl);

      alert("Image uploaded successfully ✅");
    } catch (err) {
      console.error("IMAGE UPLOAD ERROR:", err);

      alert(
        err.response?.data?.error ||
          "Image upload failed."
      );
    } finally {
      setUploading(false);
    }
  };


  const handleSubmit = async () => {
    try {
      // TITLE VALIDATION
      if (!title.trim()) {
        alert("Please enter a title.");
        return;
      }

      // CONTENT VALIDATION
      if (!content.trim()) {
        alert("Please enter content.");
        return;
      }

      // CATEGORY VALIDATION
      if (!category.trim()) {
        alert("Please enter a category.");
        return;
      }

      // SCHEDULE VALIDATION
      if (status === "scheduled") {
        if (!scheduledAt) {
          alert("Please select a schedule date and time.");
          return;
        }

        const selectedDate = new Date(scheduledAt);
        const currentDate = new Date();

        if (selectedDate <= currentDate) {
          alert(
            "Scheduled date and time must be in the future."
          );
          return;
        }
      }

      setSubmitting(true);

      const res = await createArticle({
        title: title.trim(),
        content,
        image_url: imageUrl,
        category: category.trim(),
        tags,
        status,
        scheduled_at:
          status === "scheduled"
            ? scheduledAt
            : null,
      });



      if (status === "draft") {
        alert("Article saved as draft ✅");

        navigate("/admin/drafts");
      } else if (status === "scheduled") {
        alert("Article scheduled successfully ✅");

        navigate("/admin/scheduled");
      } else {
        alert("Article published successfully ✅");

        navigate(`/article/${res.data.slug}`);
      }
    } catch (err) {
      console.error(
        "CREATE ARTICLE ERROR:",
        err
      );

      alert(
        err.response?.data?.error ||
          "Failed to create article."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-article-page">
      <div className="create-article-shell">

        <div className="create-article-heading">
          <p>EDITOR</p>
          <h3>Create a new article</h3>
          <span>Write, organise, and publish your next story.</span>
        </div>

        
        <div className="mb-3">
          <label className="form-label">
            Title
          </label>

          <input
            type="text"
            className="form-control"
            placeholder="Enter article title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />
        </div>

        
        <div className="mb-3">
          <label className="form-label">
            Upload Image
          </label>

          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={(e) =>
              setImage(e.target.files[0])
            }
          />

          <button
            type="button"
            className="btn editor-upload-btn mt-2"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading
              ? "Uploading..."
              : "Upload Image"}
          </button>

          {/* IMAGE PREVIEW */}
          {imageUrl && (
            <div className="mt-3">
              <p className="mb-2">
                Image Preview:
              </p>

              <img
                src={imageUrl}
                alt="Article preview"
                className="article-preview-image"
              />
            </div>
          )}
        </div>

      
        <div className="mb-3">
          <label className="form-label">
            Content
          </label>

          <textarea
            className="form-control"
            rows="8"
            placeholder="Write your article..."
            value={content}
            onChange={(e) =>
              setContent(e.target.value)
            }
          />
        </div>

       
        <div className="mb-3">
          <label className="form-label">
            Category
          </label>

          <input
            type="text"
            className="form-control"
            placeholder="e.g. Technology"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          />
        </div>

      
        <div className="mb-3">
          <label className="form-label">
            Tags
          </label>

          {/* EXISTING TAGS */}
          <div className="mb-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="editor-tag badge me-2"
              >
                {tag}

                <button
                  type="button"
                  className="editor-tag-remove btn btn-sm ms-2"
                  onClick={() =>
                    removeTag(tag)
                  }
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* TAG INPUT */}
          <input
            type="text"
            className="form-control"
            placeholder="Type a tag and press Enter"
            value={tagInput}
            onChange={(e) =>
              setTagInput(e.target.value)
            }
            onKeyDown={handleAddTag}
          />
        </div>

       
        <div className="mb-3">
          <label className="form-label">
            Publishing Status
          </label>

          <select
            className="form-select"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
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
          <div className="mb-3">
            <label className="form-label">
              Schedule Date & Time
            </label>

            <input
              type="datetime-local"
              className="form-control"
              value={scheduledAt}
              min={new Date()
                .toISOString()
                .slice(0, 16)}
              onChange={(e) =>
                setScheduledAt(e.target.value)
              }
            />

            <small className="text-muted">
              Choose a future date and time.
            </small>
          </div>
        )}

       
        <button
          type="button"
          className="btn editor-submit-btn w-100"
          onClick={handleSubmit}
          disabled={submitting || uploading}
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

export default CreateArticle;
