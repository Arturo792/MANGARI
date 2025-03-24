import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from '../firebase';
import '../styles/Products.Modules.css';

const Products = ({ addToCart }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
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

  const handleViewMore = (product) => {
    navigate(`/product/${product.id}`);
  };

  const toggleDescription = (productId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Cargando productos...</p>
    </div>
  );
  
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="products-page">
      <div className="products-header-container">
        <h1 className="products-main-title">Nuestros Productos</h1>
        <p className="products-subtitle">Armonia Natural</p>
      </div>
      
      {products.length === 0 ? (
        <div className="no-products">
          <p>Actualmente no hay productos disponibles</p>
          <button className="refresh-button" onClick={() => window.location.reload()}>
            Intentar de nuevo
          </button>
        </div>
      ) : (
        <div className="products-grid-container">
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=Imagen+no+disponible';
                    }}
                  />
                  {product.isNew && <span className="new-badge">Nuevo</span>}
                  {product.discount && (
                    <span className="discount-badge">-{product.discount}%</span>
                  )}
                </div>
                
                <div className="product-info">
                  <h2 className="product-name">{product.name}</h2>
                  
                  <div 
                    className={`product-description ${expandedDescriptions[product.id] ? 'expanded' : ''}`}
                    onClick={() => toggleDescription(product.id)}
                  >
                    {product.description}
                  </div>
                  
                  <div className="product-meta">
                    <div className="product-pricing">
                      {product.originalPrice ? (
                        <>
                          <span className="original-price">${product.originalPrice.toFixed(2)}</span>
                          <span className="current-price">${product.price.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="current-price">${product.price.toFixed(2)}</span>
                      )}
                    </div>
                    
                    {/* Mostrar el stock disponible */}
                    <div className={`product-stock ${product.stock <= 0 ? 'out-of-stock' : ''}`}>
                      {product.stock > 0 ? (
                        <span>{product.stock} disponibles</span>
                      ) : (
                        <span>Agotado</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="product-actions">
                    <button
                      className="view-details-button"
                      onClick={() => handleViewMore(product)}
                    >
                      Detalles
                    </button>
                    <button
                      className={`add-to-cart-button ${product.stock <= 0 ? 'disabled' : ''}`}
                      onClick={() => product.stock > 0 && addToCart(product)}
                      disabled={product.stock <= 0}
                    >
                      <span className="cart-icon">🛒</span> 
                      {product.stock > 0 ? 'Añadir' : 'Agotado'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;