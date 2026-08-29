import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getWriterArticles, deleteWriterArticle } from "../api/user";

import "./WriterArticles.css";

const WriterArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getWriterArticles();

      setArticles(response.data.articles || []);
    } catch (err) {
      console.error("GET WRITER ARTICLES ERROR:", err);

      setError(err.response?.data?.message || "Failed to load your articles.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (articleId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this article?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteWriterArticle(articleId);

      setArticles((prevArticles) =>
        prevArticles.filter((article) => article.id !== articleId),
      );
    } catch (err) {
      console.error("DELETE WRITER ARTICLE ERROR:", err);

      alert(err.response?.data?.message || "Failed to delete the article.");
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "published":
        return "writer-status published";

      case "draft":
        return "writer-status draft";

      case "scheduled":
        return "writer-status scheduled";

      default:
        return "writer-status";
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <section className="writer-articles-page">
        <div className="writer-articles-shell">
          <div className="writer-page-header">
            <p>WRITER</p>

            <h2>My Articles</h2>

            <span>Manage the articles you have written.</span>
          </div>

          <div className="writer-loading">Loading your articles...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="writer-articles-page">
      <div className="writer-articles-shell">
        {/* HEADER */}

        <div className="writer-page-header">
          <div>
            <p>WRITER</p>

            <h2>My Articles</h2>

            <span>Manage the articles you have written.</span>
          </div>

          <Link to="/dashboard/writer/write" className="writer-new-article-btn">
            + Write Article
          </Link>
        </div>

        {/* ERROR */}

        {error && <div className="writer-error">{error}</div>}

        {/* EMPTY */}

        {!error && articles.length === 0 && (
          <div className="writer-empty">
            <div className="writer-empty-icon">✍️</div>

            <h3>No articles yet</h3>

            <p>
              You haven't written any articles yet. Start writing your first
              story.
            </p>

            <Link
              to="/dashboard/writer/write"
              className="writer-new-article-btn"
            >
              Write Your First Article
            </Link>
          </div>
        )}

        {/* ARTICLES */}

        {!error && articles.length > 0 && (
          <div className="writer-articles-list">
            {articles.map((article) => (
              <article key={article.id} className="writer-article-card">
                {/* IMAGE */}

                <div className="writer-article-image">
                  {article.image_url ? (
                    <img src={article.image_url} alt={article.title} />
                  ) : (
                    <div className="writer-no-image">No Image</div>
                  )}
                </div>

                {/* CONTENT */}

                <div className="writer-article-content">
                  <div className="writer-article-top">
                    <span className={getStatusClass(article.status)}>
                      {article.status}
                    </span>

                    <span className="writer-category">
                      {article.category || "Uncategorized"}
                    </span>
                  </div>

                  <h3>{article.title}</h3>

                  <p className="writer-article-date">
                    Created {formatDate(article.created_at)}
                  </p>

                  {article.status === "scheduled" && article.scheduled_at && (
                    <p className="writer-scheduled-date">
                      Scheduled for {formatDate(article.scheduled_at)}
                    </p>
                  )}

                  {/* ACTIONS */}

                  <div className="writer-article-actions">
                    {article.status === "published" && (
                      <Link
                        to={`/article/${article.slug}`}
                        className="writer-action view"
                      >
                        View
                      </Link>
                    )}

                    <Link
                      to={`/dashboard/writer/edit/${article.id}`}
                      className="writer-action edit"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      className="writer-action delete"
                      onClick={() => handleDelete(article.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default WriterArticles;
