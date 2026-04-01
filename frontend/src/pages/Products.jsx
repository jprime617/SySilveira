import React, { useEffect, useState, useRef } from 'react';
import api from '../services/api';
import { Plus, Upload, Download } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ sku: '', name: '', stock_quantity: 0, base_price: '' });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('@ERPLite:user') || '{}');
    setUserRole(user.role);
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', form);
      setForm({ sku: '', name: '', stock_quantity: 0, base_price: '' });
      loadProducts();
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao criar produto');
    }
  };

  const handleAddStock = async (product) => {
    const qtd = window.prompt(`Quantos itens deseja adicionar ao estoque de ${product.name}?`);
    if (!qtd || isNaN(qtd) || Number(qtd) <= 0) return;

    try {
      const newStock = Number(product.stock_quantity) + Number(qtd);
      await api.put(`/products/${product.id}`, {
        name: product.name,
        base_price: product.base_price,
        stock_quantity: newStock
      });
      loadProducts();
    } catch (err) {
      alert('Erro ao atualizar estoque');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      
      const parsedProducts = [];

      // Começa do índice 1 p/ pular o cabeçalho (SKU,Nome,Estoque,Preco)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Suporta tanto o CSV de vírgula quanto o CSV europeu/brasileiro de Excel usando ponto-e-vírgula
        const separator = line.includes(';') ? ';' : ',';
        const cols = line.split(separator);

        if (cols.length >= 4) {
          parsedProducts.push({
            sku: cols[0].trim(),
            name: cols[1].trim(),
            stock_quantity: Number(cols[2].trim().replace(',', '.')), // protege contra casas decimais erradas no estoque
            base_price: Number(cols[3].trim().replace(',', '.'))
          });
        }
      }

      if (parsedProducts.length === 0) {
        alert('Nenhum produto válido encontrado no arquivo CSV.');
        return;
      }

      try {
        const res = await api.post('/products/bulk', { products: parsedProducts });
        alert(`Sucesso! Criados: ${res.data.results.created}, Atualizados: ${res.data.results.updated}. (Erros: ${res.data.results.errors.length})`);
        loadProducts();
      } catch (error) {
        alert(error.response?.data?.error || 'Erro Crítico ao importar lotes CSV.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3>Gerenciar Produtos</h3>
      </div>

      {userRole === 'ADMIN' && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ color: 'var(--text-muted)' }}>Novo Produto</h4>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href="/modelo_produtos.csv" download className="btn btn-outline" style={{ fontSize: '0.875rem' }}>
                <Download size={16} /> Baixar Modelo CSV
              </a>
              <input type="file" accept=".csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
              <button className="btn btn-success" style={{ fontSize: '0.875rem' }} onClick={() => fileInputRef.current?.click()}>
                <Upload size={16} /> Importar CSV
              </button>
            </div>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>SKU</label>
              <input type="text" className="form-input" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Nome do Produto</label>
              <input type="text" className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Estoque Inicial</label>
              <input type="number" className="form-input" value={form.stock_quantity} onChange={e => setForm({...form, stock_quantity: e.target.value})} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Preço Base (R$)</label>
              <input type="number" step="0.01" className="form-input" value={form.base_price} onChange={e => setForm({...form, base_price: e.target.value})} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: '42px' }}><Plus size={18} /> Cadastrar</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Produto</th>
                <th>Estoque</th>
                <th>Preço Base</th>
                {userRole === 'ADMIN' && <th style={{ textAlign: 'right' }}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td><span className="badge" style={{ backgroundColor: '#E0E7FF', color: 'var(--primary)' }}>{product.sku}</span></td>
                  <td style={{ fontWeight: 500 }}>{product.name}</td>
                  <td>
                    <span className={`badge ${product.stock_quantity > 0 ? 'badge-success' : ''}`} style={product.stock_quantity <= 0 ? { backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' } : {}}>
                      {product.stock_quantity} un.
                    </span>
                  </td>
                  <td>R$ {Number(product.base_price).toFixed(2)}</td>
                  {userRole === 'ADMIN' && (
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleAddStock(product)}>
                        + Estoque
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {!loading && products.length === 0 && (
                <tr><td colSpan={userRole === 'ADMIN' ? 5 : 4} style={{ textAlign: 'center' }}>Nenhum produto cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Products;
