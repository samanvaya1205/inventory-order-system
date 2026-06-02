import React, { useEffect, useState } from 'react';
import { getCustomers, createCustomer, deleteCustomer } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineUsers } from 'react-icons/hi';

const emptyForm = { full_name: '', email: '', phone: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    getCustomers().then((r) => setCustomers(r.data)).catch(() => toast.error('Failed to load customers')).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const close = () => { setModal(false); setForm(emptyForm); };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.phone) {
      toast.error('All fields are required'); return;
    }
    setSubmitting(true);
    try {
      await createCustomer(form);
      toast.success('Customer added');
      close(); load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create customer');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return;
    try { await deleteCustomer(id); toast.success('Customer deleted'); load(); }
    catch (err) { toast.error(err.response?.data?.detail || 'Delete failed'); }
  };

  return (
    <>
      <div className="page-header">
        <h2>Customers</h2>
        <button className="btn btn-primary" onClick={() => setModal(true)}><HiOutlinePlus /> Add Customer</button>
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading...</p></div>
      ) : customers.length === 0 ? (
        <div className="empty-state"><HiOutlineUsers size={40} /><p>No customers yet. Add your first customer.</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.full_name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}><HiOutlineTrash /></button>
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
              <h3>Add Customer</h3>
              <button className="modal-close" onClick={close}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input className="form-control" name="full_name" value={form.full_name} onChange={handleChange} placeholder="e.g. John Doe" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input className="form-control" name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input className="form-control" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 234 567 8900" />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={close}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
