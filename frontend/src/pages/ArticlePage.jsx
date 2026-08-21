import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import "./ArticlePage.css";

import {
  FaFacebookF,
  FaWhatsapp,
  FaTelegramPlane,
  FaLinkedinIn,
  FaInstagram,
  FaEnvelope,
  FaLink,
} from "react-icons/fa";

import { FaXTwitter } from "react-icons/fa6";
import { Share2 } from "lucide-react";

import { getArticleBySlug, togglePostLike, toggleBookmark } from "../api/articleApi";
import {
  getComments,
  addComment,
  deleteComment,
  updateComment,
} from "../api/commentApi";
import CommentCard from "../components/CommentCard";
import { toggleCommentLike } from "../api/commentApi";

const ArticlePage = () => {
  const { slug } = useParams();

  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const [showShare, setShowShare] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const shareRef = useRef(null);

  // ✅ USER ID FROM TOKEN
  let userId = null;
  let user = null;
  const token = localStorage.getItem("token");

  if (token) {
    try {
      user = JSON.parse(atob(token.split(".")[1]));
      userId = user.id;
    } catch {
      console.error("Invalid token");
    }
  }

  // ✅ FETCH DATA
  const fetchData = async () => {
    try {
      const res = await getArticleBySlug(slug);;
      setArticle(res.data);

      const commentsRes = await getComments(res.data.id);
      setComments(commentsRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [slug]);

  useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      shareRef.current &&
      !shareRef.current.contains(event.target)
    ) {
      setShowShare(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  // ✅ ADD COMMENT
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addComment(article.id, { content: newComment });
      setNewComment("");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ EDIT COMMENT
  const handleEdit = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.content);
  };

  // ✅ UPDATE COMMENT
  const handleUpdate = async (id) => {
    try {
      await updateComment(id, { content: editText });
      setEditingId(null);
      setEditText("");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ DELETE COMMENT
  const handleDelete = async (id) => {
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (commentId) => {
  try {
    await toggleCommentLike(commentId);
    fetchData(); // refresh comments
  } catch (err) {
    console.error(err);
  }
};


const handlePostLike = async () => {
  try {
    const res = await togglePostLike(article.id);

    setArticle((prev) => ({
      ...prev,
      like_count: res.data.totalLikes,
      is_liked: res.data.liked,
    }));

  } catch (err) {
    console.error(err);
  }
};

const handleBookmark = async () => {
  if (!article) return;

  try {
    const res = await toggleBookmark(article.id);

    setArticle((prev) => ({
      ...prev,
      is_bookmarked: res.data.bookmarked,
    }));

  } catch (err) {
    console.error(err);
  }
};

const articleUrl = window.location.href;

const handleShare = (platform) => {
  if (!article) return;

  const title = article.title;
  const url = articleUrl;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  let shareUrl = "";

  switch (platform) {
    case "facebook":
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      break;

    case "whatsapp":
      shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
      break;

    case "telegram":
      shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
      break;

    case "x":
      shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
      break;

    case "linkedin":
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      break;

    case "instagram":
      navigator.clipboard.writeText(url);

      window.open(
        "https://www.instagram.com/",
        "_blank",
        "noopener,noreferrer"
      );

      setLinkCopied(true);

      setTimeout(() => {
        setLinkCopied(false);
      }, 2000);

      return;

    case "email":
      shareUrl = `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(
        `Check out this article:\n\n${title}\n\n${url}`
      )}`;
      break;

    default:
      return;
  }

  window.open(
    shareUrl,
    "_blank",
    "noopener,noreferrer,width=700,height=600"
  );
};

const handleCopyLink = async () => {
  try {
    await navigator.clipboard.writeText(articleUrl);

    setLinkCopied(true);

    setTimeout(() => {
      setLinkCopied(false);
    }, 2000);
  } catch (err) {
    console.error("Failed to copy link:", err);
  }
};


  if (!article) return <p className="loading">Loading...</p>;

  return (
    <div className="page">
      <div className="article-container">

        {/* TITLE */}
        <p className="article-kicker">{article.category || "Article"}</p>
        <h1 className="article-title">{article.title}</h1>

        {/* META */}
        <div className="article-meta">
          <span>✍️ Author</span>
          <span> • </span>
          <span>
            {new Date(article.created_at).toDateString()}
          </span>
        </div>

        {/* IMAGE */}
        <img
          className="article-image"
          src={
            article.image_url ||
            "https://source.unsplash.com/1200x600/?writing,blog"
          }
          alt="article"
        />

        {/* CONTENT */}
        <div
  className="article-content"
  dangerouslySetInnerHTML={{
    __html: article.content,
  }}
/>

    <div className="article-actions">
  {/* LIKE */}
  <button
    className="article-action-btn"
    onClick={handlePostLike}
  >
    {article.is_liked ? "❤️" : "🤍"}
    <span>{article.like_count || 0}</span>
  </button>

  {/* BOOKMARK */}
  <button
    className="article-action-btn"
    onClick={handleBookmark}
  >
    <span>{article.is_bookmarked ? "🔖" : "📑"}</span>
    <span>{article.is_bookmarked ? "Saved" : "Save"}</span>
  </button>

  {/* SHARE */}
  <div className="share-wrapper" ref={shareRef}>
    <button
      className="article-action-btn share-trigger"
      onClick={() => setShowShare((prev) => !prev)}
      aria-expanded={showShare}
      aria-label="Share article"
    >
      <Share2 size={17} strokeWidth={2} />
      <span>Share</span>
    </button>

    {/* SHARE OPTIONS */}
    {showShare && (
      <div className="share-menu">
        <div className="share-menu-title">
          Share this article
        </div>

        <div className="share-options">

          {/* FACEBOOK */}
          <button
            className="share-option facebook"
            onClick={() => handleShare("facebook")}
            title="Share on Facebook"
          >
            <FaFacebookF />
          </button>

          {/* WHATSAPP */}
          <button
            className="share-option whatsapp"
            onClick={() => handleShare("whatsapp")}
            title="Share on WhatsApp"
          >
            <FaWhatsapp />
          </button>

          {/* TELEGRAM */}
          <button
            className="share-option telegram"
            onClick={() => handleShare("telegram")}
            title="Share on Telegram"
          >
            <FaTelegramPlane />
          </button>

          {/* X */}
          <button
            className="share-option x-twitter"
            onClick={() => handleShare("x")}
            title="Share on X"
          >
            <FaXTwitter />
          </button>

          {/* LINKEDIN */}
          <button
            className="share-option linkedin"
            onClick={() => handleShare("linkedin")}
            title="Share on LinkedIn"
          >
            <FaLinkedinIn />
          </button>

          {/* INSTAGRAM */}
          <button
            className="share-option instagram"
            onClick={() => handleShare("instagram")}
            title="Share on Instagram"
          >
            <FaInstagram />
          </button>

          {/* EMAIL */}
          <button
            className="share-option email"
            onClick={() => handleShare("email")}
            title="Share by Email"
          >
            <FaEnvelope />
          </button>

          {/* COPY LINK */}
          <button
            className="share-option copy-link"
            onClick={handleCopyLink}
            title="Copy article link"
          >
            <FaLink />
          </button>

        </div>

        {linkCopied && (
          <div className="link-copied">
            ✓ Link copied
          </div>
        )}
      </div>
    )}
  </div>
</div>

        {/* COMMENTS */}
        <div className="responses-heading">
          <h2 className="comment-header">Responses</h2>
          <span>{comments.length}</span>
        </div>

{token ? (
  <div className="comment-box">
    <input
      className="input"
      type="text"
      placeholder="Write a response..."
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
    />
    <button className="primary-btn" onClick={handleAddComment}>
      Post
    </button>
  </div>
) : (
  <p className="login-warning">
    Please login to write a response
  </p>
)}

        {/* COMMENT LIST */}
        {comments.map((c) => (
          <CommentCard
            key={c.id}
            comment={c}
            userId={userId}
            userRole={user?.role}
            editingId={editingId}
            editText={editText}
            setEditText={setEditText}
            setEditingId={setEditingId}
            handleEdit={handleEdit}
            handleUpdate={handleUpdate}
            handleDelete={handleDelete}
            handleLike={handleLike} 
            handleBookmark={handleBookmark}
          />
        ))}
      </div>
    </div>
  );
};



export default ArticlePage;
