import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { getCategories } from "../../api/categoryApi";

const EditArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const [status, setStatus] = useState("published");
  const [scheduledAt, setScheduledAt] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
  try {
    const res = await getCategories();
    setCategories(res.data);
  } catch (err) {
    console.error("GET CATEGORIES ERROR:", err);
  }
};


  useEffect(() => {
  const fetchArticle = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:5000/api/admin/articles/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const article = res.data;

      setTitle(article.title || "");
      setContent(article.content || "");
      setImageUrl(article.image_url || "");
      setCategory(article.category || "");
      setStatus(article.status || "published");

      if (article.scheduled_at) {
        const date = new Date(article.scheduled_at);

        const formattedDate = new Date(
          date.getTime() - date.getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(0, 16);

        setScheduledAt(formattedDate);
      }

      setTags(article.tags || []);

    } catch (err) {
      console.error("FETCH ARTICLE ERROR:", err);
      alert("Failed to load article");
    } finally {
      setLoading(false);
    }
  };

  fetchCategories();
  fetchArticle();

}, [id]);

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

  
  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!content.trim()) {
      alert("Please enter content");
      return;
    }

    if (!category.trim()) {
      alert("Please enter a category");
      return;
    }

    if (status === "scheduled" && !scheduledAt) {
      alert("Please select a schedule date and time");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/admin/articles/${id}`,
        {
          title,
          content,
          image_url: imageUrl,
          category,
          tags,
          status,
          scheduled_at:
            status === "scheduled" ? scheduledAt : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Article updated successfully ✅");

      navigate("/admin/articles");

    } catch (err) {
      console.error("UPDATE ARTICLE ERROR:", err);

      alert(
        err.response?.data?.error ||
          "Failed to update article"
      );
    } finally {
      setSaving(false);
    }
  };

 
  if (loading) {
    return (
      <div className="container mt-5">
        <h3>Loading article...</h3>
      </div>
    );
  }

  return (
    <div className="container mt-5">

      <div className="card p-4 shadow">

        <h3 className="mb-4">
          Edit Article
        </h3>

        {/* TITLE */}
        <div className="mb-3">
          <label className="form-label">
            Title
          </label>

          <input
            type="text"
            className="form-control"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />
        </div>

        {/* IMAGE URL */}
        <div className="mb-3">
          <label className="form-label">
            Image URL
          </label>

          <input
            type="text"
            className="form-control"
            value={imageUrl}
            onChange={(e) =>
              setImageUrl(e.target.value)
            }
            placeholder="https://..."
          />

          {imageUrl && (
            <img
              src={imageUrl}
              alt="Article"
              className="mt-3"
              style={{
                width: "200px",
                height: "120px",
                objectFit: "cover",
              }}
            />
          )}
        </div>

        {/* CONTENT */}
        <div className="mb-3">
          <label className="form-label">
            Content
          </label>

          <textarea
            className="form-control"
            rows="10"
            value={content}
            onChange={(e) =>
              setContent(e.target.value)
            }
          />
        </div>

        {/* CATEGORY */}
        <div className="mb-3">
          <label className="form-label">
            Category
          </label>

          <select
  className="form-select"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
>
  <option value="">Select Category</option>

  {categories.map((cat) => (
    <option key={cat.id} value={cat.name}>
      {cat.name}
    </option>
  ))}
</select>
        </div>

        {/* TAGS */}
        <div className="mb-3">

          <label className="form-label">
            Tags
          </label>

          <div className="mb-2">

            {tags.map((tag, index) => (
              <span
                key={index}
                className="badge bg-primary me-2"
              >
                {tag}

                <button
                  type="button"
                  className="btn btn-sm btn-light ms-2"
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
            className="form-control"
            placeholder="Press Enter to add tag"
            value={tagInput}
            onChange={(e) =>
              setTagInput(e.target.value)
            }
            onKeyDown={handleAddTag}
          />

        </div>

        {/* STATUS */}
        <div className="mb-3">

          <label className="form-label">
            Status
          </label>

          <select
            className="form-select"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
          >
            <option value="published">
              Published
            </option>

            <option value="draft">
              Draft
            </option>

            <option value="scheduled">
              Scheduled
            </option>
          </select>

        </div>

        {/* SCHEDULE */}
        {status === "scheduled" && (
          <div className="mb-3">

            <label className="form-label">
              Schedule Date & Time
            </label>

            <input
              type="datetime-local"
              className="form-control"
              value={scheduledAt}
              onChange={(e) =>
                setScheduledAt(e.target.value)
              }
            />

          </div>
        )}

        {/* BUTTONS */}
        <div className="d-flex gap-2">

          <button
            className="btn btn-success"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

          <button
            className="btn btn-secondary"
            onClick={() =>
              navigate("/admin/articles")
            }
            disabled={saving}
          >
            Cancel
          </button>

        </div>

      </div>

    </div>
  );
};

export default EditArticle;