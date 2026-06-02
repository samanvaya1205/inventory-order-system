import React, { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

const emptyForm = { name: '', sku: '', price: '', quantity: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    getProducts().then((r) => setProducts(r.data)).catch(() => toast.error('Failed to load products')).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, sku: p.sku, price: String(p.price), quantity: String(p.quantity) }); setModal(true); };
  const close = () => { setModal(false); setEditing(null); setForm(emptyForm); };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.sku || !form.price || form.quantity === '') {
      toast.error('All fields are required'); return;
    }
    setSubmitting(true);
    const payload = { name: form.name, sku: form.sku, price: parseFloat(form.price), quantity: parseInt(form.quantity) };
    try {
      if (editing) {
        await updateProduct(editing.id, payload);
        toast.success('Product updated');
      } else {
        await createProduct(payload);
        toast.success('Product created');
      }
      close(); load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Operation failed');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await deleteProduct(id); toast.success('Product deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.detail || 'Delete failed'); }
  };

  return (
    <>
      <div className="page-header">
        <h2>Products</h2>
        <button className="btn btn-primary" onClick={openAdd}><HiOutlinePlus /> Add Product</button>
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading...</p></div>
      ) : products.length === 0 ? (
        <div className="empty-state"><HiOutlineCube size={40} /><p>No products yet. Add your first product.</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>SKU</th><th>Price</th><th>Quantity</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td><span className="sku">{p.sku}</span></td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${p.quantity <= 10 ? (p.quantity === 0 ? 'badge-danger' : 'badge-warning') : 'badge-success'}`}>
                      {p.quantity}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}><HiOutlinePencil /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}><HiOutlineTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button className="modal-close" onClick={close}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name</label>
                  <input className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Widget Pro" />
                </div>
                <div className="form-group">
                  <label>SKU / Code</label>
                  <input className="form-control" name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. WDG-001" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input className="form-control" name="price" type="number" step="0.01" min="0.01" value={form.price} onChange={handleChange} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input className="form-control" name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} placeholder="0" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={close}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
