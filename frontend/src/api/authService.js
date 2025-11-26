import http from './http';

/**
 * Centralised helpers for hitting the Laravel auth endpoints.
 */
export const login = async (payload) => {
  const { data } = await http.post('/auth/login', payload);
  return data;
};

export const register = async (payload) => {
  const { data } = await http.post('/auth/register', payload);
  return data;
};

