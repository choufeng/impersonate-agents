import { useState } from "react";

export default function Popup() {
  const [count, setCount] = useState(0);
  console.log("🟢 [POPUP] Popup page loaded, count:", count);

  const handleClick = () => {
    setCount(count + 1);
    console.log("🟢 [POPUP] Button clicked! count:", count + 1);
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "10px",
        minWidth: "500px",
        minHeight: "400px",
      }}
    >
      <h1>🟢 [POPUP] Popup Page</h1>
      <p style={{ marginTop: "20px" }}>
        Hot reload test - Click count: <strong>{count}</strong>
      </p>
      <button
        onClick={handleClick}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Click me!
      </button>
    </div>
  );
}
