
import { useEffect, useState } from "react";

import { getCategories } from "../../api/categoryApi";
import { submitWriterRequest } from "../../api/user";
import { uploadImage } from "../../api/uploadApi";
import { useNavigate } from "react-router-dom";

import "./BecomeWriter.css";

const BecomeWriter = () => {

const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [profileImage, setProfileImage] = useState(null);
  const [authorName, setAuthorName] = useState("");
  const [bio, setBio] = useState("");

  const [categoryType, setCategoryType] = useState("existing");
  const [categoryId, setCategoryId] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ======================================================
  // LOAD EXISTING CATEGORIES
  // ======================================================

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        setError("");

        const response = await getCategories();

        setCategories(response.data || []);
      } catch (err) {
        console.error("GET CATEGORIES ERROR:", err);

        setError(
          err.response?.data?.error ||
            "Failed to load categories."
        );
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // ======================================================
  // PROFILE IMAGE
  // ======================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;

    setProfileImage(file);
  };

  // ======================================================
  // CATEGORY TYPE
  // ======================================================

  const handleCategoryTypeChange = (type) => {
    setCategoryType(type);

    if (type === "existing") {
      setNewCategoryName("");
    } else {
      setCategoryId("");
    }
  };

  // ======================================================
  // SUBMIT
  // ======================================================

const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");

  // ======================================================
  // VALIDATION
  // ======================================================

  if (!profileImage) {
    setError("Please select your profile picture.");
    return;
  }

  if (!authorName.trim()) {
    setError("Please enter your author name.");
    return;
  }

  if (!bio.trim()) {
    setError("Please enter your bio.");
    return;
  }

  if (categoryType === "existing" && !categoryId) {
    setError("Please select a category.");
    return;
  }

  if (
    categoryType === "new" &&
    !newCategoryName.trim()
  ) {
    setError("Please enter the new category name.");
    return;
  }

  try {
    setSubmitting(true);

    // ====================================================
    // UPLOAD PROFILE IMAGE
    // ====================================================

    const imageResponse = await uploadImage(profileImage);

    const imageUrl = imageResponse.data.imageUrl;

    // ====================================================
    // SUBMIT WRITER REQUEST
    // ====================================================

    const response = await submitWriterRequest({
      category_id:
        categoryType === "existing"
          ? categoryId
          : null,

      requested_category_name:
        categoryType === "new"
          ? newCategoryName.trim()
          : null,

      is_new_category:
        categoryType === "new",

      author_name: authorName.trim(),

      bio: bio.trim(),

      image_url: imageUrl,
    });

    console.log(
      "WRITER REQUEST SUBMITTED:",
      response.data
    );

    alert(
      "Your writer request has been submitted successfully. Please wait for admin approval."
    );
    // navigate("/writer/profile");

  } catch (err) {
    console.error(
      "SUBMIT WRITER REQUEST ERROR:",
      err
    );

    setError(
      err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to submit writer request."
    );
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="become-writer-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="become-writer-header">

        <p>JOIN OUR WRITERS</p>

        <h2>Become a Writer</h2>

        <span>
          Share your knowledge, ideas and stories with
          our readers.
        </span>

      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="become-writer-error">
          {error}
        </div>
      )}

      {/* ==================================================
          FORM
      ================================================== */}

      <form
        className="become-writer-form"
        onSubmit={handleSubmit}
      >

        {/* ==================================================
            PROFILE IMAGE
        ================================================== */}

        <div className="become-writer-card">

          <label className="become-writer-label">
            Profile Picture
          </label>

          <p className="become-writer-help">
            Upload the photo that will be shown with
            your author profile.
          </p>

          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleImageChange}
          />

          {profileImage && (
            <div className="become-writer-image-preview">

              <img
                src={URL.createObjectURL(profileImage)}
                alt="Profile preview"
              />

              <span>
                {profileImage.name}
              </span>

            </div>
          )}

        </div>

        {/* ==================================================
            AUTHOR NAME
        ================================================== */}

        <div className="become-writer-card">

          <label
            htmlFor="authorName"
            className="become-writer-label"
          >
            Author Name
          </label>

          <input
            id="authorName"
            type="text"
            className="form-control"
            placeholder="Enter the name you want readers to see"
            value={authorName}
            onChange={(e) =>
              setAuthorName(e.target.value)
            }
          />

          <p className="become-writer-help">
            This name will appear as the author of your
            articles.
          </p>

        </div>

        {/* ==================================================
            BIO
        ================================================== */}

        <div className="become-writer-card">

          <label
            htmlFor="bio"
            className="become-writer-label"
          >
            Author Bio
          </label>

          <textarea
            id="bio"
            className="form-control"
            rows="5"
            placeholder="Tell readers a little about yourself, your experience and what you write about..."
            value={bio}
            onChange={(e) =>
              setBio(e.target.value)
            }
          />

        </div>

        {/* ==================================================
            CATEGORY
        ================================================== */}

        <div className="become-writer-card">

          <label className="become-writer-label">
            Category
          </label>

          <p className="become-writer-help">
            Choose the category you want permission to
            write in.
          </p>

          {/* CATEGORY TYPE */}

          <div className="become-writer-category-options">

            <label className="become-writer-radio">

              <input
                type="radio"
                name="categoryType"
                value="existing"
                checked={
                  categoryType === "existing"
                }
                onChange={() =>
                  handleCategoryTypeChange(
                    "existing"
                  )
                }
              />

              <span>
                Choose an existing category
              </span>

            </label>

            <label className="become-writer-radio">

              <input
                type="radio"
                name="categoryType"
                value="new"
                checked={
                  categoryType === "new"
                }
                onChange={() =>
                  handleCategoryTypeChange("new")
                }
              />

              <span>
                Request a new category
              </span>

            </label>

          </div>

          {/* EXISTING CATEGORY */}

          {categoryType === "existing" && (
            <div className="become-writer-category-field">

              {loadingCategories ? (
                <p className="become-writer-muted">
                  Loading categories...
                </p>
              ) : categories.length === 0 ? (
                <p className="become-writer-muted">
                  No categories are currently available.
                </p>
              ) : (
                <select
                  className="form-select"
                  value={categoryId}
                  onChange={(e) =>
                    setCategoryId(e.target.value)
                  }
                >
                  <option value="">
                    Select a category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}

                </select>
              )}

            </div>
          )}

          {/* NEW CATEGORY */}

          {categoryType === "new" && (
            <div className="become-writer-category-field">

              <label
                htmlFor="newCategoryName"
                className="become-writer-sub-label"
              >
                Requested Category Name
              </label>

              <input
                id="newCategoryName"
                type="text"
                className="form-control"
                placeholder="Enter the category you want to write about"
                value={newCategoryName}
                onChange={(e) =>
                  setNewCategoryName(
                    e.target.value
                  )
                }
              />

              <p className="become-writer-help">
                Your new category request will be reviewed
                by an administrator.
              </p>

            </div>
          )}

        </div>

        {/* ==================================================
            SUBMIT
        ================================================== */}

        <div className="become-writer-actions">

          <button
  type="submit"
  className="become-writer-submit"
  disabled={submitting}
>
  {submitting
    ? "Submitting..."
    : "Submit Writer Request"}
</button>

        </div>

      </form>

    </div>
  );
};

export default BecomeWriter;

