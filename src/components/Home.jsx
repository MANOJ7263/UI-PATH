import React, { useState } from "react";

export default function Home({ onStart, onHistory }) {
  const [name, setName] = useState("");

  return (
    <div className="home">
      <h1>UiPath Practice Test Simulator</h1>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={() => name && onStart(name)}>Start Test</button>
      <button onClick={onHistory}>View History</button>
    </div>
  );
}
