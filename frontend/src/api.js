import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getCharts = async () => {
  const response = await api.get('/charts');
  return response.data;
};

export const generateChart = async (chartName) => {
  const response = await api.get(`/generate/${chartName}`);
  return response.data;
};
