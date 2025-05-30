import React from 'react';
import '../styles/Nosotros.css'; 

const Nosotros = () => {
  return (
    <div className="nosotros-container">
      {/* Hero Intro */}
      <div className="hero-section compact">
        <h1>Conócenos</h1>
        <p>
          Mangari es una empresa michoacana dedicada a la creación de joyería y accesorios artesanales
          elaborados con piedras y cuarzos naturales.
        </p>
      </div>

      {/* Historia */}
      <div className="historia-section compact">
        <div className="historia-content">
          <h2>Nuestra Historia</h2>
          <p>
            Mangari nace del amor por las piedras, la energía de la naturaleza y el diseño con intención.
            Inspirados por el poder simbólico de los cuarzos, decidimos crear piezas que embellecen,
            acompañan y protegen a quienes las llevan.
          </p>
          <p>
            Cada creación representa una armonía entre la naturaleza y el ser humano, una conexión
            emocional y estética que trasciende la moda.
          </p>
        </div>
        <div className="historia-imagen">
          
        </div>
      </div>

      {/* Misión y Visión */}
      <div className="mision-vision-section compact">
        <div className="mision">
          <h2>Misión</h2>
          <p>
            Diseñar joyería artesanal con propósito, seleccionando materiales naturales y fusionando
            tradición con estilo contemporáneo para crear accesorios que conecten con el alma.
          </p>
        </div>
        <div className="vision">
          <h2>Visión</h2>
          <p>
            Ser una marca referente de armonía y significado, creando piezas que inspiren, protejan y
            acompañen la historia de cada persona.
          </p>
        </div>
      </div>

      {/* Valores */}
      <div className="valores-section compact">
        <h2>Nuestros Valores</h2>
        <div className="valores-grid">
          <div className="valor-card">
            <h3>Pasión</h3>
            <p>Creamos con el corazón, guiados por la emoción que nos une con cada piedra.</p>
          </div>
          <div className="valor-card">
            <h3>Artesanía</h3>
            <p>Honramos el trabajo manual y la dedicación en cada detalle de nuestras piezas.</p>
          </div>
          <div className="valor-card">
            <h3>Sostenibilidad</h3>
            <p>Elegimos conscientemente materiales y procesos que respetan nuestro entorno.</p>
          </div>
          <div className="valor-card">
            <h3>Significado</h3>
            <p>Cada diseño refleja intención, energía y una historia única por contar.</p>
          </div>
        </div>
      </div>

     

      {/* Cierre emocional */}
      <div className="hero-section compact" style={{ backgroundColor: '#BEAEA0', color: '#fff' }}>
        <h2>Más que joyería, una conexión</h2>
        <p>
          En Mangari encontrarás piezas que reflejan tu esencia, pensadas para acompañarte y regalar con
          alma. Diseñamos armonía natural hecha con el corazón.
        </p>
      </div>
    </div>
  );
};

export default Nosotros;