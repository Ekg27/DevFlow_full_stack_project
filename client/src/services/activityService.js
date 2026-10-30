import api from './api';

export const activityService = {
  async getProjectActivity(projectId, params = {}) {
    const res = await api.get(`/projects/${projectId}/activity`, { params });
    return res.data;
  },
};

export default activityService;
