import React, { useEffect, useState } from "react";
import questionsData from "../data/questions.json";

export default function QuizApp({ user, onExit }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 mins in seconds

  useEffect(() => {
    // Shuffle and pick 60 random questions
    const shuffled = [...questionsData].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 60));
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSelect = (option) => {
    if (selected) return; // prevent multiple selections
    setSelected(option);

    const correct = questions[current].answer;
    if (option === correct) setScore((prev) => prev + 1);
  };

  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
      setSelected(null);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    setShowResult(true);

    const attempt = {
      name: user,
      date: new Date().toLocaleString(),
      score,
      total: questions.length,
      percentage: ((score / questions.length) * 100).toFixed(2),
      passed: ((score / questions.length) * 100) >= 70
    };

    const history = JSON.parse(localStorage.getItem("quizHistory") || "[]");
    history.push(attempt);
    localStorage.setItem("quizHistory", JSON.stringify(history));
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (questions.length === 0) return <h2>Loading questions...</h2>;

  if (showResult)
    return (
      <div className="result">
        <h2>Test Completed</h2>
        <p>Name: {user}</p>
        <p>Score: {score} / {questions.length}</p>
        <p>Percentage: {((score / questions.length) * 100).toFixed(2)}%</p>
        <h3
          style={{
            color: ((score / questions.length) * 100) >= 70 ? "green" : "red"
          }}
        >
          {((score / questions.length) * 100) >= 70 ? "✅ Passed" : "❌ Failed"}
        </h3>
        <button onClick={onExit}>Exit</button>
      </div>
    );

  const q = questions[current];

  // 🧠 Ensure options exist as an object
  const options = q.options || {};
  const images = q.images || [];

  return (
    <div className="quiz">
      <div className="quiz-header">
        <h3>{user}'s Test</h3>
        <p>Question {current + 1} / {questions.length}</p>
        <p>⏱ Time Left: {formatTime(timeLeft)}</p>
      </div>

      <div className="quiz-body">
        <h4>
          {q.question_number}. {q.question_text}
        </h4>

        {/* 🖼️ Multiple Images Support */}
        {images.length > 0 && (
          <div className="question-images">
            {images.map((img, index) => (
              <img
                key={index}
                src={`images/${img}`}
                alt={`Question ${q.question_number} - ${index}`}
                className="question-img"
              />
            ))}
          </div>
        )}

        <ul>
          {Object.entries(options).map(([letter, opt], i) => {
            const isCorrect = selected && letter === q.answer;
            const isWrong = selected === letter && letter !== q.answer;

            return (
              <li
                key={i}
                onClick={() => handleSelect(letter)}
                className={
                  selected
                    ? isCorrect
                      ? "correct"
                      : isWrong
                      ? "wrong"
                      : ""
                    : ""
                }
              >
                {letter}. {opt}
              </li>
            );
          })}
        </ul>

        {selected && (
          <p className="feedback">
            {selected === q.answer
              ? "✅ Correct!"
              : `❌ Incorrect! Correct Answer: ${q.answer}`}
          </p>
        )}
      </div>

      <div className="quiz-footer">
        <button onClick={handleNext}>Next</button>
      </div>
    </div>
  );
}
