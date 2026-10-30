import api from './api';

export const commentService = {
  async getTaskComments(taskId) {
    const res = await api.get(`/tasks/${taskId}/comments`);
    return res.data;
  },

  async addComment(taskId, content) {
    const res = await api.post(`/tasks/${taskId}/comments`, { content });
    return res.data;
  },

  async updateComment(commentId, content) {
    const res = await api.put(`/comments/${commentId}`, { content });
    return res.data;
  },

  async deleteComment(commentId) {
    const res = await api.delete(`/comments/${commentId}`);
    return res.data;
  },
};

export default commentService;
