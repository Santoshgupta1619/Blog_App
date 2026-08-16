import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminBookmarks } from "../../api/articleApi";

const AdminBookmark = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchBookmarks = async () => {
    try {
      const res = await getAdminBookmarks();

      setBookmarks(res.data);
    } catch (err) {
      console.error("GET ADMIN BOOKMARKS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);


  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">
            Loading...
          </span>
        </div>

        <p className="mt-2">
          Loading bookmarks...
        </p>
      </div>
    );
  }

  return (
    <div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            Bookmarks
          </h2>

          <p className="text-muted mb-0">
            Articles bookmarked by users
          </p>
        </div>

        <span className="badge bg-primary fs-6">
          {bookmarks.length} Bookmark
          {bookmarks.length !== 1 ? "s" : ""}
        </span>
      </div>


      {/* EMPTY STATE */}

      {bookmarks.length === 0 ? (

        <div className="text-center py-5">

          <div
            className="mb-3"
            style={{ fontSize: "50px" }}
          >
            🔖
          </div>

          <h4>
            No bookmarks yet
          </h4>

          <p className="text-muted">
            No users have bookmarked any articles yet.
          </p>

        </div>

      ) : (

        /* CARDS */

        <div className="row">

          {bookmarks.map((bookmark) => (

            <div
              className="col-md-6 col-lg-4 mb-4"
              key={bookmark.id}
            >

              <div className="card h-100 shadow-sm border-0">

                {/* IMAGE */}

                {bookmark.image_url ? (

                  <img
                    src={bookmark.image_url}
                    className="card-img-top"
                    alt={bookmark.title}
                    style={{
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />

                ) : (

                  <div
                    className="d-flex align-items-center justify-content-center bg-light"
                    style={{
                      height: "200px",
                    }}
                  >
                    <span className="text-muted">
                      No Image
                    </span>
                  </div>

                )}


                {/* BODY */}

                <div className="card-body d-flex flex-column">

                  <h5 className="card-title">
                    {bookmark.title}
                  </h5>


                  {/* STATUS */}

                  <div className="mb-3">

                    <span
                      className={`badge ${
                        bookmark.status === "published"
                          ? "bg-success"
                          : "bg-secondary"
                      }`}
                    >
                      {bookmark.status}
                    </span>

                  </div>


                  {/* USER */}

                  <div className="border-top pt-3">

                    
                  </div>


                  {/* DATE */}

                  <div className="mt-3">

                    <small className="text-muted">
                      Bookmarked on
                    </small>

                    <div>
                      {new Date(
                        bookmark.bookmarked_at
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>

                  </div>


                  {/* BUTTON */}

                  <div className="mt-auto pt-3">

                    <button
                      className="btn btn-primary w-100"
                      onClick={() =>
                        navigate(
                          `/article/${bookmark.slug}`
                        )
                      }
                    >
                      View Article
                    </button>

                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
};

export default AdminBookmark;