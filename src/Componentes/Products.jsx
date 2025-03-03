import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebase';
import '../styles/Products.Modules.css';

const Products = ({ addToCart }) => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    fetchProducts();
  }, []);

  const handleViewMore = (product) => {
    navigate(`/product/${product.id}`);
  };

  const handleBuyNow = (product) => {
    // Lógica para comprar ahora
    console.log("Comprar ahora:", product);
  };

  return (
    <div className="products-container">
      <h1 className="products-header">Nuestros Productos</h1>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
            />
            <h2 className="product-name">{product.name}</h2>
            <p className="product-description">
              {product.description.length > 100
                ? `${product.description.slice(0, 100)}...`
                : product.description}
            </p>
            <p className="product-price">${product.price}</p>
            <div className="product-actions">
              <button
                className="buy-now-button"
                onClick={() => handleBuyNow(product)}
              >
                Comprar ahora
              </button>
              <div className="secondary-buttons">
                <button
                  className="view-more-button"
                  onClick={() => handleViewMore(product)}
                >
                  Ver más
                </button>
                <button
                  className="add-to-cart-button"
                  onClick={() => addToCart(product)}
                >
                  Agregar al carrito
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;