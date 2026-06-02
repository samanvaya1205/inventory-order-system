import React, { useEffect, useState } from 'react';
import { getDashboard } from '../services/api';
import { HiOutlineCube, HiOutlineUsers, HiOutlineClipboardList, HiOutlineExclamation } from 'react-icons/hi';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="empty-state"><p>Loading dashboard...</p></div>;
  if (!data) return <div className="empty-state"><p>Could not load dashboard data.</p></div>;

  return (
    <>
      <div className="page-header"><h2>Dashboard</h2></div>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon purple"><HiOutlineCube /></div>
          <div className="stat-info"><h3>{data.total_products}</h3><p>Total Products</p></div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon green"><HiOutlineUsers /></div>
          <div className="stat-info"><h3>{data.total_customers}</h3><p>Total Customers</p></div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon amber"><HiOutlineClipboardList /></div>
          <div className="stat-info"><h3>{data.total_orders}</h3><p>Total Orders</p></div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon red"><HiOutlineExclamation /></div>
          <div className="stat-info"><h3>{data.low_stock_products.length}</h3><p>Low Stock Items</p></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Low Stock */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Low Stock Products</h3>
          {data.low_stock_products.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>All products are well-stocked.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Product</th><th>SKU</th><th>Qty</th></tr>
                </thead>
                <tbody>
                  {data.low_stock_products.map((p) => (
                    <tr key={p.id} className="low-stock-row">
                      <td>{p.name}</td>
                      <td><span className="sku">{p.sku}</span></td>
                      <td>{p.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Recent Orders</h3>
          {data.recent_orders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No orders yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>#</th><th>Customer</th><th>Total</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {data.recent_orders.map((o) => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 600 }}>#{o.id}</td>
                      <td>{o.customer_name || `Customer #${o.customer_id}`}</td>
                      <td>${o.total_amount.toFixed(2)}</td>
                      <td><span className="badge badge-success">{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
