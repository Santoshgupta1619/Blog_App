import { useEffect, useState } from "react";
import { getUserLikes, getUserComments } from "../api/articles";
import {
  Heart,
  MessageCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import "./Activity.css";

const Activity = () => {
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAllLikes, setShowAllLikes] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  const VISIBLE_ITEMS = 3;

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const [likesRes, commentsRes] = await Promise.all([
        getUserLikes(),
        getUserComments(),
      ]);

      setLikes(likesRes.data);
      setComments(commentsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="activity-page">
        <div className="activity-loading">
          <div className="activity-spinner"></div>
          <span>Loading your activity...</span>
        </div>
      </div>
    );
  }

  const visibleLikes = showAllLikes
    ? likes
    : likes.slice(0, VISIBLE_ITEMS);

  const visibleComments = showAllComments
    ? comments
    : comments.slice(0, VISIBLE_ITEMS);

  return (
    <div className="activity-page">

      {/* PAGE HEADER */}
      <div className="activity-header">
        <div>
          <span className="activity-eyebrow">ACCOUNT</span>

          <h2>Your Activity</h2>

          <p>
            Keep track of the articles you've liked and the comments you've
            shared.
          </p>
        </div>
      </div>

      {/* =========================
          LIKES SECTION
      ========================= */}

      <section className="activity-section">

        <div className="activity-section-header">

          <div className="activity-section-title">

            <span className="activity-icon like-icon">
              <Heart size={19} strokeWidth={2.2} />
            </span>

            <div>
              <h4>Liked Articles</h4>

              <span>
                {likes.length}{" "}
                {likes.length === 1 ? "article" : "articles"}
              </span>
            </div>

          </div>

          {/* VIEW ALL */}
          {likes.length > VISIBLE_ITEMS && (
            <button
              type="button"
              className="activity-view-all"
              onClick={() => setShowAllLikes(!showAllLikes)}
            >
              {showAllLikes ? (
                <>
                  Show Less
                  <ChevronUp size={15} />
                </>
              ) : (
                <>
                  View All
                  <ChevronDown size={15} />
                </>
              )}
            </button>
          )}

        </div>

        {likes.length === 0 ? (
          <div className="activity-empty">

            <Heart size={24} strokeWidth={1.7} />

            <div>
              <strong>No liked articles yet</strong>

              <p>
                Articles you like will appear here.
              </p>
            </div>

          </div>
        ) : (
          <div className="activity-list">

            {visibleLikes.map((item) => (
              <div
                key={item.id}
                className="activity-item"
              >

                <div className="activity-item-icon like-item-icon">
                  <Heart size={17} strokeWidth={2} />
                </div>

                <div className="activity-item-content">

                  <a
                    href={`/article/${item.slug}`}
                    className="activity-article-title"
                  >
                    {item.title}
                  </a>

                  <span className="activity-item-meta">
                    You liked this article
                  </span>

                </div>

                <a
                  href={`/article/${item.slug}`}
                  className="activity-action"
                >
                  <span>View</span>
                  <ArrowRight size={16} strokeWidth={2} />
                </a>

              </div>
            ))}

          </div>
        )}

      </section>

      {/* =========================
          COMMENTS SECTION
      ========================= */}

      <section className="activity-section">

        <div className="activity-section-header">

          <div className="activity-section-title">

            <span className="activity-icon comment-icon">
              <MessageCircle size={19} strokeWidth={2.2} />
            </span>

            <div>
              <h4>Your Comments</h4>

              <span>
                {comments.length}{" "}
                {comments.length === 1 ? "comment" : "comments"}
              </span>
            </div>

          </div>

          {/* VIEW ALL */}
          {comments.length > VISIBLE_ITEMS && (
            <button
              type="button"
              className="activity-view-all"
              onClick={() =>
                setShowAllComments(!showAllComments)
              }
            >
              {showAllComments ? (
                <>
                  Show Less
                  <ChevronUp size={15} />
                </>
              ) : (
                <>
                  View All
                  <ChevronDown size={15} />
                </>
              )}
            </button>
          )}

        </div>

        {comments.length === 0 ? (
          <div className="activity-empty">

            <MessageCircle
              size={24}
              strokeWidth={1.7}
            />

            <div>
              <strong>No comments yet</strong>

              <p>
                Your comments will appear here.
              </p>
            </div>

          </div>
        ) : (
          <div className="activity-list">

            {visibleComments.map((c) => (
              <div
                key={c.id}
                className="activity-item comment-item"
              >

                <div className="activity-item-icon comment-item-icon">
                  <MessageCircle
                    size={17}
                    strokeWidth={2}
                  />
                </div>

                <div className="activity-item-content">

                  <p className="activity-comment">
                    {c.content}
                  </p>

                  <span className="activity-item-meta">
                    On{" "}
                    <a href={`/article/${c.slug}`}>
                      {c.title}
                    </a>
                  </span>

                </div>

                <a
                  href={`/article/${c.slug}`}
                  className="activity-action"
                >
                  <span>View</span>

                  <ArrowRight
                    size={16}
                    strokeWidth={2}
                  />
                </a>

              </div>
            ))}

          </div>
        )}

      </section>

    </div>
  );
};

export default Activity;