import React, { useState, useEffect, useMemo } from 'react';

const STORAGE_KEY = 'hustle_pos_v2';

const DEFAULT_CATEGORIES = [
  { name: 'Rings', group: 'Jewelry' },
  { name: 'Chains', group: 'Jewelry' },
  { name: 'Earrings', group: 'Jewelry' },
  { name: 'Gloves', group: 'Accessories' },
  { name: 'Refill Perfumes', group: 'Fragrances' },
  { name: 'Soaps', group: 'Skincare' },
  { name: 'Body Lotions', group: 'Skincare' },
];

const PAYMENT_METHODS = ['Mpesa', 'Cash', 'Bank'];

function fmt(n) {
  return 'Ksh ' + Math.round(Number(n)).toLocaleString('en-KE');
}

function today() {
  return new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '14px 16px',
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 500, color: color || 'var(--text)' }}>{value}</div>
    </div>
  );
}

function Badge({ method }) {
  const styles = {
    Mpesa: { bg: 'rgba(76,175,125,0.15)', color: '#4caf7d' },
    Cash: { bg: 'rgba(212,168,67,0.15)', color: '#d4a843' },
    Bank: { bg: 'rgba(91,155,213,0.15)', color: '#5b9bd5' },
  };
  const s = styles[method] || styles.Cash;
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 10, padding: '3px 8px',
      borderRadius: 99, fontWeight: 500,
      letterSpacing: '0.05em', textTransform: 'uppercase',
    }}>{method}</span>
  );
}

function SaleRow({ sale, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const rem = sale.remaining;
  const isSettled = rem <= 0;

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      marginBottom: 8,
      overflow: 'hidden',
      transition: 'border-color 0.15s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hi)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div
        style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
        onClick={() => setExpanded(x => !x)}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 500, fontSize: 14, color: 'var(--text)' }}>{sale.item}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--surface2)', padding: '2px 7px', borderRadius: 99 }}>{sale.category}</span>
            <Badge method={sale.paymentMethod} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {sale.name ? `${sale.name} · ` : ''}{sale.date}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--green)' }}>+{fmt(sale.profit)}</div>
          <div style={{ fontSize: 11, color: isSettled ? 'var(--green)' : 'var(--red)', marginTop: 2 }}>
            {isSettled ? 'Settled' : fmt(rem) + ' owing'}
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginLeft: 4 }}>{expanded ? '▲' : '▼'}</div>
      </div>

      {expanded && (
        <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 12 }}>
            {[
              ['Buying price', fmt(sale.buying)],
              ['Selling price', fmt(sale.selling)],
              ['Amount paid', fmt(sale.paid)],
            ].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{
              marginTop: 14, background: 'var(--red-bg)', color: 'var(--red)',
              border: '1px solid rgba(224,92,92,0.2)', borderRadius: 'var(--radius-sm)',
              padding: '6px 14px', fontSize: 12, cursor: 'pointer', letterSpacing: '0.05em',
            }}
          >Delete sale</button>
        </div>
      )}
    </div>
  );
}

const emptyForm = (cats) => ({
  name: '', item: '', category: cats[0] || '',
  buying: '', selling: '', paid: '', paymentMethod: 'Mpesa',
});

export default function App() {
  const [sales, setSales] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES.map(c => c.name));
  const [form, setForm] = useState(emptyForm(DEFAULT_CATEGORIES.map(c => c.name)));
  const [newCat, setNewCat] = useState('');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [view, setView] = useState('sales');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setSales(data.sales || []);
        setCategories(data.categories || DEFAULT_CATEGORIES.map(c => c.name));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ sales, categories }));
    } catch (e) {}
  }, [sales, categories]);

  const addCategory = () => {
    const val = newCat.trim();
    if (val && !categories.includes(val)) {
      setCategories(prev => [...prev, val]);
      setNewCat('');
    }
  };

  const addSale = () => {
    const { name, item, category, buying, selling, paid, paymentMethod } = form;
    if (!item.trim()) { setError('Item name is required.'); return; }
    const b = parseFloat(buying), s = parseFloat(selling), p = parseFloat(paid);
    if (isNaN(b) || b < 0) { setError('Enter a valid buying price.'); return; }
    if (isNaN(s) || s <= 0) { setError('Enter a valid selling price.'); return; }
    if (isNaN(p) || p < 0) { setError('Enter a valid amount paid.'); return; }
    if (p > s) { setError('Amount paid cannot exceed selling price.'); return; }
    setError('');
    const newSale = {
      id: Date.now(), name: name.trim(), item: item.trim(), category, paymentMethod,
      buying: b, selling: s, paid: p,
      remaining: s - p, profit: s - b,
      date: new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
    setSales(prev => [newSale, ...prev]);
    setForm(emptyForm(categories));
    setView('sales');
  };

  const deleteSale = (id) => setSales(prev => prev.filter(s => s.id !== id));

  const filtered = filter === 'All' ? sales : sales.filter(s => s.category === filter);

  const stats = useMemo(() => ({
    count: sales.length,
    revenue: sales.reduce((a, s) => a + s.selling, 0),
    profit: sales.reduce((a, s) => a + s.profit, 0),
    owing: sales.reduce((a, s) => a + Math.max(0, s.remaining), 0),
  }), [sales]);

  const inp = (field, placeholder, type = 'text') => (
    <input
      type={type} placeholder={placeholder}
      value={form[field]}
      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
      style={{ width: '100%', padding: '10px 12px' }}
      {...(type === 'number' ? { min: 0, step: 'any' } : {})}
    />
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', maxWidth: 480, margin: '0 auto', paddingBottom: 80 }}>

      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 26, color: 'var(--gold)', lineHeight: 1 }}>Hustle POS</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, letterSpacing: '0.06em' }}>{today()}</div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
            <div style={{ color: 'var(--green)', fontWeight: 500, fontSize: 14 }}>{fmt(stats.profit)}</div>
            <div>total profit</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '16px 20px' }}>
        <StatCard label="Sales" value={stats.count} />
        <StatCard label="Revenue" value={fmt(stats.revenue)} />
        <StatCard label="Owing" value={fmt(stats.owing)} color="var(--red)" />
      </div>

      <div style={{ display: 'flex', margin: '0 20px 16px', background: 'var(--surface)', borderRadius: 'var(--radius)', padding: 4, gap: 4 }}>
        {['sales', 'add'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            flex: 1, padding: '8px', fontSize: 13, border: 'none', cursor: 'pointer',
            borderRadius: 7, fontWeight: view === v ? 500 : 400,
            background: view === v ? 'var(--gold)' : 'transparent',
            color: view === v ? '#0a0a0a' : 'var(--text-muted)',
            letterSpacing: '0.04em',
          }}>
            {v === 'sales' ? `Sales (${sales.length})` : '+ New Sale'}
          </button>
        ))}
      </div>

      {view === 'add' && (
        <div style={{ padding: '0 20px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '20px' }}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Customer name (optional)</label>
              {inp('name', 'e.g. Wanjiku')}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Item *</label>
              {inp('item', 'e.g. Gold ring')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px' }}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Payment</label>
                <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px' }}>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div><label style={labelStyle}>Buying (Ksh)</label>{inp('buying', '0', 'number')}</div>
              <div><label style={labelStyle}>Selling (Ksh)</label>{inp('selling', '0', 'number')}</div>
              <div><label style={labelStyle}>Paid (Ksh)</label>{inp('paid', '0', 'number')}</div>
            </div>
            <div style={{ marginBottom: 18, display: 'flex', gap: 8 }}>
              <input placeholder="Add new category…" value={newCat}
                onChange={e => setNewCat(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCategory()}
                style={{ flex: 1, padding: '8px 12px', fontSize: 13 }} />
              <button onClick={addCategory} style={{
                background: 'var(--surface2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '8px 14px',
                fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer',
              }}>+ Add</button>
            </div>
            {error && <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{error}</div>}
            <button onClick={addSale} style={{
              width: '100%', padding: '13px', fontSize: 14, fontWeight: 500,
              background: 'var(--gold)', color: '#0a0a0a',
              border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer',
              letterSpacing: '0.05em', fontFamily: 'var(--mono)',
            }}>Record Sale</button>
          </div>
        </div>
      )}

      {view === 'sales' && (
        <div style={{ padding: '0 20px' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {['All', ...categories].map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} style={{
                fontSize: 11, padding: '5px 12px', borderRadius: 99,
                border: filter === cat ? 'none' : '1px solid var(--border)',
                background: filter === cat ? 'var(--gold)' : 'transparent',
                color: filter === cat ? '#0a0a0a' : 'var(--text-muted)',
                cursor: 'pointer', fontFamily: 'var(--mono)',
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>{cat}</button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '40px 20px',
              border: '1px dashed var(--border)', borderRadius: 'var(--radius)',
              color: 'var(--text-muted)', fontSize: 13,
            }}>
              {sales.length === 0 ? 'No sales yet — tap "+ New Sale" to start' : 'No sales in this category'}
            </div>
          ) : (
            filtered.map(sale => (
              <SaleRow key={sale.id} sale={sale} onDelete={() => deleteSale(sale.id)} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: 'block', fontSize: 10, color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5,
};
