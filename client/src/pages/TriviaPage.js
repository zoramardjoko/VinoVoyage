import { useState, useEffect } from 'react';
// import css page
import './CSS/TriviaPage.css';

const questions = [
    { id: 1, question: "What is the capital of France?", options: ["Paris", "London", "Rome", "Berlin"], answer: "Paris" },
    { id: 2, question: "What is 2 + 2?", options: ["3", "4", "5", "6"], answer: "4" },
    { id: 3, question: "Who wrote 'Hamlet'?", options: ["Marlowe", "Shakespeare", "Byron", "Keats"], answer: "Shakespeare" },
    // Add more questions as needed
  ];


export default function TriviaGame() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
  
    const handleAnswerOptionClick = (option) => {
      if (option === questions[currentQuestionIndex].answer) {
        setScore(score + 1);
      }
  
      const nextQuestion = currentQuestionIndex + 1;
      if (nextQuestion < questions.length) {
        setCurrentQuestionIndex(nextQuestion);
      } else {
        setShowResults(true);
      }
    };
  
    return (
        <div className="App">
          {showResults ? (
            <div className="game-over">
              <h1>Game Over</h1>
              <p className="score">Your score: {score} out of {questions.length}</p>
            </div>
          ) : (
            <div>
              <h1>{questions[currentQuestionIndex].question}</h1>
              <div className="options-container">
                {questions[currentQuestionIndex].options.map((option) => (
                  <button onClick={() => handleAnswerOptionClick(option)} key={option}>
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
  }
