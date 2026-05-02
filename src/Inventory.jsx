import React, { useState } from 'react';

const CATEGORIES = ['Rings', 'Chains', 'Earrings', 'Gloves', 'Refill Perfumes', 'Soaps', 'Body Lotions'];
const emptyForm = { name: '', category: 'Rings', buyingPrice: '', sellingPrice: '', qty: '' };

export default function Inventory({ inventory, addInventoryItem, deleteInventoryItem }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [view, setView] = useState('list');
  const [customCat, setCustomCat] = useState('');
  const [cats, setCats] = useState(CATEGORIES);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) { setError('Item name required'); return; }
    const b = parseFloat(form.buyingPrice);
    const s = parseFloat(form.sellingPrice);
    const q = parseInt(form.qty);
    if (isNaN(b) || b < 0) { setError('Enter valid buying price'); return; }
    if (isNaN(s) || s <= 0) { setError('Enter valid selling price'); return; }
    if (isNaN(q) || q <= 0) { setError('Enter valid quantity'); return; }
    if (s < b) { setError('Selling price is less than buying price!'); return; }
    setError('');
    setSaving(true);
    await addInventoryItem({ name: form.name.trim(), category: form.category, buyingPrice: b, sellingPrice: s, qty: q });
    setSaving(false);
    setForm(emptyForm);
    setView('list');
  };

  const addCat = () => {
    const v = customCat.trim();
    if (v && !cats.includes(v)) { setCats(c => [...c, v]); setCustomCat(''); }
  };

  const totalInvested = inventory.reduce((a, i) => a + i.buying_price * i.qty, 0);
  const totalValue = inventory.reduce((a, i) => a + i.selling_price * i.remaining, 0);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['list', 'add'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            flex: 1, padding: '9px', fontSize: 12, cursor: 'pointer', borderRadius: 8,
            fontWeight: view === v ? 500 : 400,
            background: view === v ? 'var(--gold)' : 'var(--surface)',
            color: view === v ? '#0a0a0a' : 'var(--text-muted)',
            fontFamily: 'var(--mono)', letterSpacing: '0.04em',
            border: view === v ? 'none' : '1px solid var(--border)',
          }}>{v === 'list' ? `Stock (${inventory.length})` : '+ Add Stock'}</button>
        ))}
      </div>

      {view === 'list' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={lbl}>Invested</div>
              <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--red)' }}>Ksh {Math.round(totalInvested).toLocaleString('en-KE')}</div>
            </div>
            <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={lbl}>Stock value</div>
              <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--green)' }}>Ksh {Math.round(totalValue).toLocaleString('en-KE')}</div>
            </div>
          </div>

          {inventory.length === 0 ? (
            <div style={emptyState}>No stock yet — tap "+ Add Stock" to begin</div>
          ) : (
            inventory.map(item => {
              const low = item.remaining <= 2;
              const out = item.remaining === 0;
              return (
                <div key={item.id} style={{
                  background: 'var(--surface)',
                  border: `1px solid ${out ? 'var(--red)' : low ? '#8a6d2a' : 'var(--border)'}`,
                  borderRadius: 10, padding: '14px', marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.category}</div>
                    </div>
                    <div style={{
                      fontSize: 11, padding: '3px 10px', borderRadius: 99,
                      background: out ? 'var(--red-bg)' : low ? 'rgba(212,168,67,0.15)' : 'var(--green-bg)',
                      color: out ? 'var(--red)' : low ? 'var(--gold)' : 'var(--green)',
                      fontWeight: 500,
                    }}>
                      {out ? 'Out of stock' : `${item.remaining} left`}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
                    <div><div style={lbl}>Bought at</div><div style={val}>Ksh {Number(item.buying_price).toLocaleString('en-KE')}</div></div>
                    <div><div style={lbl}>Selling at</div><div style={val}>Ksh {Number(item.selling_price).toLocaleString('en-KE')}</div></div>
                    <div><div style={lbl}>Margin</div><div style={{ ...val, color: 'var(--green)' }}>Ksh {(item.selling_price - item.buying_price).toLocaleString('en-KE')}</div></div>
                  </div>
                  <button onClick={() => deleteInventoryItem(item.id)} style={{
                    marginTop: 12, fontSize: 11, padding: '5px 12px',
                    background: 'var(--red-bg)', color: 'var(--red)',
                    border: '1px solid rgba(224,92,92,0.2)', borderRadius: 6, cursor: 'pointer',
                  }}>Remove</button>
                </div>
              );
            })
          )}
        </>
      )}

      {view === 'add' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Item name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Gold ring" style={inp} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label style={lbl}>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} style={inp}>
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Quantity</label>
              <input type="number" value={form.qty} onChange={e => set('qty', e.target.value)} placeholder="0" min="1" style={inp} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label style={lbl}>Buying price (Ksh)</label>
              <input type="number" value={form.buyingPrice} onChange={e => set('buyingPrice', e.target.value)} placeholder="0" min="0" style={inp} />
            </div>
            <div>
              <label style={lbl}>Selling price (Ksh)</label>
              <input type="number" value={form.sellingPrice} onChange={e => set('sellingPrice', e.target.value)} placeholder="0" min="0" style={inp} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            <input placeholder="New category…" value={customCat} onChange={e => setCustomCat(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCat()}
              style={{ ...inp, flex: 1 }} />
            <button onClick={addCat} style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '0 14px', fontSize: 12,
              color: 'var(--text-muted)', cursor: 'pointer',
            }}>+ Add</button>
          </div>
          {error && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{error}</div>}
          <button onClick={submit} disabled={saving} style={{
            width: '100%', padding: 13, fontSize: 14, fontWeight: 500,
            background: saving ? 'var(--surface2)' : 'var(--gold)',
            color: saving ? 'var(--text-muted)' : '#0a0a0a',
            border: 'none', borderRadius: 10, cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--mono)', letterSpacing: '0.05em',
          }}>{saving ? 'Saving...' : 'Add to Stock'}</button>
        </div>
      )}
    </div>
  );
}

const lbl = { display: 'block', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 };
const val = { fontSize: 13, fontWeight: 500 };
const inp = { width: '100%', padding: '10px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', fontSize: 13, fontFamily: 'var(--mono)', outline: 'none', boxSizing: 'border-box' };
const emptyState = { textAlign: 'center', padding: '40px 20px', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', fontSize: 13 };
