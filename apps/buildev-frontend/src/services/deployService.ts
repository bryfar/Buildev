import { apiBase } from "../utils/apiBase";
import { readBuildevApiJson } from "../utils/apiResponse";

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
    const res = await fetch(`${apiBase}/api/deploy/vercel/link`, {
      method: "POST",
      headers: headers(authHeaders, siteId, vercelToken),
      body: JSON.stringify({ siteId, ...payload }),
    });
    const json = await readBuildevApiJson(res);
    if (!json.ok) throw new Error(json.error ?? "Vercel link failed");
    return json.data;
  },

  async previewDeploy(
    authHeaders: Record<string, string>,
    siteId: string,
    vercelToken: string,
    branch: string,
  ): Promise<{ url: string; status: string; deploymentId: string }> {
    const res = await fetch(`${apiBase}/api/deploy/vercel/preview`, {
      method: "POST",
      headers: headers(authHeaders, siteId, vercelToken),
      body: JSON.stringify({ siteId, branch }),
    });
    const json = await readBuildevApiJson(res);
    if (!json.ok) throw new Error(json.error ?? "Preview deploy failed");
    const data = json.data as { url?: string; status?: string; deploymentId?: string } | null | undefined;
    if (!data?.url || !data.status || !data.deploymentId) {
      throw new Error("Respuesta de preview incompleta");
    }
    return { url: data.url, status: data.status, deploymentId: data.deploymentId };
  },
};
