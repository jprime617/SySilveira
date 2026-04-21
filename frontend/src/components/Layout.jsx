import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Users, ShoppingCart, Truck, LogOut, UserPlus, Bike, FileText, Menu, X } from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('@ERPLite:token');
    localStorage.removeItem('@ERPLite:user');
    navigate('/login');
  };

  return (
    <div className="main-layout">
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay no-print" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <aside className={`sidebar no-print ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '2rem 1.5rem', fontWeight: '800', fontSize: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid var(--border)' }}>
          ERP Lite
        </div>
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          <Link to="/" className={`sidebar-item ${location.pathname === '/' ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/products" className={`sidebar-item ${location.pathname === '/products' ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
            <Package size={20} /> Produtos
          </Link>
          <Link to="/clients" className={`sidebar-item ${location.pathname === '/clients' ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
            <Users size={20} /> Clientes
          </Link>
          <Link to="/logistics" className={`sidebar-item ${location.pathname === '/logistics' ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
            <Truck size={20} /> Logística
          </Link>
          <Link to="/delivery-people" className={`sidebar-item ${location.pathname === '/delivery-people' ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
            <Bike size={20} /> Motoboys
          </Link>
          <Link to="/users" className={`sidebar-item ${location.pathname === '/users' ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
            <UserPlus size={20} /> Usuários
          </Link>
          <Link to="/reports" className={`sidebar-item ${location.pathname === '/reports' ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
            <FileText size={20} /> Relatórios Financeiros
          </Link>
          <Link to="/pos" className={`sidebar-item ${location.pathname === '/pos' ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}>
             <ShoppingCart size={20} /> Vender (PDV)
          </Link>
        </nav>
        <div style={{ padding: '1rem' }}>
          <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={handleLogout}>
            <LogOut size={20} /> Sair
          </button>
        </div>
      </aside>
      <main className="content-area">
        <header className="header-app no-print" style={{ marginBottom: '2rem', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="btn btn-outline mobile-menu-btn" 
              onClick={() => setIsSidebarOpen(true)}
              style={{ padding: '0.5rem', display: 'none' }}
            >
              <Menu size={24} />
            </button>
            <h2>{location.pathname === '/pos' ? 'Ponto de Venda' : 'Painel de Controle'}</h2>
          </div>
          <div className="badge badge-success">Ativo</div>
        </header>
        {children}
      </main>
    </div>
  );
};

export default Layout;
