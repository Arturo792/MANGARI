import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebase';
import '../styles/ProductDetail.modules.css';

const ProductDetail = ({ addToCart }) => {
  const { id } = useParams(); // Obtén el ID del producto desde la URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true); // Estado para manejar la carga

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Obtén el documento del producto desde Firestore usando el ID
        const productDoc = await getDoc(doc(db, "products", id));
        if (productDoc.exists()) {
          // Si el producto existe, guarda sus datos en el estado
          setProduct({ id: productDoc.id, ...productDoc.data() });
        } else {
          console.error("El producto no existe.");
        }
      } catch (error) {
        console.error("Error fetching product details: ", error);
      } finally {
        setLoading(false); // Finaliza la carga
      }
    };

    fetchProduct();
  }, [id]);

  // Si el producto aún no se ha cargado, muestra un mensaje de carga
  if (loading) {
    return <div>Cargando...</div>;
  }

  // Si no se encontró el producto, muestra un mensaje de error
  if (!product) {
    return <div>El producto no existe.</div>;
  }

  /*const handleBuyNow = () => {
    // Lógica para comprar ahora
    console.log("Comprar ahora:", product);
  };*/

  return (
    <div className="product-detail">
      <img src={product.image} alt={product.name} className="product-image" />
      <div className="product-detail-content">
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <p className="price">Precio: ${product.price}</p>
        <div className="buttons-container">
          
          <button onClick={() => addToCart(product)} className="add-to-cart-button">
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;