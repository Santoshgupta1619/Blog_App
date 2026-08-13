import API from "./axios";

export const getBookmarks = () => {
  return API.get("/users/bookmarks");
};

export const toggleBookmark = (articleId) => {
  return API.post(`/articles/${articleId}/bookmark`);
};

export const getUserLikes = () => {
    return API.get("/users/likes");
};

export const getUserComments = () => {
    return API.get("users/comments");
};