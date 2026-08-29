import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getWriterProfile,
  submitWriterRequest,
} from "../api/user";
import { getCategories } from "../api/articleApi.js";

import "./WriterRequest.css";

const WriterRequest = () => {
  const navigate = useNavigate();

  const [requestType, setRequestType] = useState("existing");

  const [categories, setCategories] = useState([]);
  const [approvedCategories, setApprovedCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ======================================================
  // LOAD DATA
  // ======================================================

  useEffect(() => {
    loadRequestData();
  }, []);

  const loadRequestData = async () => {
    try {
      setLoading(true);
      setError("");

      const [categoriesResponse, profileResponse] =
        await Promise.all([
          getCategories(),
          getWriterProfile(),
        ]);

      setCategories(categoriesResponse.data || []);

      setApprovedCategories(
        profileResponse.data?.approvedCategories || []
      );
    } catch (err) {
      console.error(
        "LOAD WRITER REQUEST DATA ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load request data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // FILTER APPROVED CATEGORIES
  // ======================================================

  const availableCategories = categories.filter(
    (category) =>
      !approvedCategories.some(
        (approvedCategory) =>
          String(approvedCategory.id) ===
          String(category.id)
      )
  );

  // ======================================================
  // CHANGE REQUEST TYPE
  // ======================================================

  const handleRequestTypeChange = (type) => {
    setRequestType(type);

    setError("");
    setSuccess("");

    setSelectedCategory("");
    setNewCategoryName("");
  };

  // ======================================================
  // SUBMIT REQUEST
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // --------------------------------------------------
    // EXISTING CATEGORY
    // --------------------------------------------------

    if (requestType === "existing") {
      if (!selectedCategory) {
        setError("Please select a category.");
        return;
      }
    }

    // --------------------------------------------------
    // NEW CATEGORY
    // --------------------------------------------------

    if (requestType === "new") {
      if (!newCategoryName.trim()) {
        setError("Please enter a category name.");
        return;
      }

      if (newCategoryName.trim().length < 2) {
        setError(
          "Category name must contain at least 2 characters."
        );
        return;
      }
    }

    try {
      setSubmitting(true);

      let requestData;

      if (requestType === "existing") {
        requestData = {
          category_id: selectedCategory,
          is_new_category: false,
        };
      } else {
        requestData = {
          requested_category_name:
            newCategoryName.trim(),
          is_new_category: true,
        };
      }

      const response = await submitWriterRequest(
        requestData
      );

      setSuccess(
        response.data?.message ||
          "Category request submitted successfully."
      );

      setSelectedCategory("");
      setNewCategoryName("");

      // Give the user time to see the success message
      setTimeout(() => {
        navigate("/dashboard/writer/profile");
      }, 1200);
    } catch (err) {
      console.error(
        "SUBMIT WRITER REQUEST ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to submit category request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="writer-request-page">
        <div className="writer-request-loading">
          <div className="writer-request-spinner"></div>

          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="writer-request-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="writer-request-header">

        <div>
          <span className="writer-request-kicker">
            WRITER
          </span>

          <h2>Request Category</h2>

          <p>
            Request access to an existing category or
            suggest a new category for the platform.
          </p>
        </div>

        <button
          type="button"
          className="writer-request-back-btn"
          onClick={() =>
            navigate("/dashboard/writer/profile")
          }
        >
          ← Back to Profile
        </button>

      </div>

      {/* ==================================================
          REQUEST CARD
      ================================================== */}

      <div className="writer-request-card">

        <div className="writer-request-card-header">

          <span className="writer-request-label">
            CATEGORY ACCESS
          </span>

          <h3>
            What category would you like to write in?
          </h3>

          <p>
            Your request will be reviewed by an
            administrator before you can publish articles
            in the selected category.
          </p>

        </div>

        {/* ==================================================
            REQUEST TYPE
        ================================================== */}

        <div className="writer-request-type">

          <button
            type="button"
            className={
              requestType === "existing"
                ? "active"
                : ""
            }
            onClick={() =>
              handleRequestTypeChange("existing")
            }
          >
            <span className="writer-request-option-title">
              Existing Category
            </span>

            <span className="writer-request-option-text">
              Choose from categories already available.
            </span>
          </button>

          <button
            type="button"
            className={
              requestType === "new"
                ? "active"
                : ""
            }
            onClick={() =>
              handleRequestTypeChange("new")
            }
          >
            <span className="writer-request-option-title">
              New Category
            </span>

            <span className="writer-request-option-text">
              Suggest a category that doesn't exist yet.
            </span>
          </button>

        </div>

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          className="writer-request-form"
          onSubmit={handleSubmit}
        >

          {requestType === "existing" ? (
            <div className="writer-request-field">

              <label htmlFor="category">
                Select Category
              </label>

              <select
                id="category"
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value)
                }
                disabled={submitting}
              >
                <option value="">
                  Select a category
                </option>

                {availableCategories.map(
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

              {availableCategories.length === 0 && (
                <small className="writer-request-help">
                  You already have access to all
                  available categories.
                </small>
              )}

            </div>
          ) : (
            <div className="writer-request-field">

              <label htmlFor="new-category">
                Category Name
              </label>

              <input
                id="new-category"
                type="text"
                value={newCategoryName}
                onChange={(e) =>
                  setNewCategoryName(e.target.value)
                }
                placeholder="e.g. Artificial Intelligence"
                maxLength={100}
                disabled={submitting}
              />

              <small className="writer-request-help">
                The administrator will review your
                suggested category before creating it.
              </small>

            </div>
          )}

          {/* ==================================================
              MESSAGES
          ================================================== */}

          {error && (
            <div className="writer-request-message error">
              {error}
            </div>
          )}

          {success && (
            <div className="writer-request-message success">
              {success}
            </div>
          )}

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="writer-request-actions">

            <button
              type="button"
              className="writer-request-cancel-btn"
              onClick={() =>
                navigate("/dashboard/writer/profile")
              }
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="writer-request-submit-btn"
              disabled={
                submitting ||
                (
                  requestType === "existing" &&
                  availableCategories.length === 0
                )
              }
            >
              {submitting
                ? "Submitting..."
                : "Submit Request"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default WriterRequest;