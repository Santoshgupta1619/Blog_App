import API from "./axios";


export const getArticles = () =>
  API.get("/articles?limit=20");

export const getArticleBySlug = (slug) =>
  API.get(`/articles/${slug}`);

export const createArticle = (data) =>
  API.post("/articles", data);

export const togglePostLike = (articleId) => {
  return API.post(`/articles/${articleId}/like`);
};

export const toggleBookmark = (articleId) =>
  API.post(`/articles/${articleId}/bookmark`);

export const getAdminBookmarks = () =>
  API.get("/admin/bookmarks");