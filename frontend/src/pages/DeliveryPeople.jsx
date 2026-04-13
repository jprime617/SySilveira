import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Truck } from 'lucide-react';

const DeliveryPeople = () => {
  const [deliveryPeople, setDeliveryPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '' });
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('@ERPLite:user') || '{}');
    setUserRole(user.role);
    loadDeliveryPeople();
  }, []);

  const loadDeliveryPeople = async () => {
    try {
      const response = await api.get('/delivery_people');
      setDeliveryPeople(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliveryPersonSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/delivery_people', form);
      setForm({ name: '' });
      loadDeliveryPeople();
      alert('Motoboy cadastrado com sucesso!');
    } catch (err) {
      alert('Erro ao criar Motoboy');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3>Gerenciar Motoboys (Entregadores)</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginTop: '1.5rem', marginBottom: '2rem' }}>
        {/* Delivery Person Form */}
        {userRole === 'ADMIN' && (
          <div className="card">
            <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Novo Motoboy</h4>
            <form onSubmit={handleDeliveryPersonSubmit}>
              <div className="form-group">
                <label>Nome do Entregador</label>
                <input 
                    type="text" 
                    className="form-input" 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    required 
                    placeholder="Ex: Carlos (Placa ABC-1234)"
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                <Plus size={18} /> Cadastrar Motoboy
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="card">
        <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Truck size={20} /> Lista de Motoboys Cadastrados
        </h4>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome do Motoboy</th>
              </tr>
            </thead>
            <tbody>
              {deliveryPeople.map(person => (
                  <tr key={person.id}>
                    <td>{person.id}</td>
                    <td style={{ fontWeight: 500 }}>{person.name}</td>
                  </tr>
              ))}
              {!loading && deliveryPeople.length === 0 && (
                <tr><td colSpan={2} style={{ textAlign: 'center' }}>Nenhum motoboy cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DeliveryPeople;
