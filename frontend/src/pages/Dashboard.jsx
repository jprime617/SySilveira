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

  const handleCleanup = async () => {
    if (!window.confirm("Atenção: Esta ação vai varrer o banco de dados e excluir o histórico de TODAS as vendas e movimentos de estoque mais antigos que 12 meses. Esta ação é IRREVERSÍVEL. Tem certeza que deseja otimizar o banco?")) return;
    
    try {
      const res = await api.delete('/system/cleanup');
      alert(`Limpeza concluída! ${res.data.details.salesDeleted} vendas antigas de antes de ${new Date(res.data.details.cutoffDate).toLocaleDateString()} foram removidas para liberar espaço.`);
      window.location.reload();
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("Ação negada. Apenas Administradores podem limpar o banco de dados.");
      } else {
        alert("Erro ao tentar limpar o banco.");
      }
    }
  };

  // Pega o usuário do localStorage para verificar se é admin
  const userStr = localStorage.getItem('@ERPLite:user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user && user.role === 'ADMIN';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontWeight: 600 }}>Visão Geral</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          
          {isAdmin && (
            <button className="btn btn-outline hide-on-mobile" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', fontSize: '0.8rem', padding: '0.3rem 0.6rem' }} onClick={handleCleanup}>
              Limpar Dados Antigos (&gt; 1 ano)
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Filtrar Data:</label>
            <input type="date" className="form-input" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card metric-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="metric-icon" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '1rem', borderRadius: 'var(--radius-md)' }}><ShoppingCart size={24} /></div>
          <div><p className="metric-title" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Total de Vendas</p><h3 className="metric-value" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{sales.length}</h3></div>
        </div>
        <div className="card metric-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="metric-icon" style={{ backgroundColor: 'var(--success)', color: 'white', padding: '1rem', borderRadius: 'var(--radius-md)' }}><TrendingUp size={24} /></div>
          <div><p className="metric-title" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Faturamento</p><h3 className="metric-value" style={{ fontSize: '1.5rem', fontWeight: 700 }}>R$ {totalRevenue.toFixed(2)}</h3></div>
        </div>
        <div className="card metric-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="metric-icon" style={{ backgroundColor: 'var(--warning)', color: 'white', padding: '1rem', borderRadius: 'var(--radius-md)' }}><Users size={24} /></div>
          <div><p className="metric-title" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Clientes Cadastrados</p><h3 className="metric-value" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{clientsCount}</h3></div>
        </div>
        <div className="card metric-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="metric-icon" style={{ backgroundColor: '#8B5CF6', color: 'white', padding: '1rem', borderRadius: 'var(--radius-md)' }}><Package size={24} /></div>
          <div><p className="metric-title" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Produtos Disponíveis</p><h3 className="metric-value" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{productsCount}</h3></div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem', padding: '2rem', background: 'var(--card-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>Gerenciamento de Notas</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Para revisar, editar ou consultar o histórico completo de notas geradas no sistema, acesse a nova página de revisão.</p>
        <Link to="/sales" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <Edit size={18} /> Acessar Revisão de Notas
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
