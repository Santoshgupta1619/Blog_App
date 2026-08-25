import API from "./axios";

export const getComments = (articleId, page = 1, limit = 5) => {
  return API.get(`/comments/${articleId}`, {
    params: {
      page,
      limit,
    },
  });
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