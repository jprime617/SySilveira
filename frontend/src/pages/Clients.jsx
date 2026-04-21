import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { Plus, DollarSign, Upload, Download, Trash2 } from 'lucide-react';
import SearchableSelect from '../components/SearchableSelect';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', address: '', phone: '' });

  const [products, setProducts] = useState([]);
  const [priceForm, setPriceForm] = useState({ client_id: '', product_id: '', agreed_price: '' });
  const [userRole, setUserRole] = useState('');
  const fileInputRef = useRef(null);

  const [editingClient, setEditingClient] = useState(null);
  const [editClientForm, setEditClientForm] = useState({ name: '', phone: '', address: '' });

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

  const handleEditClick = (client) => {
    setEditingClient(client.id);
    setEditClientForm({
      name: client.name,
      phone: client.phone || '',
      address: client.address || ''
    });
  };

  const handleEditSave = async (id) => {
    try {
      await api.put(`/clients/${id}`, editClientForm);
      setEditingClient(null);
      loadClients();
    } catch (err) {
      alert('Erro ao salvar edições do cliente.');
    }
  };

  const handleEditCancel = () => {
    setEditingClient(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza absoluta que deseja apagar este cliente permanentemente?')) {
      try {
        await api.delete(`/clients/${id}`);
        setClients(clients.filter(c => c.id !== id));
      } catch (err) {
        alert(err.response?.data?.error || 'Erro ao apagar o cliente.');
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      
      const parsedClients = [];

      // Pula cabeçalho Nome,Telefone,Endereco
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const separator = line.includes(';') ? ';' : ',';
        const cols = line.split(separator);

        if (cols.length >= 2) {
          parsedClients.push({
            name: cols[0].trim(),
            phone: cols[1].trim(),
            address: cols[2] ? cols[2].trim() : ''
          });
        }
      }

      if (parsedClients.length === 0) {
        alert('Nenhum dado válido de cliente encontrado.');
        return;
      }

      try {
        const res = await api.post('/clients/bulk', { clients: parsedClients });
        alert(`Sucesso! Criados: ${res.data.results.created}, Atualizados: ${res.data.results.updated}. Erros: ${res.data.results.errors.length}`);
        loadClients();
      } catch (error) {
        alert(error.response?.data?.error || 'Erro Crítico na importação CSV.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3>Gerenciar Clientes</h3>
        {userRole === 'ADMIN' && (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="/modelo_clientes.csv" download className="btn btn-outline" style={{ fontSize: '0.875rem' }}>
              <Download size={16} /> Baixar Modelo CSV
            </a>
            <input type="file" accept=".csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
            <button className="btn btn-success" style={{ fontSize: '0.875rem' }} onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} /> Importar CSV
            </button>
          </div>
        )}
      </div>

      <div className={`admin-forms-grid ${userRole === 'ADMIN' ? 'admin-role' : ''}`} style={{ gap: '2rem', marginTop: '1.5rem', marginBottom: '2rem' }}>
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
              <SearchableSelect 
                options={clients.map(c => ({ id: c.id, label: c.name }))}
                value={priceForm.client_id}
                onChange={id => setPriceForm({...priceForm, client_id: id})}
                placeholder="Busque o cliente pelo nome..."
                required={true}
              />
            </div>
            <div className="form-group">
              <label>Produto</label>
              <SearchableSelect 
                options={products.map(p => ({ id: p.id, label: `${p.name} (Base: R$ ${p.base_price})` }))}
                value={priceForm.product_id}
                onChange={id => setPriceForm({...priceForm, product_id: id})}
                placeholder="Busque o produto..."
                required={true}
              />
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
                {userRole === 'ADMIN' && <th style={{ textAlign: 'right' }}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                editingClient === client.id ? (
                  <tr key={client.id}>
                    <td>{client.id}</td>
                    <td><input type="text" className="form-input" value={editClientForm.name} onChange={e => setEditClientForm({...editClientForm, name: e.target.value})} style={{ padding: '0.2rem', height: 'auto' }} /></td>
                    <td><input type="text" className="form-input" value={editClientForm.phone} onChange={e => setEditClientForm({...editClientForm, phone: e.target.value})} style={{ padding: '0.2rem', height: 'auto', width: '120px' }} /></td>
                    <td><input type="text" className="form-input" value={editClientForm.address} onChange={e => setEditClientForm({...editClientForm, address: e.target.value})} style={{ padding: '0.2rem', height: 'auto' }} /></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-success" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleEditSave(client.id)}>Salvar</button>
                        <button className="btn" style={{ backgroundColor: 'var(--danger)', color: 'white', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={handleEditCancel}>Cancelar</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={client.id}>
                    <td>{client.id}</td>
                    <td style={{ fontWeight: 500 }}>{client.name}</td>
                    <td>{client.phone}</td>
                    <td>{client.address}</td>
                    {userRole === 'ADMIN' && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button className="btn btn-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleEditClick(client)}>
                            Editar
                          </button>
                          <button className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--danger)', color: 'white' }} onClick={() => handleDelete(client.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              ))}
              {!loading && clients.length === 0 && (
                <tr><td colSpan={userRole === 'ADMIN' ? 5 : 4} style={{ textAlign: 'center' }}>Nenhum cliente cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Clients;
