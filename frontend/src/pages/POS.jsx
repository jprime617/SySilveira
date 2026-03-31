import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ShoppingCart, Printer, Check, Trash2 } from 'lucide-react';
import SearchableSelect from '../components/SearchableSelect';

const POS = () => {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [deliveryPeople, setDeliveryPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  const [clientId, setClientId] = useState('');
  const [deliveryPersonId, setDeliveryPersonId] = useState('');
  const [cart, setCart] = useState([]); // [{product, quantity, price}]
  
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [lastSale, setLastSale] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, pRes, dRes] = await Promise.all([
          api.get('/clients'), 
          api.get('/products'),
          api.get('/delivery_people')
        ]);
        setClients(cRes.data);
        setProducts(pRes.data);
        setDeliveryPeople(dRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!clientId) {
      alert('Selecione um cliente primeiro para calcular o preço correto.');
      return;
    }
    
    const product = products.find(p => p.id === Number(selectedProductId));
    if (!product) return;

    if (product.stock_quantity < quantity) {
      alert('Estoque insuficiente para essa quantidade!');
      return;
    }

    // Check if there is a smart price
    let priceToApply = Number(product.base_price);
    let isSmartPrice = false;
    try {
      const priceRes = await api.get(`/clients/${clientId}/prices`);
      const customPrice = priceRes.data.find(p => p.product_id === product.id);
      if (customPrice) {
        priceToApply = Number(customPrice.agreed_price);
        isSmartPrice = true;
      }
    } catch (err) {
      console.error(err);
    }

    const existingItemIndex = cart.findIndex(item => item.product.id === product.id);
    if (existingItemIndex >= 0) {
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += Number(quantity);
      setCart(newCart);
    } else {
      setCart([...cart, { product, quantity: Number(quantity), price: priceToApply, originalPrice: Number(product.base_price), isSmartPrice }]);
    }

    setSelectedProductId('');
    setQuantity(1);
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (!clientId || cart.length === 0) return;
    try {
      const payload = {
        client_id: clientId,
        delivery_person_id: deliveryPersonId || null,
        items: cart.map(item => ({ product_id: item.product.id, quantity: item.quantity }))
      };
      const res = await api.post('/sales', payload);
      
      setLastSale({
        id: res.data.id,
        client: clients.find(c => c.id === Number(clientId)),
        delivery_person: deliveryPeople.find(d => d.id === Number(deliveryPersonId)),
        total: cartTotal,
        items: [...cart],
        date: new Date()
      });

      alert('Venda finalizada com sucesso!');
      setCart([]);
      setClientId('');
      setDeliveryPersonId('');
      
      // Refresh products to update stock
      const pRes = await api.get('/products');
      setProducts(pRes.data);

    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao finalizar venda.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Area TELA PADRAO */}
      <div className="no-print">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Coluna 1: Formulário e Produtos */}
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>1. Selecione o Cliente</h4>
              <SearchableSelect 
                options={clients.map(c => ({ id: c.id, label: c.name }))}
                value={clientId}
                onChange={id => { setClientId(id); setCart([]); }}
                placeholder="Busque o cliente pelo nome..."
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '0.5rem', marginBottom: '1rem' }}>* O cliente afeta o preço do produto.</p>

              <h4 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Entregador (Opcional)</h4>
              <select className="form-select" value={deliveryPersonId} onChange={e => setDeliveryPersonId(e.target.value)} style={{ width: '100%' }}>
                <option value="">Retirada no Local</option>
                {deliveryPeople.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div className="card" style={{ opacity: clientId ? 1 : 0.5, pointerEvents: clientId ? 'auto' : 'none' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>2. Adicionar Itens</h4>
              <form onSubmit={handleAddToCart} style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Produto</label>
                  <SearchableSelect 
                    options={products.filter(p => p.stock_quantity > 0).map(p => ({ id: p.id, label: `${p.sku} - ${p.name} (Est: ${p.stock_quantity})` }))}
                    value={selectedProductId}
                    onChange={id => setSelectedProductId(id)}
                    placeholder="Busque por SKU ou Nome..."
                    required={true}
                  />
                </div>
                <div className="form-group" style={{ width: '80px', marginBottom: 0 }}>
                  <label>Qtd</label>
                  <input type="number" min="1" className="form-input" value={quantity} onChange={e => setQuantity(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>Incluir</button>
              </form>
            </div>
          </div>

          {/* Coluna 2: Carrinho */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShoppingCart size={20} /> Checkout</h4>
              <span className="badge badge-success">{cart.length} itens</span>
            </div>
            
            <div style={{ minHeight: '300px', backgroundColor: '#F9FAFB', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem' }}>
              {cart.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '4rem' }}>Carrinho vazio.</div>
              ) : (
                <table style={{ width: '100%' }}>
                  <tbody>
                  {cart.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.5rem 0' }}>{item.quantity}x</td>
                      <td style={{ padding: '0.5rem 0' }}>{item.product.name}</td>
                      <td style={{ padding: '0.5rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        <div style={{ color: item.isSmartPrice ? 'var(--danger)' : 'var(--text-muted)', fontWeight: item.isSmartPrice ? 'bold' : 'normal' }}>
                          R$ {Number(item.price).toFixed(2)} un
                        </div>
                        {item.isSmartPrice && (
                          <div style={{ fontSize: '0.7rem', marginTop: '0.2rem' }}>
                             <span style={{ color: 'var(--danger)' }}>(Preço Especial)</span><br/>
                             <button type="button" style={{ background: 'none', border: 'none', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', padding: 0 }} onClick={() => {
                               const newCart = [...cart];
                               newCart[index].price = newCart[index].originalPrice;
                               newCart[index].isSmartPrice = false;
                               setCart(newCart);
                             }}>
                               Reverter Base
                             </button>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.5rem 0', fontWeight: 600 }}>R$ {(item.price * item.quantity).toFixed(2)}</td>
                      <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>
                         <button type="button" className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', color: 'var(--danger)' }} onClick={() => removeFromCart(index)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
              <span>Total:</span>
              <span style={{ color: 'var(--primary)' }}>R$ {cartTotal.toFixed(2)}</span>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={handleCheckout} disabled={cart.length === 0}>
              <Check size={20} /> Finalizar Venda
            </button>
          </div>

        </div>

        {/* Bloco caso tenha finalizado a venda para IMPRIMIR */}
        {lastSale && (
          <div className="card" style={{ marginTop: '2rem', backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ color: '#065F46' }}>Venda #{lastSale.id} criada com sucesso!</h4>
                <p style={{ color: '#047857', fontSize: '0.875rem' }}>O estoque já foi atualizado e a transação confirmada no PostgreSQL.</p>
              </div>
              <button className="btn" style={{ backgroundColor: '#059669', color: 'white' }} onClick={handlePrint}>
                <Printer size={20} /> Imprimir Nota
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Area TELA DE IMPRESSAO (somente vísivel ctrl+p) */}
      {lastSale && (
      <div className="print-only" style={{ display: 'none' }}>
        {['Via do Estabelecimento', 'Via do Cliente'].map((via, index) => (
          <div key={index} style={{ flex: 1, paddingRight: index === 0 ? '1rem' : 0, borderRight: index === 0 ? '1px dashed black' : 'none', paddingLeft: index === 1 ? '1rem' : 0 }}>
            <div style={{ textAlign: 'center', marginBottom: '0.5rem', borderBottom: '1px dashed #000', paddingBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '14px', margin: 0, textTransform: 'uppercase' }}>SySilveira ERP</h1>
              <p style={{ margin: '0.2rem 0', fontSize: '10px' }}>Comprovante Não Fiscal - {via}</p>
              <p style={{ margin: 0, fontSize: '10px' }}>{lastSale.date.toLocaleString()}</p>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '12px' }}>Pedido Nº: {lastSale.id}</p>
            </div>

            <div style={{ marginBottom: '0.5rem', fontSize: '11px' }}>
              <p style={{ margin: '0.1rem 0' }}><strong>CLIENTE:</strong> {lastSale.client?.name.toUpperCase()}</p>
              <p style={{ margin: '0.1rem 0' }}><strong>ENDEREÇO:</strong> {lastSale.client?.address || 'N/I'}</p>
              <p style={{ margin: '0.1rem 0' }}><strong>ENTREGADOR:</strong> {lastSale.delivery_person?.name?.toUpperCase() || 'Retirada Local'}</p>
            </div>

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
                {lastSale.items.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '0.1rem 0' }}>{item.quantity}</td>
                    <td style={{ padding: '0.1rem 0' }}>{item.product.name}</td>
                    <td style={{ padding: '0.1rem 0', textAlign: 'right' }}>{Number(item.price).toFixed(2)}</td>
                    <td style={{ padding: '0.1rem 0', textAlign: 'right' }}>{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>
                TOTAL R$ {lastSale.total.toFixed(2)}
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
}

export default POS;
