import React, { useState, useEffect, useCallback } from 'react';
import Inventory from './Inventory';
import Sales from './Sales';
import Dashboard from './Dashboard';
import { supabase } from './supabase';

export function useStore() {
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [{ data: inv }, { data: sal }] = await Promise.all([
      supabase.from('inventory').select('*').order('created_at', { ascending: false }),
      supabase.from('sales').select('*').order('created_at', { ascending: false }),
    ]);
    setInventory(inv || []);
    setSales(sal || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addInventoryItem = async (item) => {
    await supabase.from('inventory').insert([{
      name: item.name, category: item.category,
      buying_price: item.buyingPrice, selling_price: item.sellingPrice,
      qty: item.qty, remaining: item.qty,
    }]);
    await fetchAll();
  };

  const addSale = async (sale) => {
    await supabase.from('sales').insert([{
      customer_name: sale.customerName, item_id: sale.itemId,
      item_name: sale.itemName, item_cost: sale.itemCost,
      selling_price: sale.sellingPrice, paid: sale.paid,
      method: sale.method,
      date: new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' }),
    }]);
    await supabase.from('inventory').update({ remaining: sale.newRemaining }).eq('id', sale.itemId);
    await fetchAll();
  };

  const deleteInventoryItem = async (id) => {
    await supabase.from('inventory').delete().eq('id', id);
    await fetchAll();
  };

  const deleteSale = async (id) => {
    const sale = sales.find(s => s.id === id);
    await supabase.from('sales').delete().eq('id', id);
    if (sale) {
      const item = inventory.find(i => i.id === sale.item_id);
      if (item) {
        await supabase.from('inventory').update({ remaining: item.remaining + 1 }).eq('id', item.id);
      }
    }
    await fetchAll();
  };

  const markPaid = async (saleId, amount) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;
    const newPaid = Math.min(sale.selling_price, sale.paid + amount);
    await supabase.from('sales').update({ paid: newPaid }).eq('id', saleId);
    await fetchAll();
  };

  return { inventory, sales, loading, fetchAll, addInventoryItem, addSale, deleteInventoryItem, deleteSale, markPaid };
}

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '◈' },
  { id: 'inventory', label: 'Stock', icon: '▤' },
  { id: 'sales', label: 'Sell', icon: '⊕' },
];

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const store = useStore();

  const totalProfit = store.sales.reduce((a, s) => a + (s.selling_price - s.item_cost), 0);

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
            Ksh {Math.round(totalProfit).toLocaleString('en-KE')}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>total profit</div>
        </div>
      </header>

      {store.loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--gold)', marginBottom: 8 }}>Liz Luxe</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading your store...</div>
        </div>
      ) : (
        <main style={{ padding: '16px 20px' }}>
          {tab === 'dashboard' && <Dashboard {...store} />}
          {tab === 'inventory' && <Inventory {...store} />}
          {tab === 'sales' && <Sales {...store} setTab={setTab} />}
        </main>
      )}

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
