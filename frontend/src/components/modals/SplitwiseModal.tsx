import { useMemo, useState, useEffect } from 'react';
import { Person } from '../../types';
import { getOrderHistory } from '../../services/api';
import { getPrice, parsePrice } from '../../services/menuStore';

interface Props {
  open: boolean;
  onClose: () => void;
  persons: Person[];
  sessionCode: string;
}

interface PersonTotal {
  name: string;
  items: Array<{ name: string; qty: number; price: number }>;
  total: number;
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

interface HistoryItem {
  person: string;
  item_name: string;
  item_code?: string;
  qty: number;
  price: number;
}

interface HistoryOrder {
  order_number: number;
  paid_by: string;
  items: HistoryItem[];
}

function SplitwiseModal({ open, onClose, persons, sessionCode }: Props) {
  const [copied, setCopied] = useState<'text' | 'csv' | null>(null);
  const [historyOrders, setHistoryOrders] = useState<HistoryOrder[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch history when modal opens
  useEffect(() => {
    if (!open || !sessionCode) return;
    setLoading(true);
    getOrderHistory(sessionCode)
      .then(data => setHistoryOrders(data as HistoryOrder[]))
      .catch(() => setHistoryOrders([]))
      .finally(() => setLoading(false));
  }, [open, sessionCode]);

  const { personTotals, groupTotal, average, settlements, allNames } = useMemo(() => {
    // 1. Aggregate from history orders (all rounds)
    const totals: Record<string, Record<string, { name: string; qty: number; price: number }>> = {};

    // Process history items
    historyOrders.forEach(order => {
      (order.items || []).forEach((item: HistoryItem) => {
        const person = item.person || '?';
        const key = item.item_code || item.item_name;
        if (!totals[person]) totals[person] = {};
        if (!totals[person][key]) {
          totals[person][key] = { name: item.item_name, qty: 0, price: 0 };
        }
        totals[person][key].qty += item.qty || 0;
        totals[person][key].price += (item.price || 0) * (item.qty || 0);
      });
    });

    // 2. Merge current active items on top
    persons.forEach(p => {
      Object.entries(p.items).forEach(([key, o]) => {
        const item = o as any;
        if (!item.qty || item.qty <= 0) return;
        const currentPrice = parsePrice(getPrice(item.category, item.item)) * item.qty;
        if (!totals[p.name]) totals[p.name] = {};
        if (!totals[p.name][key]) {
          totals[p.name][key] = { name: item.item.name || key, qty: 0, price: 0 };
        }
        totals[p.name][key].qty += item.qty || 0;
        totals[p.name][key].price += currentPrice;
      });
    });

    // 3. Build person totals
    const allNamesSet = new Set<string>();
    const pts: PersonTotal[] = Object.entries(totals).map(([name, items]) => {
      allNamesSet.add(name);
      const itemList = Object.values(items).map(i => ({
        name: i.name,
        qty: i.qty,
        price: Math.round(i.price * 100) / 100,
      }));
      const total = itemList.reduce((s, i) => s + i.price, 0);
      return { name, items: itemList, total: Math.round(total * 100) / 100 };
    });

    // Also add people from active persons who aren't in the totals (empty but present)
    persons.forEach(p => {
      if (!totals[p.name]) allNamesSet.add(p.name);
    });

    // Add history-only people
    historyOrders.forEach(order => {
      (order.items || []).forEach((item: HistoryItem) => {
        if (item.person) allNamesSet.add(item.person);
      });
    });

    const gt = Math.round(pts.reduce((s, p) => s + p.total, 0) * 100) / 100;
    const n = pts.length || 1;
    const avg = Math.round((gt / n) * 100) / 100;

    // Calculate settlements
    const debtors: { name: string; debt: number }[] = [];
    const creditors: { name: string; credit: number }[] = [];
    pts.forEach(p => {
      const diff = Math.round((p.total - avg) * 100) / 100;
      if (diff < -0.01) debtors.push({ name: p.name, debt: Math.abs(diff) });
      else if (diff > 0.01) creditors.push({ name: p.name, credit: diff });
    });

    const s: Settlement[] = [];
    let di = 0, ci = 0;
    while (di < debtors.length && ci < creditors.length) {
      const amount = Math.round(Math.min(debtors[di].debt, creditors[ci].credit) * 100) / 100;
      if (amount > 0.01) {
        s.push({
          from: debtors[di].name,
          to: creditors[ci].name,
          amount,
        });
      }
      debtors[di].debt = Math.round((debtors[di].debt - amount) * 100) / 100;
      creditors[ci].credit = Math.round((creditors[ci].credit - amount) * 100) / 100;
      if (debtors[di].debt < 0.01) di++;
      if (creditors[ci].credit < 0.01) ci++;
    }

    return {
      personTotals: pts,
      groupTotal: gt,
      average: avg,
      settlements: s,
      allNames: Array.from(allNamesSet),
    };
  }, [historyOrders, persons]);

  const formatPrice = (n: number) => n.toFixed(2).replace('.', ',') + '€';

  const getSummaryText = () => {
    let rounds = historyOrders.length;
    const hasActive = persons.some(p => Object.keys(p.items).length > 0);
    if (hasActive) rounds += 1;

    let text = `🛵 Euromania · ${sessionCode}\n`;
    text += `📋 ${rounds} ronda${rounds !== 1 ? 's' : ''}\n`;
    text += `━`.repeat(28) + '\n\n';
    personTotals.forEach(pt => {
      text += `👤 ${pt.name}: ${formatPrice(pt.total)}\n`;
      pt.items.forEach(i => {
        text += `   ×${i.qty} ${i.name}\n`;
      });
      text += '\n';
    });
    text += `━`.repeat(28) + '\n';
    text += `💰 Total: ${formatPrice(groupTotal)}\n`;
    text += `👥 ${personTotals.length} personas · Media: ${formatPrice(average)}/persona\n\n`;

    if (settlements.length > 0) {
      text += `💸 Liquidación sugerida:\n`;
      settlements.forEach(s => {
        text += `   ${s.from} → ${s.to}: ${formatPrice(s.amount)}\n`;
      });
    } else {
      text += `✅ Cuentas cuadradas: todos pagan lo mismo.\n`;
    }
    return text;
  };

  const getCsvText = () => {
    const lines: string[] = [];
    lines.push('Persona,Producto,Cantidad,Precio Unitario,Total');
    personTotals.forEach(pt => {
      pt.items.forEach(i => {
        const unitPrice = i.qty > 0 ? Math.round((i.price / i.qty) * 100) / 100 : 0;
        lines.push(
          `${pt.name},"${i.name}",${i.qty},${unitPrice.toFixed(2).replace('.', ',')}€,${i.price.toFixed(2).replace('.', ',')}€`
        );
      });
    });
    lines.push('');
    lines.push('RESUMEN,,,,');  
    personTotals.forEach(pt => {
      lines.push(`${pt.name} Total,,,${formatPrice(pt.total)},`);
    });
    lines.push(`TOTAL GRUPO,,,,${formatPrice(groupTotal)}`);
    lines.push(`Media por persona,,,,${formatPrice(average)}`);
    
    if (settlements.length > 0) {
      lines.push('');
      lines.push('LIQUIDACIÓN,,,,');  
      settlements.forEach(s => {
        lines.push(`${s.from} paga a ${s.to},,,${formatPrice(s.amount)},`);
      });
    }
    return lines.join('\n');
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(getSummaryText());
      setCopied('text');
      setTimeout(() => setCopied(null), 2000);
    } catch { /* ignore */ }
  };

  const handleCopyCsv = async () => {
    try {
      await navigator.clipboard.writeText(getCsvText());
      setCopied('csv');
      setTimeout(() => setCopied(null), 2000);
    } catch { /* ignore */ }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box splitwise-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ background: '#0f172a', color: '#fff' }}>
          <i className="fas fa-hand-holding-dollar"></i>
          <h2 style={{ color: '#fff' }}>Splitwise / Liquidación</h2>
          <button className="modal-close" onClick={onClose} style={{ color: '#94a3b8' }}>
            <i className="fas fa-xmark"></i>
          </button>
        </div>

        <div className="modal-body splitwise-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: 24 }}></i>
              <p style={{ marginTop: 10 }}>Cargando historial...</p>
            </div>
          ) : (
            <>
              {/* Session info */}
              <div className="sw-header">
                <span className="sw-session">
                  🛵 Euromania · {sessionCode}
                  {' · '}
                  {historyOrders.length} comanda{historyOrders.length !== 1 ? 's' : ''}
                  {persons.some(p => Object.keys(p.items).length > 0) ? ' + ronda activa' : ''}
                </span>
              </div>

              {/* Per-person breakdown */}
              {personTotals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                  <i className="fas fa-receipt" style={{ fontSize: 32, marginBottom: 10 }}></i>
                  <p>Sin datos para liquidar</p>
                </div>
              ) : (
                <>
                  {personTotals.map((pt, i) => (
                    <div key={i} className="sw-person">
                      <div className="sw-person-header">
                        <span className="sw-person-name">
                          <i className="fas fa-user"></i> {pt.name}
                        </span>
                        <span className="sw-person-total">{formatPrice(pt.total)}</span>
                      </div>
                      {pt.items.map((item, j) => (
                        <div key={j} className="sw-item">
                          <span className="sw-item-name">×{item.qty} {item.name}</span>
                          <span className="sw-item-price">{formatPrice(item.price)}</span>
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Group summary */}
                  <div className="sw-summary">
                    <div className="sw-summary-row total">
                      <span>Total global</span>
                      <span className="sw-summary-value">{formatPrice(groupTotal)}</span>
                    </div>
                    <div className="sw-summary-row">
                      <span>Personas</span>
                      <span>{personTotals.length}</span>
                    </div>
                    <div className="sw-summary-row">
                      <span>Media por persona</span>
                      <span className="sw-summary-value">{formatPrice(average)}</span>
                    </div>
                    <div className="sw-summary-row" style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                      <span>Incluye {historyOrders.length} comanda{historyOrders.length !== 1 ? 's' : ''} pasada{historyOrders.length !== 1 ? 's' : ''}</span>
                      <span></span>
                    </div>
                  </div>

                  {/* Settlements */}
                  {settlements.length > 0 && (
                    <div className="sw-settlements">
                      <div className="sw-settlements-title">
                        <i className="fas fa-arrow-right-arrow-left"></i> Liquidación sugerida
                      </div>
                      {settlements.map((s, i) => (
                        <div key={i} className="sw-settlement">
                          <span className="sw-sett-from">{s.from}</span>
                          <span className="sw-sett-arrow">→</span>
                          <span className="sw-sett-to">{s.to}</span>
                          <span className="sw-sett-amount">{formatPrice(s.amount)}</span>
                        </div>
                      ))}
                      <div className="sw-sett-note">
                        <i className="fas fa-info-circle"></i> Quien gastó menos de la media paga a quien gastó más
                      </div>
                    </div>
                  )}

                  {settlements.length === 0 && personTotals.length > 0 && (
                    <div className="sw-settlements" style={{ borderColor: '#86efac' }}>
                      <div className="sw-settlements-title" style={{ color: '#16a34a' }}>
                        <i className="fas fa-check-circle"></i> Cuadradas
                      </div>
                      <div style={{ padding: '12px 0', color: '#64748b', fontSize: 13 }}>
                        Todos pagan lo mismo ({formatPrice(average)}). No hay que transferir nada.
                      </div>
                    </div>
                  )}

                  {/* Copy buttons */}
                  <div className="sw-actions">
                    <button
                      className={`sw-btn ${copied === 'text' ? 'copied' : ''}`}
                      onClick={handleCopyText}
                    >
                      <i className={`fas ${copied === 'text' ? 'fa-check' : 'fa-copy'}`}></i>
                      {copied === 'text' ? 'Copiado ✓' : 'Copiar resumen'}
                    </button>
                    <button
                      className={`sw-btn sw-btn-csv ${copied === 'csv' ? 'copied' : ''}`}
                      onClick={handleCopyCsv}
                    >
                      <i className={`fas ${copied === 'csv' ? 'fa-check' : 'fa-file-csv'}`}></i>
                      {copied === 'csv' ? 'Copiado ✓' : 'CSV (Excel / Splitwise)'}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SplitwiseModal;
