import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ARTICLES_PER_PAGE = 6;

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/articles", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setArticles(res.data);
    } catch (err) {
      console.error("ERROR:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/articles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedTotalPages = Math.max(1, Math.ceil((articles.length - 1) / ARTICLES_PER_PAGE));
      setArticles((prev) => prev.filter((item) => item.id !== id));
      setCurrentPage((page) => Math.min(page, updatedTotalPages));
    } catch (err) {
      console.error("DELETE ERROR:", err);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const totalPages = Math.max(1, Math.ceil(articles.length / ARTICLES_PER_PAGE));
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const displayedArticles = articles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);

  return (
    <section className="admin-articles-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-page-kicker">CONTENT MANAGEMENT</p>
          <h2>All articles</h2>
          <p className="admin-page-description">Review, edit, and manage your published content.</p>
        </div>
        <div className="admin-article-count">{articles.length} {articles.length === 1 ? "article" : "articles"}</div>
      </header>

      {articles.length === 0 ? (
        <div className="admin-empty-state">
          <h4>No articles found</h4>
          <p>Your articles will appear here once they are created.</p>
          <button className="btn btn-primary" onClick={() => navigate("/create")}>Create article</button>
        </div>
      ) : (
        <>
          <div className="row admin-article-grid">
            {displayedArticles.map((item) => (
              <div className="col-md-6 col-xl-4" key={item.id}>
                <article className="card admin-article-card h-100">
                  {item.image_url ? (
                    <img src={item.image_url} className="card-img-top" alt={item.title} />
                  ) : (
                    <div className="admin-article-image-placeholder">No cover image</div>
                  )}

                  <div className="card-body d-flex flex-column">
                    <div className="admin-article-card-topline">
                      <span className={`admin-status admin-status-${item.status || "published"}`}>{item.status || "published"}</span>
                      <span className="admin-article-category">{item.category || "Uncategorized"}</span>
                    </div>
                    <h5 className="card-title">{item.title}</h5>
                    <p className="card-text">
                      {item.content ? `${item.content.substring(0, 120)}...` : "No content"}
                    </p>
                    <div className="admin-article-actions mt-auto">
                      <button className="btn btn-primary btn-sm" onClick={() => navigate(`/article/${item.slug}`)}>View</button>
                      <button className="btn btn-warning btn-sm" onClick={() => navigate(`/admin/articles/edit/${item.id}`)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="admin-pagination" aria-label="Article pagination">
              <button className="admin-pagination-button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}>Previous</button>
              <div className="admin-pagination-pages">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button key={page} className={`admin-page-number ${currentPage === page ? "active" : ""}`} onClick={() => setCurrentPage(page)} aria-current={currentPage === page ? "page" : undefined}>{page}</button>
                ))}
              </div>
              <button className="admin-pagination-button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages}>Next</button>
            </nav>
          )}
        </>
      )}
    </section>
  );
};

export default Articles;
