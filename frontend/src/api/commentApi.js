import API from "./axios";

export const getComments = (articleId) => {
  return API.get(`/comments/${articleId}`);
};

export const addComment = (articleId, data) => {
  return API.post(`/comments/${articleId}`, data);
};

export const deleteComment = (id) => {
  return API.delete(`/comments/${id}`);
};

export const updateComment = (id, data) => {
  return API.put(`/comments/${id}`, data);
};

// commentApi.js
export const toggleCommentLike = (commentId) =>
  API.post(`/comments/${commentId}/like`);