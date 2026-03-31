import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, DollarSign } from 'lucide-react';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', address: '', phone: '' });

  const [products, setProducts] = useState([]);
  const [priceForm, setPriceForm] = useState({ client_id: '', product_id: '', agreed_price: '' });
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('@ERPLite:user') || '{}');
    setUserRole(user.role);
    loadClients();
    loadProducts();
  }, []);

  const loadClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/clients', form);
      setForm({ name: '', address: '', phone: '' });
      loadClients();
    } catch (err) {
      alert('Erro ao criar cliente');
    }
  };

  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/clients/${priceForm.client_id}/prices`, {
        product_id: priceForm.product_id,
        agreed_price: priceForm.agreed_price
      });
      alert('Preço Acordado salvo com sucesso!');
      setPriceForm({ client_id: '', product_id: '', agreed_price: '' });
    } catch (err) {
      alert('Erro ao salvar preço');
    }
  };

  return (
    <div>
      <h3>Gerenciar Clientes</h3>

      <div style={{ display: 'grid', gridTemplateColumns: userRole === 'ADMIN' ? '1fr 1fr' : '1fr', gap: '2rem', marginTop: '1.5rem', marginBottom: '2rem' }}>
        {/* Cliente Form */}
        <div className="card">
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Novo Cliente</h4>
          <form onSubmit={handleClientSubmit}>
            <div className="form-group">
              <label>Nome / Razão Social</label>
              <input type="text" className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input type="text" className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Endereço</label>
              <input type="text" className="form-input" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}><Plus size={18} /> Cadastrar Cliente</button>
          </form>
        </div>

        {/* Preço Acordado Form (Apenas Admin) */}
        {userRole === 'ADMIN' && (
        <div className="card" style={{ border: '1px solid var(--primary)' }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={20} /> Preço Específico (Smart Pricing)
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Desconto ou preço travado para um cliente.</p>
          <form onSubmit={handlePriceSubmit}>
            <div className="form-group">
              <label>Cliente</label>
              <select className="form-select" value={priceForm.client_id} onChange={e => setPriceForm({...priceForm, client_id: e.target.value})} required>
                <option value="">Selecione o Cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Produto</label>
              <select className="form-select" value={priceForm.product_id} onChange={e => setPriceForm({...priceForm, product_id: e.target.value})} required>
                <option value="">Selecione o Produto</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Base: R$ {p.base_price})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Preço Acordado (R$)</label>
              <input type="number" step="0.01" className="form-input" value={priceForm.agreed_price} onChange={e => setPriceForm({...priceForm, agreed_price: e.target.value})} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Salvar Regra</button>
          </form>
        </div>
        )}
      </div>

      <div className="card">
        <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Lista de Clientes</h4>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Endereço</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id}>
                  <td>{client.id}</td>
                  <td style={{ fontWeight: 500 }}>{client.name}</td>
                  <td>{client.phone}</td>
                  <td>{client.address}</td>
                </tr>
              ))}
              {!loading && clients.length === 0 && (
                <tr><td colSpan="4" style={{ textAlign: 'center' }}>Nenhum cliente cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Clients;
