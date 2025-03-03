import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import cuarzoRosa from '../img/cuarzo rosa.jpg';
import cuarzoTransparente from '../img/cuarzoz transparentes.jpg';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebase';

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Mezclar los productos aleatoriamente
      const shuffledProducts = productsData.sort(() => Math.random() - 0.5);
      setProducts(shuffledProducts);
    } catch (error) {
      console.error("Error fetching products: ", error);
    }
  };

  const handleClick = () => {
    navigate('/piedras');
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`); // Navega a la página de detalles del producto
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1
        }
      }
    ]
  };

  return (
    <div className="home-container">
      <div className="image-panel">
        <img src={cuarzoRosa} alt="Cuarzo Rosa" className="home-image" />
        <div className="overlay-text">
          <h1>MANGARI</h1>
          <p>armonía natural</p>
        </div>
      </div>
      <div className="text-panel">
        <br /><br />
        <p className="description">
          Diseñamos joyas únicas con cuarzos, fusionando protección energética y durabilidad. Nuestras
          piezas te conectan con la naturaleza, ofreciendo belleza y bienestar en cada detalle.
        </p>
        <br /><br /><br />
        <div className="carousel-container">
          <h2>Productos Destacados</h2>
          <Slider {...settings}>
            {products.map((product) => (
              <div
                key={product.id}
                className="carousel-item"
                onClick={() => handleProductClick(product.id)} // Navega al hacer clic
              >
                <img src={product.image} alt={product.name} className="carousel-image" />
                <h3>{product.name}</h3>
                <p>{product.description.slice(0, 50)}...</p>
                <p>${product.price}</p>
              </div>
            ))}
          </Slider>
        </div>
        <div className="transparent-image-container">
          <img src={cuarzoTransparente} alt="cuarzoTransparente" className="text-panel-image" />
          <div className="blurred-box">
            <p className="blurred-text">Usamos distintas piedras</p>
            <p>Elige la mejor según tu signo</p>
            <button className="blurred-button" onClick={handleClick}>
              Danos un vistazo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;