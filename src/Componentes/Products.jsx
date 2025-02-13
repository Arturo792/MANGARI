import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Products.css';

const Products = ({ addToCart }) => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('https://fakestoreapi.com/products')
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error('Error fetching data: ', error);
      });
  }, []);

  const handleViewMore = (product) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="container">
      <h1 className="header">Productos</h1>
      <ul className="product-list">
        {products.map(product => (
          <li key={product.id} className="product-item">
            <img
              src={product.image}
              alt={product.title}
              className="product-image"
            />
            <h2 className="product-title">{product.title}</h2>
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