import React, { useEffect, useState } from "react";
import questionsData from "../data/questions.json";

export default function QuizApp({ user, onExit }) {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes in seconds

  // 🔹 Load questions
  useEffect(() => {
    // Retrieve used question numbers from localStorage
    const used = JSON.parse(localStorage.getItem("usedQuestions") || "[]");

    // Filter out already used questions
    const unusedQuestions = questionsData.filter(
      (q) => !used.includes(q.question_number)
    );

    // If less than 60 unused remain, reset the used list
    let availableQuestions = unusedQuestions;
    if (unusedQuestions.length < 60) {
      localStorage.removeItem("usedQuestions");
      availableQuestions = [...questionsData];
    }

    // Randomize and pick 60
    const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());
    const selectedSet = shuffled.slice(0, 60);
    setQuestions(selectedSet);

    // Update used questions list
    const newUsed = [
      ...used,
      ...selectedSet.map((q) => q.question_number),
    ];
    localStorage.setItem("usedQuestions", JSON.stringify(newUsed));
  }, []);

  // 🔹 Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // 🔹 Selecting an answer
  const handleSelect = (option) => {
    if (answers[current]) return; // prevent re-answering
    const q = questions[current];
    const correct = q.answer;

    setAnswers((prev) => ({
      ...prev,
      [current]: option,
    }));

    if (option === correct) {
      setScore((prev) => prev + 1);
    }
  };

  // 🔹 Move next only if answered
  const handleNext = () => {
    if (!answers[current]) return; // must answer before moving on
    if (current + 1 < questions.length) {
      setCurrent((prev) => prev + 1);
      setSelected(null);
    } else {
      handleFinish();
    }
  };

  // 🔹 Go to previous question (read-only)
  const handlePrevious = () => {
    if (current > 0) setCurrent((prev) => prev - 1);
  };

  // 🔹 Finish test and save history
  const handleFinish = () => {
    setShowResult(true);

    const attempt = {
      name: user,
      date: new Date().toLocaleString(),
      score,
      total: questions.length,
      percentage: ((score / questions.length) * 100).toFixed(2),
      passed: ((score / questions.length) * 100) >= 70,
      attemptedQuestions: questions.map((q) => q.question_number),
    };

    const history = JSON.parse(localStorage.getItem("quizHistory") || "[]");
    history.push(attempt);
    localStorage.setItem("quizHistory", JSON.stringify(history));
  };

  // 🔹 Format timer
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  if (questions.length === 0) return <h2>Loading questions...</h2>;

  // 🔹 Result Page
  if (showResult)
    return (
      <div className="result">
        <h2>Test Completed</h2>
        <p>Name: {user}</p>
        <p>
          Score: {score} / {questions.length}
        </p>
        <p>Percentage: {((score / questions.length) * 100).toFixed(2)}%</p>
        <h3
          style={{
            color: ((score / questions.length) * 100) >= 70 ? "green" : "red",
          }}
        >
          {((score / questions.length) * 100) >= 70
            ? "✅ Passed"
            : "❌ Failed"}
        </h3>
        <button onClick={onExit}>Exit</button>
      </div>
    );

  const q = questions[current];
  const selectedAnswer = answers[current];
  const options = q.options || {};
  const images = q.images || [];

  return (
    <div className="quiz">
      {/* Header */}
      <div className="quiz-header">
        <h3>{user}'s Test</h3>
        <p>
          Question {current + 1} / {questions.length}
        </p>
        <p>⏱ Time Left: {formatTime(timeLeft)}</p>
      </div>

      {/* Body */}
      <div className="quiz-body">
        <h4>
          {q.question_number}. {q.question_text}
        </h4>

        {/* Images */}
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

        {/* Options */}
        <ul>
          {Object.entries(options).map(([letter, opt], i) => {
            const isCorrect = selectedAnswer && letter === q.answer;
            const isWrong = selectedAnswer === letter && letter !== q.answer;

            return (
              <li
                key={i}
                onClick={() => handleSelect(letter)}
                className={
                  selectedAnswer
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

        {/* Feedback */}
        {selectedAnswer && (
          <p className="feedback">
            {selectedAnswer === q.answer
              ? "✅ Correct!"
              : `❌ Incorrect! Correct Answer: ${q.answer}`}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="quiz-footer">
        <button onClick={handlePrevious} disabled={current === 0}>
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={!answers[current]} // disable until answered
        >
          {current + 1 === questions.length ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}