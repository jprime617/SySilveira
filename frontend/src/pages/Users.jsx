import React, { useState } from 'react';
import api from '../services/api';
import { UserPlus, ShieldAlert } from 'lucide-react';

const Users = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' });

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', form);
      setForm({ name: '', email: '', password: '', role: 'USER' });
      alert('Usuário cadastrado com sucesso!');
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao criar Usuário');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3>Gerenciar Usuários</h3>
      </div>

      <div className="card" style={{ maxWidth: '600px', borderLeft: '4px solid var(--primary)' }}>
        <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={20} /> Cadastrar Novo Usuário
        </h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <ShieldAlert size={14} /> Essa conta terá acesso ao sistema com o seu próprio login.
        </p>

        <form onSubmit={handleUserSubmit}>
          <div className="form-group">
            <label>Nome Completo</label>
            <input 
                type="text" 
                className="form-input" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                required 
                placeholder="Ex: João Silva"
            />
          </div>
          <div className="form-group">
            <label>E-mail de Acesso</label>
            <input 
                type="email" 
                className="form-input" 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
                required 
                placeholder="Ex: joao@sysilveira.com"
            />
          </div>
          <div className="form-group">
            <label>Senha Provisória</label>
            <input 
                type="password" 
                className="form-input" 
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
                required 
                placeholder="Mínimo 6 caracteres"
                minLength="6"
            />
          </div>
          <div className="form-group">
            <label>Nível de Acesso (Cargo)</label>
            <select 
                className="form-input" 
                value={form.role} 
                onChange={e => setForm({...form, role: e.target.value})} 
                required
            >
                <option value="USER">Funcionário Comum (USER)</option>
                <option value="ADMIN">Administrador Deste Sistema (ADMIN)</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
             Criar Conta de Usuário
          </button>
        </form>
      </div>
    </div>
  );
}

export default Users;
