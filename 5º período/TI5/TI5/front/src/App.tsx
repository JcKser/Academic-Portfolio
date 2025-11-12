// src/App.tsx
import React from "react";
import FlyThroughScene from "./FlyThroughScene";

export default function App() {
  // Este App não faz nada, só renderiza a cena.
  // Isso corrige os erros de 'sceneKey' e 'onTriggerTransition'.
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <FlyThroughScene />
    </div>
  );
}