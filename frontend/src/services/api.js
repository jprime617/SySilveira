import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
  timeout: 60000, 
});

let activeRequests = 0;
let renderHibernationTimer = null;

const createLoader = () => {
  if (!document.getElementById('render-hibernation-loader')) {
    const loader = document.createElement('div');
    loader.id = 'render-hibernation-loader';
    loader.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 9999; color: white; font-family: sans-serif; backdrop-filter: blur(5px);">
        <div style="width: 60px; height: 60px; border: 6px solid #f3f3f3; border-top: 6px solid var(--primary, #3498db); border-radius: 50%; animation: spin 1s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite;"></div>
        <h2 style="margin-top: 25px; margin-bottom: 5px;">O servidor estava hibernando...</h2>
        <p style="font-size: 14px; opacity: 0.8;">Acordando o backend (esse processo pode levar até 50 segundos)</p>
        <p style="font-size: 11px; opacity: 0.5; margin-top: 20px;">Por favor, não atualize a página.</p>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
      </div>
    `;
    document.body.appendChild(loader);
  }
};

const removeLoader = () => {
  const loader = document.getElementById('render-hibernation-loader');
  if (loader) loader.remove();
};

api.interceptors.request.use(async config => {
  activeRequests++;
  
  if (activeRequests === 1) {
    // Se passar de 4 segundos e o banco/render ainda não respondeu, bloqueia a tela com aviso
    renderHibernationTimer = setTimeout(() => {
      createLoader();
    }, 4000);
  }

  const token = localStorage.getItem('@ERPLite:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    activeRequests--;
    if (activeRequests === 0) {
      clearTimeout(renderHibernationTimer);
      removeLoader();
    }
    return response;
  },
  (error) => {
    activeRequests--;
    if (activeRequests === 0) {
      clearTimeout(renderHibernationTimer);
      removeLoader();
    }
    return Promise.reject(error);
  }
);

export default api;
