import React from 'react';

export default function Dashboard({ inventory, sales }) {
  const totalProfit = sales.reduce((a, s) => a + (s.sellingPrice - s.itemCost), 0);
  const totalRevenue = sales.reduce((a, s) => a + s.sellingPrice, 0);
  const totalOwing = sales.filter(s => s.paid < s.sellingPrice).reduce((a, s) => a + (s.sellingPrice - s.paid), 0);
  const totalCollected = sales.reduce((a, s) => a + s.paid, 0);

  const today = new Date().toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
  const todaySales = sales.filter(s => s.date === today);
  const todayProfit = todaySales.reduce((a, s) => a + (s.sellingPrice - s.itemCost), 0);

  const lowStock = inventory.filter(i => i.remaining <= 2 && i.remaining > 0);
  const outOfStock = inventory.filter(i => i.remaining === 0);
  const debtors = sales.filter(s => s.paid < s.sellingPrice);

  const categoryStats = {};
  sales.forEach(s => {
    const item = inventory.find(i => i.id === s.itemId);
    const cat = item?.category || 'Other';
    if (!categoryStats[cat]) categoryStats[cat] = { profit: 0, count: 0 };
    categoryStats[cat].profit += s.sellingPrice - s.itemCost;
    categoryStats[cat].count += 1;
  });
  const catList = Object.entries(categoryStats).sort((a, b) => b[1].profit - a[1].profit);
  const maxProfit = catList[0]?.[1].profit || 1;

  const mpesa = sales.filter(s => s.method === 'Mpesa').reduce((a, s) => a + s.paid, 0);
  const cash = sales.filter(s => s.method === 'Cash').reduce((a, s) => a + s.paid, 0);
  const bank = sales.filter(s => s.method === 'Bank').reduce((a, s) => a + s.paid, 0);

  return (
    <div>

      {/* Today snapshot */}
      <div style={{ marginBottom: 16 }}>
        <div style={sectionLabel}>Today</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <StatCard label="Sales" value={todaySales.length} />
          <StatCard label="Profit" value={`Ksh ${Math.round(todayProfit).toLocaleString('en-KE')}`} color="var(--green)" />
        </div>
      </div>

      {/* All time */}
      <div style={{ marginBottom: 16 }}>
        <div style={sectionLabel}>All time</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <StatCard label="Total sales" value={sales.length} />
          <StatCard label="Total profit" value={`Ksh ${Math.round(totalProfit).toLocaleString('en-KE')}`} color="var(--green)" />
          <StatCard label="Collected" value={`Ksh ${Math.round(totalCollected).toLocaleString('en-KE')}`} />
          <StatCard label="Owing" value={`Ksh ${Math.round(totalOwing).toLocaleString('en-KE')}`} color={totalOwing > 0 ? 'var(--red)' : 'var(--text)'} />
        </div>
      </div>

      {/* Money by method */}
      <div style={{ marginBottom: 16 }}>
        <div style={sectionLabel}>Money in</div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
          {[['Mpesa', mpesa, '#4caf7d'], ['Cash', cash, '#d4a843'], ['Bank', bank, '#5b9bd5']].map(([m, amt, color]) => (
            <div key={m} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{m}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color }}> Ksh {Math.round(amt).toLocaleString('en-KE')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category performance */}
      {catList.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={sectionLabel}>Best sellers</div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            {catList.map(([cat, { profit, count }]) => (
              <div key={cat} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cat} <span style={{ color: 'var(--text-dim)' }}>({count})</span></span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--green)' }}>Ksh {Math.round(profit).toLocaleString('en-KE')}</span>
                </div>
                <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 99 }}>
                  <div style={{ height: 4, borderRadius: 99, background: 'var(--green)', width: `${(profit / maxProfit) * 100}%`, transition: 'width 0.4s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Debtors */}
      {debtors.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={sectionLabel}>Debtors ({debtors.length})</div>
          <div style={{ background: 'var(--surface)', border: '1px solid rgba(224,92,92,0.3)', borderRadius: 10, overflow: 'hidden' }}>
            {debtors.map((s, i) => (
              <div key={s.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px',
                borderBottom: i < debtors.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{s.customerName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.itemName} · {s.date}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--red)' }}>
                  Ksh {(s.sellingPrice - s.paid).toLocaleString('en-KE')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock alerts */}
      {(lowStock.length > 0 || outOfStock.length > 0) && (
        <div style={{ marginBottom: 16 }}>
          <div style={sectionLabel}>Stock alerts</div>
          {outOfStock.map(i => (
            <div key={i.id} style={alertRow('#e05c5c')}>
              <span style={{ fontSize: 13 }}>{i.name}</span>
              <span style={{ fontSize: 11, color: 'var(--red)', fontWeight: 500 }}>OUT OF STOCK</span>
            </div>
          ))}
          {lowStock.map(i => (
            <div key={i.id} style={alertRow('#d4a843')}>
              <span style={{ fontSize: 13 }}>{i.name}</span>
              <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 500 }}>{i.remaining} LEFT</span>
            </div>
          ))}
        </div>
      )}

      {sales.length === 0 && inventory.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)', fontSize: 13 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>◈</div>
          <div style={{ marginBottom: 6, fontWeight: 500, color: 'var(--text)' }}>Welcome to Hustle POS</div>
          <div>Start by adding your stock in the Stock tab</div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 500, color: color || 'var(--text)' }}>{value}</div>
    </div>
  );
}

const sectionLabel = { fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 };
const alertRow = (color) => ({
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  background: 'var(--surface)', border: `1px solid ${color}33`,
  borderRadius: 8, padding: '10px 14px', marginBottom: 6,
});
