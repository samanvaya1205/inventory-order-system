import React, { useEffect, useState } from 'react';
import { getOrders, getOrder, createOrder, deleteOrder, getCustomers, getProducts } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineEye, HiOutlineX } from 'react-icons/hi';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [submitting, setSubmitting] = useState(false);

  const loadOrders = () => {
    setLoading(true);
    getOrders().then((r) => setOrders(r.data)).catch(() => toast.error('Failed to load orders')).finally(() => setLoading(false));
  };

  useEffect(loadOrders, []);

  const openCreate = async () => {
    try {
      const [cRes, pRes] = await Promise.all([getCustomers(), getProducts()]);
      setCustomers(cRes.data);
      setProducts(pRes.data);
      setCustomerId('');
      setItems([{ product_id: '', quantity: 1 }]);
      setModal(true);
    } catch { toast.error('Failed to load data'); }
  };

  const openDetail = async (id) => {
    try {
      const res = await getOrder(id);
      setDetailModal(res.data);
    } catch { toast.error('Failed to load order details'); }
  };

  const addItem = () => setItems([...items, { product_id: '', quantity: 1 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const updateItem = (i, field, val) => {
    const copy = [...items];
    copy[i] = { ...copy[i], [field]: field === 'quantity' ? parseInt(val) || 0 : val };
    setItems(copy);
  };

  const calcTotal = () => {
    return items.reduce((sum, item) => {
      const prod = products.find((p) => p.id === parseInt(item.product_id));
      if (!prod) return sum;
      return sum + prod.price * (item.quantity || 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId) { toast.error('Select a customer'); return; }
    const validItems = items.filter((i) => i.product_id && i.quantity > 0);
    if (validItems.length === 0) { toast.error('Add at least one product'); return; }

    setSubmitting(true);
    try {
      await createOrder({
        customer_id: parseInt(customerId),
        items: validItems.map((i) => ({ product_id: parseInt(i.product_id), quantity: i.quantity })),
      });
      toast.success('Order created');
      setModal(false);
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create order');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Cancel this order? Stock will be restored.')) return;
    try { await deleteOrder(id); toast.success('Order cancelled'); loadOrders(); }
    catch (err) { toast.error(err.response?.data?.detail || 'Delete failed'); }
  };

  return (
    <>
      <div className="page-header">
        <h2>Orders</h2>
        <button className="btn btn-primary" onClick={openCreate}><HiOutlinePlus /> Create Order</button>
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading...</p></div>
      ) : orders.length === 0 ? (
        <div className="empty-state"><p>No orders yet. Create your first order.</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 700 }}>#{o.id}</td>
                  <td>{o.customer_name || `#${o.customer_id}`}</td>
                  <td>{o.items.length} item{o.items.length !== 1 ? 's' : ''}</td>
                  <td style={{ fontWeight: 600 }}>${o.total_amount.toFixed(2)}</td>
                  <td><span className="badge badge-success">{o.status}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openDetail(o.id)}><HiOutlineEye /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}><HiOutlineTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Order Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Order</h3>
              <button className="modal-close" onClick={() => setModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer</label>
                <select className="form-control" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                  <option value="">Select a customer...</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
                </select>
              </div>

              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                Order Items
              </label>
              {items.map((item, i) => (
                <div key={i} className="order-item-row">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <select className="form-control" value={item.product_id} onChange={(e) => updateItem(i, 'product_id', e.target.value)}>
                      <option value="">Select product...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} — ${p.price.toFixed(2)} (Stock: {p.quantity})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input className="form-control" type="number" min="1" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} placeholder="Qty" />
                  </div>
                  <button type="button" className="btn-remove" onClick={() => removeItem(i)} disabled={items.length === 1}>
                    <HiOutlineX />
                  </button>
                </div>
              ))}

              <button type="button" className="btn btn-ghost btn-sm" onClick={addItem} style={{ marginBottom: '1rem' }}>
                <HiOutlinePlus /> Add Item
              </button>

              <div style={{ padding: '0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Estimated Total</span>
                <span>${calcTotal().toFixed(2)}</span>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Placing...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {detailModal && (
        <div className="modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="modal" style={{ maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order #{detailModal.id}</h3>
              <button className="modal-close" onClick={() => setDetailModal(null)}>&times;</button>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Customer: <strong style={{ color: 'var(--text-primary)' }}>{detailModal.customer_name}</strong>
              </p>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Status: <span className="badge badge-success">{detailModal.status}</span>
              </p>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Date: {new Date(detailModal.created_at).toLocaleString()}
              </p>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
                <tbody>
                  {detailModal.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product_name || `Product #${item.product_id}`}</td>
                      <td>{item.quantity}</td>
                      <td>${item.unit_price.toFixed(2)}</td>
                      <td style={{ fontWeight: 600 }}>${item.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.05rem' }}>
              <span>Total</span>
              <span>${detailModal.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
