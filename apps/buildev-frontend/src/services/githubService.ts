const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

interface GithubRepo {
  name: string;
  description?: string;
  private: boolean;
}

class GithubService {
  /**
   * Creates a new repository on the user's GitHub account via the backend.
   */
  async createRepository(data: GithubRepo): Promise<any> {
    const res = await fetch(`${API}/api/github/repos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "Failed to create repository");
    return json.data;
  }

  /**
   * Pushes the current project state to a branch.
   */
  async pushToBranch(repoName: string, branch: string, message: string): Promise<any> {
    const res = await fetch(`${API}/api/github/push`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoName, branch, message }),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "Failed to push to GitHub");
    return json.data;
  }

  /**
   * Creates a Pull Request.
   */
  async createPullRequest(repoName: string, title: string, body: string, head: string, base: string = 'main'): Promise<any> {
    const res = await fetch(`${API}/api/github/pulls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoName, title, body, head, base }),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "Failed to create Pull Request");
    return json.data;
  }
}

export const githubService = new GithubService();
