import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Truck, MapPin, Printer } from 'lucide-react';

const Logistics = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [saleToPrint, setSaleToPrint] = useState(null);

  useEffect(() => {
    loadReports();
  }, [filterDate]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const startDate = `${filterDate}T00:00:00.000Z`;
      const endDate = `${filterDate}T23:59:59.999Z`;
      const res = await api.get('/delivery/reports', { params: { startDate, endDate } });
      setReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (sale, deliveryPersonName) => {
    setSaleToPrint({ ...sale, deliveryPersonName });
    setTimeout(() => window.print(), 100);
  };

  return (
    <div>
      <div className="no-print">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3>Relatório de Logística e Fretes</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Filtrar Data:</label>
          <input type="date" className="form-input" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>Carregando dados logísticos...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {reports.map(person => (
            <div key={person.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <Truck size={20} color="var(--primary)" /> {person.name}
                </h4>
                <span className="badge badge-success">{person.total_deliveries} entregas</span>
              </div>
              
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Transportado (R$)</p>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 1rem 0' }}>R$ {Number(person.total_amount).toFixed(2)}</h2>

              {person.sales.length > 0 ? (
                <div style={{ backgroundColor: 'var(--background)', borderRadius: 'var(--radius-md)', padding: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Rotas / Pedidos</p>
                  {person.sales.map(sale => (
                    <div key={sale.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong style={{ color: 'var(--text-main)' }}>Pedido #{sale.id} - {sale.client_name}</strong>
                        <span>R$ {Number(sale.total).toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          <MapPin size={12} /> {sale.client_address || 'Endereço não informado'}
                        </div>
                        <button className="btn btn-outline" style={{ padding: '0.1rem 0.3rem', fontSize: '0.7rem' }} onClick={() => handlePrint(sale, person.name)}>
                          <Printer size={12} /> Imprimir
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Sem entregas registradas para este período.</p>
              )}
            </div>
          ))}
          {reports.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)' }}>
              Nenhum entregador cadastrado ou dados indisponíveis.
            </div>
          )}
        </div>
      )}
      </div>

      {saleToPrint && (
      <div className="print-only" style={{ display: 'none' }}>
        {['Via do Estabelecimento', 'Via do Cliente'].map((via, index) => (
          <div key={index} style={{ flex: 1, paddingRight: index === 0 ? '1rem' : 0, borderRight: index === 0 ? '1px dashed black' : 'none', paddingLeft: index === 1 ? '1rem' : 0 }}>
            <div style={{ textAlign: 'center', marginBottom: '0.5rem', borderBottom: '1px dashed #000', paddingBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '14px', margin: 0, textTransform: 'uppercase' }}>SySilveira ERP</h1>
              <p style={{ margin: '0.2rem 0', fontSize: '10px' }}>Comprovante Não Fiscal - {via}</p>
              <p style={{ margin: 0, fontSize: '10px' }}>{new Date(saleToPrint.date).toLocaleString()}</p>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '12px' }}>Pedido Nº: {saleToPrint.id}</p>
            </div>

            <div style={{ marginBottom: '0.5rem', fontSize: '11px' }}>
              <p style={{ margin: '0.1rem 0' }}><strong>CLIENTE:</strong> {saleToPrint.client_name.toUpperCase()}</p>
              <p style={{ margin: '0.1rem 0' }}><strong>ENDEREÇO:</strong> {saleToPrint.client_address || 'N/I'}</p>
              <p style={{ margin: '0.1rem 0' }}><strong>ENTREGADOR:</strong> {saleToPrint.deliveryPersonName.toUpperCase()}</p>
            </div>

            {saleToPrint.items && saleToPrint.items.length > 0 && (
              <table style={{ width: '100%', marginBottom: '0.5rem', borderTop: '1px solid black', borderBottom: '1px solid black', fontSize: '10px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0.2rem 0', textAlign: 'left' }}>QTD</th>
                    <th style={{ padding: '0.2rem 0', textAlign: 'left' }}>ITEM</th>
                    <th style={{ padding: '0.2rem 0', textAlign: 'right' }}>V.UN</th>
                    <th style={{ padding: '0.2rem 0', textAlign: 'right' }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {saleToPrint.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '0.1rem 0' }}>{item.quantity}</td>
                      <td style={{ padding: '0.1rem 0' }}>{item.product.name}</td>
                      <td style={{ padding: '0.1rem 0', textAlign: 'right' }}>{Number(item.price).toFixed(2)}</td>
                      <td style={{ padding: '0.1rem 0', textAlign: 'right' }}>{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>
                TOTAL R$ {Number(saleToPrint.total).toFixed(2)}
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
                Obrigado pela preferência!
            </div>


          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default Logistics;
