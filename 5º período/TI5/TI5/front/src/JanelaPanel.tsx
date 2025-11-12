// src/JanelaPanel.tsx
import React, { useState } from "react";

type JanelaPanelProps = {
  onRestart?: () => void;
  // Esta é a prop que dispara a animação de nuvens
  onSensoresClick?: () => void;
};

// Define os "sub-menus"
type TelaAtiva = "main" | "controles" | "sensores" | "historico" | "ajustes";

// -----------------------------------------------------------------
// Componente "Voltar"
// -----------------------------------------------------------------
const BotaoVoltar = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    title="Voltar"
    style={{
      background: "#ffffff22", color: "white", border: "none",
      borderRadius: "50%", width: 40, height: 40, fontSize: "1.2em",
      cursor: "pointer", position: "absolute", top: 16, left: 16,
    }}
  >
    ⬅️
  </button>
);

// -----------------------------------------------------------------
// O Painel Principal
// -----------------------------------------------------------------
const JanelaPanel: React.FC<JanelaPanelProps> = ({
  onRestart,
  onSensoresClick, // Recebendo a prop correta
}) => {
  const [telaAtiva, setTelaAtiva] = useState<TelaAtiva>("main");
  const [janelaAberta, setJanelaAberta] = useState(false);

  const handleToggleJanela = () => {
    setJanelaAberta(!janelaAberta);
    alert(janelaAberta ? "Enviando comando: Fechar" : "Enviando comando: Abrir");
  };

  const handleSimularChuva = () => {
    alert("Enviando simulação de chuva...");
  };
  
  const handleSensoresClick = () => {
    // 1. Chama a animação das nuvens (no FlyThroughScene)
    if (onSensoresClick) {
      onSensoresClick();
    }
    // 2. (Opcional) Poderia trocar para a tela de sensores
    // setTelaAtiva("sensores"); 
    // Por enquanto, vamos focar só na animação.
    // alert("Iniciando transição de nuvens...");
  };

  // ----- Funções de Renderização -----

  // Tela 1: O Menu Principal (4 Símbolos)
  const renderTelaMain = () => (
    <>
      <h2 style={{ marginTop: 0 }}>Janela Inteligente</h2>
      <p style={{ marginTop: -10, opacity: 0.7 }}>Dashboard Principal</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginTop: 24,
        }}
      >
        <button onClick={() => setTelaAtiva("controles")} style={menuIconStyle}>
          <span style={iconStyle}>🕹️</span> Controles
        </button>
        
        {/* Este botão agora chama a transição */}
        <button onClick={handleSensoresClick} style={menuIconStyle}>
          <span style={iconStyle}>🌡️</span> Sensores
        </button>

        <button onClick={() => setTelaAtiva("historico")} style={menuIconStyle}>
          <span style={iconStyle}>🔔</span> Histórico
        </button>

        <button onClick={() => setTelaAtiva("ajustes")} style={menuIconStyle}>
          <span style={iconStyle}>⚙️</span> Ajustes
        </button>
      </div>
      
      <button
        onClick={() => onRestart?.()}
        title="Reiniciar Animação"
        style={{ ...menuIconStyle, background: "#ffffff11", marginTop: 12, width: "100%" }}
      >
        🔄 Reiniciar Voo
      </button>
    </>
  );

  // Telas 2, 3, 4, 5 (Controles, Sensores, etc.)
  const renderTelaControles = () => (
    <>
      <BotaoVoltar onClick={() => setTelaAtiva("main")} />
      <h2 style={{ marginTop: 0 }}>🕹️ Controles</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
        <button
          onClick={handleToggleJanela}
          style={{...buttonStyle, background: janelaAberta ? "#ff4444aa" : "#44dd44aa"}}
        >
          {janelaAberta ? "🔒 Fechar Janela" : "🔓 Abrir Janela"}
        </button>
        <button
          onClick={handleSimularChuva}
          style={{...buttonStyle, background: "#44aaffaa"}}
        >
          🌧️ Simular Umidade
        </button>
      </div>
    </>
  );
  const renderTelaSensores = () => (
    <>
      <BotaoVoltar onClick={() => setTelaAtiva("main")} />
      <h2 style={{ marginTop: 0 }}>🌡️ Sensores</h2>
      <div style={{...panelStyle, marginTop: 24, textAlign: 'left'}}>
        <p>Temperatura: <strong>24°C</strong></p>
      </div>
    </>
  );
  const renderTelaHistorico = () => (
    <>
      <BotaoVoltar onClick={() => setTelaAtiva("main")} />
      <h2 style={{ marginTop: 0 }}>🔔 Histórico</h2>
      <div style={{...panelStyle, marginTop: 24, textAlign: 'left', opacity: 0.7}}>
        <p style={{margin: "4px 0"}}>- 13:02: Janela aberta.</p>
      </div>
    </>
  );
  const renderTelaAjustes = () => (
    <>
      <BotaoVoltar onClick={() => setTelaAtiva("main")} />
      <h2 style={{ marginTop: 0 }}>⚙️ Ajustes</h2>
      <div style={{...panelStyle, marginTop: 24, textAlign: 'left', opacity: 0.7}}>
        <p>Ativar Sons...</p>
      </div>
    </>
  );

  // ----- Renderização Principal -----
  
  const renderTela = () => {
    switch (telaAtiva) {
      case "controles": return renderTelaControles();
      case "sensores": return renderTelaSensores();
      case "historico": return renderTelaHistorico();
      case "ajustes": return renderTelaAjustes();
      case "main": default: return renderTelaMain();
    }
  };

  return (
    <div
      style={{
        width: 420, maxWidth: "92vw", minHeight: 300, padding: 24,
        borderRadius: 16, background: "rgba(12, 12, 18, 0.95)",
        color: "#fff", boxShadow: "0 10px 40px rgba(0,0,0,0.45)",
        textAlign: "center", transition: "all 0.3s ease", position: 'relative',
      }}
    >
      {renderTela()}
    </div>
  );
};

export default JanelaPanel;

// ----- Estilos reutilizados -----
const menuIconStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.2)",
  color: "white", borderRadius: 12, padding: "16px", fontSize: "1em",
  cursor: "pointer", display: "flex", flexDirection: "column",
  alignItems: "center", gap: 8, transition: "background 0.2s ease",
};
const iconStyle: React.CSSProperties = { fontSize: "2.5em", lineHeight: 1 };
const panelStyle: React.CSSProperties = { background: "rgba(0,0,0,0.2)", padding: "16px", borderRadius: 8 };
const buttonStyle: React.CSSProperties = { padding: "16px", borderRadius: 8, border: "none", color: "white", cursor: "pointer", fontSize: "1.2em" };