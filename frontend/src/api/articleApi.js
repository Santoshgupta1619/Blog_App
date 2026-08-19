import API from "./axios";


// export const getArticles = (page = 1, category = "") =>
//   API.get(
//     `/articles?page=${page}&limit=5&category=${encodeURIComponent(category)}`
//   );

export const getArticles = (
  page = 1,
  category = "",
  limit = 5
) =>
  API.get(
    `/articles?page=${page}&limit=${limit}&category=${encodeURIComponent(category)}`
  );

export const getCategories = () =>
  API.get("/articles/categories");

export const getTrendingArticles = () =>
  API.get("/articles/trending");

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