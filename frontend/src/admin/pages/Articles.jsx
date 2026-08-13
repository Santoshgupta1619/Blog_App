import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();

  // 🔹 FETCH ARTICLES
  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/admin/articles",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setArticles(res.data);
    } catch (err) {
      console.error("ERROR:", err);
    }
  };

  // 🔹 DELETE ARTICLE
  const handleDelete = async (id) => {
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

      // remove from UI
      setArticles((prev) =>
        prev.filter((item) => item.id !== id)
      );
    } catch (err) {
      console.error("DELETE ERROR:", err);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">All Articles</h2>

      <div className="row">
        {articles.length === 0 ? (
          <p>No articles found</p>
        ) : (
          articles.map((item) => (
            <div className="col-md-4" key={item.id}>
              <div className="card mb-4 shadow-sm">
                
                {/* OPTIONAL IMAGE */}
                {item.image_url && (
                  <img
                    src={item.image_url}
                    className="card-img-top"
                    alt="article"
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                )}

                <div className="card-body">
                  <h5 className="card-title">{item.title}</h5>

                  <p className="card-text">
                    {item.content
                      ? item.content.substring(0, 80) + "..."
                      : "No content"}
                  </p>

                  <span className="badge bg-success mb-2">
                    {item.status}
                  </span>

                  <div className="d-flex gap-2 mt-2">
                    
                    {/* VIEW */}
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() =>
                        navigate(`/article/${item.slug}`)
                      }
                    >
                      View
                    </button>

                    {/* EDIT */}
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() =>
                        navigate(`/admin/articles/edit/${item.id}`)
                      }
                    >
                      Edit
                    </button>

                    {/* DELETE */}
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>

                  </div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Articles;