import { useEffect, useState } from "react";
import { getArticles } from "../api/articleApi";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "./Home.css";

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await getArticles();
        setArticles(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchArticles();
  }, []);

  // =========================
  // CATEGORIES
  // =========================

  const categories = [
    "All",
    ...new Set(
      articles
        .map((article) => article.category)
        .filter(
          (category) =>
            category && category !== "Uncategorized"
        )
    ),
  ];

  // =========================
  // FILTER ARTICLES
  // =========================

  const filteredArticles = articles.filter((article) => {
    const matchCategory =
      selectedCategory === "All" ||
      article.category === selectedCategory;

    const matchTag =
      !selectedTag ||
      article.tags?.includes(selectedTag);

    return matchCategory && matchTag;
  });

  // =========================
  // FEATURED ARTICLE
  // =========================

  const featuredArticle = filteredArticles[0];

  // =========================
  // REGULAR ARTICLES
  // =========================

  const regularArticles = filteredArticles.slice(1);

  // =========================
  // TRENDING ARTICLES
  // =========================

  const trendingArticles = articles.slice(0, 5);

  // =========================
  // OPEN ARTICLE
  // =========================

  const openArticle = (slug) => {
    navigate(`/article/${slug}`);
  };

  return (
    <div className="home">

      {/* =========================
          MAIN CONTAINER
      ========================= */}

      <div className="home-container">

        {/* =========================
            CATEGORY FILTER
        ========================= */}

        <div className="category-section">

          <div className="category-filter">

            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedCategory(category);
                  setSelectedTag(null);
                }}
                className={
                  selectedCategory === category
                    ? "active"
                    : ""
                }
              >
                {category}
              </button>
            ))}

          </div>

        </div>

        {/* =========================
            CLEAR TAG
        ========================= */}

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

        {/* =========================
            CONTENT LAYOUT
        ========================= */}

        <div className="home-layout">

          {/* =========================
              LEFT SIDE
          ========================= */}

          <main className="articles-section">

            {featuredArticle ? (

              <>
                {/* =========================
                    FEATURED ARTICLE
                ========================= */}

                <article
                  className="featured-card"
                  onClick={() =>
                    openArticle(featuredArticle.slug)
                  }
                >

                  {/* IMAGE */}

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

                  {/* CONTENT */}

                  <div className="featured-content">

                    <div className="article-category">
                      {featuredArticle.category ||
                        "Uncategorized"}
                    </div>

                    <h1>
                      {featuredArticle.title}
                    </h1>

                    <p className="featured-preview">
                      {featuredArticle.content?.slice(
                        0,
                        220
                      )}
                      ...
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

                {/* =========================
                    REGULAR ARTICLES
                ========================= */}

                <div className="articles-list">

                  {regularArticles.map((article) => (

                    <article
                      key={article.id}
                      className="post-card"
                      onClick={() =>
                        openArticle(article.slug)
                      }
                    >

                      {/* CONTENT */}

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
                          {article.content?.slice(
                            0,
                            130
                          )}
                          ...
                        </p>

                        {/* TAGS */}

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

                      {/* IMAGE */}

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

              </>

            ) : (

              <div className="no-articles">
                <h3>No articles found</h3>
                <p>
                  There are no articles available in
                  this category.
                </p>
              </div>

            )}

          </main>

          {/* =========================
              TRENDING SIDEBAR
          ========================= */}

          <aside className="trending-section">

            <div className="trending-header">

              <span className="trending-icon">
                ✨
              </span>

              <h2>Trending</h2>

            </div>

            <div className="trending-list">

              {trendingArticles.map(
                (article, index) => (

                  <div
                    key={article.id}
                    className="trending-item"
                    onClick={() =>
                      openArticle(article.slug)
                    }
                  >

                    <div className="trending-number">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <div className="trending-content">

                      <h3>
                        {article.title}
                      </h3>

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

                )
              )}

            </div>

          </aside>

        </div>

      </div>

    </div>
  );
};

export default Home;