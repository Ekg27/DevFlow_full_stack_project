import api from './api';

export const projectService = {
  async getProjects() {
    const res = await api.get('/projects');
    return res.data;
  },

  async getProject(projectId) {
    const res = await api.get(`/projects/${projectId}`);
    return res.data;
  },

  async createProject(data) {
    const res = await api.post('/projects', data);
    return res.data;
  },

  async updateProject(projectId, data) {
    const res = await api.put(`/projects/${projectId}`, data);
    return res.data;
  },

  async deleteProject(projectId) {
    const res = await api.delete(`/projects/${projectId}`);
    return res.data;
  },
};

export default projectService;
