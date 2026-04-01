import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Package, Users, ShoppingCart, TrendingUp, Edit } from 'lucide-react';

const Dashboard = () => {
  const [sales, setSales] = useState([]);
  const [clientsCount, setClientsCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    async function loadStats() {
      try {
        const startDate = `${filterDate}T00:00:00.000Z`;
        const endDate = `${filterDate}T23:59:59.999Z`;

        const [salesRes, clientsRes, productsRes] = await Promise.all([
          api.get('/sales', { params: { startDate, endDate } }),
          api.get('/clients'),
          api.get('/products'),
        ]);
        setSales(salesRes.data);
        setClientsCount(clientsRes.data.length);
        setProductsCount(productsRes.data.length);
      } catch (err) {
        console.error(err);
      }
    }
    loadStats();
  }, [filterDate]);

  const totalRevenue = sales.reduce((acc, sale) => acc + Number(sale.total_price), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: 600 }}>Visão Geral</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Filtrar Data:</label>
          <input type="date" className="form-input" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '1rem', borderRadius: 'var(--radius-md)' }}><ShoppingCart size={24} /></div>
          <div><p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Total de Vendas</p><h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{sales.length}</h3></div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: 'var(--success)', color: 'white', padding: '1rem', borderRadius: 'var(--radius-md)' }}><TrendingUp size={24} /></div>
          <div><p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Faturamento</p><h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>R$ {totalRevenue.toFixed(2)}</h3></div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: 'var(--warning)', color: 'white', padding: '1rem', borderRadius: 'var(--radius-md)' }}><Users size={24} /></div>
          <div><p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Clientes Cadastrados</p><h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{clientsCount}</h3></div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: '#8B5CF6', color: 'white', padding: '1rem', borderRadius: 'var(--radius-md)' }}><Package size={24} /></div>
          <div><p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Produtos Disponíveis</p><h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{productsCount}</h3></div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Últimas Vendas</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Cliente</th>
                <th>Entregador</th>
                <th>Itens</th>
                <th>Valor Total</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {sales.slice(0, 5).map(sale => (
                <tr key={sale.id}>
                  <td>{new Date(sale.date).toLocaleDateString()}</td>
                  <td>{sale.client?.name}</td>
                  <td>{sale.delivery_person?.name || 'Retirada'}</td>
                  <td>{sale.items.length}</td>
                  <td style={{ fontWeight: 600, color: 'var(--success)' }}>R$ {Number(sale.total_price).toFixed(2)}</td>
                  <td>
                    <Link to={`/edit-sale/${sale.id}`} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', textDecoration: 'none' }}>
                      <Edit size={14} /> Revisar
                    </Link>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Nenhuma venda registrada ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
