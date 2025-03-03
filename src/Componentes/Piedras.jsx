import React, { useEffect, useState } from 'react';
import '../styles/Piedras.css';
import Amazonita from '../img/amazonite-6058741_1280-removebg-preview.png';
import Broncita from '../img/broncita-removebg-preview.png';
import Jaspe from '../img/Jaspe-ppal-removebg-preview.png';
import Jade from '../img/jade-removebg-preview.png';
import Cuarzo from '../img/cuarzo-removebg-preview.png';
import Cereza from '../img/cereza-removebg-preview.png';
import Charoita from '../img/charoita.png';
import Pirita from '../img/pirita-removebg-preview.png';
import Chiastolita from '../img/Chiastolita-removebg-preview.png';
import Esmeralda from '../img/esmeralda-removebg-preview.png';
import PiedraSol from '../img/pirita-removebg-preview.png';
import Luna from '../img/luna_piedra-removebg-preview.png';
import Hematita from '../img/hematita-removebg-preview.png';
import Rodonita from '../img/rodonita-removebg-preview.png';
import Rubi from '../img/ruby-removebg-preview.png';
import Granate from '../img/granate-removebg-preview.png';
import Zafiro from '../img/zafiro-1-removebg-preview.png';
import Fluorita from '../img/flutorita-removebg-preview.png';

const Piedras = () => {
  const [selectedPiedra, setSelectedPiedra] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const piedras = [
    {
      nombre: "Amazonita",
      propiedad: "Armonía, Comunicación y equilibrio emocional",
      signos: "Virgo, Acuario",
      imagen: Amazonita,
      descripcionCosmica: "La Amazonita es conocida por su capacidad para equilibrar las energías emocionales y fomentar la comunicación sincera."
    },
    {
      nombre: "Broncita",
      propiedad: "Equilibrio, protección y seguridad personal",
      signos: "Leo, Aries",
      imagen: Broncita,
      descripcionCosmica: "La Broncita es una piedra de protección que ayuda a mantener el equilibrio emocional y la seguridad personal."
    },
    {
      nombre: "Jaspe",
      propiedad: "Vitalidad, estabilidad, conexión con la tierra",
      signos: "Aries, Escorpio y Virgo",
      imagen: Jaspe,
      descripcionCosmica: "El Jaspe es una piedra que aporta vitalidad y estabilidad, ayudando a conectar con la energía de la tierra."
    },
    {
      nombre: "Jade",
      propiedad: "Prosperidad, Armonía y Protección",
      signos: "Tauro, Libra",
      imagen: Jade,
      descripcionCosmica: "El Jade es una piedra que atrae prosperidad, armonía y protección, equilibrando las energías del cuerpo y la mente."
    },
    {
      nombre: "Cuarzo",
      propiedad: "Sanación Emocional, amor y vitalidad",
      signos: "Escorpio y Sagitario",
      imagen: Cuarzo,
      descripcionCosmica: "El Cuarzo es una piedra versátil que promueve la sanación emocional, el amor y la vitalidad."
    },
    {
      nombre: "Cereza",
      propiedad: "Transformación espiritual y sanación profunda",
      signos: "Leo, Tauro",
      imagen: Cereza,
      descripcionCosmica: "La Cereza es una piedra que facilita la transformación espiritual y la sanación profunda."
    },
    {
      nombre: "Charoita",
      propiedad: "Prosperidad, Abundancia y Protección",
      signos: "Libra y Capricornio",
      imagen: Charoita,
      descripcionCosmica: "La Charoita es una piedra que atrae prosperidad, abundancia y protección, ayudando a equilibrar las energías."
    },
    {
      nombre: "Pirita",
      propiedad: "Protección, Equilibrio y conexión con lo divino",
      signos: "Leo, Aries",
      imagen: Pirita,
      descripcionCosmica: "La Pirita es una piedra de protección que promueve el equilibrio y la conexión con lo divino."
    },
    {
      nombre: "Chiastolita",
      propiedad: "Amor, Paz y Sanación",
      signos: "Libra, Tauro",
      imagen: Chiastolita,
      descripcionCosmica: "La Chiastolita es una piedra que fomenta el amor, la paz y la sanación emocional."
    },
    {
      nombre: "Esmeralda",
      propiedad: "Paz interior, comunicación y equilibrio energético",
      signos: "Tauro, Libra",
      imagen: Esmeralda,
      descripcionCosmica: "La Esmeralda es una piedra que promueve la paz interior, la comunicación y el equilibrio energético."
    },
    {
      nombre: "Piedra Sol",
      propiedad: "Alegría, Vitalidad y energía positiva",
      signos: "Leo, Aries",
      imagen: PiedraSol,
      descripcionCosmica: "La Piedra Sol es una piedra que irradia alegría, vitalidad y energía positiva."
    },
    {
      nombre: "Luna",
      propiedad: "Intuición, protección y sanación emocional",
      signos: "Cáncer y Piscis",
      imagen: Luna,
      descripcionCosmica: "La Piedra Luna es conocida por fortalecer la intuición, ofrecer protección y promover la sanación emocional."
    },
    {
      nombre: "Hematita",
      propiedad: "Energía, Equilibrio",
      signos: "Aries, Acuario",
      imagen: Hematita,
      descripcionCosmica: "La Hematita es una piedra que aporta energía y equilibrio, ayudando a estabilizar las emociones."
    },
    {
      nombre: "Rodonita",
      propiedad: "Sanación Emocional, equilibrio, amor incondicional",
      signos: "Libra y Tauro",
      imagen: Rodonita,
      descripcionCosmica: "La Rodonita es una piedra que promueve la sanación emocional, el equilibrio y el amor incondicional."
    },
    {
      nombre: "Rubí",
      propiedad: "Pasión, Energía y protección",
      signos: "Aries y Leo",
      imagen: Rubi,
      descripcionCosmica: "El Rubí es una piedra que estimula la pasión, la energía y ofrece protección."
    },
    {
      nombre: "Granate",
      propiedad: "Energía, Pasión y vitalidad",
      signos: "Aries, Escorpio",
      imagen: Granate,
      descripcionCosmica: "El Granate es una piedra que aporta energía, pasión y vitalidad, revitalizando el espíritu."
    },
    {
      nombre: "Zafiro",
      propiedad: "Sabiduría, claridad y calma mental",
      signos: "Capricornio y Virgo",
      imagen: Zafiro,
      descripcionCosmica: "El Zafiro es una piedra que fomenta la sabiduría, la claridad mental y la calma."
    },
    {
      nombre: "Fluorita",
      propiedad: "Elimina bloqueos mentales y emocionales",
      signos: "Capricornio, Piscis, Acuario",
      imagen: Fluorita,
      descripcionCosmica: "La Fluorita es una piedra que ayuda a eliminar bloqueos mentales y emocionales, promoviendo la claridad."
    },
  ];

  const handleCardClick = (piedra) => {
    setSelectedPiedra(piedra);
  };

  const closeModal = () => {
    setSelectedPiedra(null);
  };

  return (
    <div className="piedras-container">
      <h1>Piedras Naturales</h1>
      <p className="subtitulo">Tu energía en equilibrio</p>
      <div className="piedras-list">
        {piedras.map((piedra, index) => (
          <div key={index} className="piedra-card" onClick={() => handleCardClick(piedra)}>
            <h2>{piedra.nombre}</h2>
            <img src={piedra.imagen} alt={piedra.nombre} className="piedra-image" />
            <p><strong>Propiedad:</strong> {piedra.propiedad}</p>
            <p><strong>Signos:</strong> {piedra.signos}</p>
          </div>
        ))}
      </div>

      {selectedPiedra && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedPiedra.imagen} alt={selectedPiedra.nombre} className="modal-image" />
            <h2>{selectedPiedra.nombre}</h2>
            <p><strong>Propiedades Cósmicas:</strong> {selectedPiedra.descripcionCosmica}</p>
            <button onClick={closeModal}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Piedras;