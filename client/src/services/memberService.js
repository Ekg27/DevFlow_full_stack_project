import api from './api';

export const memberService = {
  async getMembers(projectId) {
    const res = await api.get(`/projects/${projectId}/members`);
    return res.data;
  },

  async addMember(projectId, { email, role }) {
    const res = await api.post(`/projects/${projectId}/members`, { email, role });
    return res.data;
  },

  async removeMember(projectId, userId) {
    const res = await api.delete(`/projects/${projectId}/members/${userId}`);
    return res.data;
  },
};

export default memberService;
