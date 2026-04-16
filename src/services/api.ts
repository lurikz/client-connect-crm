import type { Client, KanbanStatus } from '@/types/client';

const API_URL = import.meta.env.VITE_API_URL || '';

// In-memory fallback when no backend is available
let localClients: Client[] = [];

function loadLocal(): Client[] {
  try {
    const data = localStorage.getItem('crm_clients');
    if (data) localClients = JSON.parse(data);
  } catch { /* ignore */ }
  return localClients;
}

function saveLocal() {
  localStorage.setItem('crm_clients', JSON.stringify(localClients));
}

async function tryFetch<T>(url: string, opts?: RequestInit): Promise<T | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}${url}`, {
      ...opts,
      headers: { 'Content-Type': 'application/json', ...opts?.headers },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getClients(): Promise<Client[]> {
  const remote = await tryFetch<Client[]>('/clients');
  if (remote) return remote;
  return loadLocal();
}

export async function createClient(data: Omit<Client, 'id' | 'created_at'>): Promise<Client> {
  const remote = await tryFetch<Client>('/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (remote) return remote;

  const client: Client = {
    ...data,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  loadLocal();
  localClients.push(client);
  saveLocal();
  return client;
}

export async function updateClient(id: string, data: Partial<Client>): Promise<Client | null> {
  const remote = await tryFetch<Client>(`/clients/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (remote) return remote;

  loadLocal();
  const idx = localClients.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  localClients[idx] = { ...localClients[idx], ...data };
  saveLocal();
  return localClients[idx];
}
