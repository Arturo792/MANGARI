import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, where, updateDoc, deleteDoc  } from 'firebase/firestore';
import '../styles/adminPanel.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cupones
  const [couponCode, setCouponCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [coupons, setCoupons] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [expirationDate, setExpirationDate] = useState('');

  // Costo de Envío
  const [shippingCost, setShippingCost] = useState(0);
  const [freeFrom, setFreeFrom] = useState(0);
  const [newShippingCost, setNewShippingCost] = useState('');
  const [newFreeFrom, setNewFreeFrom] = useState('');
  const [editShipping, setEditShipping] = useState(false);
  const [shippingLoading, setShippingLoading] = useState(true);

  const formatFirebaseTimestamp = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    if (timestamp instanceof Date) return timestamp.toLocaleString();
    if (typeof timestamp.toDate === 'function') return timestamp.toDate().toLocaleString();
    if (typeof timestamp === 'string') return new Date(timestamp).toLocaleString();
    return 'Formato de fecha no reconocido';
  };

  const fetchShippingCost = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'shipping'));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (typeof data.cost === 'number') setShippingCost(data.cost);
        if (typeof data.freeFrom === 'number') setFreeFrom(data.freeFrom);
      }
    } catch (error) {
      console.error('Error al cargar el costo de envío:', error);
    } finally {
      setShippingLoading(false);
    }
  };

  const saveShippingCost = async () => {
    const parsedCost = parseFloat(newShippingCost);
    const parsedFreeFrom = parseFloat(newFreeFrom);

    if (isNaN(parsedCost) || isNaN(parsedFreeFrom)) {
      alert('Por favor ingresa valores válidos.');
      return;
    }

    try {
      const docRef = doc(db, 'settings', 'shipping');
      await setDoc(docRef, {
        cost: parsedCost,
        freeFrom: parsedFreeFrom,
        updatedAt: new Date().toISOString(),
      });
      setShippingCost(parsedCost);
      setFreeFrom(parsedFreeFrom);
      setNewShippingCost('');
      setNewFreeFrom('');
      setEditShipping(false);
    } catch (error) {
      console.error('Error al guardar el nuevo costo de envío:', error);
      alert('No se pudo guardar el costo de envío.');
    }
  };

  const fetchCoupons = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'coupons'));
      const couponsList = [];
      querySnapshot.forEach((doc) => {
        couponsList.push({ id: doc.id, ...doc.data() });
      });
      setCoupons(couponsList);
    } catch (error) {
      console.error('Error al cargar los cupones:', error);
    }
  };

  const checkAdminStatus = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      const adminDoc = await getDoc(doc(db, 'admins', user.email));
      if (!adminDoc.exists()) {
        navigate('/home');
        return;
      }

      setIsAdmin(true);

      await fetchCoupons();
      await fetchShippingCost();
    } catch (error) {
      console.error('Error verificando admin:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const couponRef = doc(db, 'coupons', couponCode);
    const existing = await getDoc(couponRef);

    if (existing.exists()) {
      const overwrite = window.confirm('Ya existe un cupón con este código. ¿Deseas sobrescribirlo?');
      if (!overwrite) return;
    }

    const couponData = {
      code: couponCode,
      discount: Number(discountPercentage),
      isActive: isActive,
      createdAt: new Date(),
      createdBy: auth.currentUser.email,
      usedBy: existing.exists() ? existing.data().usedBy || [] : [],
      expirationDate: expirationDate ? new Date(expirationDate) : null,
    };

    await setDoc(couponRef, couponData);

    await fetchCoupons();

    setCouponCode('');
    setDiscountPercentage(0);
    setIsActive(true);
    setExpirationDate('');

    alert('Cupón guardado exitosamente');
  } catch (error) {
    console.error('Error guardando cupón:', error);
    alert('Ocurrió un error al guardar el cupón.');
  }
};


  const toggleCouponStatus = async (couponId, currentStatus) => {
    try {
      const couponRef = doc(db, 'coupons', couponId);
      await updateDoc(couponRef, {
        isActive: !currentStatus,
        updatedAt: new Date(),
      });
      await fetchCoupons();
    } catch (error) {
      console.error('Error actualizando estado del cupón:', error);
    }
  };

  const deleteCoupon = async (couponId) => {
  if (window.confirm('¿Estás seguro de que deseas eliminar este cupón?')) {
    try {
      await deleteDoc(doc(db, 'coupons', couponId));
      setCoupons(coupons.filter(coupon => coupon.id !== couponId));
      alert('Cupón eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando cupón:', error);
      alert('No se pudo eliminar el cupón');
    }
  }
};

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (loading) return <div className="loading">Verificando permisos...</div>;
  if (!isAdmin) return null;

  return (
    <div className="admin-container">
      <h1>Panel de Administrador</h1>

      <button onClick={handleLogout} className="logout-button">
        Cerrar Sesión
      </button>

      {/* Cupones */}
      <div className="coupon-form">
        <h2>Crear Nuevo Cupón</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Código:</label>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              required
              placeholder="Ej: VERANO2023"
            />
          </div>
          <div className="form-group">
            <label>Descuento (%):</label>
            <input
              type="number"
              min="1"
              max="100"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Fecha de expiración (opcional):</label>
            <input
              type="datetime-local"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          </div>
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Activo
            </label>
          </div>
          <button type="submit" className="submit-btn">
            Crear Cupón
          </button>
        </form>

        <div className="coupons-list">
          <h3>Lista de Cupones</h3>
          {coupons.length === 0 ? (
            <p>No hay cupones registrados</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descuento</th>
                  <th>Estado</th>
                  <th>Creado</th>
                  <th>Expiración</th>
                  <th>Usos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td>{coupon.code}</td>
                    <td>{coupon.discount}%</td>
                    <td>{coupon.isActive ? 'Activo' : 'Inactivo'}</td>
                    <td>{formatFirebaseTimestamp(coupon.createdAt)}</td>
                    <td>{coupon.expirationDate ? formatFirebaseTimestamp(coupon.expirationDate) : 'No expira'}</td>
                    <td>{coupon.usedBy ? coupon.usedBy.length : 0}</td>
                    <td>
                      <button 
                        onClick={() => toggleCouponStatus(coupon.id, coupon.isActive)}
                        className={coupon.isActive ? 'deactivate-btn' : 'activate-btn'}
                      >
                        {coupon.isActive ? 'Desactivar' : 'Activar'}
                      </button>
                      <button 
                        onClick={() => deleteCoupon(coupon.id)}
                        className="remove-btn"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Costo de Envío */}
      <div className="shipping-cost-section">
        <h2>Configuración de Envío</h2>
        {shippingLoading ? (
          <p>Cargando costo de envío...</p>
        ) : (
          <>
            {!editShipping ? (
              <div>
                <p><strong>Costo actual:</strong> ${shippingCost}</p>
                <p><strong>Gratis a partir de:</strong> ${freeFrom}</p>
                <button onClick={() => {
                  setNewShippingCost(shippingCost.toString());
                  setNewFreeFrom(freeFrom.toString());
                  setEditShipping(true);
                }} className="submit-btn">
                  Editar
                </button>
              </div>
            ) : (
              <div className="form-group">
                <label>Nuevo costo de envío:</label>
                <input
                  type="number"
                  value={newShippingCost}
                  onChange={(e) => setNewShippingCost(e.target.value)}
                  placeholder="Ej: 100"
                />
                <br />
                <label>Gratis a partir de:</label>
                <input
                  type="number"
                  value={newFreeFrom}
                  onChange={(e) => setNewFreeFrom(e.target.value)}
                  placeholder="Ej: 500"
                />
                <button onClick={saveShippingCost} className="submit-btn">
                  Guardar
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;