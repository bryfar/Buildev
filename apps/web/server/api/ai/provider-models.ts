import { defineEventHandler, readBody } from 'h3';
import {
  buildAnthropicModelsURL,
  buildProviderModelsURL,
  formatFetchError,
  normalizeOptionalBaseURL,
} from './provider-url';

interface ProviderModelsBody {
  baseURL: string;
  apiKey?: string;
  /** Default: openai-compat (Bearer + /models on OpenAI-compat root). */
  apiFormat?: 'anthropic' | 'openai-compat';
}

interface ModelEntry {
  id: string;
  name: string;
}

/**
 * POST /api/ai/provider-models
 * Proxies model list requests to external providers to avoid CORS issues.
 * Body: { baseURL: string, apiKey?: string, apiFormat?: 'anthropic' | 'openai-compat' }
 * Returns: { models: Array<{ id: string, name: string }> }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<ProviderModelsBody>(event);
  const normalizedBaseURL = normalizeOptionalBaseURL(body?.baseURL);
  const apiKey = body?.apiKey;
  const apiFormat = body?.apiFormat === 'anthropic' ? 'anthropic' : 'openai-compat';
  if (!normalizedBaseURL) {
    return { models: [], error: 'baseURL is required' };
  }

  const url =
    apiFormat === 'anthropic'
      ? buildAnthropicModelsURL(normalizedBaseURL)
      : buildProviderModelsURL(normalizedBaseURL);
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (apiKey) {
    if (apiFormat === 'anthropic') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      headers.Authorization = `Bearer ${apiKey}`;
    }
  }

  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(10_000) });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { models: [], error: `Provider returned ${res.status}: ${text.slice(0, 200)}` };
    }

    const json = (await res.json()) as Record<string, unknown>;
    // Handle different response formats: { data: [...] } (OpenAI), { models: [...] }, or [...]
    const rawModels = Array.isArray(json.data)
      ? json.data
      : Array.isArray(json.models)
        ? json.models
        : Array.isArray(json)
          ? json
          : null;
    if (!rawModels) {
      return { models: [], error: 'Unexpected response format (no model array found)' };
    }

    const models: ModelEntry[] = (rawModels as Array<Record<string, unknown>>)
      .filter((m) => m.id)
      .map((m) => {
        const display =
          (typeof m.name === 'string' && m.name) ||
          (typeof m.display_name === 'string' && m.display_name) ||
          '';
        return {
          id: String(m.id),
          name: display || String(m.id),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return { models };
  } catch (err) {
    return { models: [], error: formatFetchError(err) };
  }
});
