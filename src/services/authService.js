import { useSyncExternalStore } from 'react'

const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
let currentUserSnapshot
let hasReadCurrentUser = false
let currentUserRevision = 0
const currentUserSubscribers = new Set()

function readStoredUser() {
  const rawUser = localStorage.getItem('user')
  if (!rawUser) return null
  try { return JSON.parse(rawUser) } catch {
    localStorage.removeItem('user')
    return null
  }
}

function notifyUserSubscribers() {
  currentUserSubscribers.forEach((subscriber) => subscriber())
}

function handleStorageChange(event) {
  if (event.key === 'user' || event.key === null) {
    currentUserSnapshot = readStoredUser()
    hasReadCurrentUser = true
    currentUserRevision += 1
    notifyUserSubscribers()
  }
}

function subscribeCurrentUser(subscriber) {
  currentUserSubscribers.add(subscriber)
  if (currentUserSubscribers.size === 1) window.addEventListener('storage', handleStorageChange)
  return () => {
    currentUserSubscribers.delete(subscriber)
    if (currentUserSubscribers.size === 0) window.removeEventListener('storage', handleStorageChange)
  }
}

function getCurrentUserSnapshot() {
  if (!hasReadCurrentUser) {
    currentUserSnapshot = readStoredUser()
    hasReadCurrentUser = true
  }
  return currentUserSnapshot
}

export function useCurrentUser() {
  return useSyncExternalStore(subscribeCurrentUser, getCurrentUserSnapshot, () => null)
}

function createAuthError(data, fallbackMessage) {
  const error = new Error(data?.message || fallbackMessage);

  if (data?.requiresVerification || data?.requiresEmailVerification) {
    error.requiresVerification = true;
    error.requiresEmailVerification = true;
    error.email = data.email;
  }

  if (data?.retryAfterSeconds) {
    error.retryAfterSeconds = data.retryAfterSeconds;
  }

  return error;
}

export function setCurrentUser(user) {
  if (user) localStorage.setItem("user", JSON.stringify(user));
  else localStorage.removeItem("user");
  currentUserSnapshot = user || null
  hasReadCurrentUser = true
  currentUserRevision += 1
  notifyUserSubscribers()
}

export function getCurrentUserRevision() {
  return currentUserRevision
}

async function parseJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export async function login(payload) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
    }),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw createAuthError(data, "Login failed");
  }

  // Save authentication information
  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  if (data.user) {
    setCurrentUser(data.user);
  }

  return data;
}

export async function signup(payload) {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw createAuthError(data, "Signup failed");
  }

  return data;
}

export async function verifyEmail(email, code) {
  const response = await fetch(`${API_URL}/auth/verify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, code }),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw createAuthError(data, "Email verification failed");
  }

  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  if (data.user) {
    setCurrentUser(data.user);
  }

  return data;
}

export async function resendVerification(email) {
  const response = await fetch(`${API_URL}/auth/resend-verification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw createAuthError(data, "Could not resend verification code");
  }

  return data;
}

export function logout() {
  localStorage.removeItem("token");
  setCurrentUser(null)
}

async function passwordResetRequest(endpoint, payload) {
  const response = await fetch(`${API_URL}/auth/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseJsonResponse(response);
  if (!response.ok || !data.success) {
    throw createAuthError(data, "Unable to complete password reset. Please try again.");
  }
  return data;
}

export const requestPasswordReset = (email) => passwordResetRequest("forgot-password", { email });
export const verifyPasswordResetOtp = (email, otp) => passwordResetRequest("verify-password-reset-otp", { email, otp });
export const resetPassword = (resetToken, newPassword) => passwordResetRequest("reset-password", { resetToken, newPassword });

export function getToken() {
  return localStorage.getItem("token");
}

export function getCurrentUser() {
  return getCurrentUserSnapshot()
}
