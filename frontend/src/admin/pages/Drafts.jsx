import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Drafts = () => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();


  const fetchDrafts = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/admin/drafts",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDrafts(res.data);
    } catch (err) {
      console.error("GET DRAFTS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);


  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this draft?"
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
      setDrafts((prev) =>
        prev.filter((article) => article.id !== id)
      );

    } catch (err) {
      console.error("DELETE DRAFT ERROR:", err);
      alert("Failed to delete draft");
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <h3>Loading drafts...</h3>
      </div>
    );
  }

  return (
    <div className="container mt-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Drafts</h2>

        <span className="badge bg-secondary fs-6">
          {drafts.length} Draft
          {drafts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {drafts.length === 0 ? (
        <div className="text-center py-5">
          <h4>No drafts found</h4>

          <p className="text-muted">
            Articles saved as drafts will appear here.
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

          {drafts.map((article) => (

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
                    <span className="badge bg-secondary">
                      DRAFT
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

                  {/* CREATED DATE */}
                  <small className="text-muted mb-3">
                    Created:{" "}
                    {new Date(
                      article.created_at
                    ).toLocaleDateString()}
                  </small>

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

export default Drafts;