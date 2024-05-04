import { useState, useEffect } from 'react';
// import css page
import './CSS/App.css';

const questions = [
    { id: 1, question: "What is the term used for the year a wine's grapes were harvested?", options: ["Blend", "Vintage", "Reserve", "Estate"], answer: "Vintage" },
    { id: 2, question: "Which country is the largest producer of wine in the world?", options: ["France", "Spain", "Italy", "United States"], answer: "Italy" },
    { id: 3, question: "What is the process called in which sugars in grape juice are converted to alcohol by yeast?", options: ["Distillation", "Fermentation", "Maceration", "Oxidation"], answer: "Fermentation" },
    { id: 4, question: 'What type of wine is "Sherry"?', options: ["A white wine from Portugal", "A red wine from Italy", "A fortified wine from Spain", "A sparkling wine from France"], answer: "A fortified wine from Spain"},
    { id: 5, question: "Which red wine grape is most associated with the Bordeaux region of France?", options: ["Merlot", "Pinot Noir", "Cabernet Sauvignon", "Syrah"], answer: "Cabernet Sauvignon"},
    { id: 6, question: "Dynamic Question", options: ["1", "2", "3", "4"], answer: "1"},
    { id: 7, question: "Dynamic Q 2", options: ["1", "2", "3", "4"], answer: "2"},
    { id: 8, question: "D Q 3", options: ["1", "2", "3", "4"], answer: "3"},
    { id: 9, question: "DQ4", options: ["1", "2", "3", "4"], answer: "4"},
    { id: 10, question: "Name a wine region in New Zealand famous for its Sauvignon Blanc.", options: ["Marlborough", "Hawke's Bay", "Central Otago", "Gisborne"], answer: "Marlborough"},
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
