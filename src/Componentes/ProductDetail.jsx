import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ProductDetail = ({ addToCart }) => {
  const { id } = useParams(); 
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axios.get(`https://fakestoreapi.com/products/${id}`)
      .then(response => {
        setProduct(response.data);
      })
      .catch(error => {
        console.error('Error fetching product details: ', error);
      });
  }, [id]);

  if (!product) {
    return <div>Loading...</div>; 
  }

  return (
    <div className="product-detail">
      <h1>{product.title}</h1>
      <img src={product.image} alt={product.title} className="product-image" />
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
      <p>Category: {product.category}</p>
      <p>Rating: {product.rating.rate} ({product.rating.count} reviews)</p>

      {/* Botón para agregar al carrito */}
      <button onClick={() => addToCart(product)} className="add-to-cart-button">
        🛒 Agregar al carrito
      </button>
    </div>
  );
};

export default ProductDetail;
