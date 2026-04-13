interface VercelErrorBody {
  error?: { message?: string; code?: string };
  message?: string;
}

function vercelHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export interface VercelDeployment {
  id: string;
  url: string;
  state?: string;
}

/**
 * Creates a Vercel deployment for an existing GitHub repo project.
 * This is intentionally minimal: it assumes the Vercel project is already linked to the repo.
 *
 * @param vercelToken - Vercel personal token
 * @param projectId - Vercel project id or name
 * @param gitSource - Git source payload (GitHub)
 * @returns deployment id and url
 */
export async function createPreviewDeployment(params: {
  vercelToken: string;
  projectId: string;
  teamId?: string;
  gitSource: {
    type: "github";
    repo: string; // owner/repo
    ref: string; // branch
  };
}): Promise<VercelDeployment> {
  const query = params.teamId ? `?teamId=${encodeURIComponent(params.teamId)}` : "";
  const res = await fetch(`https://api.vercel.com/v13/deployments${query}`, {
    method: "POST",
    headers: vercelHeaders(params.vercelToken),
    body: JSON.stringify({
      name: params.projectId,
      project: params.projectId,
      gitSource: {
        type: params.gitSource.type,
        repo: params.gitSource.repo,
        ref: params.gitSource.ref,
      },
      target: "preview",
    }),
  });
  const data = (await res.json()) as unknown as (VercelDeployment & VercelErrorBody);
  if (!res.ok) {
    const msg = data.error?.message ?? data.message ?? `Vercel deploy failed (${res.status})`;
    throw new Error(msg);
  }
  return { id: data.id, url: data.url, state: data.state };
}

/**
 * Gets deployment status.
 *
 * @param vercelToken - Vercel personal token
 * @param deploymentId - Vercel deployment id
 */
export async function getDeployment(params: { vercelToken: string; deploymentId: string; teamId?: string }): Promise<VercelDeployment> {
  const query = params.teamId ? `?teamId=${encodeURIComponent(params.teamId)}` : "";
  const res = await fetch(`https://api.vercel.com/v13/deployments/${encodeURIComponent(params.deploymentId)}${query}`, {
    headers: vercelHeaders(params.vercelToken),
  });
  const data = (await res.json()) as unknown as (VercelDeployment & VercelErrorBody);
  if (!res.ok) {
    const msg = data.error?.message ?? data.message ?? `Vercel status failed (${res.status})`;
    throw new Error(msg);
  }
  return { id: data.id, url: data.url, state: data.state };
}

