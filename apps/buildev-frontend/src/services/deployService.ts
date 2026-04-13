const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export const VERCEL_TOKEN_STORAGE_KEY = "bs_vercel_token";

function headers(
  authHeaders: Record<string, string>,
  siteId: string,
  vercelToken: string,
): Record<string, string> {
  return {
    ...authHeaders,
    "x-site-id": siteId,
    "x-vercel-token": vercelToken,
  };
}

export const deployService = {
  async linkVercel(
    authHeaders: Record<string, string>,
    siteId: string,
    vercelToken: string,
    payload: { projectId: string; teamId?: string },
  ): Promise<unknown> {
    const res = await fetch(`${API}/api/deploy/vercel/link`, {
      method: "POST",
      headers: headers(authHeaders, siteId, vercelToken),
      body: JSON.stringify({ siteId, ...payload }),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(typeof json.error === "string" ? json.error : "Vercel link failed");
    return json.data;
  },

  async previewDeploy(
    authHeaders: Record<string, string>,
    siteId: string,
    vercelToken: string,
    branch: string,
  ): Promise<{ url: string; status: string; deploymentId: string }> {
    const res = await fetch(`${API}/api/deploy/vercel/preview`, {
      method: "POST",
      headers: headers(authHeaders, siteId, vercelToken),
      body: JSON.stringify({ siteId, branch }),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(typeof json.error === "string" ? json.error : "Preview deploy failed");
    return json.data as { url: string; status: string; deploymentId: string };
  },
};

