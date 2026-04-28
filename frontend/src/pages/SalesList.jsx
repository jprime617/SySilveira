import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Edit, FileText } from 'lucide-react';

const SalesList = () => {
  const [sales, setSales] = useState([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSales() {
      setLoading(true);
      try {
        const start = `${startDate}T00:00:00.000Z`;
        const end = `${endDate}T23:59:59.999Z`;

        const res = await api.get('/sales', { params: { startDate: start, endDate: end } });
        setSales(res.data);
      } catch (err) {
        console.error('Erro ao carregar notas:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSales();
  }, [startDate, endDate]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={24} /> Revisar Notas
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--card-bg)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>De:</label>
            <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.875rem' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Até:</label>
            <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.875rem' }} />
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Carregando notas...</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nº / ID</th>
                  <th>Data/Hora</th>
                  <th>Cliente</th>
                  <th>Entregador</th>
                  <th>Itens</th>
                  <th>Valor Total</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(sale => (
                  <tr key={sale.id}>
                    <td style={{ fontWeight: 500, color: 'var(--text-muted)' }}>#{sale.id}</td>
                    <td>{new Date(sale.date).toLocaleString('pt-br')}</td>
                    <td>{sale.client?.name || 'Desconhecido'}</td>
                    <td>{sale.delivery_person?.name || 'Retirada no Local'}</td>
                    <td>{sale.items?.length || 0}</td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>
                      {Number(sale.total_price).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td>
                      <Link 
                        to={`/edit-sale/${sale.id}`} 
                        className="btn btn-outline" 
                        style={{ padding: '0.3rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', textDecoration: 'none' }}
                      >
                        <Edit size={14} /> Revisar/Editar
                      </Link>
                    </td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Nenhuma nota encontrada no período selecionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SalesList;
