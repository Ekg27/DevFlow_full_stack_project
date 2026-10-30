import api from './api';

export const dashboardService = {
  async getDashboard() {
    const res = await api.get('/dashboard');
    return res.data;
  },
};

export default dashboardService;
