import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import '../styles/Orders.modules.css';

const Orders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (orderId) => {
    setActiveDropdown(activeDropdown === orderId ? null : orderId);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      setActiveDropdown(null); // Cerrar el dropdown después de actualizar
    } catch (error) {
      console.error("Error updating order status:", error);
      setError("Error al actualizar el estado del pedido");
    }
  };

  useEffect(() => {
    let unsubscribe;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        let q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

        if (filter !== 'all') {
          q = query(q, where("status", "==", filter));
        }

        unsubscribe = onSnapshot(q, 
          (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              customer: doc.data().customer || {
                name: 'Cliente no disponible',
                email: '',
                phone: '',
                address: '',
                zipCode: ''
              },
              items: doc.data().items || [],
              paymentMethod: doc.data().paymentMethod || 'No especificado',
              status: doc.data().status || 'pending',
              total: doc.data().total || 0,
              createdAt: doc.data().createdAt || new Date().toISOString()
            }));
            setOrders(ordersData);
            setLoading(false);
          },
          (error) => {
            console.error("Error loading orders:", error);
            setError("Error al cargar los pedidos");
            setLoading(false);
          }
        );

      } catch (err) {
        console.error("Error:", err);
        setError("Error al cargar los pedidos");
        setLoading(false);
      }
    };

    fetchOrders();

    return () => unsubscribe && unsubscribe();
  }, [filter]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      const fixedDateString = dateString.replace(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}) (\d{2}:\d{2})/, '$1');
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(fixedDateString).toLocaleDateString('es-ES', options);
    } catch (e) {
      console.error("Error formateando fecha:", e);
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'ready':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      case 'shipped':
        return 'status-shipped';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'completed':
        return 'Completado';
      case 'ready':
        return 'Listo';
      case 'shipped':
        return (
          <span className="shipped-status">
            Enviado <span className="check-mark">✓</span>
          </span>
        );
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading) {
    return <div className="orders-container loading">Cargando pedidos...</div>;
  }

  if (error) {
    return <div className="orders-container error">{error}</div>;
  }

  return (
    <div className="orders-container">
      <h1>Todos los Pedidos</h1>

      

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>No hay pedidos registrados</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h3>Pedido #{order.id.substring(0, 8).toUpperCase()}</h3>
                <div className="status-container">
                  <div className="dropdown-container">
                    <span 
                      className={`order-status ${getStatusColor(order.status)} dropdown-trigger`}
                      onClick={() => toggleDropdown(order.id)}
                    >
                      {getStatusText(order.status)}
                    </span>
                    {activeDropdown === order.id && (
                      <div className="status-dropdown">
                        {order.status !== 'pending' && (
                          <button 
                            className="status-option pending"
                            onClick={() => updateOrderStatus(order.id, 'pending')}
                          >
                             Pendiente
                          </button>
                        )}
                        {order.status !== 'ready' && (
                          <button 
                            className="status-option ready"
                            onClick={() => updateOrderStatus(order.id, 'ready')}
                          >
                             Listo
                          </button>
                        )}
                        {order.status !== 'shipped' && (
                          <button 
                            className="status-option shipped"
                            onClick={() => updateOrderStatus(order.id, 'shipped')}
                          >
                           Enviado
                          </button>
                        )}
                        
                        {order.status !== 'cancelled' && (
                          <button 
                            className="status-option cancelled"
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          >
                            Cancelar Pedido
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="order-details">
                <div className="order-info">
                  <p><strong>Fecha:</strong> {formatDate(order.createdAt)}</p>
                  <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                  <p><strong>Método de pago:</strong> {order.paymentMethod}</p>
                  {order.coupon && <p><strong>Cupón:</strong> {order.coupon}</p>}
                </div>

                <div className="order-customer">
                  <h4>Cliente</h4>
                  <p>{order.customer.name}</p>
                  <p>{order.customer.email}</p>
                  <p>{order.customer.phone}</p>
                  <p>
                  {order.customer.calle} #{order.customer.numero}, {order.customer.colonia},<br />
                  {order.customer.ciudad}, {order.customer.estado}, CP {order.customer.zipCode}
                </p>





                </div>
              </div>

              <div className="order-items">
                <h4>Productos ({order.items.length})</h4>
                <ul>
                  {order.items.map((item, index) => (
                    <li key={index} className="order-item">
                      <img
                        src={item.image || '/placeholder-product.jpg'}
                        alt={item.title}
                        className="item-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                      <div className="item-info">
                        <p className="item-title">{item.title}</p>
                        <p>{item.quantity} x ${item.price.toFixed(2)}</p>
                        <p className="item-subtotal">Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;