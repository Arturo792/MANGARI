// Products.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebase';
import '../styles/Products.css';

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

  return (
    <div className="container">
      <h1 className="header">Productos</h1>
      <ul className="product-list">
        {products.map((product) => (
          <li key={product.id} className="product-item">
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
            />
            <h2 className="product-title">{product.name}</h2>
            <p className="product-description">
              {product.description.length > 100
                ? `${product.description.slice(0, 100)}...`
                : product.description}
            </p>
            <p className="product-price">${product.price}</p>
            <div className="button-container">
              <button className="view-more" onClick={() => handleViewMore(product)}>
                Ver más
              </button>
              <button className="add-to-cart" onClick={() => addToCart(product)}>
                Agregar al carrito
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Products;