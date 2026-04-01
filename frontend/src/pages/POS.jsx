import React, { useEffect, useState, useMemo } from 'react';
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
  const [deliveryType, setDeliveryType] = useState('DELIVERY');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        setClients(Array.isArray(cRes.data) ? cRes.data : []);
        setProducts(Array.isArray(pRes.data) ? pRes.data : []);
        setDeliveryPeople(Array.isArray(dRes.data) ? dRes.data : []);
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

  const cartTotals = useMemo(() => {
    let totalItems = 0;
    let totalPrice = 0;
    cart.forEach(item => {
      totalItems += Number(item.quantity);
      totalPrice += Number(item.price) * Number(item.quantity);
    });
    return { totalItems, totalPrice };
  }, [cart]);

  const handleCheckout = async () => {
    if (!clientId || cart.length === 0 || isSubmitting) return;
    
    setIsSubmitting(true);
    setLastSale(null); // Clear previous receipt to prevent phantom data on slow network

    try {
      const payload = {
        client_id: clientId,
        delivery_person_id: deliveryType === 'PICKUP' ? null : (deliveryPersonId || null),
        delivery_type: deliveryType,
        frontend_total: cartTotals.totalPrice, // Dual-validation
        items: cart.map(item => ({ product_id: item.product.id, quantity: item.quantity }))
      };
      
      const res = await api.post('/sales', payload, { headers: { 'Cache-Control': 'no-cache' } });
      
      setLastSale({
        id: res.data.id,
        client: clients.find(c => String(c.id) === String(clientId)) || { name: 'Cliente Desconhecido' },
        delivery_person: deliveryType === 'PICKUP' ? null : (deliveryPeople.find(d => String(d.id) === String(deliveryPersonId)) || { name: 'Sem Entregador' }),
        delivery_type: deliveryType,
        total: Number(res.data.total_price),
        items: [...cart],
        date: new Date()
      });

      setCart([]);
      setClientId('');
      setDeliveryPersonId('');
      setDeliveryType('DELIVERY');

      // Refresh products to update stock
      const pRes = await api.get('/products');
      setProducts(Array.isArray(pRes.data) ? pRes.data : []);

    } catch (error) {
      console.error('Erro de rede ou na API ao finalizar venda via Axios/Tailscale:', error);
      alert(error.response?.data?.error || 'Erro ao finalizar venda. Verifique a conexão com o servidor ou logs no console.');
    } finally {
      setIsSubmitting(false);
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

              <h4 style={{ marginBottom: '1rem', color: 'var(--primary)', marginTop: '1rem' }}>Logística de Entrega</h4>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" name="deliveryType" checked={deliveryType === 'DELIVERY'} onChange={() => setDeliveryType('DELIVERY')} /> Entrega (Motoboy)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" name="deliveryType" checked={deliveryType === 'PICKUP'} onChange={() => { setDeliveryType('PICKUP'); setDeliveryPersonId(''); }} /> Retirada no Local
                </label>
              </div>

              {deliveryType === 'DELIVERY' && (
                <>
                  <h4 style={{ marginBottom: '1rem', color: 'var(--primary)', marginTop: '0.5rem' }}>Entregador (Opcional)</h4>
                  <select className="form-select" value={deliveryPersonId} onChange={e => setDeliveryPersonId(e.target.value)} style={{ width: '100%' }}>
                    <option value="">Selecione o Entregador</option>
                    {deliveryPeople.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </>
              )}
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
              <span className="badge badge-success">{cartTotals.totalItems} itens</span>
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
                          {Number(item.price).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })} un
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
                      <td style={{ padding: '0.5rem 0', fontWeight: 600 }}>{(Number(item.price) * Number(item.quantity)).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</td>
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
              <span style={{ color: 'var(--primary)' }}>{cartTotals.totalPrice.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</span>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', cursor: isSubmitting ? 'not-allowed' : 'pointer' }} onClick={handleCheckout} disabled={cart.length === 0 || isSubmitting}>
              {isSubmitting ? (
                 <>Processando Venda...</>
              ) : (
                 <><Check size={20} /> Finalizar Venda</>
              )}
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
              <p style={{ margin: '0.1rem 0' }}><strong>CLIENTE:</strong> {lastSale.client?.name?.toUpperCase() || 'N/I'}</p>
              <p style={{ margin: '0.1rem 0' }}><strong>ENDEREÇO:</strong> {lastSale.client?.address || 'N/I'}</p>
              {lastSale.delivery_type === 'PICKUP' ? (
                <p style={{ margin: '0.1rem 0', fontWeight: 'bold' }}>FORMA DE ENTREGA: RETIRADA NO LOCAL</p>
              ) : (
                <p style={{ margin: '0.1rem 0' }}><strong>ENTREGADOR:</strong> {lastSale.delivery_person?.name?.toUpperCase() || 'Não Informado'}</p>
              )}
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
                    <td style={{ padding: '0.1rem 0' }}>{item?.quantity || 1}</td>
                    <td style={{ padding: '0.1rem 0' }}>{item?.product?.name || 'Produto'}</td>
                    <td style={{ padding: '0.1rem 0', textAlign: 'right' }}>{Number(item?.price || 0).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</td>
                    <td style={{ padding: '0.1rem 0', textAlign: 'right' }}>{(Number(item?.price || 0) * Number(item?.quantity || 1)).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: 'bold' }}>
                TOTAL {Number(lastSale.total).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}
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
