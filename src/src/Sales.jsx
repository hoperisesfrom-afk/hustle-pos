import React, { useState } from 'react';

const empty = { customerName: '', itemId: '', paid: '', method: 'Mpesa' };

export default function Sales({ inventory, sales, addSale, deleteSale, markPaid, setTab }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [view, setView] = useState('list');
  const [paying, setPaying] = useState(null);
  const [extraPay, setExtraPay] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const availableStock = inventory.filter(i => i.remaining > 0);
  const selectedItem = inventory.find(i => i.id === parseInt(form.itemId));

  const submit = () => {
    if (!form.customerName.trim()) { setError('Customer name required'); return; }
    if (!form.itemId) { setError('Select an item'); return; }
    const p = parseFloat(form.paid);
    if (isNaN(p) || p < 0) { setError('Enter valid amount paid'); return; }
    if (selectedItem && p > selectedItem.sellingPrice) { setError('Paid amount exceeds selling price'); return; }
    setError('');
    addSale({
      customerName: form.customerName.trim(),
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      itemCost: selectedItem.buyingPrice,
      sellingPrice: selectedItem.sellingPrice,
      paid: p,
      method: form.method,
    });
    setForm(empty);
    setView('list');
  };

  const debtors = sales.filter(s => s.paid < s.sellingPrice);
  const settled = sales.filter(s => s.paid >= s.sellingPrice);

  const handleMarkPaid = () => {
    const amt = parseFloat(extraPay);
    if (isNaN(amt) || amt <= 0) return;
    markPaid(paying, amt);
    setPaying(null);
    setExtraPay('');
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['list', 'new'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            flex: 1, padding: '9px', fontSize: 12, border: 'none', cursor: 'pointer',
            borderRadius: 8, fontWeight: view === v ? 500 : 400,
            background: view === v ? 'var(--gold)' : 'var(--surface)',
            color: view === v ? '#0a0a0a' : 'var(--text-muted)',
            fontFamily: 'var(--mono)', letterSpacing: '0.04em',
            border: view === v ? 'none' : '1px solid var(--border)',
          }}>
            {v === 'list' ? `Sales (${sales.length})` : '+ New Sale'}
          </button>
        ))}
      </div>

      {view === 'new' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          {availableStock.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>No stock available. Add items first.</div>
              <button onClick={() => setTab('inventory')} style={{
                background: 'var(--gold)', color: '#0a0a0a', border: 'none',
                borderRadius: 8, padding: '10px 20px', fontSize: 13,
                fontFamily: 'var(--mono)', cursor: 'pointer',
              }}>Go to Stock →</button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Customer name *</label>
                <input value={form.customerName} onChange={e => set('customerName', e.target.value)}
                  placeholder="e.g. Wanjiku" style={inp} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Item *</label>
                <select value={form.itemId} onChange={e => set('itemId', e.target.value)} style={inp}>
                  <option value="">— Select item —</option>
                  {availableStock.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} — Ksh {i.sellingPrice.toLocaleString('en-KE')} ({i.remaining} left)
                    </option>
                  ))}
                </select>
              </div>

              {selectedItem && (
                <div style={{
                  background: 'var(--gold-bg)', border: '1px solid var(--gold-dim)',
                  borderRadius: 8, padding: '12px 14px', marginBottom: 14,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Selling price</div>
                      <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)', marginTop: 2 }}>
                        Ksh {selectedItem.sellingPrice.toLocaleString('en-KE')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your profit</div>
                      <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--green)', marginTop: 2 }}>
                        +Ksh {(selectedItem.sellingPrice - selectedItem.buyingPrice).toLocaleString('en-KE')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div>
                  <label style={lbl}>Amount paid (Ksh)</label>
                  <input type="number" value={form.paid} onChange={e => set('paid', e.target.value)}
                    placeholder="0" min="0" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Payment method</label>
                  <select value={form.method} onChange={e => set('method', e.target.value)} style={inp}>
                    <option value="Mpesa">Mpesa</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank</option>
                  </select>
                </div>
              </div>

              {selectedItem && form.paid && parseFloat(form.paid) < selectedItem.sellingPrice && (
                <div style={{
                  background: 'var(--red-bg)', border: '1px solid rgba(224,92,92,0.2)',
                  borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13,
                  color: 'var(--red)',
                }}>
                  Balance owing: Ksh {(selectedItem.sellingPrice - parseFloat(form.paid || 0)).toLocaleString('en-KE')}
                </div>
              )}

              {error && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{error}</div>}
              <button onClick={submit} style={{
                width: '100%', padding: 13, fontSize: 14, fontWeight: 500,
                background: 'var(--gold)', color: '#0a0a0a',
                border: 'none', borderRadius: 10, cursor: 'pointer',
                fontFamily: 'var(--mono)', letterSpacing: '0.05em',
              }}>Record Sale</button>
            </>
          )}
        </div>
      )}

      {view === 'list' && (
        <>
          {debtors.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                Owing ({debtors.length})
              </div>
              {debtors.map(s => {
                const balance = s.sellingPrice - s.paid;
                return (
                  <div key={s.id} style={{
                    background: 'var(--surface)', border: '1px solid rgba(224,92,92,0.3)',
                    borderRadius: 10, padding: '14px', marginBottom: 8,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 14 }}>{s.customerName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.itemName} · {s.date}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--red)' }}>Ksh {balance.toLocaleString('en-KE')}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>balance</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {paying === s.id ? (
                        <>
                          <input type="number" value={extraPay} onChange={e => setExtraPay(e.target.value)}
                            placeholder="Amount received" style={{ ...inp, flex: 1, padding: '7px 10px' }} />
                          <button onClick={handleMarkPaid} style={{
                            background: 'var(--green)', color: '#0a0a0a', border: 'none',
                            borderRadius: 6, padding: '7px 14px', fontSize: 12,
                            fontFamily: 'var(--mono)', cursor: 'pointer',
                          }}>✓</button>
                          <button onClick={() => setPaying(null)} style={{
                            background: 'var(--surface2)', color: 'var(--text-muted)', border: '1px solid var(--border)',
                            borderRadius: 6, padding: '7px 14px', fontSize: 12,
                            fontFamily: 'var(--mono)', cursor: 'pointer',
                          }}>✕</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setPaying(s.id); setExtraPay(''); }} style={{
                            fontSize: 11, padding: '6px 12px', background: 'var(--green-bg)',
                            color: 'var(--green)', border: '1px solid rgba(76,175,125,0.2)',
                            borderRadius: 6, cursor: 'pointer',
                          }}>+ Record payment</button>
                          <button onClick={() => deleteSale(s.id)} style={{
                            fontSize: 11, padding: '6px 12px', background: 'var(--red-bg)',
                            color: 'var(--red)', border: '1px solid rgba(224,92,92,0.2)',
                            borderRadius: 6, cursor: 'pointer',
                          }}>Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {settled.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                Settled ({settled.length})
              </div>
              {settled.map(s => (
                <div key={s.id} style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: '14px', marginBottom: 8,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{s.customerName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.itemName} · {s.date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--green)' }}>+Ksh {(s.sellingPrice - s.itemCost).toLocaleString('en-KE')}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.method}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {sales.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--text-muted)', fontSize: 13 }}>
              No sales yet — tap "+ New Sale" to start
            </div>
          )}
        </>
      )}

      {paying && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
        }} onClick={() => setPaying(null)} />
      )}
    </div>
  );
}

const lbl = { display: 'block', fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 };
const inp = { width: '100%', padding: '10px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', fontSize: 13, fontFamily: 'var(--mono)', outline: 'none', boxSizing: 'border-box' };
