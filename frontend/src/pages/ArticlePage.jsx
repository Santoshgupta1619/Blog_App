import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./ArticlePage.css";

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


  if (!article) return <p className="loading">Loading...</p>;

  return (
    <div className="page">
      <div className="article-container">

        {/* TITLE */}
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
        <div className="article-content">
          {article.content}
        </div>

        <button onClick={handlePostLike}>
  {article.is_liked ? "❤️" : "🤍"} {article.like_count || 0}
</button>

<button onClick={handleBookmark}>
  {article.is_bookmarked ? "🔖 Saved" : "📑 Save"}
</button>

        {/* COMMENTS */}
        <h2 className="comment-header">Responses</h2>

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