import React, { useState, useEffect, useCallback, useRef } from 'react';
import { marked } from 'marked';
import { biblioApi, getToken } from '../../api';

const API_BASE = (import.meta.env.VITE_API_URL as string) || '/api';

const NAVY    = '#0b1c35';
const NAVY_M  = '#0e2040';
const NAVY_L  = '#112850';
const GREEN   = '#6dd400';
const RED     = '#ff4d4d';
const BLUE    = '#38bdf8';
const GRAY    = '#8899aa';
const GRAY_D  = '#56687a';

type Dossier = { id: number; parent_id: number | null; nom: string };
type Tag     = { id: number; label: string; couleur: string };
type Doc     = {
  id: number; dossier_id: number | null; titre: string; description: string;
  type_fichier: string; nom_fichier: string | null; taille: number;
  contenu: string | null; created_at: string; updated_at: string;
  ouvert_at: string | null; supprime_at: string | null; tags: Tag[];
};
type Version = { id: number; doc_id: number; taille: number; created_at: string };
type Note    = { id: number; doc_id: number; contenu: string; created_at: string; updated_at: string };

const fmtSize = (b: number) => b < 1024 ? `${b} o` : b < 1048576 ? `${(b/1024).toFixed(1)} Ko` : `${(b/1048576).toFixed(1)} Mo`;
const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-CA', { day:'2-digit', month:'short', year:'numeric' });
const typeIcon = (t: string) => ({ md:'📝', txt:'📄', pdf:'📕', image:'🖼️', office:'📊', autre:'📎' }[t] ?? '📎');
const typeLabel = (t: string) => ({ md:'Markdown', txt:'Texte', pdf:'PDF', image:'Image', office:'Office', autre:'Autre' }[t] ?? t);
const fileUrl  = (id: number) => `${API_BASE}/biblio/docs/${id}/file?token=${encodeURIComponent(getToken() ?? '')}`;

function buildTree(dossiers: Dossier[]): (Dossier & { children: Dossier[] })[] {
  const map = new Map<number, Dossier & { children: Dossier[] }>();
  dossiers.forEach(d => map.set(d.id, { ...d, children: [] }));
  const roots: (Dossier & { children: Dossier[] })[] = [];
  map.forEach(d => {
    if (d.parent_id && map.has(d.parent_id)) map.get(d.parent_id)!.children.push(d);
    else roots.push(d);
  });
  return roots;
}

function renderMd(md: string): string {
  try { return String(marked.parse(md, { breaks: true, gfm: true })); }
  catch { return `<pre>${md}</pre>`; }
}

const BTN: React.CSSProperties = {
  border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600,
  fontSize: '0.8rem', padding: '0.4rem 0.8rem',
};

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: NAVY_M, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ flex: 1, fontWeight: 700, color: '#fff' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: GRAY, fontSize: '1.1rem' }}>✕</button>
        </div>
        <div style={{ padding: '1.2rem' }}>{children}</div>
      </div>
    </div>
  );
}

export default function Bibliotheque() {
  // ── View state ────────────────────────────────────────────
  const [view, setView]         = useState<{ type: string; id?: number }>({ type: 'all' });
  const [searchQ, setSearchQ]   = useState('');
  const [filterType, setFType]  = useState('');
  const [sortBy, setSortBy]     = useState('updated_desc');
  const [viewMode, setViewMode] = useState<'liste' | 'grille'>('liste');
  const [sidebarOpen, setSB]    = useState(false);

  // ── Data ──────────────────────────────────────────────────
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [allTags, setTags]      = useState<Tag[]>([]);
  const [docs, setDocs]         = useState<Doc[]>([]);
  const [loading, setLoading]   = useState(false);

  // ── Detail ────────────────────────────────────────────────
  const [detail, setDetail]     = useState<Doc | null>(null);
  const [dlLoad, setDlLoad]     = useState(false);
  const [docTab, setDocTab]     = useState<'apercu' | 'modifier' | 'versions' | 'notes'>('apercu');
  const [versions, setVers]     = useState<Version[]>([]);
  const [notes, setNotes]       = useState<Note[]>([]);
  const [editTitle, setET]      = useState('');
  const [editCont, setEC]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [noteInput, setNI]      = useState('');
  const [editNoteId, setENId]   = useState<number | null>(null);
  const [editNoteTxt, setENT]   = useState('');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  // ── Modals ────────────────────────────────────────────────
  const [uploadMod, setUpMod]   = useState(false);
  const [textMod, setTxMod]     = useState(false);
  const [dossierMod, setDMod]   = useState<{ mode: 'new'; parent?: Dossier } | { mode: 'rename'; target: Dossier } | null>(null);
  const [tagMod, setTagMod]     = useState(false);

  // ── Upload form ───────────────────────────────────────────
  const [upFile, setUpFile]     = useState<File | null>(null);
  const [upTitle, setUpTitle]   = useState('');
  const [upDossier, setUpDos]   = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileRef                 = useRef<HTMLInputElement>(null);

  // ── Text create form ──────────────────────────────────────
  const [nwTitle, setNwTitle]   = useState('');
  const [nwType, setNwType]     = useState<'md' | 'txt'>('md');
  const [nwCont, setNwCont]     = useState('');
  const [nwDos, setNwDos]       = useState<string>('');
  const [creating, setCreating] = useState(false);

  // ── Dossier form ──────────────────────────────────────────
  const [dosName, setDosName]   = useState('');

  // ── Tag form ──────────────────────────────────────────────
  const [tagLabel, setTagLabel] = useState('');
  const [tagColor, setTagColor] = useState('#6B7280');
  const [editTagId, setEditTagId] = useState<number | null>(null);

  // ── Load ──────────────────────────────────────────────────
  const loadMeta = useCallback(async () => {
    const [d, t] = await Promise.all([biblioApi.getDossiers(), biblioApi.getTags()]);
    setDossiers(d.dossiers); setTags(t.tags);
  }, []);

  const loadDocs = useCallback(async () => {
    setLoading(true);
    try {
      if (view.type === 'recents') {
        const d = await biblioApi.getRecents(); setDocs(d.docs);
      } else if (view.type === 'corbeille') {
        const d = await biblioApi.getDocs({ corbeille: '1' }); setDocs(d.docs);
      } else if (searchQ.trim()) {
        const d = await biblioApi.search({ q: searchQ, ...(filterType && { type: filterType }) });
        setDocs(d.docs);
      } else {
        const p: Record<string, string> = { tri: sortBy };
        if (view.type === 'dossier' && view.id) p.dossier = String(view.id);
        if (view.type === 'racine') p.dossier = 'racine';
        if (filterType) p.type = filterType;
        const d = await biblioApi.getDocs(p); setDocs(d.docs);
      }
    } catch {}
    setLoading(false);
  }, [view, searchQ, filterType, sortBy]);

  useEffect(() => { loadMeta(); }, [loadMeta]);
  useEffect(() => { loadDocs(); }, [loadDocs]);

  useEffect(() => {
    if (docTab !== 'apercu' || !detail || detail.type_fichier !== 'pdf') {
      setPdfBlobUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE}/biblio/docs/${detail.id}/file`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok || cancelled) return;
        const blob = await res.blob();
        if (!cancelled) setPdfBlobUrl(URL.createObjectURL(blob));
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [detail?.id, docTab]);

  const openDoc = useCallback(async (id: number) => {
    if (detail?.id === id) return;
    setDlLoad(true); setDetail(null); setDocTab('apercu');
    setVers([]); setNotes([]); setET(''); setEC('');
    try {
      const { doc } = await biblioApi.getDoc(id);
      setDetail(doc); setET(doc.titre); setEC(doc.contenu ?? '');
    } catch {}
    setDlLoad(false);
  }, [detail?.id]);

  const loadVersions = useCallback(async (id: number) => {
    const { versions } = await biblioApi.getVersions(id); setVers(versions);
  }, []);

  const loadNotes = useCallback(async (id: number) => {
    const { notes } = await biblioApi.getNotes(id); setNotes(notes);
  }, []);

  const handleTabChange = useCallback((tab: 'apercu' | 'modifier' | 'versions' | 'notes') => {
    setDocTab(tab);
    if (!detail) return;
    if (tab === 'versions') loadVersions(detail.id);
    if (tab === 'notes')    loadNotes(detail.id);
  }, [detail, loadVersions, loadNotes]);

  const saveContent = async () => {
    if (!detail) return;
    setSaving(true);
    try {
      await biblioApi.updateDoc(detail.id, { titre: editTitle, contenu: editCont });
      setDetail(d => d ? { ...d, titre: editTitle, contenu: editCont } : d);
      setDocs(ds => ds.map(d => d.id === detail.id ? { ...d, titre: editTitle } : d));
    } catch {}
    setSaving(false);
  };

  const moveDoc = async (docId: number, dossierId: string) => {
    await biblioApi.updateDoc(docId, { dossier_id: dossierId || null });
    setDetail(d => d ? { ...d, dossier_id: dossierId ? Number(dossierId) : null } : d);
    loadDocs();
  };

  const doUpload = async () => {
    if (!upFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('fichier', upFile);
      fd.append('titre', upTitle || upFile.name);
      if (upDossier) fd.append('dossier_id', upDossier);
      await biblioApi.uploadFichier(fd);
      setUpMod(false); setUpFile(null); setUpTitle(''); setUpDos('');
      loadDocs();
    } catch {}
    setUploading(false);
  };

  const doCreateText = async () => {
    if (!nwTitle.trim()) return;
    setCreating(true);
    try {
      await biblioApi.createTexte({ titre: nwTitle, type_fichier: nwType, contenu: nwCont, dossier_id: nwDos || null });
      setTxMod(false); setNwTitle(''); setNwCont(''); setNwDos('');
      loadDocs();
    } catch {}
    setCreating(false);
  };

  const doCreateDossier = async () => {
    if (!dosName.trim() || !dossierMod) return;
    if (dossierMod.mode === 'new') {
      await biblioApi.createDossier({ nom: dosName });
    } else {
      await biblioApi.renameDossier(dossierMod.target.id, dosName);
    }
    setDMod(null); setDosName('');
    loadMeta();
  };

  const doDeleteDossier = async (d: Dossier) => {
    if (!confirm(`Supprimer le dossier "${d.nom}" ? Les documents seront déplacés à la racine.`)) return;
    await biblioApi.deleteDossier(d.id);
    loadMeta(); loadDocs();
  };

  const doDeleteDoc = async (id: number) => {
    await biblioApi.deleteDoc(id);
    if (detail?.id === id) setDetail(null);
    loadDocs();
  };

  const doRestoreDoc = async (id: number) => {
    await biblioApi.restaurerDoc(id);
    if (detail?.id === id) setDetail(null);
    loadDocs();
  };

  const doPermDelete = async (id: number) => {
    if (!confirm('Supprimer définitivement ce document ? Action irréversible.')) return;
    await biblioApi.supprimerDef(id);
    if (detail?.id === id) setDetail(null);
    loadDocs();
  };

  const addNote = async () => {
    if (!detail || !noteInput.trim()) return;
    await biblioApi.addNote(detail.id, noteInput);
    setNI(''); loadNotes(detail.id);
  };

  const saveNote = async (nid: number) => {
    if (!detail || !editNoteTxt.trim()) return;
    await biblioApi.updateNote(detail.id, nid, editNoteTxt);
    setEditNoteId(null); setENT(''); loadNotes(detail.id);
  };

  const delNote = async (nid: number) => {
    if (!detail) return;
    await biblioApi.deleteNote(detail.id, nid);
    loadNotes(detail.id);
  };

  const restoreVersion = async (vId: number) => {
    if (!detail) return;
    await biblioApi.restaurerVer(detail.id, vId);
    const { doc } = await biblioApi.getDoc(detail.id);
    setDetail(doc); setEC(doc.contenu ?? '');
    loadVersions(detail.id);
  };

  const saveTag = async () => {
    if (!tagLabel.trim()) return;
    if (editTagId) {
      await biblioApi.updateTag(editTagId, { label: tagLabel, couleur: tagColor });
    } else {
      await biblioApi.createTag({ label: tagLabel, couleur: tagColor });
    }
    setTagLabel(''); setTagColor('#6B7280'); setEditTagId(null);
    loadMeta();
  };

  const tree = buildTree(dossiers);

  // ── Styles ────────────────────────────────────────────────
  const SB: React.CSSProperties = {
    width: 240, minWidth: 240, background: NAVY_M, borderRight: `1px solid rgba(255,255,255,0.07)`,
    display: 'flex', flexDirection: 'column', overflowY: 'auto', flexShrink: 0,
    transition: 'transform 0.2s',
  };

  const navItem = (active: boolean): React.CSSProperties => ({
    padding: '0.45rem 1rem', cursor: 'pointer', borderRadius: 6,
    background: active ? 'rgba(109,212,0,0.1)' : 'transparent',
    color: active ? GREEN : GRAY,
    fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8,
    userSelect: 'none', margin: '1px 0',
    border: 'none', textAlign: 'left', width: '100%',
    transition: 'background 0.15s',
  });

  const tab = (active: boolean): React.CSSProperties => ({
    ...BTN, background: active ? 'rgba(56,189,248,0.15)' : 'transparent',
    color: active ? BLUE : GRAY, border: active ? `1px solid rgba(56,189,248,0.3)` : '1px solid transparent',
    borderRadius: 6, fontSize: '0.78rem',
  });

  // ── DossierItem ───────────────────────────────────────────
  function DossierItem({ d, depth = 0 }: { d: Dossier & { children: Dossier[] }; depth?: number }) {
    const active = view.type === 'dossier' && view.id === d.id;
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: depth * 12 }}>
          <button style={navItem(active)} onClick={() => setView({ type: 'dossier', id: d.id })}>
            📁 {d.nom}
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: GRAY_D, fontSize: '0.7rem', padding: '0 4px', flexShrink: 0 }}
            title="Renommer" onClick={e => { e.stopPropagation(); setDMod({ mode: 'rename', target: d }); setDosName(d.nom); }}>✏️</button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: GRAY_D, fontSize: '0.7rem', padding: '0 4px', flexShrink: 0 }}
            title="Supprimer" onClick={e => { e.stopPropagation(); doDeleteDossier(d); }}>🗑</button>
        </div>
        {d.children.map(c => <DossierItem key={c.id} d={c as any} depth={depth + 1} />)}
      </div>
    );
  }

  // ── DocCard / DocRow ──────────────────────────────────────
  function DocCard({ d }: { d: Doc }) {
    const active = detail?.id === d.id;
    return (
      <div onClick={() => openDoc(d.id)} style={{
        background: active ? 'rgba(56,189,248,0.08)' : NAVY_L,
        border: `1px solid ${active ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 8, padding: '0.9rem', cursor: 'pointer',
        transition: 'border-color 0.15s',
      }}>
        <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{typeIcon(d.type_fichier)}</div>
        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.titre}</div>
        {d.description && <div style={{ fontSize: '0.75rem', color: GRAY, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.description}</div>}
        <div style={{ fontSize: '0.72rem', color: GRAY_D }}>{fmtDate(d.updated_at)} · {fmtSize(d.taille)}</div>
        {d.tags.length > 0 && <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {d.tags.map(t => <span key={t.id} style={{ background: t.couleur + '33', color: t.couleur, border: `1px solid ${t.couleur}55`, borderRadius: 10, padding: '1px 7px', fontSize: '0.68rem', fontWeight: 600 }}>{t.label}</span>)}
        </div>}
      </div>
    );
  }

  function DocRow({ d }: { d: Doc }) {
    const active = detail?.id === d.id;
    return (
      <div onClick={() => openDoc(d.id)} style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '0.65rem 1rem',
        background: active ? 'rgba(56,189,248,0.07)' : 'transparent',
        borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
        borderRadius: 6,
      }}>
        <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{typeIcon(d.type_fichier)}</span>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontWeight: 600, fontSize: '0.84rem', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.titre}</div>
          <div style={{ fontSize: '0.72rem', color: GRAY_D }}>{typeLabel(d.type_fichier)} · {fmtSize(d.taille)}</div>
        </div>
        <div style={{ fontSize: '0.72rem', color: GRAY_D, flexShrink: 0 }}>{fmtDate(d.updated_at)}</div>
        {d.tags.length > 0 && <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {d.tags.slice(0, 2).map(t => <span key={t.id} style={{ background: t.couleur + '33', color: t.couleur, borderRadius: 10, padding: '1px 7px', fontSize: '0.68rem', fontWeight: 600 }}>{t.label}</span>)}
        </div>}
      </div>
    );
  }

  // ── Detail panel content ──────────────────────────────────
  const renderDetailPanel = () => {
    if (dlLoad) return <div style={{ padding: 32, color: GRAY, textAlign: 'center' }}>Chargement…</div>;
    if (!detail) return <div style={{ padding: 32, color: GRAY_D, textAlign: 'center', fontSize: '0.85rem' }}>Sélectionnez un document pour l'afficher.</div>;

    const isTrash = !!detail.supprime_at;
    const isText  = ['md', 'txt'].includes(detail.type_fichier);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: '1.6rem' }}>{typeIcon(detail.type_fichier)}</span>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', wordBreak: 'break-word' }}>{detail.titre}</div>
              {detail.description && <div style={{ fontSize: '0.78rem', color: GRAY, marginTop: 2 }}>{detail.description}</div>}
            </div>
            <button onClick={() => setDetail(null)} style={{ ...BTN, background: 'none', color: GRAY, padding: '0.2rem 0.5rem', fontSize: '1rem', flexShrink: 0 }}>✕</button>
          </div>
          <div style={{ fontSize: '0.74rem', color: GRAY_D, display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
            <span>{typeLabel(detail.type_fichier)} · {fmtSize(detail.taille)}</span>
            <span>Modifié {fmtDate(detail.updated_at)}</span>
            {detail.dossier_id && <span>📁 {dossiers.find(d => d.id === detail.dossier_id)?.nom || '—'}</span>}
          </div>
          {detail.tags.length > 0 && <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {detail.tags.map(t => <span key={t.id} style={{ background: t.couleur + '33', color: t.couleur, border: `1px solid ${t.couleur}55`, borderRadius: 10, padding: '1px 8px', fontSize: '0.72rem', fontWeight: 600 }}>{t.label}</span>)}
          </div>}
          {/* Corbeille actions */}
          {isTrash ? (
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <button onClick={() => doRestoreDoc(detail.id)} style={{ ...BTN, background: 'rgba(109,212,0,0.1)', color: GREEN }}>↩ Restaurer</button>
              <button onClick={() => doPermDelete(detail.id)} style={{ ...BTN, background: 'rgba(255,77,77,0.1)', color: RED }}>🗑 Supprimer définitivement</button>
            </div>
          ) : (
            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {detail.nom_fichier && <a href={fileUrl(detail.id)} target="_blank" rel="noreferrer" style={{ ...BTN, background: 'rgba(56,189,248,0.1)', color: BLUE, textDecoration: 'none' }}>⬇ Télécharger</a>}
              <select value={detail.dossier_id ?? ''} onChange={e => moveDoc(detail.id, e.target.value)}
                style={{ background: NAVY_L, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: GRAY, fontSize: '0.78rem', padding: '0.3rem 0.5rem' }}>
                <option value="">— Sans dossier —</option>
                {dossiers.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
              </select>
              <button onClick={() => doDeleteDoc(detail.id)} style={{ ...BTN, background: 'rgba(255,77,77,0.08)', color: RED }}>🗑 Corbeille</button>
            </div>
          )}
        </div>

        {/* Tabs */}
        {!isTrash && <div style={{ display: 'flex', gap: 6, padding: '0.6rem 1.2rem', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          {(['apercu', 'modifier', 'versions', 'notes'] as const).map(t =>
            (t === 'modifier' && !isText) ? null :
            <button key={t} style={tab(docTab === t)} onClick={() => handleTabChange(t)}>
              {{ apercu:'Aperçu', modifier:'Modifier', versions:'Versions', notes:'Notes' }[t]}
            </button>
          )}
        </div>}

        {/* Tab content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1rem 1.2rem' }}>
          {docTab === 'apercu' && (
            <>
              {detail.type_fichier === 'md' && detail.contenu !== null && (
                <div className="biblio-md" dangerouslySetInnerHTML={{ __html: renderMd(detail.contenu) }} />
              )}
              {detail.type_fichier === 'txt' && detail.contenu !== null && (
                <pre style={{ color: GRAY, fontSize: '0.84rem', whiteSpace: 'pre-wrap', margin: 0 }}>{detail.contenu}</pre>
              )}
              {detail.type_fichier === 'pdf' && detail.nom_fichier && (
                pdfBlobUrl
                  ? <iframe src={pdfBlobUrl} style={{ width: '100%', height: 480, border: 'none', borderRadius: 6 }} title={detail.titre} />
                  : <div style={{ textAlign: 'center', padding: 32, color: GRAY, fontSize: '0.85rem' }}>Chargement du PDF…</div>
              )}
              {detail.type_fichier === 'image' && detail.nom_fichier && (
                <img src={fileUrl(detail.id)} alt={detail.titre} style={{ maxWidth: '100%', borderRadius: 6 }} />
              )}
              {['office', 'autre'].includes(detail.type_fichier) && (
                <div style={{ textAlign: 'center', padding: 32, color: GRAY }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>{typeIcon(detail.type_fichier)}</div>
                  <div style={{ fontSize: '0.85rem' }}>Aperçu non disponible pour ce type de fichier.</div>
                  {detail.nom_fichier && <a href={fileUrl(detail.id)} target="_blank" rel="noreferrer" style={{ color: BLUE, fontSize: '0.85rem' }}>Télécharger le fichier ↗</a>}
                </div>
              )}
            </>
          )}

          {docTab === 'modifier' && isText && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={editTitle} onChange={e => setET(e.target.value)} placeholder="Titre"
                style={{ background: NAVY_L, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', padding: '0.5rem 0.8rem', fontSize: '0.9rem' }} />
              <textarea value={editCont} onChange={e => setEC(e.target.value)} rows={16}
                style={{ background: NAVY_L, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', padding: '0.7rem', fontSize: '0.83rem', resize: 'vertical', fontFamily: 'monospace' }}
                placeholder={detail.type_fichier === 'md' ? '# Titre\n\nContenu en Markdown…' : 'Contenu texte…'} />
              <button onClick={saveContent} disabled={saving} style={{ ...BTN, background: saving ? 'rgba(109,212,0,0.1)' : 'rgba(109,212,0,0.15)', color: GREEN, alignSelf: 'flex-end' }}>
                {saving ? 'Enregistrement…' : '💾 Enregistrer'}
              </button>
            </div>
          )}

          {docTab === 'versions' && (
            <div>
              {versions.length === 0 ? <div style={{ color: GRAY_D, fontSize: '0.84rem' }}>Aucune version sauvegardée.</div> :
                versions.map((v, i) => (
                  <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', color: '#fff' }}>Version {versions.length - i}</div>
                      <div style={{ fontSize: '0.72rem', color: GRAY_D }}>{fmtDate(v.created_at)} · {fmtSize(v.taille)}</div>
                    </div>
                    <button onClick={() => restoreVersion(v.id)} style={{ ...BTN, background: 'rgba(56,189,248,0.1)', color: BLUE, fontSize: '0.75rem' }}>↩ Restaurer</button>
                  </div>
                ))
              }
            </div>
          )}

          {docTab === 'notes' && (
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <input value={noteInput} onChange={e => setNI(e.target.value)} placeholder="Ajouter une note…" onKeyDown={e => e.key === 'Enter' && addNote()}
                  style={{ flex: 1, background: NAVY_L, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', padding: '0.45rem 0.7rem', fontSize: '0.83rem' }} />
                <button onClick={addNote} style={{ ...BTN, background: 'rgba(109,212,0,0.1)', color: GREEN }}>+</button>
              </div>
              {notes.length === 0 ? <div style={{ color: GRAY_D, fontSize: '0.84rem' }}>Aucune note.</div> :
                notes.map(n => (
                  <div key={n.id} style={{ background: NAVY_L, borderRadius: 6, padding: '0.65rem 0.8rem', marginBottom: 8 }}>
                    {editNoteId === n.id ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input value={editNoteTxt} onChange={e => setENT(e.target.value)} autoFocus
                          style={{ flex: 1, background: NAVY_M, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', padding: '0.3rem 0.5rem', fontSize: '0.82rem' }} />
                        <button onClick={() => saveNote(n.id)} style={{ ...BTN, background: 'rgba(109,212,0,0.1)', color: GREEN, fontSize: '0.75rem' }}>✓</button>
                        <button onClick={() => setEditNoteId(null)} style={{ ...BTN, background: 'none', color: GRAY, fontSize: '0.75rem' }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ flex: 1, fontSize: '0.83rem', color: '#fff', wordBreak: 'break-word' }}>{n.contenu}</div>
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                          <button onClick={() => { setEditNoteId(n.id); setENT(n.contenu); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: GRAY_D, fontSize: '0.8rem' }}>✏️</button>
                          <button onClick={() => delNote(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: GRAY_D, fontSize: '0.8rem' }}>🗑</button>
                        </div>
                      </div>
                    )}
                    <div style={{ fontSize: '0.7rem', color: GRAY_D, marginTop: 4 }}>{fmtDate(n.created_at)}</div>
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: NAVY_L, border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6, color: '#fff', padding: '0.5rem 0.8rem', fontSize: '0.85rem', boxSizing: 'border-box',
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: NAVY, position: 'relative' }}>
      <style>{`
        .biblio-md { color: #cdd6e8; font-size: 0.88rem; line-height: 1.7; word-break: break-word; overflow-wrap: anywhere; }
        .biblio-md h1,.biblio-md h2,.biblio-md h3 { color: #fff; margin: 1em 0 0.4em; }
        .biblio-md h1 { font-size: 1.3em; } .biblio-md h2 { font-size: 1.1em; } .biblio-md h3 { font-size: 1em; }
        .biblio-md p { margin: 0 0 0.8em; }
        .biblio-md code { background: rgba(255,255,255,0.08); padding: 1px 5px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
        .biblio-md pre { background: rgba(255,255,255,0.06); padding: 0.8rem; border-radius: 6px; overflow-x: auto; margin-bottom: 1em; }
        .biblio-md pre code { background: none; padding: 0; }
        .biblio-md a { color: #38bdf8; word-break: break-all; }
        .biblio-md ul,.biblio-md ol { padding-left: 1.5em; margin-bottom: 0.8em; }
        .biblio-md blockquote { border-left: 3px solid rgba(56,189,248,0.4); padding-left: 0.8em; color: #8899aa; margin: 0 0 0.8em; }
        .biblio-md table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
        .biblio-md th,.biblio-md td { border: 1px solid rgba(255,255,255,0.1); padding: 0.4rem 0.6rem; font-size: 0.85em; }
        .biblio-md th { background: rgba(255,255,255,0.05); }
        @media(max-width:768px){
          .biblio-sidebar { display: none !important; }
          .biblio-sidebar.open { display: flex !important; position: fixed; top: 0; left: 0; bottom: 0; z-index: 900; }
          .biblio-detail { position: fixed !important; inset: 0; z-index: 800; }
        }
      `}</style>

      {/* Sidebar */}
      <div className={`biblio-sidebar${sidebarOpen ? ' open' : ''}`} style={SB}>
        <div style={{ padding: '1rem 0.8rem 0.6rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginBottom: 10 }}>📚 Bibliothèque</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{ ...BTN, flex: 1, background: 'rgba(109,212,0,0.1)', color: GREEN, fontSize: '0.75rem' }}
              onClick={() => { setTxMod(true); setSB(false); }}>+ Doc texte</button>
            <button style={{ ...BTN, flex: 1, background: 'rgba(56,189,248,0.1)', color: BLUE, fontSize: '0.75rem' }}
              onClick={() => { setUpMod(true); setSB(false); }}>⬆ Upload</button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '0.5rem 0.6rem' }}>
          <button style={navItem(view.type === 'recents')} onClick={() => { setView({ type: 'recents' }); setSB(false); }}>🕐 Récents</button>
          <button style={navItem(view.type === 'all')} onClick={() => { setView({ type: 'all' }); setSB(false); }}>📋 Tous les documents</button>
          <button style={navItem(view.type === 'racine')} onClick={() => { setView({ type: 'racine' }); setSB(false); }}>📁 Sans dossier</button>

          <div style={{ margin: '8px 0 4px', fontSize: '0.7rem', color: GRAY_D, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 0.5rem' }}>Dossiers</div>
          {tree.map(d => <DossierItem key={d.id} d={d} />)}
          <button style={{ ...navItem(false), color: GRAY_D, fontSize: '0.8rem' }} onClick={() => { setDMod({ mode: 'new' }); setDosName(''); }}>＋ Nouveau dossier</button>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', margin: '8px 0 4px' }} />
          <button style={{ ...navItem(false), color: GRAY_D }} onClick={() => { setView({ type: 'corbeille' }); setSB(false); }}>🗑 Corbeille</button>
          <button style={{ ...navItem(false), color: GRAY_D }} onClick={() => setTagMod(true)}>🏷 Gérer les tags</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Toolbar */}
        <div style={{ padding: '0.8rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
          <button className="admin-mobile-only" style={{ ...BTN, background: 'rgba(255,255,255,0.05)', color: GRAY, display: 'none' }} onClick={() => setSB(s => !s)}>☰</button>
          <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="🔍 Rechercher…"
            style={{ flex: 1, minWidth: 150, background: NAVY_L, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', padding: '0.45rem 0.7rem', fontSize: '0.85rem' }} />
          <select value={filterType} onChange={e => setFType(e.target.value)}
            style={{ background: NAVY_L, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: GRAY, fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}>
            <option value="">Tous les types</option>
            {['md','txt','pdf','image','office','autre'].map(t => <option key={t} value={t}>{typeLabel(t)}</option>)}
          </select>
          {view.type !== 'recents' && view.type !== 'corbeille' && <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            style={{ background: NAVY_L, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: GRAY, fontSize: '0.8rem', padding: '0.4rem 0.6rem' }}>
            <option value="updated_desc">Récents d'abord</option>
            <option value="updated_asc">Anciens d'abord</option>
            <option value="name_asc">Nom A→Z</option>
            <option value="name_desc">Nom Z→A</option>
            <option value="created_desc">Créés récemment</option>
          </select>}
          <div style={{ display: 'flex', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden' }}>
            <button onClick={() => setViewMode('liste')} style={{ ...BTN, borderRadius: 0, background: viewMode === 'liste' ? 'rgba(56,189,248,0.1)' : 'transparent', color: viewMode === 'liste' ? BLUE : GRAY, padding: '0.4rem 0.6rem' }}>☰</button>
            <button onClick={() => setViewMode('grille')} style={{ ...BTN, borderRadius: 0, background: viewMode === 'grille' ? 'rgba(56,189,248,0.1)' : 'transparent', color: viewMode === 'grille' ? BLUE : GRAY, padding: '0.4rem 0.6rem' }}>⊞</button>
          </div>
        </div>

        {/* Section header */}
        <div style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', color: GRAY_D, flexShrink: 0 }}>
          {{ all:'Tous les documents', recents:'Documents récents', racine:'Sans dossier', corbeille:'Corbeille', dossier: dossiers.find(d => d.id === view.id)?.nom ?? 'Dossier' }[view.type] ?? ''}
          {' '}— {docs.length} document{docs.length !== 1 ? 's' : ''}
        </div>

        {/* Doc list */}
        <div style={{ flex: 1, overflow: 'auto', padding: viewMode === 'grille' ? '0.5rem 1rem 1rem' : '0 0.5rem 1rem' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: GRAY }}>Chargement…</div>
          ) : docs.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: GRAY_D, fontSize: '0.85rem' }}>
              {view.type === 'corbeille' ? 'La corbeille est vide.' : 'Aucun document.'}
            </div>
          ) : viewMode === 'grille' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
              {docs.map(d => <DocCard key={d.id} d={d} />)}
            </div>
          ) : (
            <div>{docs.map(d => <DocRow key={d.id} d={d} />)}</div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {(detail || dlLoad) && (
        <div className="biblio-detail" style={{ width: 380, minWidth: 320, background: NAVY_M, borderLeft: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {renderDetailPanel()}
        </div>
      )}

      {/* ── Upload Modal ── */}
      {uploadMod && (
        <Modal title="⬆ Importer un fichier" onClose={() => { setUpMod(false); setUpFile(null); setUpTitle(''); }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ border: '2px dashed rgba(56,189,248,0.3)', borderRadius: 8, padding: '1.5rem', textAlign: 'center', cursor: 'pointer', color: GRAY }}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { setUpFile(f); if (!upTitle) setUpTitle(f.name.replace(/\.[^.]+$/, '')); } }}>
              {upFile ? <><div style={{ color: BLUE, fontWeight: 600 }}>{upFile.name}</div><div style={{ fontSize: '0.75rem', marginTop: 4 }}>{fmtSize(upFile.size)}</div></> : <div>Cliquer ou glisser un fichier ici<br /><span style={{ fontSize: '0.75rem' }}>Max 25 Mo</span></div>}
            </div>
            <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setUpFile(f); if (!upTitle) setUpTitle(f.name.replace(/\.[^.]+$/, '')); } }} />
            <input value={upTitle} onChange={e => setUpTitle(e.target.value)} placeholder="Titre du document" style={inputStyle} />
            <select value={upDossier} onChange={e => setUpDos(e.target.value)} style={{ ...inputStyle, color: upDossier ? '#fff' : GRAY }}>
              <option value="">— Sans dossier —</option>
              {dossiers.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
            </select>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setUpMod(false); setUpFile(null); setUpTitle(''); }} style={{ ...BTN, background: 'rgba(255,255,255,0.05)', color: GRAY }}>Annuler</button>
              <button onClick={doUpload} disabled={!upFile || uploading} style={{ ...BTN, background: 'rgba(56,189,248,0.15)', color: BLUE }}>{uploading ? 'Envoi…' : 'Importer'}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── New Text Modal ── */}
      {textMod && (
        <Modal title="📝 Nouveau document texte" onClose={() => { setTxMod(false); setNwTitle(''); setNwCont(''); }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input value={nwTitle} onChange={e => setNwTitle(e.target.value)} placeholder="Titre *" style={inputStyle} autoFocus />
            <div style={{ display: 'flex', gap: 10 }}>
              <select value={nwType} onChange={e => setNwType(e.target.value as 'md' | 'txt')} style={{ ...inputStyle, flex: 1 }}>
                <option value="md">📝 Markdown</option>
                <option value="txt">📄 Texte brut</option>
              </select>
              <select value={nwDos} onChange={e => setNwDos(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
                <option value="">— Sans dossier —</option>
                {dossiers.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
              </select>
            </div>
            <textarea value={nwCont} onChange={e => setNwCont(e.target.value)} rows={8} placeholder={nwType === 'md' ? '# Titre\n\nContenu en Markdown…' : 'Contenu texte…'}
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '0.82rem' }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setTxMod(false); setNwTitle(''); setNwCont(''); }} style={{ ...BTN, background: 'rgba(255,255,255,0.05)', color: GRAY }}>Annuler</button>
              <button onClick={doCreateText} disabled={!nwTitle.trim() || creating} style={{ ...BTN, background: 'rgba(109,212,0,0.15)', color: GREEN }}>{creating ? 'Création…' : 'Créer'}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Dossier Modal ── */}
      {dossierMod && (
        <Modal title={dossierMod.mode === 'new' ? '📁 Nouveau dossier' : '✏️ Renommer le dossier'} onClose={() => setDMod(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input value={dosName} onChange={e => setDosName(e.target.value)} placeholder="Nom du dossier" style={inputStyle} autoFocus
              onKeyDown={e => e.key === 'Enter' && doCreateDossier()} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setDMod(null)} style={{ ...BTN, background: 'rgba(255,255,255,0.05)', color: GRAY }}>Annuler</button>
              <button onClick={doCreateDossier} disabled={!dosName.trim()} style={{ ...BTN, background: 'rgba(109,212,0,0.15)', color: GREEN }}>
                {dossierMod.mode === 'new' ? 'Créer' : 'Renommer'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Tag Modal ── */}
      {tagMod && (
        <Modal title="🏷 Gestion des tags" onClose={() => { setTagMod(false); setTagLabel(''); setTagColor('#6B7280'); setEditTagId(null); }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={tagLabel} onChange={e => setTagLabel(e.target.value)} placeholder="Nom du tag" style={{ ...inputStyle, flex: 1 }} onKeyDown={e => e.key === 'Enter' && saveTag()} />
              <input type="color" value={tagColor} onChange={e => setTagColor(e.target.value)} style={{ width: 44, height: 36, padding: 2, background: NAVY_L, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, cursor: 'pointer' }} />
              <button onClick={saveTag} disabled={!tagLabel.trim()} style={{ ...BTN, background: 'rgba(109,212,0,0.15)', color: GREEN, whiteSpace: 'nowrap' }}>
                {editTagId ? 'Modifier' : '+ Ajouter'}
              </button>
            </div>
            {editTagId && <button onClick={() => { setEditTagId(null); setTagLabel(''); setTagColor('#6B7280'); }} style={{ ...BTN, background: 'none', color: GRAY, alignSelf: 'flex-start', fontSize: '0.78rem' }}>✕ Annuler la modification</button>}
            <div>
              {allTags.length === 0 ? <div style={{ color: GRAY_D, fontSize: '0.84rem' }}>Aucun tag.</div> :
                allTags.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: t.couleur, flexShrink: 0 }} />
                    <span style={{ flex: 1, color: '#fff', fontSize: '0.84rem' }}>{t.label}</span>
                    <button onClick={() => { setEditTagId(t.id); setTagLabel(t.label); setTagColor(t.couleur); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: GRAY_D, fontSize: '0.8rem' }}>✏️</button>
                    <button onClick={async () => { await biblioApi.deleteTag(t.id); loadMeta(); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: GRAY_D, fontSize: '0.8rem' }}>🗑</button>
                  </div>
                ))
              }
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
