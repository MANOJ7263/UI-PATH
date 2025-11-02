import React, { useState } from "react";
import Home from "./components/Home";
import QuizApp from "./components/QuizApp";
import History from "./components/History";
import "./App.css";

function App() {
  const [view, setView] = useState("home");
  const [user, setUser] = useState("");

  return (
    <div className="App">
      {view === "home" && (
        <Home
          onStart={(name) => {
            setUser(name);
            setView("quiz");
          }}
          onHistory={() => setView("history")}
        />
      )}
      {view === "quiz" && <QuizApp user={user} onExit={() => setView("home")} />}
      {view === "history" && <History onBack={() => setView("home")} />}
    </div>
  );
}

export default App;
