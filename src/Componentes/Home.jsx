import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebase';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import mangariLogo from '../img/mangari-home.png';
import cuarzoHero from '../img/cuarzo rosa.jpg';
import gargantilla from '../img/IMG_5013.jpeg';
import '../styles/Home.css';
 

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [piedras, setPiedras] = useState([]);
  const [loading, setLoading] = useState({
    products: true,
    piedras: true
  });
  const [selectedPiedra, setSelectedPiedra] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProducts();
    fetchPiedras();
  }, []);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData.sort(() => Math.random() - 0.5).slice(0, 8));
      setLoading(prev => ({...prev, products: false}));
    } catch (error) {
      console.error("Error fetching products: ", error);
      setLoading(prev => ({...prev, products: false}));
    }
  };

  const fetchPiedras = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "piedras"));
      const piedrasData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        let imagenUrl = data.imagen || '';
        if (imagenUrl.includes('firebaesitorage')) {
          imagenUrl = imagenUrl.replace('firebaesitorage', 'firebasestorage');
        }
        return {
          id: doc.id,
          nombre: data.nombre || '',
          propiedad: data.propiedad || '',
          imagen: imagenUrl
        };
      });
      setPiedras(piedrasData.sort(() => Math.random() - 0.5).slice(0, 6));
      setLoading(prev => ({...prev, piedras: false}));
    } catch (error) {
      console.error("Error fetching piedras: ", error);
      setLoading(prev => ({...prev, piedras: false}));
    }
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleViewPiedra = (piedra) => {
    setSelectedPiedra(piedra);
  };

  const closeModal = () => {
    setSelectedPiedra(null);
  };

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  return (
    <div className="mangari-home">
      {/* Hero Section */}
      <section className="hero-section">
  <div className="hero-image-container">
    <img src={cuarzoHero} alt="Cuarzo natural" className="hero-image" />
    <div className="hero-overlay"></div>
  </div>
  
  <div className="hero-content-container">
    <div className="hero-content">
      <img src={mangariLogo} alt="Mangari" className="hero-logo" />
      
      <h1 className="hero-title">JOYERÍA ENERGÉTICA</h1>
      <p className="hero-subtitle">Donde la naturaleza y la elegancia se encuentran</p>
      
      <div className="hero-cta">
        <button className="cta-button" onClick={() => navigate('/piedras')}>
          EXPLORA LAS PIEDRAS
        </button>
        <button className="cta-button secondary" onClick={() => navigate('/products')}>
          VER COLECCIÓN
        </button>
      </div>
    </div>
  </div>
</section>

    {/* About Section */}
<section className="about-section">
  <div className="about-container">
    <div className="about-text">
      <h2>MANGARI</h2>
      <div className="divider"></div>
      <p>
        En Mangari, fusionamos la belleza natural de los minerales con diseños contemporáneos 
        para crear piezas únicas que no solo adornan, sino que también armonizan tu energía. 
        Cada joya es cuidadosamente elaborada para conectar con tu esencia.
      </p>
      <button className="about-button cta-button" onClick={() => navigate('/nosotros')}>
      CONOCE NUESTRA HISTORIA
      </button>
      
    </div>
    <div className="about-image">
      <img 
        src={gargantilla} 
        alt="Gargantilla de Mangari" 
        className="about-image-content"
      />
    </div>
  </div>
</section>
br

      {/* Featured Products */}
      <section className="featured-section">
        <div className="section-header">
          <h2>COLECCIÓN DESTACADA</h2>
          <p>Piezas seleccionadas para inspirarte</p>
          <div className="divider"></div>
        </div>
        
        {loading.products ? (
          <div className="loading-spinner"></div>
        ) : (
          <Slider {...carouselSettings} className="products-carousel">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    onError={(e) => e.target.src = 'https://via.placeholder.com/500x500?text=Imagen+no+disponible'}
                  />
                  <div className="product-overlay">
                    <button className="view-button cta-button" onClick={() => handleViewProduct(product.id)}>
                      VER DETALLES
                    </button>
                  </div>
                  {product.isNew && <span className="new-badge">NUEVO</span>}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="price">${product.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </Slider>
        )}
        
        <div className="section-footer">
         <button className="view-all-button cta-button" onClick={() => navigate('/products')}>
          VER TODOS LOS PRODUCTOS
         </button>
        </div>
      </section>
      <br />

      {/* Piedras Energéticas */}
      <section className="piedras-section">
        <div className="section-header">
          <h2>PIEDRAS ENERGÉTICAS</h2>
          <p>Descubre la magia de los minerales</p>
          <div className="divider"></div>
        </div>
        
        {loading.piedras ? (
          <div className="loading-spinner"></div>
        ) : (
          <div className="piedras-grid">
            {piedras.map((piedra) => (
              <div 
                key={piedra.id} 
                className="piedra-card"
                onClick={() => handleViewPiedra(piedra)}
              >
                <div className="piedra-image-container">
                  <img 
                    src={piedra.imagen} 
                    alt={piedra.nombre}
                    onError={(e) => e.target.src = 'https://via.placeholder.com/300x300?text=Imagen+no+disponible'}
                  />
                </div>
                <div className="piedra-info">
                  <h3>{piedra.nombre}</h3>
                  <p className="propiedad">{piedra.propiedad.substring(0, 80)}...</p>
                  <button className="piedra-button cta-button">
                    VER PROPIEDADES
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="section-footer">
          <button className="view-all-button" onClick={() => navigate('/piedras')}>
            EXPLORAR CATÁLOGO COMPLETO
          </button>
        </div>
      </section>

      {/* Testimonials */}
           {/* Beneficios de las Joyas Energéticas */}
           <section className="benefits-section">
        <div className="section-header">
          <h2>BENEFICIOS DE LAS JOYAS ENERGÉTICAS</h2>
          <p>Descubre cómo nuestras piezas pueden transformar tu vida</p>
          <div className="divider"></div>
        </div>
        
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">♡</div>
            <h3>Armonía Interior</h3>
            <p>Equilibra tus energías y encuentra paz interior con piedras seleccionadas para tu bienestar emocional.</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">✧</div>
            <h3>Protección Natural</h3>
            <p>Cada mineral tiene propiedades únicas que actúan como escudos energéticos en tu día a día.</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">☽</div>
            <h3>Conexión Espiritual</h3>
            <p>Amplía tu conciencia y conecta con tu esencia a través de diseños cargados de intención.</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">☀</div>
            <h3>Estilo con Propósito</h3>
            <p>Lleva contigo belleza que trasciende lo estético, piezas que cuentan una historia y tienen un propósito.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="cta-container">
          <h2>¿LISTO PARA ENCONTRAR TU PIEZA PERFECTA?</h2>
          <p>Descubre cómo nuestras joyas pueden transformar tu energía y estilo</p>
          <div className="cta-buttons">
            <button className="cta-button" onClick={() => navigate('/piedras')}>
              ENCUENTRA TU PIEDRA
            </button>
            <button className="cta-button secondary" onClick={() => navigate('/products')}>
              VER COLECCIÓN
            </button>
          </div>
        </div>
      </section>

      {/* Piedra Modal */}
      {selectedPiedra && (
        <div className="piedra-modal-overlay" onClick={closeModal}>
          <div className="piedra-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <div className="modal-body">
              <div className="modal-image">
                <img 
                  src={selectedPiedra.imagen} 
                  alt={selectedPiedra.nombre}
                  onError={(e) => e.target.src = 'https://via.placeholder.com/600x600?text=Imagen+no+disponible'}
                />
              </div>
              <div className="modal-info">
                <h2>{selectedPiedra.nombre}</h2>
                <h3>Propiedades Energéticas</h3>
                <p>{selectedPiedra.propiedad}</p>
                <button 
                  className="modal-button"
                  onClick={() => {
                    closeModal();
                    navigate('/piedras');
                  }}
                >
                  VER MÁS PIEDRAS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default Home;
