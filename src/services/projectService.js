const PROJECT_API_AVAILABLE = false;

export async function getRecentProjects() {
  // The current backend has no project model or route yet.
  if (!PROJECT_API_AVAILABLE) {
    return {
      projects: [],
      isConfigured: false,
    };
  }

  return {
    projects: [],
    isConfigured: true,
  };
}
