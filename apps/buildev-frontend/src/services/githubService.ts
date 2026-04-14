import { apiBase } from "../utils/apiBase";
import { readBuildevApiJson } from "../utils/apiResponse";

interface GithubRepo {
  name: string;
  description?: string;
  private: boolean;
}

class GithubService {
  /**
   * Crea un repositorio (legacy). El API puede responder 501; usar integración `/api/git` en el panel.
   */
  async createRepository(data: GithubRepo): Promise<unknown> {
    const res = await fetch(`${apiBase}/api/github/repos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await readBuildevApiJson(res);
    if (!json.ok) throw new Error(json.error ?? "Failed to create repository");
    return json.data;
  }

  /**
   * Push a rama (legacy). Preferir `/api/git/push`.
   */
  async pushToBranch(repoName: string, branch: string, message: string): Promise<unknown> {
    const res = await fetch(`${apiBase}/api/github/push`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoName, branch, message }),
    });
    const json = await readBuildevApiJson(res);
    if (!json.ok) throw new Error(json.error ?? "Failed to push to GitHub");
    return json.data;
  }

  /**
   * Abre un PR (legacy). Preferir `/api/git/pull-requests`.
   */
  async createPullRequest(
    repoName: string,
    title: string,
    body: string,
    head: string,
    base: string = "main",
  ): Promise<unknown> {
    const res = await fetch(`${apiBase}/api/github/pulls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoName, title, body, head, base }),
    });
    const json = await readBuildevApiJson(res);
    if (!json.ok) throw new Error(json.error ?? "Failed to create Pull Request");
    return json.data;
  }
}

export const githubService = new GithubService();
