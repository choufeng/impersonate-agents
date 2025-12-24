import { useState } from "react";
import "./style.css";

export default function Popup() {
  const [count, setCount] = useState(0);
  console.log("🟢 [POPUP] Popup page loaded, count:", count);

  const handleClick = () => {
    setCount(count + 1);
    console.log("🟢 [POPUP] Button clicked! count:", count + 1);
  };

  return (
    <div
      data-theme="abyss"
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "10px",
        minWidth: "500px",
        minHeight: "400px",
      }}
    >
      <h1 className="text-2xl font-bold text-abyss-primary">
        🟢 [POPUP] Popup Page
      </h1>
      <p style={{ marginTop: "20px" }}>
        Hot reload test - Click count:{" "}
        <strong className="text-abyss-primary">{count}</strong>
      </p>
      <button onClick={handleClick} className="btn btn-primary">
        Click me!
      </button>
    </div>
  );
}
