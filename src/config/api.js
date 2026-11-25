// Centralized API Configuration
const envApiUrl = import.meta.env.VITE_API_URL

export const API_BASE_URL =
  // If explicitly provided and not empty, and not accidentally pointing to localhost on production
  envApiUrl && !(import.meta.env.PROD && envApiUrl.includes('localhost'))
    ? envApiUrl
    : typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : ''

// Secret Admin / Staff Terminal Route Slug (Strictly loaded from .env)
export const ADMIN_ROUTE_PATH = (import.meta.env.VITE_ADMIN_PATH || '').trim()
