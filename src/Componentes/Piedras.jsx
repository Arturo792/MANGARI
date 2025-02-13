import React, { useEffect } from 'react';
import '../styles/Piedras.css';

const Piedras = () => {
  useEffect(() => {
    window.scrollTo(0, 0); 
  }, []);
  const piedras = [
    
    {
      nombre: "Amazonita",
      propiedad: "Armonía, Comunicación y equilibrio emocional",
      signos: "Virgo, Acuario",
    },
    {
      nombre: "Broncita",
      propiedad: "Equilibrio, protección y seguridad personal",
      signos: "Leo, Aries",
    },
    {
      nombre: "Jaspe",
      propiedad: "Vitalidad, estabilidad, conexión con la tierra",
      signos: "Aries, Escorpio y Virgo",
    },
    {
      nombre: "Jade",
      propiedad: "Prosperidad, Armonía y Protección",
      signos: "Tauro, Libra",
    },
    {
      nombre: "Cuarzo",
      propiedad: "Sanación Emocional, amor y vitalidad",
      signos: "Escorpio y Sagitario",
    },
    {
      nombre: "Cereza",
      propiedad: "Transformación espiritual y sanación profunda",
      signos: "Leo, Tauro",
    },
    {
      nombre: "Charoita",
      propiedad: "Prosperidad, Abundancia y Protección",
      signos: "Libra y Capricornio",
    },
    {
      nombre: "Pirita",
      propiedad: "Protección, Equilibrio y conexión con lo divino",
      signos: "Leo, Aries",
    },
    {
      nombre: "Chiastolita",
      propiedad: "Amor, Paz y Sanación",
      signos: "Libra, Tauro",
    },
    {
      nombre: "Esmeralda",
      propiedad: "Paz interior, comunicación y equilibrio energético",
      signos: "Tauro, Libra",
    },
    {
      nombre: "Piedra Sol",
      propiedad: "Alegría, Vitalidad y energía positiva",
      signos: "Leo, Aries",
    },
    {
      nombre: "Luna",
      propiedad: "Intuición, protección y sanación emocional",
      signos: "Cáncer y Piscis",
    },
    {
      nombre: "Hematita",
      propiedad: "Energía, Equilibrio",
      signos: "Aries, Acuario",
    },
    {
      nombre: "Rodonita",
      propiedad: "Sanación Emocional, equilibrio, amor incondicional",
      signos: "Libra y Tauro",
    },
    {
      nombre: "Rubí",
      propiedad: "Pasión, Energía y protección",
      signos: "Aries y Leo",
    },
    {
      nombre: "Granate",
      propiedad: "Energía, Pasión y vitalidad",
      signos: "Aries, Escorpio",
    },
    {
      nombre: "Zafiro",
      propiedad: "Sabiduría, claridad y calma mental",
      signos: "Capricornio y Virgo",
    },
    {
      nombre: "Fluorita",
      propiedad: "Elimina bloqueos mentales y emocionales",
      signos: "Capricornio, Piscis, Acuario",
    },
  ];

  return (
    <div className="piedras-container">
      <h1>Piedras Naturales</h1>
      <p className="subtitulo">Tu energía en equilibrio</p>
      <div className="piedras-list">
        {piedras.map((piedra, index) => (
          <div key={index} className="piedra-card">
            <h2>{piedra.nombre}</h2>
            <p><strong>Propiedad:</strong> {piedra.propiedad}</p>
            <p><strong>Signos:</strong> {piedra.signos}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Piedras;