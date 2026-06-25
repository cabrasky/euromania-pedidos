import { useState, useEffect, useCallback } from 'react';
import { MenuConfig } from '../../types';

interface Props {
  authHeaders: () => Record<string, string>;
  base: string;
}

function AdminMenus({ authHeaders, base }: Props) {
  const [menus, setMenus] = useState<MenuConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'ok' | 'err'>('ok');
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${base}/api/admin/menus`, { headers: authHeaders() });
      if (r.status === 401 || r.status === 403) return;
      setMenus(await r.json());
    } catch { setMsg('Error al cargar'); setMsgType('err'); }
    setLoading(false);
  }, [base, authHeaders]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!newName.trim() || !newSlug.trim()) return;
    setMsg('');
    try {
      const r = await fetch(`${base}/api/admin/menus`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ name: newName.trim(), slug: newSlug.trim(), description: newDesc.trim() }),
      });
      const data = await r.json();
      if (data.error) { setMsg(data.error); setMsgType('err'); }
      else {
        setMsg(`✅ Carta "${newName}" creada`); setMsgType('ok');
        setNewName(''); setNewSlug(''); setNewDesc('');
        load();
      }
    } catch { setMsg('Error al crear'); setMsgType('err'); }
  };

  const handleActivate = async (id: number) => {
    try {
      const r = await fetch(`${base}/api/admin/menus/${id}/activate`, { method: 'POST', headers: authHeaders() });
      const data = await r.json();
      if (data.error) { setMsg(data.error); setMsgType('err'); }
      else { setMsg('✅ Carta activada'); setMsgType('ok'); load(); }
    } catch { setMsg('Error'); setMsgType('err'); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`¿Eliminar la carta "${name}"?`)) return;
    try {
      const r = await fetch(`${base}/api/admin/menus/${id}`, { method: 'DELETE', headers: authHeaders() });
      const data = await r.json();
      if (data.error) { setMsg(data.error); setMsgType('err'); }
      else { setMsg(`✅ "${name}" eliminada`); setMsgType('ok'); load(); }
    } catch { setMsg('Error'); setMsgType('err'); }
  };

  return (
    <div className="admin-menus">
      <div className="admin-section">
        <h3><i className="fas fa-plus-circle"></i> Nueva carta</h3>
        <div className="menu-create-form">
          <input type="text" className="menu-input" placeholder="Nombre (ej: Euromanía 1€)" value={newName}
            onChange={e => setNewName(e.target.value)} />
          <input type="text" className="menu-input" placeholder="Slug (ej: euromania)" value={newSlug}
            onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} />
          <input type="text" className="menu-input" placeholder="Descripción (opcional)" value={newDesc}
            onChange={e => setNewDesc(e.target.value)} />
          <button className="menu-create-btn" onClick={handleCreate} disabled={!newName.trim() || !newSlug.trim()}>
            <i className="fas fa-plus"></i> Crear carta
          </button>
        </div>
        {msg && <div className={`ban-msg ${msgType === 'ok' ? 'ban-msg-ok' : 'ban-msg-err'}`}>{msg}</div>}
      </div>

      <div className="admin-section">
        <h3><i className="fas fa-list"></i> Cartas configuradas</h3>
        {loading ? (
          <div className="admin-loading"><i className="fas fa-spinner fa-spin"></i> Cargando...</div>
        ) : menus.length === 0 ? (
          <p className="ban-empty"><i className="fas fa-book"></i> No hay cartas configuradas</p>
        ) : (
          <div className="menu-list">
            {menus.map(m => (
              <div className={`menu-card ${m.is_active ? 'active-menu' : ''}`} key={m.id}>
                <div className="menu-card-left">
                  <div className="menu-card-name">
                    {m.is_active && <span className="menu-active-badge"><i className="fas fa-check-circle"></i></span>}
                    <strong>{m.name}</strong>
                    <span className="menu-slug"><code>{m.slug}</code></span>
                  </div>
                  {m.description && <div className="menu-card-desc">{m.description}</div>}
                  <div className="menu-card-meta">Creada {m.created_at ? new Date(m.created_at).toLocaleDateString('es-ES') : '—'}</div>
                </div>
                <div className="menu-card-right">
                  {!m.is_active && (
                    <button className="menu-activate-btn" onClick={() => handleActivate(m.id)} title="Activar esta carta">
                      <i className="fas fa-check"></i> Activar
                    </button>
                  )}
                  {m.is_active && <span className="menu-active-label">Activa</span>}
                  <button className="menu-delete-btn" onClick={() => handleDelete(m.id, m.name)} title="Eliminar carta">
                    <i className="fas fa-trash-can"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-note" style={{ marginTop: 12 }}>
        <i className="fas fa-info-circle"></i>
        Al activar una carta, se desactiva automáticamente la anterior. Los cambios se reflejan al instante en la app.
      </div>
    </div>
  );
}

export default AdminMenus;
