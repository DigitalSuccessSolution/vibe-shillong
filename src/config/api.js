// Centralized API & Admin Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Admin / Staff Gate Scanner Login Credentials from .env
export const ADMIN_USER = import.meta.env.VITE_ADMIN_USER || 'admin'
export const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || 'neon@2026'
