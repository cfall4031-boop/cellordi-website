/**
 * Shared client info persisted in localStorage.
 * Both Rendezvous and Decharge read/write this so the
 * user never has to type their name/email/phone twice.
 */

const KEY = "cellordi_client";

export type StoredClient = {
  prenom?: string;
  nom?: string;
  email?: string;
  telephone?: string;
  appareil?: string;   // type d'appareil (partagé entre Rendezvous service et Decharge appareil)
  probleme?: string;   // description du problème
};

export function loadClient(): StoredClient {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveClient(patch: StoredClient) {
  try {
    const current = loadClient();
    localStorage.setItem(KEY, JSON.stringify({ ...current, ...patch }));
  } catch {
    // localStorage unavailable (e.g. private mode with strict settings) — ignore
  }
}
