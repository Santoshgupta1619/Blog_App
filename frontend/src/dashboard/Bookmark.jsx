import { useEffect, useState } from "react";
import { getBookmarks, toggleBookmark } from "../api/articles";

const Bookmark = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await getBookmarks();
      setBookmarks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 REMOVE BOOKMARK HANDLER
  const handleRemove = async (articleId) => {
    try {
      await toggleBookmark(articleId);

      // ✅ remove from UI instantly
      setBookmarks((prev) =>
        prev.filter((item) => item.id !== articleId)
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading bookmarks...</p>;

  if (bookmarks.length === 0) {
    return <h4>No bookmarks yet 📭</h4>;
  }

  return (
    <div>
      <h2 className="mb-4">Your Bookmarks</h2>

      <div className="row">
        {bookmarks.map((article) => (
          <div className="col-md-6 mb-4" key={article.id}>
            <div className="card h-100 shadow-sm">

              <div className="card-body">
                <h5 className="card-title">{article.title}</h5>

                <p className="card-text">
                  {article.content.slice(0, 100)}...
                </p>

                <div className="d-flex justify-content-between">
                  
                  <a
                    href={`/article/${article.slug}`}
                    className="btn btn-primary"
                  >
                    Read
                  </a>

                  {/* ❌ REMOVE BUTTON */}
                  <button
                    className="btn btn-danger"
                    onClick={() => handleRemove(article.id)}
                  >
                    Remove
                  </button>

                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Bookmark;