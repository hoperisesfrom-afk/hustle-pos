import React, { useState, useEffect } from 'react';
import Inventory from './Inventory';
import Sales from './Sales';
import Dashboard from './Dashboard';

const STORAGE_KEY = 'hustle_pos_v3';

export function useStore() {
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        setInventory(d.inventory || []);
        setSales(d.sales || []);
      }
    } catch (e) {}
  }, []);

  const save = (inv, sal) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ inventory: inv, sales: sal }));
    } catch (e) {}
  };

  const addInventoryItem = (item) => {
    const updated = [{ ...item, id: Date.now(), remaining: item.qty }, ...inventory];
    setInventory(updated);
    save(updated, sales);
  };

  const addSale = (sale) => {
    const updatedSales = [{ ...sale, id: Date.now(), date: new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }) }, ...sales];
    const updatedInv = inventory.map(i =>
      i.id === sale.itemId ? { ...i, remaining: Math.max(0, i.remaining - 1) } : i
    );
    setSales(updatedSales);
    setInventory(updatedInv);
    save(updatedInv, updatedSales);
  };

  const deleteInventoryItem = (id) => {
    const updated = inventory.filter(i => i.id !== id);
    setInventory(updated);
    save(updated, sales);
  };

  const deleteSale = (id) => {
    const sale = sales.find(s => s.id === id);
    const updatedSales = sales.filter(s => s.id !== id);
    const updatedInv = inventory.map(i =>
      i.id === sale?.itemId ? { ...i, remaining: i.remaining + 1 } : i
    );
    setSales(updatedSales);
    setInventory(updatedInv);
    save(updatedInv, updatedSales);
  };

  const markPaid = (saleId, amount) => {
    const updatedSales = sales.map(s =>
      s.id === saleId ? { ...s, paid: Math.min(s.sellingPrice, s.paid + amount), } : s
    );
    setSales(updatedSales);
    save(inventory, updatedSales);
  };

  return { inventory, sales, addInventoryItem, addSale, deleteInventoryItem, deleteSale, markPaid };
}

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '◈' },
  { id: 'inventory', label: 'Stock', icon: '▤' },
  { id: 'sales', label: 'Sell', icon: '⊕' },
];

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const store = useStore();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', maxWidth: 480, margin: '0 auto', paddingBottom: 72 }}>
      <header style={{ padding: '20px 20px 12px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 24, color: 'var(--gold)' }}>Liz Luxe</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'short' })}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--green)' }}>
            Ksh {Math.round(store.sales.reduce((a, s) => a + (s.sellingPrice - s.itemCost), 0)).toLocaleString('en-KE')}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>total profit</div>
        </div>
      </header>

      <main style={{ padding: '16px 20px' }}>
        {tab === 'dashboard' && <Dashboard {...store} />}
        {tab === 'inventory' && <Inventory {...store} />}
        {tab === 'sales' && <Sales {...store} setTab={setTab} />}
      </main>

      <nav style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: 'var(--surface)', borderTop: '1px solid var(--border)',
        display: 'flex',
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '12px 8px 10px', border: 'none', background: 'none', cursor: 'pointer',
            color: tab === t.id ? 'var(--gold)' : 'var(--text-muted)',
            borderTop: tab === t.id ? '2px solid var(--gold)' : '2px solid transparent',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--mono)' }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
