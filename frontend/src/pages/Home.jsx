import { useEffect, useState } from "react";
import { getArticles, getCategories, getTrendingArticles } from "../api/articleApi";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState(["All"]);
const [trendingArticles, setTrendingArticles] = useState([]);

const [selectedCategory, setSelectedCategory] = useState("All");
const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
  fetchArticles();
}, [page, selectedCategory]);

useEffect(() => {
  fetchCategories();
  fetchTrendingArticles();
}, []);

useEffect(() => {
  setPage(1);
}, [selectedCategory]);

  const fetchArticles = async () => {
  try {
    setLoading(true);

    const res = await getArticles(
  page,
  selectedCategory === "All" ? "" : selectedCategory
);

    setArticles(res.data.data);
    setTotalPages(res.data.totalPages);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

const fetchCategories = async () => {
  try {
    const res = await getCategories();

    setCategories([
      "All",
      ...res.data.map((category) => category.name),
    ]);
  } catch (err) {
    console.error(err);
  }
};

const fetchTrendingArticles = async () => {
  try {
    const res = await getTrendingArticles();

    setTrendingArticles(res.data);
  } catch (err) {
    console.error(err);
  }
};

  const filteredArticles = selectedTag
  ? articles.filter((article) =>
      article.tags?.includes(selectedTag)
    )
  : articles;

const featuredArticle = filteredArticles[0];
const regularArticles = filteredArticles.slice(1);
  

  const openArticle = (slug) => {
    navigate(`/article/${slug}`);
  };

  if (loading) {
    return (
      <div className="home">
        <div className="home-container">
          <h2>Loading articles...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="home-container">

        {/* Categories */}

        <div className="category-section">
          <div className="category-filter">
            {categories.map((category, index) => (
              <button
                key={index}
                className={
                  selectedCategory === category ? "active" : ""
                }
                onClick={() => {
                  setSelectedCategory(category);
                  setSelectedTag(null);
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {selectedTag && (
          <div className="tag-filter">
            <span>
              Showing articles tagged with{" "}
              <strong>#{selectedTag}</strong>
            </span>

            <button
              className="clear-tag"
              onClick={() => setSelectedTag(null)}
            >
              Clear ✕
            </button>
          </div>
        )}

        <div className="home-layout">

          {/* Left */}

          <main className="articles-section">

            {featuredArticle ? (
              <>
                <article
                  className="featured-card"
                  onClick={() => openArticle(featuredArticle.slug)}
                >
                  {featuredArticle.image_url && (
                    <div className="featured-image">
                      <img
                        src={featuredArticle.image_url}
                        alt={featuredArticle.title}
                      />
                      <span className="featured-label">
                        Featured
                      </span>
                    </div>
                  )}

                  <div className="featured-content">
                    <div className="article-category">
                      {featuredArticle.category ||
                        "Uncategorized"}
                    </div>

                    <h1>{featuredArticle.title}</h1>

                    <p className="featured-preview">
                      {featuredArticle.content?.slice(0, 220)}...
                    </p>

                    <div className="article-meta">
                      <span>✍️ Author</span>
                      <span>•</span>
                      <span>
                        {dayjs(
                          featuredArticle.created_at
                        ).format("MMM D, YYYY")}
                      </span>
                    </div>
                  </div>
                </article>

                <div className="articles-list">
                  {regularArticles.map((article) => (
                    <article
                      key={article.id}
                      className="post-card"
                      onClick={() =>
                        openArticle(article.slug)
                      }
                    >
                      <div className="post-content">
                        <div className="article-category">
                          {article.category ||
                            "Uncategorized"}
                        </div>

                        <div className="post-meta">
                          <span>✍️ Author</span>
                          <span>•</span>
                          <span>
                            {dayjs(
                              article.created_at
                            ).format("MMM D")}
                          </span>
                        </div>

                        <h2 className="post-title">
                          {article.title}
                        </h2>

                        <p className="post-preview">
                          {article.content?.slice(0, 130)}
                          ...
                        </p>

                        {article.tags?.length > 0 && (
                          <div className="post-tags">
                            {article.tags.map(
                              (tag, index) => (
                                <span
                                  key={index}
                                  className={`tag ${
                                    selectedTag === tag
                                      ? "active-tag"
                                      : ""
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTag(tag);
                                  }}
                                >
                                  #{tag}
                                </span>
                              )
                            )}
                          </div>
                        )}
                      </div>

                      {article.image_url && (
                        <div className="post-image">
                          <img
                            src={article.image_url}
                            alt={article.title}
                          />
                        </div>
                      )}
                    </article>
                  ))}
                </div>

                {/* Pagination */}

                <div className="pagination">
                  <button
                    disabled={page === 1}
                    onClick={() =>
                      setPage((prev) => prev - 1)
                    }
                  >
                    Previous
                  </button>

                  <span>
                    Page {page} of {totalPages}
                  </span>

                  <button
                    disabled={page === totalPages}
                    onClick={() =>
                      setPage((prev) => prev + 1)
                    }
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <div className="no-articles">
                <h3>No articles found</h3>
                <p>
                  There are no articles available in this
                  category.
                </p>
              </div>
            )}
          </main>

          {/* Right */}

          <aside className="trending-section">
            <div className="trending-header">
              <span className="trending-icon">✨</span>
              <h2>Trending</h2>
            </div>

            <div className="trending-list">
              {trendingArticles.map((article, index) => (
                <div
                  key={article.id}
                  className="trending-item"
                  onClick={() => openArticle(article.slug)}
                >
                  <div className="trending-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="trending-content">
                    <h3>{article.title}</h3>

                    <div className="trending-meta">
                      <span>
                        {article.category ||
                          "Technology"}
                      </span>

                      <span>•</span>

                      <span>
                        {dayjs(
                          article.created_at
                        ).format("MMM D")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default Home;