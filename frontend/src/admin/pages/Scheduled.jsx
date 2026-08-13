import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Scheduled = () => {
  const [scheduledArticles, setScheduledArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // =========================
  // FETCH SCHEDULED ARTICLES
  // =========================
  const fetchScheduledArticles = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/admin/scheduled",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setScheduledArticles(res.data);
    } catch (err) {
      console.error("GET SCHEDULED ARTICLES ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduledArticles();
  }, []);

  // =========================
  // DELETE SCHEDULED ARTICLE
  // =========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this scheduled article?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5000/api/articles/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove from UI immediately
      setScheduledArticles((prev) =>
        prev.filter((article) => article.id !== id)
      );
    } catch (err) {
      console.error("DELETE SCHEDULED ARTICLE ERROR:", err);
      alert("Failed to delete article");
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="container mt-4">
        <h3>Loading scheduled articles...</h3>
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="container mt-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Scheduled Articles</h2>

        <span className="badge bg-primary fs-6">
          {scheduledArticles.length} Scheduled
        </span>
      </div>

      {scheduledArticles.length === 0 ? (
        <div className="text-center py-5">

          <h4>No scheduled articles</h4>

          <p className="text-muted">
            Articles scheduled for future publication will appear here.
          </p>

          <button
            className="btn btn-primary"
            onClick={() => navigate("/create")}
          >
            Create Article
          </button>

        </div>
      ) : (

        <div className="row">

          {scheduledArticles.map((article) => (

            <div
              className="col-md-6 col-lg-4 mb-4"
              key={article.id}
            >

              <div className="card h-100 shadow-sm">

                {/* IMAGE */}
                {article.image_url ? (
                  <img
                    src={article.image_url}
                    className="card-img-top"
                    alt={article.title}
                    style={{
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    className="d-flex justify-content-center align-items-center bg-light"
                    style={{
                      height: "200px",
                    }}
                  >
                    <span className="text-muted">
                      No Image
                    </span>
                  </div>
                )}

                <div className="card-body d-flex flex-column">

                  {/* STATUS */}
                  <div className="mb-2">
                    <span className="badge bg-primary">
                      SCHEDULED
                    </span>
                  </div>

                  {/* TITLE */}
                  <h5 className="card-title">
                    {article.title}
                  </h5>

                  {/* CONTENT */}
                  <p className="card-text text-muted">
                    {article.content
                      ? article.content.length > 100
                        ? article.content.substring(0, 100) + "..."
                        : article.content
                      : "No content"}
                  </p>

                  {/* CATEGORY */}
                  {article.category && (
                    <div className="mb-2">
                      <span className="badge bg-info text-dark">
                        {article.category}
                      </span>
                    </div>
                  )}

                  {/* SCHEDULED DATE */}
                  {article.scheduled_at && (
                    <div className="mb-3">
                      <small className="text-muted">
                        📅 Scheduled for:
                      </small>

                      <div className="fw-semibold">
                        {new Date(
                          article.scheduled_at
                        ).toLocaleString()}
                      </div>
                    </div>
                  )}

                  {/* ACTIONS */}
                  <div className="mt-auto d-flex gap-2">

                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() =>
                        navigate(
                          `/admin/articles/edit/${article.id}`
                        )
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleDelete(article.id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
};

export default Scheduled;