import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Gestion des utilisateurs
export const userAPI = {
  getAllUsers: () => api.get('/users'),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (CIN, userData) => api.put(`/users/${CIN}`, userData),
  deleteUser: (CIN) => api.delete(`/users/${CIN}`), // ← Export ajouté
  changeUserState: (CIN) => api.patch(`/users/${CIN}/state`),
};

// Gestion des rendez-vous
export const rendezVousAPI = {
  getRendezVous: () => api.get('/rendezVous/index'),
  createRendezVous: (data) => api.post('/rendezVous', data),
  updateRendezVous: (id, data) => api.put(`/rendezVous/${id}/update`, data),
  deleteRendezVous: (id) => api.delete(`/rendezVous/${id}/destroy`),
  getRendezVousById: (id) => api.get(`/rendezVous/${id}/show`),
};

// Gestion des produits
export const produitsAPI = {
  getProduits: () => api.get('/produit/index'),
  createProduit: (data) => api.post('/produit', data),
  updateProduit: (id, data) => api.put(`/produit/${id}/update`, data),
  deleteProduit: (id) => api.delete(`/produit/${id}/destroy`),
  getProduitById: (id) => api.get(`/produit/${id}/show`),
};

// Gestion des diagnostics
export const diagnosticsAPI = {
  getDiagnostics: () => api.get('/diagnostics/index'),
  createDiagnostic: (data) => api.post('/diagnostics', data),
  updateDiagnostic: (id, data) => api.put(`/diagnostics/${id}/update`, data),
  deleteDiagnostic: (id) => api.delete(`/diagnostics/${id}/destroy`),
  getDiagnosticByPatientId: (id) => api.get(`/diagnostics/${id}/patient`),
};

// Gestion des livraisons
export const livraisonAPI = {
  getLivraisons: () => api.get('/livraison/index'),
  createLivraison: (data) => api.post('/livraison', data),
  updateLivraison: (id, data) => api.put(`/livraison/update/${id}`, data),
  deleteLivraison: (id) => api.delete(`/livraison/delete/${id}`),
  getLivraisonById: (id) => api.get(`/livraison/${id}`),
};

// Gestion des produits-livraison
export const produitLivraisonAPI = {
  getProduitLivraisons: () => api.get('/livraison-produit/index'),
  createProduitLivraison: (data) => api.post('/livraison-produit', data),
  updateProduitLivraison: (id, data) => api.put(`/livraison-produit/update/${id}`, data),
  deleteProduitLivraison: (id) => api.delete(`/livraison-produit/delete/${id}`),
  getProduitLivraisonByLivraisonId: (id) => api.get(`/livraison-produit/${id}`),
};

// Export par défaut
export default api;