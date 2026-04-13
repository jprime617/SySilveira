import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Search, Printer, FileText } from 'lucide-react';

const Reports = () => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPerson, setSelectedPerson] = useState('ALL');
  
  const [deliveryPeopleList, setDeliveryPeopleList] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch only the list of Delivery People once to populate the dropdown
  useEffect(() => {
    const fetchDeliveryPeople = async () => {
      try {
        const response = await api.get('/delivery_people');
        setDeliveryPeopleList(response.data);
      } catch (err) {
        console.error('Erro ao buscar motoboys', err);
      }
    };
    fetchDeliveryPeople();
  }, []);

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setReportData([]);
    try {
      const sDate = `${startDate}T00:00:00.000Z`;
      const eDate = `${endDate}T23:59:59.999Z`;
      
      const response = await api.get('/delivery/reports', { params: { startDate: sDate, endDate: eDate } });
      
      let data = response.data;
      if (selectedPerson !== 'ALL') {
         data = data.filter(person => String(person.id) === String(selectedPerson));
      }
      
      setReportData(data);
    } catch (err) {
      console.error(err);
      alert('Houve um erro ao buscar o relatório.');
    } finally {
      setLoading(false);
    }
  };

  const calculateGlobalTotal = () => {
    return reportData.reduce((acc, person) => acc + Number(person.total_amount), 0);
  };
  
  const calculateTotalDeliveries = () => {
      return reportData.reduce((acc, person) => acc + person.total_deliveries, 0);
  };

  const handlePrint = () => {
    setTimeout(() => window.print(), 100);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="no-print card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
          <FileText size={24} /> Emissão de Relatório Financeiro
        </h3>
        
        <form onSubmit={handleGenerateReport} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14} /> Data Inicial</label>
            <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} required />
          </div>
          
          <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14} /> Data Final</label>
            <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} required />
          </div>

          <div className="form-group" style={{ flex: 2, minWidth: '200px' }}>
            <label>Motoboy / Tipo de Envio</label>
            <select className="form-input" value={selectedPerson} onChange={e => setSelectedPerson(e.target.value)}>
              <option value="ALL">Todos os Motoboys + Retiradas</option>
              {deliveryPeopleList.map(dp => (
                <option key={dp.id} value={dp.id}>{dp.name}</option>
              ))}
              <option value="pickup">Somente Retiradas no Local</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: '42px', padding: '0 2rem' }} disabled={loading}>
            <Search size={18} style={{ marginRight: '0.5rem' }} /> Gerar Extrato
          </button>
        </form>
      </div>

      {loading && <p className="no-print" style={{ textAlign: 'center' }}>Calculando fechamentos...</p>}

      {!loading && reportData.length > 0 && (
        <div className="card" style={{ padding: '2rem' }}>
          
          {/* Cabeçalho do Extrato / Impresso */}
          <div style={{ borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <div>
                  <h2 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>EXTRATO DE ENTREGAS</h2>
                  <p style={{ margin: '0.5rem 0', color: '#555' }}><strong>PERÍODO:</strong> {startDate.split('-').reverse().join('/')} até {endDate.split('-').reverse().join('/')}</p>
                  <p style={{ margin: '0', color: '#555' }}>
                    <strong>FILTRO APLICADO: </strong> 
                    {selectedPerson === 'ALL' ? 'Todos os Registros' : selectedPerson === 'pickup' ? 'Retirada no Local' : deliveryPeopleList.find(d => String(d.id) === String(selectedPerson))?.name }
                  </p>
               </div>
               
               <button className="btn btn-success no-print" onClick={handlePrint}>
                  <Printer size={18} style={{ marginRight: '0.5rem' }}/> Imprimir Fechamento
               </button>
            </div>
            
            <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '4px' }}>
               <div>
                  <span style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>Volume Transportado</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>R$ {calculateGlobalTotal().toFixed(2)}</div>
               </div>
               <div>
                  <span style={{ fontSize: '0.8rem', color: '#666', textTransform: 'uppercase' }}>Total de Corridas / Pedidos</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{calculateTotalDeliveries()} un</div>
               </div>
            </div>
          </div>

          {/* Listagem Dinâmica - adaptada para leitura limpa na impressora */}
          <div className="report-print-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
             {reportData.map(person => (
                person.total_deliveries > 0 && (
                  <div key={person.id} style={{ breakInside: 'avoid' }}>
                    <h4 style={{ backgroundColor: '#eee', padding: '0.5rem', margin: '0 0 1rem 0', borderLeft: '4px solid #333' }}>
                      {person.name.toUpperCase()} - (Total R$: {Number(person.total_amount).toFixed(2)})
                    </h4>
                    
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #ccc' }}>
                          <th style={{ textAlign: 'left', padding: '0.5rem' }}>Data</th>
                          <th style={{ textAlign: 'left', padding: '0.5rem' }}>Pedido</th>
                          <th style={{ textAlign: 'left', padding: '0.5rem' }}>Cliente</th>
                          <th style={{ textAlign: 'right', padding: '0.5rem' }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {person.sales.map(sale => (
                          <tr key={sale.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '0.5rem' }}>{new Date(sale.date).toLocaleString()}</td>
                            <td style={{ padding: '0.5rem' }}>#{sale.id}</td>
                            <td style={{ padding: '0.5rem' }}>{sale.client_name}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>R$ {Number(sale.total).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
             ))}
             {calculateTotalDeliveries() === 0 && (
                <div style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>Nenhuma venda foi registrada neste critério.</div>
             )}
          </div>
          
        </div>
      )}
    </div>
  );
};

export default Reports;
