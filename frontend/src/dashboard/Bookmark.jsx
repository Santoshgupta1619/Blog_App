import { useEffect, useState } from "react";
import { getBookmarks, toggleBookmark } from "../api/articles";
import "./Bookmark.css";

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

  const handleRemove = async (articleId) => {
    try {
      await toggleBookmark(articleId);
      setBookmarks((prev) => prev.filter((item) => item.id !== articleId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <section className="bookmarks-page" aria-busy="true">
        <header className="bookmarks-header">
          <div>
            <p className="bookmarks-eyebrow">READING LIST</p>
            <h2>Your bookmarks</h2>
            <span>Loading your saved articles...</span>
          </div>
        </header>
        <div className="bookmarks-skeleton-grid" aria-hidden="true">
          {[0, 1, 2, 3].map((item) => <div className="bookmark-skeleton" key={item} />)}
        </div>
      </section>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <section className="bookmarks-page">
        <header className="bookmarks-header">
          <div>
            <p className="bookmarks-eyebrow">READING LIST</p>
            <h2>Your bookmarks</h2>
          </div>
        </header>
        <div className="bookmarks-empty-state">
          <span className="bookmarks-empty-icon" aria-hidden="true">⌑</span>
          <h3>Your reading list is waiting</h3>
          <p>Save articles you want to revisit, and they’ll appear here.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bookmarks-page">
      <header className="bookmarks-header">
        <div>
          <p className="bookmarks-eyebrow">READING LIST</p>
          <h2>Your bookmarks</h2>
          <span>Keep your favourite stories close at hand.</span>
        </div>
        <div className="bookmarks-count" aria-label={`${bookmarks.length} saved articles`}>
          <strong>{bookmarks.length}</strong>
          <span>{bookmarks.length === 1 ? "saved article" : "saved articles"}</span>
        </div>
      </header>

      <div className="bookmarks-grid">
        {bookmarks.map((article) => (
          <article className="bookmark-card" key={article.id}>
            <div className="bookmark-card-topline">
              <span>Saved article</span>
              <span className="bookmark-mark" aria-hidden="true">▮</span>
            </div>
            <h3>{article.title}</h3>
            <p className="bookmark-excerpt">{article.content.slice(0, 100)}...</p>
            <div className="bookmark-card-actions">
              <a href={`/article/${article.slug}`} className="bookmark-read-link">
                Read article <span aria-hidden="true">→</span>
              </a>
              <button className="bookmark-remove-button" onClick={() => handleRemove(article.id)}>
                <span aria-hidden="true">×</span> Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Bookmark;
