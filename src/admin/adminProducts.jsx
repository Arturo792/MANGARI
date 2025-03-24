import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import '../styles/adminProducts.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products: ", error);
        setError("Error al cargar los productos");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleEdit = (productId) => {
    navigate(`/admin/edit-product/${productId}`);
  };

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm("¿Estás seguro que deseas eliminar este producto?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "products", productId));
        setProducts(products.filter((product) => product.id !== productId));
      } catch (error) {
        console.error("Error al eliminar producto:", error);
        setError("Error al eliminar el producto");
      }
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;


  
  return (
    <div className="admin-products-container">
      <div className="admin-products-header">
        <h1>Administración de Productos</h1>
        <button 
          className="add-product-button"
          onClick={() => navigate('/admin/add-product')}
        >
          + Añadir Producto
        </button>
      </div>
      
      {products.length === 0 ? (
        <div className="no-products">
          <p>No hay productos registrados</p>
          <button 
            className="add-product-button"
            onClick={() => navigate('/admin/add-product')}
          >
            Añadir Primer Producto
          </button>
        </div>
      ) : ( 
        <div className="admin-products-grid">
          {products.map((product) => (
            <div key={product.id} className="admin-product-card">
              <div className="product-image-container">
                <img
                  src={product.image}
                  alt={product.name} 
                  className="admin-product-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x300?text=Imagen+no+disponible';
                  }}
                />
                {product.discount && (
                  <span className="discount-badge">-{product.discount}%</span>
                )}
              </div>
              
              <div className="product-info">
                <h2 className="admin-product-title">{product.name}</h2>
                <p className="admin-product-description">
                  {product.description.length > 100 
                    ? `${product.description.substring(0, 100)}...` 
                    : product.description}
                </p>
                
                <div className="product-meta">
                  <div className="price-section">
                    {product.originalPrice ? (
                      <>
                        <span className="original-price">${product.originalPrice.toFixed(2)}</span>
                        <span className="current-price">${product.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="current-price">${product.price.toFixed(2)}</span>
                    )}
                  </div>
                  
                  <div className={`stock-section ${product.stock <= 0 ? 'out-of-stock' : ''}`}>
                    {product.stock <= 0 ? (
                      <span>AGOTADO</span>
                    ) : (
                      <span>Stock: {product.stock} unidades</span>
                    )}
                  </div>
                </div>
                
                <div className="admin-product-actions">
                  <button
                    className="edit-button"
                    onClick={() => handleEdit(product.id)}
                  >
                    Editar
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(product.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;