import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, setDoc } from 'firebase/firestore';
import '../styles/adminPanel.css';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cupones
  const [couponCode, setCouponCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [activeCoupon, setActiveCoupon] = useState(null);

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
      const docSnap = await getDoc(doc(db, "settings", "shipping"));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (typeof data.cost === "number") {
          setShippingCost(data.cost);
        }
      }
    } catch (error) {
      console.error("Error al cargar el costo de envío:", error);
    } finally {
      setShippingLoading(false);
    }
  };

  const saveShippingCost = async () => {
    try {
      const docRef = doc(db, "settings", "shipping");
      await setDoc(docRef, {
        cost: parseFloat(newShippingCost),
        freeFrom: parseFloat(newFreeFrom),
        updatedAt: new Date().toISOString(),
      });
      setShippingCost(parseFloat(newShippingCost));
      setFreeFrom(parseFloat(newFreeFrom));
      setEditShipping(false);
      setNewShippingCost('');
    } catch (error) {
      console.error("Error al guardar el nuevo costo de envío:", error);
      alert("No se pudo guardar el costo de envío.");
    }
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/login');
          return;
        }

        const adminDoc = await getDoc(doc(db, "admins", user.email));
        if (!adminDoc.exists()) {
          navigate('/home');
          return;
        }

        setIsAdmin(true);

        const querySnapshot = await getDoc(collection(db, "coupons")); 
        querySnapshot.forEach((doc) => {
        //  setActiveCoupon(doc.data());
          <div className="current-coupon">
            <h3>Cupón Activo</h3>
            <p><strong>Código:</strong> {doc.code}</p>
            <p><strong>Descuento:</strong> {doc.discount}%</p>
            <p><strong>Creado:</strong> {formatFirebaseTimestamp(doc.createdAt)}</p>
            <button onClick={removeCoupon} className="remove-btn">
              Eliminar Cupón
            </button>
          </div>

          console.log(doc.id, " => ", doc.data());
        });


      

        await fetchShippingCost();
        

      } catch (error) {
        console.error("Error verificando admin:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const couponData = {
        code: couponCode,
        discount: Number(discountPercentage),
        createdAt: new Date(),
        createdBy: auth.currentUser.email
      };
      await setDoc(doc(db, "coupons", "active"), couponData);
      setActiveCoupon(couponData);
      setCouponCode('');
      setDiscountPercentage(0);
    } catch (error) {
      console.error("Error guardando cupón:", error);
      alert("Ocurrió un error al guardar el cupón.");
    }
  };

  const removeCoupon = async () => {
    try {
      await setDoc(doc(db, "coupons", "active"), {
        code: "",
        discount: 0,
        deletedAt: new Date()
      });
      setActiveCoupon(null);
    } catch (error) {
      console.error("Error eliminando cupón:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
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
        <h2>{activeCoupon ? 'Actualizar Cupón' : 'Crear Nuevo Cupón'}</h2>
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
          <button type="submit" className="submit-btn">
            {activeCoupon ? 'Actualizar' : 'Crear'}
          </button>
        </form>

        {/* {activeCoupon && (
          <div className="current-coupon">
            <h3>Cupón Activo</h3>
            <p><strong>Código:</strong> {activeCoupon.code}</p>
            <p><strong>Descuento:</strong> {activeCoupon.discount}%</p>
            <p><strong>Creado:</strong> {formatFirebaseTimestamp(activeCoupon.createdAt)}</p>
            <button onClick={removeCoupon} className="remove-btn">
              Eliminar Cupón
            </button>
          </div>


        )}*/}


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
                <br />
                 <p><strong>Gratis a partir de:</strong> ${freeFrom}</p>
                <button onClick={() => setEditShipping(true)} className="submit-btn">
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
                  placeholder="Ej: 100"
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
