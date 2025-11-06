// src/JanelaPanel.tsx
import React from "react";

type JanelaPanelProps = {
  onClose?: () => void;
  onRestart?: () => void;
};

const JanelaPanel: React.FC<JanelaPanelProps> = ({ onClose, onRestart }) => {
  return (
    <div
      style={{
        width: 420,
        maxWidth: "92vw",
        padding: 24,
        borderRadius: 16,
        background: "rgba(12,12,18,0.8)",
        color: "#fff",
        boxShadow: "0 10px 40px rgba(0,0,0,0.45)",
        textAlign: "center",
        backdropFilter: "blur(8px)",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Menu Principal</h2>
      <p>Bem-vindo! Escolha uma opção abaixo:</p>

      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14 }}>
        <button onClick={() => alert("Iniciar")} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#ffffff22", color: "white", cursor: "pointer" }}>
          Iniciar
        </button>

        <button onClick={() => onRestart?.()} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#ffffff22", color: "white", cursor: "pointer" }}>
          Reiniciar Fly
        </button>

        <button onClick={() => onClose?.()} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#ff4444aa", color: "white", cursor: "pointer" }}>
          Fechar
        </button>
      </div>
    </div>
  );
};

export default JanelaPanel;
