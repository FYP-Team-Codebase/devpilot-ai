const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

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
    localStorage.setItem("user", JSON.stringify(data.user));
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
    localStorage.setItem("user", JSON.stringify(data.user));
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
  localStorage.removeItem("user");
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getCurrentUser() {
  const user = localStorage.getItem("user");

  return user ? JSON.parse(user) : null;
}
