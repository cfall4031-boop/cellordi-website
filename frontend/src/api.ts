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
  resetDisponibilites: () =>
    req<{ message: string; disponibilites: any[] }>("POST", "/rendezvous/disponibilites/reset"),
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
  // Tracking updates
  getUpdates:   (id: number) => req<{ updates: any[] }>("GET", `/tickets/${id}/updates`),
  addUpdate:    (id: number, message: string) => req<any>("POST", `/tickets/${id}/updates`, { message }),
  deleteUpdate: (id: number, updateId: number) => req<any>("DELETE", `/tickets/${id}/updates/${updateId}`),
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

// ── CALCULATEUR DE PRIX ────────────────────────────────────────
export const prixApi = {
  getCatalogue:     (params: Record<string, string> = {}) =>
    req<{ pieces: any[] }>("GET", "/prix/catalogue" + toQuery(params)),
  addPiece:         (data: Record<string, unknown>) =>
    req<{ message: string; id: number }>("POST", "/prix/catalogue", data),
  updatePiece:      (id: number, data: Record<string, unknown>) =>
    req<{ message: string }>("PATCH", `/prix/catalogue/${id}`, data),
  deletePiece:      (id: number) =>
    req<{ message: string }>("DELETE", `/prix/catalogue/${id}`),
  addDemande:       (id: number, qty: number = 1) =>
    req<{ message: string; nb_demandes: number }>("POST", `/prix/catalogue/${id}/demande`, { qty }),

  getConcurrents:   (params: Record<string, string> = {}) =>
    req<{ concurrents: any[] }>("GET", "/prix/concurrents" + toQuery(params)),
  addConcurrent:    (data: Record<string, unknown>) =>
    req<{ message: string; id: number }>("POST", "/prix/concurrents", data),
  updateConcurrent: (id: number, data: Record<string, unknown>) =>
    req<{ message: string }>("PATCH", `/prix/concurrents/${id}`, data),
  deleteConcurrent: (id: number) =>
    req<{ message: string }>("DELETE", `/prix/concurrents/${id}`),

  getAppareils:     (params: Record<string, string> = {}) =>
    req<{ appareils: any[] }>("GET", "/prix/appareils" + toQuery(params)),
  addAppareil:      (data: Record<string, unknown>) =>
    req<{ message: string; id: number }>("POST", "/prix/appareils", data),
  updateAppareil:   (id: number, data: Record<string, unknown>) =>
    req<{ message: string }>("PATCH", `/prix/appareils/${id}`, data),
  deleteAppareil:   (id: number) =>
    req<{ message: string }>("DELETE", `/prix/appareils/${id}`),

  calculer:         (params: Record<string, string>) =>
    req<any>("GET", "/prix/calculer" + toQuery(params)),
};

// ── NOTIFICATIONS PUSH ──────────────────────────────────────
export const notificationsApi = {
  getVapidKey:  () => req<{ publicKey: string }>("GET", "/notifications/vapid-key", null, true),
  subscribe:    (subscription: PushSubscriptionJSON) =>
    req<{ message: string }>("POST", "/notifications/subscribe", subscription),
  unsubscribe:  (endpoint: string) =>
    req<{ message: string }>("DELETE", "/notifications/unsubscribe", { endpoint }),
  status:       () => req<{ pushEnabled: boolean; subscriberCount: number; vapidKeyPrefix: string }>("GET", "/notifications/status"),
  test:         () => req<{ message: string; sent: number }>("POST", "/notifications/test"),
  purge:        () => req<{ message: string; deleted: number }>("DELETE", "/notifications/purge"),
};

// ── HELPER ───────────────────────────────────────────────────
function toQuery(params: Record<string, string>): string {
  const q = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "") as [string, string][]
  ).toString();
  return q ? `?${q}` : "";
}
