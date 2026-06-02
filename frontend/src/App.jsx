import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HiOutlineHome, HiOutlineCube, HiOutlineUsers, HiOutlineClipboardList, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';

import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/', icon: <HiOutlineHome size={20} />, label: 'Dashboard' },
    { to: '/products', icon: <HiOutlineCube size={20} />, label: 'Products' },
    { to: '/customers', icon: <HiOutlineUsers size={20} />, label: 'Customers' },
    { to: '/orders', icon: <HiOutlineClipboardList size={20} />, label: 'Orders' },
  ];

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1e2130', color: '#f1f1f4', border: '1px solid #2e3247' },
        }}
      />

      {/* Mobile header */}
      <div className="mobile-header">
        <button className="hamburger" onClick={() => setSidebarOpen(true)}>
          <HiOutlineMenu />
        </button>
        <span style={{ marginLeft: '0.75rem', fontWeight: 700, fontSize: '0.95rem' }}>InvenTrack</span>
      </div>

      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <div className="app-layout">
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-brand">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1>InvenTrack</h1>
              <button className="hamburger" onClick={() => setSidebarOpen(false)} style={{ display: sidebarOpen ? 'block' : 'none' }}>
                <HiOutlineX />
              </button>
            </div>
            <span>Inventory & Orders</span>
          </div>
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
