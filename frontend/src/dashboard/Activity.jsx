import { useEffect, useState } from "react";
import { getUserLikes, getUserComments } from "../api/articles";

const Activity = () => {
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const [likesRes, commentsRes] = await Promise.all([
        getUserLikes(),
        getUserComments()
      ]);

      setLikes(likesRes.data);
      setComments(commentsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading activity...</p>;

  return (
    <div>
      <h2 className="mb-4">Your Activity</h2>

      {/* ❤️ Likes Section */}
      <div className="mb-5">
        <h4>❤️ Liked Articles</h4>

        {likes.length === 0 ? (
          <p>No likes yet</p>
        ) : (
          <ul className="list-group">
            {likes.map((item) => (
              <li
                key={item.id}
                className="list-group-item d-flex justify-content-between"
              >
                <span>{item.title}</span>

                <a
                  href={`/article/${item.slug}`}
                  className="btn btn-sm btn-outline-primary"
                >
                  View
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 💬 Comments Section */}
      <div>
        <h4>💬 Your Comments</h4>

        {comments.length === 0 ? (
          <p>No comments yet</p>
        ) : (
          <div className="list-group">
            {comments.map((c) => (
              <div key={c.id} className="list-group-item">
                
                <p className="mb-1">{c.content}</p>

                <small className="text-muted">
                  On: {c.title}
                </small>

                <div className="mt-2">
                  <a
                    href={`/article/${c.slug}`}
                    className="btn btn-sm btn-outline-secondary"
                  >
                    Go to Article
                  </a>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;