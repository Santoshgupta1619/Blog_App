import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getWriterProfile,
  updateWriterProfile,
  changeWriterPassword,
} from "../api/user.js";

import "./WriterProfile.css";

const WriterProfile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // BIO EDIT STATE
  // ======================================================

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState("");
  const [savingBio, setSavingBio] = useState(false);

  // ======================================================
// CHANGE PASSWORD STATE
// ======================================================

const [isChangingPassword, setIsChangingPassword] =
  useState(false);

const [currentPassword, setCurrentPassword] =
  useState("");

const [newPassword, setNewPassword] =
  useState("");

const [confirmPassword, setConfirmPassword] =
  useState("");

const [changingPassword, setChangingPassword] =
  useState(false);

  // ======================================================
  // LOAD PROFILE
  // ======================================================

  useEffect(() => {
    loadWriterProfile();
  }, []);

  const loadWriterProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getWriterProfile();

      setProfile(response.data);

      setBio(response.data?.writer?.bio || "");
    } catch (err) {
      console.error("GET WRITER PROFILE ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load writer profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // SAVE BIO
  // ======================================================

  const handleSaveBio = async () => {
    if (!bio.trim()) {
      alert("Bio cannot be empty.");
      return;
    }

    try {
      setSavingBio(true);

      const response = await updateWriterProfile({
        bio: bio.trim(),
      });

      setProfile((prev) => ({
        ...prev,
        writer: response.data.writer,
      }));

      setBio(response.data.writer.bio);

      setIsEditingBio(false);

      alert("Bio updated successfully.");
    } catch (err) {
      console.error("UPDATE WRITER BIO ERROR:", err);

      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to update bio."
      );
    } finally {
      setSavingBio(false);
    }
  };

  // ======================================================
  // CANCEL BIO EDIT
  // ======================================================

  const handleCancelBio = () => {
    setBio(profile?.writer?.bio || "");
    setIsEditingBio(false);
  };

  // ======================================================
// CHANGE PASSWORD
// ======================================================

const handleChangePassword = async (e) => {
  e.preventDefault();

  if (
    !currentPassword ||
    !newPassword ||
    !confirmPassword
  ) {
    alert("Please fill in all password fields.");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("New passwords do not match.");
    return;
  }

  try {
    setChangingPassword(true);

    const response = await changeWriterPassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    alert(
      response.data?.message ||
        "Password changed successfully."
    );

    // Clear form
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    // Close form
    setIsChangingPassword(false);

  } catch (err) {
    console.error(
      "CHANGE PASSWORD ERROR:",
      err
    );

    alert(
      err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to change password."
    );
  } finally {
    setChangingPassword(false);
  }
};

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="writer-profile-page">
        <div className="writer-profile-loading">
          Loading writer profile...
        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <div className="writer-profile-page">
        <div className="writer-profile-error">
          {error}
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const writer = profile.writer;
  const approvedCategories = profile.approvedCategories || [];
  const pendingRequest = profile.pendingRequest;
  const latestRequest = profile.latestRequest;

  return (
    <div className="writer-profile-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="writer-profile-header">
        <p>WRITER</p>

        <h2>Writer Profile</h2>

        <span>
          Manage your writer profile, categories and articles.
        </span>
      </div>

      {/* ==================================================
          PROFILE CARD
      ================================================== */}

      <div className="writer-profile-card writer-profile-main">

        <div className="writer-profile-image-wrapper">
          {writer?.image_url ? (
            <img
              src={writer.image_url}
              alt={
                writer.author_name ||
                profile.user.name
              }
              className="writer-profile-image"
            />
          ) : (
            <div className="writer-profile-placeholder">
              {(
                writer?.author_name ||
                profile.user.name ||
                "W"
              )
                .charAt(0)
                .toUpperCase()}
            </div>
          )}
        </div>

        <div className="writer-profile-info">

          <span className="writer-profile-label">
            Author
          </span>

          <h3>
            {writer?.author_name ||
              profile.user.name}
          </h3>

          <p className="writer-profile-email">
            {profile.user.email}
          </p>

          {/* ==================================================
              BIO
          ================================================== */}

          <div className="writer-profile-bio-section">

            <div className="writer-bio-header">

              <span className="writer-profile-label">
                BIO
              </span>

              {!isEditingBio && (
                <button
                  type="button"
                  className="writer-edit-bio-btn"
                  onClick={() =>
                    setIsEditingBio(true)
                  }
                >
                  Edit Bio
                </button>
              )}

            </div>

            {isEditingBio ? (
              <div className="writer-bio-edit">

                <textarea
                  value={bio}
                  onChange={(e) =>
                    setBio(e.target.value)
                  }
                  placeholder="Write something about yourself..."
                  rows={5}
                  disabled={savingBio}
                  autoFocus
                />

                <div className="writer-bio-actions">

                  <button
                    type="button"
                    className="writer-bio-cancel-btn"
                    onClick={handleCancelBio}
                    disabled={savingBio}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="writer-bio-save-btn"
                    onClick={handleSaveBio}
                    disabled={savingBio}
                  >
                    {savingBio
                      ? "Saving..."
                      : "Save Bio"}
                  </button>

                </div>

              </div>
            ) : (
              <p className="writer-profile-bio">
                {writer?.bio ||
                  "No bio added yet."}
              </p>
            )}

          </div>

          <span className="writer-approved-badge">
            Writer
          </span>

        </div>

      </div>

      {/* ==================================================
          APPROVED CATEGORIES
      ================================================== */}

      <div className="writer-profile-card">

        <div className="writer-section-header">

          <div>
            <span className="writer-profile-label">
              ACCESS
            </span>

            <h3>Approved Categories</h3>
          </div>

          <button
            type="button"
            className="writer-request-btn"
            onClick={() =>
              navigate(
                "/dashboard/writer/request"
              )
            }
          >
            Request Category
          </button>

        </div>

        {approvedCategories.length === 0 ? (
          <div className="writer-empty-state">

            <p>
              You don't have any approved
              categories yet.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/dashboard/writer/request"
                )
              }
            >
              Request a Category
            </button>

          </div>
        ) : (
          <div className="writer-category-list">

            {approvedCategories.map(
              (category) => (
                <div
                  key={category.id}
                  className="writer-category-item"
                >
                  <span>
                    {category.name}
                  </span>

                  <small>
                    Approved
                  </small>
                </div>
              )
            )}

          </div>
        )}

      </div>

      {/* ==================================================
          PENDING REQUEST
      ================================================== */}

      {pendingRequest && (
        <div className="writer-profile-card writer-request-card pending">

          <div>
            <span className="writer-profile-label">
              CATEGORY REQUEST
            </span>

            <h3>Request Pending</h3>

            <p>
  {pendingRequest.is_new_category
    ? pendingRequest.requested_category_name
    : pendingRequest.category_name}
</p>
          </div>

          <span className="writer-request-status pending">
            Pending
          </span>

        </div>
      )}

      {/* ==================================================
          LATEST REQUEST
      ================================================== */}

      {!pendingRequest &&
        latestRequest && (
          <div
            className={`writer-profile-card writer-request-card ${latestRequest.status}`}
          >

            <div>
              <span className="writer-profile-label">
                LATEST REQUEST
              </span>

              <h3>
                Category Request
              </h3>

              <p>
  {latestRequest.is_new_category
    ? latestRequest.requested_category_name
    : latestRequest.category_name}
</p>

              {latestRequest.admin_note && (
                <p className="writer-admin-note">
                  Admin note:{" "}
                  {latestRequest.admin_note}
                </p>
              )}
            </div>

            <span
              className={`writer-request-status ${latestRequest.status}`}
            >
              {latestRequest.status}
            </span>

          </div>
        )}

      {/* ==================================================
          QUICK ACTIONS
      ================================================== */}

      <div className="writer-profile-card">

        <div className="writer-section-header">

          <div>
            <span className="writer-profile-label">
              ACTIONS
            </span>

            <h3>Writer Actions</h3>
          </div>

        </div>

        <div className="writer-profile-actions">

  <button
    type="button"
    onClick={() =>
      navigate(
        "/dashboard/writer/write"
      )
    }
  >
    Write Article
  </button>

  <button
    type="button"
    onClick={() =>
      navigate(
        "/dashboard/writer/articles"
      )
    }
  >
    My Articles
  </button>

  <button
    type="button"
    onClick={() =>
      navigate(
        "/dashboard/writer/request"
      )
    }
  >
    Request Category
  </button>

  <button
    type="button"
    onClick={() =>
      setIsChangingPassword(
        !isChangingPassword
      )
    }
  >
    {isChangingPassword
      ? "Cancel Change Password"
      : "Change Password"}
  </button>

</div>

{isChangingPassword && (
  <form
    className="writer-change-password-form"
    onSubmit={handleChangePassword}
  >

    <div className="writer-password-field">

      <label htmlFor="currentPassword">
        Current Password
      </label>

      <input
        id="currentPassword"
        type="password"
        value={currentPassword}
        onChange={(e) =>
          setCurrentPassword(e.target.value)
        }
        placeholder="Enter current password"
        disabled={changingPassword}
      />

    </div>

    <div className="writer-password-field">

      <label htmlFor="newPassword">
        New Password
      </label>

      <input
        id="newPassword"
        type="password"
        value={newPassword}
        onChange={(e) =>
          setNewPassword(e.target.value)
        }
        placeholder="Enter new password"
        disabled={changingPassword}
      />

    </div>

    <div className="writer-password-field">

      <label htmlFor="confirmPassword">
        Confirm New Password
      </label>

      <input
        id="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={(e) =>
          setConfirmPassword(e.target.value)
        }
        placeholder="Confirm new password"
        disabled={changingPassword}
      />

    </div>

    <p className="writer-password-hint">
      Password must contain at least 8 characters,
      one uppercase letter, one lowercase letter,
      one number and one special character.
    </p>

    <button
      type="submit"
      className="writer-password-submit"
      disabled={changingPassword}
    >
      {changingPassword
        ? "Changing Password..."
        : "Update Password"}
    </button>

  </form>
)}

      </div>

    </div>
  );
};

export default WriterProfile;