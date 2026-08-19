import { useEffect, useState } from "react";
import {
  getArticles,
  getCategories,
  getTrendingArticles,
} from "../api/articleApi";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { htmlToText } from "../utils/htmlToText";
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
        selectedCategory === "All" ? "" : selectedCategory,7
      );

      setArticles(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching articles:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategories();

      const categoryList = [
        "All",
        ...(res.data || []).map((category) => category.name),
      ];

      setCategories(categoryList);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchTrendingArticles = async () => {
    try {
      const res = await getTrendingArticles();

      setTrendingArticles(res.data || []);
    } catch (err) {
      console.error("Error fetching trending articles:", err);
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

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedTag(null);
  };

  if (loading) {
    return (
      <div className="home">
        <div className="home-loading">
          <div className="loading-line"></div>
          <div className="loading-title"></div>
          <div className="loading-text"></div>
          <p>Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="home-container">

        {/* =====================================================
            CATEGORY NAVIGATION
        ====================================================== */}

        <section className="category-section">
          <div className="section-kicker">Explore</div>

          <div className="category-scroll-wrapper">
            <div className="category-filter">
              {categories.map((category, index) => (
                <button
                  key={`${category}-${index}`}
                  className={
                    selectedCategory === category ? "active" : ""
                  }
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            BRAND INTRO
        ====================================================== */}

        <section className="brand-intro">
          <div className="brand-rule"></div>

          <p className="brand-eyebrow">
            THE INDIAN GUIDE
          </p>

          <h1>
            Ideas. Technology. Innovation.
          </h1>

          <p className="brand-description">
            Stories, ideas and insights shaping the world of
            technology and beyond.
          </p>
        </section>

        {/* =====================================================
            TAG FILTER
        ====================================================== */}

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
              Clear ×
            </button>
          </div>
        )}

        {/* =====================================================
            FEATURED
        ====================================================== */}

        {featuredArticle ? (
          <>
            <section className="editorial-section featured-section">

              <div className="section-heading">
                <span>Featured</span>
                <div></div>
              </div>

              <article
                className="featured-editorial"
                onClick={() => openArticle(featuredArticle.slug)}
              >
                <div className="featured-editorial-image">
                  {featuredArticle.image_url ? (
                    <img
                      src={featuredArticle.image_url}
                      alt={featuredArticle.title}
                    />
                  ) : (
                    <div className="image-placeholder">
                      <span>THE INDIAN GUIDE</span>
                    </div>
                  )}

                  <span className="featured-label">
                    Featured
                  </span>
                </div>

                <div className="featured-editorial-content">

                  <div className="article-category">
                    {featuredArticle.category ||
                      "Technology"}
                  </div>

                  <h2>
                    {featuredArticle.title}
                  </h2>

                  <p>
                    {htmlToText(
                      featuredArticle.content || ""
                    ).slice(0, 240)}
                    ...
                  </p>

                  <div className="editorial-meta">
                    <span>By Author</span>
                    <span>•</span>
                    <span>
                      {dayjs(
                        featuredArticle.created_at
                      ).format("MMM D, YYYY")}
                    </span>
                  </div>

                  <span className="read-story">
                    Read story →
                  </span>

                </div>
              </article>

            </section>

            {/* =====================================================
                LATEST STORIES
            ====================================================== */}

            <section className="editorial-section latest-section">

              <div className="section-heading">
                <span>Latest Stories</span>
                <div></div>
              </div>

              <div className="latest-grid">

                {regularArticles.slice(0, 6).map((article) => (
                  <article
                    key={article.id}
                    className="latest-card"
                    onClick={() => openArticle(article.slug)}
                  >
                    <div className="latest-image">
                      {article.image_url ? (
                        <img
                          src={article.image_url}
                          alt={article.title}
                        />
                      ) : (
                        <div className="image-placeholder">
                          <span>THE INDIAN GUIDE</span>
                        </div>
                      )}
                    </div>

                    <div className="latest-card-content">

                      <div className="article-category">
                        {article.category ||
                          "Technology"}
                      </div>

                      <h3>
                        {article.title}
                      </h3>

                      <p>
                        {htmlToText(
                          article.content || ""
                        ).slice(0, 100)}
                        ...
                      </p>

                      <div className="editorial-meta">
                        <span>
                          {dayjs(
                            article.created_at
                          ).format("MMM D, YYYY")}
                        </span>
                      </div>

                    </div>
                  </article>
                ))}

              </div>
            </section>

            {/* =====================================================
                TRENDING
            ====================================================== */}

            {trendingArticles.length > 0 && (
              <section className="editorial-section trending-editorial-section">

                <div className="section-heading">
                  <span>Trending</span>
                  <div></div>
                </div>

                <div className="trending-editorial-grid">

                  {trendingArticles
                    .slice(0, 5)
                    .map((article, index) => (
                      <article
                        key={article.id}
                        className="trending-editorial-item"
                        onClick={() =>
                          openArticle(article.slug)
                        }
                      >
                        <div className="trending-number">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div className="trending-editorial-content">

                          <div className="article-category">
                            {article.category ||
                              "Technology"}
                          </div>

                          <h3>
                            {article.title}
                          </h3>

                          <div className="editorial-meta">
                            <span>
                              {dayjs(
                                article.created_at
                              ).format("MMM D")}
                            </span>
                          </div>

                        </div>
                      </article>
                    ))}

                </div>
              </section>
            )}

            {/* =====================================================
                CURRENT ARTICLE LIST
            ====================================================== */}

            {regularArticles.length > 6 && (
              <section className="editorial-section more-stories-section">

                <div className="section-heading">
                  <span>More Stories</span>
                  <div></div>
                </div>

                <div className="more-stories">

                  {regularArticles.slice(6).map((article) => (
                    <article
                      key={article.id}
                      className="more-story"
                      onClick={() =>
                        openArticle(article.slug)
                      }
                    >
                      <div className="more-story-content">

                        <div className="article-category">
                          {article.category ||
                            "Technology"}
                        </div>

                        <h3>
                          {article.title}
                        </h3>

                        <p>
                          {htmlToText(
                            article.content || ""
                          ).slice(0, 130)}
                          ...
                        </p>

                        <div className="editorial-meta">
                          <span>By Author</span>
                          <span>•</span>
                          <span>
                            {dayjs(
                              article.created_at
                            ).format("MMM D, YYYY")}
                          </span>
                        </div>

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
                        <div className="more-story-image">
                          <img
                            src={article.image_url}
                            alt={article.title}
                          />
                        </div>
                      )}

                    </article>
                  ))}

                </div>
              </section>
            )}

            {/* =====================================================
                PAGINATION
            ====================================================== */}

            <div className="pagination">

              <button
                disabled={page === 1}
                onClick={() =>
                  setPage((prev) => prev - 1)
                }
              >
                ← Previous
              </button>

              <span>
                {page} / {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() =>
                  setPage((prev) => prev + 1)
                }
              >
                Next →
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

      </div>
    </div>
  );
};

export default Home;