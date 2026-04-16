import type { Client, KanbanStatus, Activity, Deal, TimelineEvent } from '@/types/client';

const API_URL = import.meta.env.VITE_API_URL || '';

let localClients: Client[] = [];
let localActivities: Activity[] = [];
let localDeals: Deal[] = [];
let localTimeline: TimelineEvent[] = [];

function load<T>(key: string): T[] {
  try {
    const d = localStorage.getItem(key);
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}
function save(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
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
  } catch { return null; }
}

// ─── Clients ───
export async function getClients(): Promise<Client[]> {
  const remote = await tryFetch<Client[]>('/clients');
  if (remote) return remote;
  localClients = load('crm_clients');
  return localClients;
}

export async function createClient(data: Omit<Client, 'id' | 'created_at'>): Promise<Client> {
  const remote = await tryFetch<Client>('/clients', { method: 'POST', body: JSON.stringify(data) });
  if (remote) return remote;
  const client: Client = { ...data, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  localClients = load('crm_clients');
  localClients.push(client);
  save('crm_clients', localClients);
  addTimelineEvent({ client_id: client.id, type: 'created', description: `Cliente "${client.name}" criado` });
  return client;
}

export async function updateClient(id: string, data: Partial<Client>): Promise<Client | null> {
  const remote = await tryFetch<Client>(`/clients/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) });
  if (remote) return remote;
  localClients = load('crm_clients');
  const idx = localClients.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const old = localClients[idx];
  localClients[idx] = { ...old, ...data };
  save('crm_clients', localClients);
  if (data.status && data.status !== old.status) {
    addTimelineEvent({ client_id: id, type: 'status_change', description: `Status alterado para "${data.status}"` });
  }
  return localClients[idx];
}

export async function deleteClient(id: string): Promise<boolean> {
  const remote = await tryFetch<{ ok: boolean }>(`/clients/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (remote) return true;
  localClients = load('crm_clients');
  localClients = localClients.filter((c) => c.id !== id);
  save('crm_clients', localClients);
  return true;
}

// ─── Activities ───
export async function getActivities(): Promise<Activity[]> {
  const remote = await tryFetch<Activity[]>('/activities');
  if (remote) return remote;
  return load('crm_activities');
}

export async function createActivity(data: Omit<Activity, 'id' | 'created_at' | 'completed'>): Promise<Activity> {
  const activity: Activity = { ...data, id: crypto.randomUUID(), completed: false, created_at: new Date().toISOString() };
  localActivities = load('crm_activities');
  localActivities.push(activity);
  save('crm_activities', localActivities);
  addTimelineEvent({ client_id: data.client_id, type: 'task', description: `Atividade "${data.title}" criada` });
  return activity;
}

export async function updateActivity(id: string, data: Partial<Activity>): Promise<Activity | null> {
  localActivities = load('crm_activities');
  const idx = localActivities.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  localActivities[idx] = { ...localActivities[idx], ...data };
  save('crm_activities', localActivities);
  return localActivities[idx];
}

export async function deleteActivity(id: string): Promise<boolean> {
  localActivities = load('crm_activities');
  localActivities = localActivities.filter((a) => a.id !== id);
  save('crm_activities', localActivities);
  return true;
}

// ─── Deals ───
export async function getDeals(): Promise<Deal[]> {
  const remote = await tryFetch<Deal[]>('/deals');
  if (remote) return remote;
  return load('crm_deals');
}

export async function createDeal(data: Omit<Deal, 'id' | 'created_at'>): Promise<Deal> {
  const deal: Deal = { ...data, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  localDeals = load('crm_deals');
  localDeals.push(deal);
  save('crm_deals', localDeals);
  addTimelineEvent({ client_id: data.client_id, type: 'deal', description: `Negócio "${data.title}" criado - R$ ${data.value.toLocaleString('pt-BR')}` });
  return deal;
}

export async function updateDeal(id: string, data: Partial<Deal>): Promise<Deal | null> {
  localDeals = load('crm_deals');
  const idx = localDeals.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  localDeals[idx] = { ...localDeals[idx], ...data };
  save('crm_deals', localDeals);
  return localDeals[idx];
}

export async function deleteDeal(id: string): Promise<boolean> {
  localDeals = load('crm_deals');
  localDeals = localDeals.filter((d) => d.id !== id);
  save('crm_deals', localDeals);
  return true;
}

// ─── Timeline ───
export async function getTimeline(clientId?: string): Promise<TimelineEvent[]> {
  localTimeline = load('crm_timeline');
  if (clientId) return localTimeline.filter((e) => e.client_id === clientId);
  return localTimeline;
}

function addTimelineEvent(data: Omit<TimelineEvent, 'id' | 'created_at'>) {
  localTimeline = load('crm_timeline');
  localTimeline.push({ ...data, id: crypto.randomUUID(), created_at: new Date().toISOString() });
  save('crm_timeline', localTimeline);
}

export { addTimelineEvent as createTimelineEvent };
