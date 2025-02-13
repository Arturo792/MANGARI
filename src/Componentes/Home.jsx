import React, { useEffect } from 'react'; // Importa useEffect
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import cuarzoRosa from '../img/cuarzo rosa.jpg';
import cuarzoTransparente from '../img/cuarzoz transparentes.jpg';

const Home = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/piedras');
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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