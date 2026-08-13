import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const CommentCard = ({
  comment,
  userId,
  userRole,
  editingId,
  editText,
  setEditText,
  setEditingId,
  handleEdit,
  handleUpdate,
  handleDelete,
  handleLike,
}) => {
  return (
    <div className="comment">
      {/* HEADER */}
      <div className="comment-header-row">
        <div className="avatar">
          {comment.user_name?.charAt(0).toUpperCase() || "U"}
        </div>

        <div>
          <p className="username">{comment.user_name || "User"}</p>
          <p className="time">
            {comment.created_at
              ? dayjs(comment.created_at).fromNow()
              : "just now"}
          </p>
        </div>
      </div>

      {/* EDIT MODE */}
      {editingId === comment.id ? (
        <>
          <input
            className="input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />

          <div className="actions">
            <button
              className="primary-btn"
              onClick={() => handleUpdate(comment.id)}
            >
              Save
            </button>

            <button
              className="secondary-btn"
              onClick={() => setEditingId(null)}
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="comment-text">{comment.content}</p>
          <button onClick={() => handleLike(comment.id)}>
  {comment.is_liked ? "❤️" : "🤍"} {comment.like_count}
</button>

          {(userId === comment.author_id || userRole === "admin") && (
            <div className="actions">
  {userId === comment.author_id && (
    <button
      className="link-btn"
      onClick={() => handleEdit(comment)}
    >
      Edit
    </button>
  )}

  {(userId === comment.author_id || userRole === "admin") && (
    <button
      className="link-btn"
      onClick={() => handleDelete(comment.id)}
    >
      Delete
    </button>
  )}
</div>
          )}
        </>
      )}
    </div>
  );
};

export default CommentCard;