// ── Client API centralisé — Réparation CeLL&Ordi ─────────────

const BASE = (import.meta.env.VITE_API_URL as string) || "/api";

export function getToken(): string | null {
  return localStorage.getItem("cellordi_token");
}
export function setToken(token: string): void {
  localStorage.setItem("cellordi_token", token);
}
export function removeToken(): void {
  localStorage.removeItem("cellordi_token");
}

async function req<T = unknown>(
  method: string,
  path: string,
  body: unknown = null,
  isPublic = false
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (!isPublic) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).erreur || `Erreur ${res.status}`);
  return data as T;
}

// ── AUTH ─────────────────────────────────────────────────────
export const authApi = {
  login:  (email: string, password: string) =>
    req<{ token: string; admin: { id: number; email: string; nom: string } }>(
      "POST", "/auth/login", { email, password }, true
    ),
  me:     () => req<{ id: number; email: string; nom: string }>("GET", "/auth/me"),
  logout: () => { removeToken(); },
};

// ── RENDEZ-VOUS ──────────────────────────────────────────────
export const rdvApi = {
  getAll:            (params: Record<string, string> = {}) =>
    req<{ rendezvous: any[] }>("GET", "/rendezvous" + toQuery(params)),
  getOne:            (id: number) => req<any>("GET", `/rendezvous/${id}`),
  create:            (data: Record<string, unknown>) =>
    req<{ message: string; id: number; numero_ticket?: string | null }>("POST", "/rendezvous", data, true),
  createAdmin:       (data: Record<string, unknown>) =>
    req<{ message: string; id: number; numero_ticket?: string | null }>("POST", "/rendezvous", data),
  updateStatut:      (id: number, statut: string) =>
    req<{ message: string }>("PATCH", `/rendezvous/${id}/statut`, { statut }),
  delete:            (id: number) => req<{ message: string }>("DELETE", `/rendezvous/${id}`),
  getDisponibilites: () =>
    req<{ disponibilites: { id: number; jour: number; heure: string; actif: number }[] }>("GET", "/rendezvous/disponibilites"),
  toggleSlot:        (jour: number, heure: string) =>
    req<{ slot: { jour: number; heure: string; actif: number } }>("POST", "/rendezvous/disponibilites", { jour, heure }),
  getSlots:          (date: string) =>
    req<{ slots: string[] }>("GET", `/rendezvous/slots?date=${date}`),
};

// ── TICKETS ──────────────────────────────────────────────────
export const ticketsApi = {
  getAll:  (params: Record<string, string> = {}) =>
    req<{ tickets: any[] }>("GET", "/tickets" + toQuery(params)),
  getOne:  (id: number) => req<any>("GET", `/tickets/${id}`),
  suivi:   (numero: string) => req<any>("GET", `/tickets/suivi/${numero}`, null, true),
  create:  (data: Record<string, unknown>) =>
    req<{ message: string; id: number; numero: string }>("POST", "/tickets", data),
  update:  (id: number, data: Record<string, unknown>) =>
    req<{ message: string }>("PATCH", `/tickets/${id}`, data),
  delete:  (id: number) => req<{ message: string }>("DELETE", `/tickets/${id}`),
};

// ── CLIENTS ──────────────────────────────────────────────────
export const clientsApi = {
  getAll:  (params: Record<string, string> = {}) =>
    req<{ clients: any[] }>("GET", "/clients" + toQuery(params)),
  getOne:  (id: number) => req<any>("GET", `/clients/${id}`),
  create:  (data: Record<string, unknown>) => req<any>("POST", "/clients", data),
  update:  (id: number, data: Record<string, unknown>) => req<any>("PATCH", `/clients/${id}`, data),
  delete:  (id: number) => req<any>("DELETE", `/clients/${id}`),
};

// ── MESSAGES ─────────────────────────────────────────────────
export const messagesApi = {
  getAll:      (params: Record<string, string> = {}) =>
    req<{ messages: any[]; non_lus: number }>("GET", "/messages" + toQuery(params)),
  send:        (data: Record<string, string>) =>
    req<{ message: string }>("POST", "/messages", data, true),
  markLu:     (id: number) => req<any>("PATCH", `/messages/${id}/lu`),
  markRepondu:(id: number) => req<any>("PATCH", `/messages/${id}/repondu`),
  reply:      (id: number, replyText: string) =>
    req<{ success: boolean; replied_at: string }>("POST", `/messages/${id}/reply`, { replyText }),
  archive:     (id: number) => req<{ message: string }>("PATCH", `/messages/${id}/archive`),
  unarchive:   (id: number) => req<{ message: string }>("PATCH", `/messages/${id}/unarchive`),
  delete:      (id: number) => req<any>("DELETE", `/messages/${id}`),
};

// ── DÉCHARGES ────────────────────────────────────────────────
export const dechargesApi = {
  getAll:      (params: Record<string, string> = {}) =>
    req<{ decharges: any[] }>("GET", "/decharges" + toQuery(params)),
  getOne:      (id: number) => req<any>("GET", `/decharges/${id}`),
  create:      (data: Record<string, unknown>) => req<any>("POST", "/decharges", data),
  updateStatut:(id: number, statut: string) =>
    req<any>("PATCH", `/decharges/${id}/statut`, { statut }),
  delete:      (id: number) => req<any>("DELETE", `/decharges/${id}`),
};

// ── HELPER ───────────────────────────────────────────────────
function toQuery(params: Record<string, string>): string {
  const q = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "") as [string, string][]
  ).toString();
  return q ? `?${q}` : "";
}
