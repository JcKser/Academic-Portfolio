import React, { useState } from "react";
import FlyThroughScene from "./FlyThroughScene";
import JanelaPanel from "./JanelaPanel";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFly, setShowFly] = useState(true);

  const handleFinish = () => {
    // Quando o fly termina, abre o menu
    setMenuOpen(true);
  };

  const handleRestart = () => {
    // Reinicia a animação
    setShowFly(false);
    setTimeout(() => {
      setMenuOpen(false);
      setShowFly(true);
    }, 100);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      {showFly && (
        <FlyThroughScene
          onFinish={handleFinish}
          menuOpen={menuOpen}
        />
      )}

      {/* Menu aparece sobreposto */}
      {menuOpen && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn 1s ease forwards",
          }}
        >
          <JanelaPanel
            onRestart={handleRestart}
            onClose={() => alert("Fechando menu")}
          />
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
