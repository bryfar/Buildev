import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { v4 as uuidv4 } from "uuid";
import type { BSPage, BSBlock, BSVariant } from "@buildersite/sdk";
import { useAuthStore } from "./auth";
import { createBlock } from "../data/blocks";
import { resolveApiBase } from "../utils/apiBase";

const API = resolveApiBase(import.meta.env.VITE_API_URL);

interface ExtendedPage extends BSPage {
  prompt?: string;
  mode?: 'ai' | 'normal' | 'figma';
}

export const usePagesStore = defineStore("pages", () => {
  const auth = useAuthStore();
  const sites = ref<any[]>(JSON.parse(localStorage.getItem("buildersite_sites") || "[]"));
  const currentSiteId = ref<string | null>(localStorage.getItem("buildersite_site_id"));
  const pages = ref<ExtendedPage[]>([]);
  const currentPage = ref<ExtendedPage | null>(null);
  const selectedBlockId = ref<string | null>(null);
  const isLoading = ref(false);
  const draggingBlockType = ref<string | null>(null);
  const draggingSymbolId = ref<string | null>(null);
  const currentBreakpoint = ref<'desktop' | 'tablet' | 'mobile'>('desktop');
  const components = ref<any[]>([]);
  const assets = ref<any[]>([]);
  
  // Initialize pages after currentSiteId is available
  const localPages = localStorage.getItem(`buildersite_pages_${currentSiteId.value}`);
  if (localPages) {
    try {
      pages.value = JSON.parse(localPages);
    } catch (e) {
      console.error("Failed to parse local pages", e);
    }
  }

  // Sync to localStorage
  watch(sites, (newSites) => {
    localStorage.setItem("buildersite_sites", JSON.stringify(newSites));
  }, { deep: true });

  watch(pages, (newPages) => {
    localStorage.setItem(`buildersite_pages_${currentSiteId.value}`, JSON.stringify(newPages));
  }, { deep: true });

  function getCommonHeaders() {
    const headers: Record<string, string> = { ...auth.authHeaders() };
    if (currentSiteId.value) {
      headers["x-site-id"] = currentSiteId.value;
    }
    return headers;
  }

  // Undo/Redo history
  const history = ref<string[]>([]);
  const historyIndex = ref(-1);

  function saveToHistory() {
    if (!currentPage.value) return;
    const snapshot = JSON.stringify(currentPage.value.blocks);
    if (historyIndex.value >= 0 && snapshot === history.value[historyIndex.value]) return;

    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1);
    }
    history.value.push(snapshot);
    if (history.value.length > 50) history.value.shift();
    historyIndex.value = history.value.length - 1;
  }

  function undo() {
    if (historyIndex.value > 0 && currentPage.value) {
      historyIndex.value--;
      currentPage.value.blocks = JSON.parse(history.value[historyIndex.value]);
    }
  }

  function redo() {
    if (historyIndex.value < history.value.length - 1 && currentPage.value) {
      historyIndex.value++;
      currentPage.value.blocks = JSON.parse(history.value[historyIndex.value]);
    }
  }

  async function loadPages() {
    if (!currentSiteId.value) return;
    isLoading.value = true;
    try {
      const res = await fetch(`${API}/api/pages`, { headers: getCommonHeaders() });
      const json = await res.json();
      if (json.ok) {
        pages.value = json.data;
      }
    } catch (err) {
      console.warn("Store: loadPages from backend failed, using local fallback", err);
      const local = localStorage.getItem(`buildersite_pages_${currentSiteId.value}`);
      if (local) pages.value = JSON.parse(local);
    } finally {
      isLoading.value = false;
    }
  }

  async function loadSites() {
    isLoading.value = true;
    try {
      const res = await fetch(`${API}/api/sites`, { headers: auth.authHeaders() });
      const json = await res.json();
      if (json.ok) {
        sites.value = json.data;
      }
    } catch (err) {
      console.warn("Store: loadSites from backend failed, using local fallback", err);
      // Logic handled by watch and initial ref value
    } finally {
      isLoading.value = false;
    }
  }

  async function createSite(name: string, options: Record<string, unknown> = {}) {
    try {
      const res = await fetch(`${API}/api/sites`, {
        method: "POST",
        headers: { ...auth.authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name,
          ...options
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        data?: Record<string, unknown> & { id: string };
        token?: string;
        error?: unknown;
      };
      if (json.ok && json.data) {
        sites.value.unshift(json.data);
        const uid = auth.userId;
        if (typeof json.token === "string" && json.token.length > 0 && typeof uid === "string" && uid.length > 0) {
          auth.persistSession({
            token: json.token,
            userId: uid,
            siteId: json.data.id,
            role: auth.role ?? undefined,
          });
        }
        return json.data;
      } else {
        throw new Error(typeof json.error === "string" ? json.error : "Failed to create site");
      }
    } catch (err) {
      void err;
      const localSite = {
        id: uuidv4(),
        name,
        ...options,
        createdAt: new Date().toISOString()
      };
      sites.value.unshift(localSite);
      return localSite;
    }
  }

  async function selectSite(id: string) {
    currentSiteId.value = id;
    localStorage.setItem("buildersite_site_id", id);
    await loadPages();
  }

  async function loadPage(id: string) {
    isLoading.value = true;
    try {
      const res = await fetch(`${API}/api/pages/${id}`, { headers: getCommonHeaders() });
      const json = await res.json();
      if (json.ok) {
        currentPage.value = json.data;
        history.value = [JSON.stringify(json.data.blocks)];
        historyIndex.value = 0;
      }
    } catch (err) {
      console.warn("Store: loadPage backend error, using local fallback", err);
      const local = pages.value.find(p => p.id === id);
      if (local) {
        currentPage.value = local;
        history.value = [JSON.stringify(local.blocks || [])];
        historyIndex.value = 0;
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function createPage(name: string, urlPath: string, options: any = {}) {
    if (!currentSiteId.value) return null;
    isLoading.value = true;
    try {
      const res = await fetch(`${API}/api/pages`, {
        method: "POST",
        headers: { ...getCommonHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: currentSiteId.value, name, urlPath, ...options }),
      });
      const json = await res.json();
      if (json.ok) {
        pages.value.push(json.data);
        return json.data;
      }
    } catch (err) {
      console.warn("Store: createPage backend error, creating locally", err);
      const localPage = {
        id: uuidv4(),
        siteId: currentSiteId.value,
        name,
        urlPath,
        blocks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...options
      };
      pages.value.push(localPage);
      return localPage;
    } finally {
      isLoading.value = false;
    }
    return null;
  }

  async function savePage() {
    if (!currentPage.value) return;
    await fetch(`${API}/api/pages/${currentPage.value.id}`, {
      method: "PATCH",
      headers: auth.authHeaders(),
      body: JSON.stringify({ blocks: currentPage.value.blocks }),
    });
  }

  async function publishPage(id: string) {
    const res = await fetch(`${API}/api/pages/${id}/publish`, {
      method: "POST", headers: auth.authHeaders(),
    });
    const json = await res.json();
    if (json.ok && currentPage.value?.id === id) {
      currentPage.value.status = "published";
    }
  }

  function addBlock(block: BSBlock, parentId?: string) {
    if (!currentPage.value) return;
    saveToHistory();
    if (parentId) {
      const parent = findBlock(currentPage.value.blocks, parentId);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(block);
        saveToHistory();
        return;
      }
    }
    currentPage.value.blocks.push(block);
    saveToHistory();
  }

  function updateBlock(id: string, props: Record<string, unknown>) {
    if (!currentPage.value) return;
    const block = findBlock(currentPage.value.blocks, id);
    if (block) {
      saveToHistory();
      Object.assign(block.props, props);
      saveToHistory();
    }
  }

  function removeBlock(id: string) {
    if (!currentPage.value) return;
    saveToHistory();
    currentPage.value.blocks = removeBlockById(currentPage.value.blocks, id);
    saveToHistory();
  }

  function moveBlock(id: string, direction: "up" | "down") {
    if (!currentPage.value) return;
    saveToHistory();
    currentPage.value.blocks = moveInTree(currentPage.value.blocks, id, direction);
    saveToHistory();
  }

  function nudgeBlock(id: string, dx: number, dy: number) {
    if (!currentPage.value) return;
    const block = findBlock(currentPage.value.blocks, id);
    if (!block) return;
    saveToHistory();
    
    const props = block.props as any;
    const currentML = parseInt(String(props.marginLeft || 0)) || 0;
    props.marginLeft = (currentML + dx) + 'px';
    
    const currentMT = parseInt(String(props.marginTop || 0)) || 0;
    props.marginTop = (currentMT + dy) + 'px';

    saveToHistory();
  }

  function duplicateBlock(id: string) {
    if (!currentPage.value) return;
    const original = findBlock(currentPage.value.blocks, id);
    if (!original) return;
    
    saveToHistory();
    const cloned = cloneBlockWithNewIds(original);
    
    // Find parent array to splice into
    const parent = findParentOfBlock(currentPage.value.blocks, id);
    if (parent) {
      const idx = parent.children!.findIndex(b => b.id === id);
      parent.children!.splice(idx + 1, 0, cloned);
    } else {
      const idx = currentPage.value.blocks.findIndex(b => b.id === id);
      if (idx !== -1) {
         currentPage.value.blocks.splice(idx + 1, 0, cloned);
      }
    }
    
    selectedBlockId.value = cloned.id;
    saveToHistory();
  }

  function selectBlock(id: string | null) {
    selectedBlockId.value = id;
  }

  function getSelectedBlock(): BSBlock | null {
    if (!currentPage.value || !selectedBlockId.value) return null;
    return findBlock(currentPage.value.blocks, selectedBlockId.value);
  }

  async function deletePage(id: string) {
    isLoading.value = true;
    const res = await fetch(`${API}/api/pages/${id}`, {
      method: "DELETE",
      headers: auth.authHeaders(),
    });
    const json = await res.json();
    if (json.ok) {
      pages.value = pages.value.filter((p) => p.id !== id);
    }
    isLoading.value = false;
  }

  async function duplicatePage(id: string) {
    isLoading.value = true;
    const res = await fetch(`${API}/api/pages/${id}/duplicate`, {
      method: "POST",
      headers: auth.authHeaders(),
    });
    const json = await res.json();
    if (json.ok) {
      await loadPages();
    }
    isLoading.value = false;
  }

  async function updatePage(id: string, data: Partial<BSPage>) {
    isLoading.value = true;
    const res = await fetch(`${API}/api/pages/${id}`, {
      method: "PATCH",
      headers: auth.authHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.ok) {
      const idx = pages.value.findIndex((p) => p.id === id);
      if (idx !== -1) pages.value[idx] = { ...pages.value[idx], ...json.data };
    }
    isLoading.value = false;
  }

  async function loadComponents() {
    const res = await fetch(`${API}/api/components`, { headers: auth.authHeaders() });
    const json = await res.json();
    if (json.ok) components.value = json.data;
  }

  async function saveAsComponent(name: string, block: BSBlock) {
    isLoading.value = true;
    const res = await fetch(`${API}/api/components`, {
      method: "POST",
      headers: auth.authHeaders(),
      body: JSON.stringify({ name, rootBlock: block }),
    });
    const json = await res.json();
    if (json.ok) {
      components.value.unshift(json.data);
    }
    isLoading.value = false;
  }

  async function deleteComponent(id: string) {
    isLoading.value = true;
    try {
      const res = await fetch(`${API}/api/components/${id}`, {
        method: "DELETE",
        headers: getCommonHeaders(),
      });
      const json = await res.json();
      if (json.ok) {
        components.value = components.value.filter((component: { id: string }) => component.id !== id);
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function loadAssets() {
    const res = await fetch(`${API}/api/assets`, { headers: auth.authHeaders() });
    const json = await res.json();
    if (json.ok) assets.value = json.data;
  }

  function handleDrop(parentId?: string) {
    if (draggingBlockType.value) {
      const block = createBlock(draggingBlockType.value);
      addBlock(block, parentId);
      selectBlock(block.id);
      draggingBlockType.value = null;
    } else if (draggingSymbolId.value) {
      const symbol = components.value.find((c: any) => c.id === draggingSymbolId.value);
      if (symbol) {
        const block = JSON.parse(symbol.rootBlockJson);
        const clonedBlock = cloneBlockWithNewIds(block);
        addBlock(clonedBlock, parentId);
        selectBlock(clonedBlock.id);
      }
      draggingSymbolId.value = null;
    }
  }

  function cloneBlockWithNewIds(block: BSBlock): BSBlock {
    const newBlock = JSON.parse(JSON.stringify(block));
    const regenerateIds = (b: BSBlock) => {
      b.id = uuidv4();
      if (b.children) b.children.forEach(regenerateIds);
    };
    regenerateIds(newBlock);
    return newBlock;
  }

  return {
    pages, currentPage, selectedBlockId, isLoading, historyIndex, historyList: history,
    loadPages, loadPage, createPage, savePage, publishPage,
    addBlock, updateBlock, removeBlock, moveBlock, nudgeBlock, duplicateBlock, selectBlock, getSelectedBlock,
    undo, redo, draggingBlockType, draggingSymbolId, handleDrop, deletePage, duplicatePage, updatePage,
    currentBreakpoint, components, assets, loadComponents, saveAsComponent, deleteComponent, loadAssets,
    sites, currentSiteId, loadSites, createSite, selectSite, getCommonHeaders
  };
});

function moveInTree(blocks: BSBlock[], id: string, direction: "up" | "down"): BSBlock[] {
  const idx = blocks.findIndex(b => b.id === id);
  if (idx !== -1) {
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx >= 0 && swapIdx < blocks.length) {
      const newBlocks = [...blocks];
      [newBlocks[idx], newBlocks[swapIdx]] = [newBlocks[swapIdx], newBlocks[idx]];
      return newBlocks;
    }
    return blocks;
  }
  return blocks.map(b => ({
    ...b,
    children: b.children ? moveInTree(b.children, id, direction) : undefined
  }));
}

function findBlock(blocks: BSBlock[], id: string): BSBlock | null {
  for (const b of blocks) {
    if (b.id === id) return b;
    if (b.children) {
      const found = findBlock(b.children, id);
      if (found) return found;
    }
  }
  return null;
}

function findParentOfBlock(blocks: BSBlock[], id: string): BSBlock | null {
  for (const b of blocks) {
    if (b.children?.some(c => c.id === id)) return b;
    if (b.children) {
      const found = findParentOfBlock(b.children, id);
      if (found) return found;
    }
  }
  return null;
}

function removeBlockById(blocks: BSBlock[], id: string): BSBlock[] {
  return blocks
    .filter((b) => b.id !== id)
    .map((b) => ({ ...b, children: b.children ? removeBlockById(b.children, id) : undefined }));
}
