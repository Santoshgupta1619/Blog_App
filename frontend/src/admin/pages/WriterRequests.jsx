import { useEffect, useState } from "react";

import { getWriterRequests, reviewWriterRequest } from "../../api/user";

import "./WriterRequests.css";

const WriterRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [adminNotes, setAdminNotes] = useState({});
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const response = await getWriterRequests();

      setRequests(response.data || []);
    } catch (err) {
      console.error("GET WRITER REQUESTS ERROR:", err);

      alert(err.response?.data?.error || "Failed to load writer requests.");
    } finally {
      setLoading(false);
    }
  };
  const handleReview = async (id, action) => {
    const confirmAction = window.confirm(
      `Are you sure you want to ${action} this request?`,
    );

    if (!confirmAction) return;

    try {
      setProcessingId(id);

      await reviewWriterRequest(id, {
        action,
        admin_note: adminNotes[id] || "",
      });

      alert(`Request ${action} successfully.`);

      fetchRequests();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Operation failed.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const pendingRequests = requests.filter(
    (request) => request.status === "pending",
  );

  if (loading) {
    return (
      <div className="writer-requests-page">
        <div className="writer-requests-loading">
          <div className="writer-loading-spinner"></div>
          <p>Loading writer requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="writer-requests-page">
      {/* HEADER */}
      <div className="writer-requests-header">
        <div>
          <div className="writer-requests-kicker">ADMINISTRATION</div>

          <h1>Writer Requests</h1>

          <p>
            Review and manage requests from users who want to become writers.
          </p>
        </div>

        <div className="writer-request-count">
          <span>{pendingRequests.length}</span>
          <small>Pending</small>
        </div>
      </div>

      {/* EMPTY STATE */}
      {pendingRequests.length === 0 ? (
        <div className="writer-requests-empty">
          <div className="writer-empty-icon">✓</div>

          <h3>All caught up!</h3>

          <p>
            There are currently no writer or category requests waiting for
            approval.
          </p>
        </div>
      ) : (
        /* REQUEST LIST */
        <div className="writer-requests-list">
          {pendingRequests.map((request) => {
            const categoryName = request.is_new_category
              ? request.requested_category_name
              : request.category_name;

            return (
              <div className="writer-request-card" key={request.id}>
                {/* CARD HEADER */}
                <div className="writer-request-card-header">
                  <div className="writer-request-profile">
                    {request.image_url ? (
                      <img src={request.image_url} alt={request.author_name} />
                    ) : (
                      <div className="writer-request-avatar">
                        {request.author_name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}

                    <div className="writer-request-profile-info">
                      <h3>{request.author_name}</h3>

                      <span>{request.user_email}</span>
                    </div>
                  </div>

                  <span className="writer-request-status">Pending</span>
                </div>

                {/* REQUEST DETAILS */}
                <div className="writer-request-details">
                  <div className="writer-request-detail">
                    <span className="writer-detail-label">Category</span>

                    <strong>{categoryName || "Unknown"}</strong>
                  </div>

                  <div className="writer-request-detail">
                    <span className="writer-detail-label">Request Type</span>

                    <strong
                      className={
                        request.is_new_category
                          ? "new-category"
                          : "existing-category"
                      }
                    >
                      {request.is_new_category
                        ? "New Category"
                        : "Existing Category"}
                    </strong>
                  </div>

                  <div className="writer-request-detail">
                    <span className="writer-detail-label">Requested</span>

                    <strong>
                      {new Date(request.created_at).toLocaleDateString(
                        undefined,
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </strong>
                  </div>
                </div>

                {/* REVIEW SECTION */}

                <div className="writer-review-section">
                  <div className="writer-request-bio">
                    <span className="writer-detail-label">Author Bio</span>

                    <div className="writer-bio-box">
                      {request.bio || "No bio provided."}
                    </div>
                  </div>

                  <div className="writer-admin-note">
                    <label>Admin Note</label>

                    <textarea
                      rows="4"
                      placeholder="Optional note for the writer..."
                      value={adminNotes[request.id] || ""}
                      onChange={(e) =>
                        setAdminNotes((prev) => ({
                          ...prev,
                          [request.id]: e.target.value,
                        }))
                      }
                      disabled={processingId === request.id}
                    />
                  </div>
                </div>

                <div className="writer-request-actions">
                  <button
                    className="writer-reject-btn"
                    onClick={() => handleReview(request.id, "rejected")}
                    disabled={processingId === request.id}
                  >
                    ✕ Reject
                  </button>

                  <button
                    className="writer-approve-btn"
                    onClick={() => handleReview(request.id, "approved")}
                    disabled={processingId === request.id}
                  >
                    ✓ Approve
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WriterRequests;
