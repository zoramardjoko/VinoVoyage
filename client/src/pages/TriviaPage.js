import { useState, useEffect } from 'react';
// import css page
import './CSS/App.css';

const config = require('../config.json');




export default function TriviaGame() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);

    // this is the section for the dynamic questions
    const [questionOne, setQuestionOne] = useState(null);
    const [questionTwo, setQuestionTwo] = useState(null);
    const [questionThree, setQuestionThree] = useState(null);
    const [questionFour, setQuestionFour] = useState(null);
    const [questionFive, setQuestionFive] = useState(null);
    const [questionSix, setQuestionSix] = useState(null);


    // sections for the queriees for some of the questions
    // QUESTION 3
    useEffect(() => {
      fetch(`http://${config.server_host}:${config.server_port}/question_one`)
      .then(res => res.json())
      .then(resJson => {
        // Ensure the array is not empty and set the first item
        if (resJson.length > 0) {
          setQuestionOne(resJson[0]); // Set the first object from the array
        } else {
          setQuestionOne(null); // Set to null if the array is empty
        }
        });
    }, []);

  //  QUESTION 6
  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/question_two`)
    .then(res => res.json())
    .then(resJson => {
      setQuestionTwo(resJson); // Set the first object from the array
      });
  }, []);

  // QUESTION 3
  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/question_three`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    })
    .then(resJson => {
      if (resJson.length > 0) {
        setQuestionThree(resJson); // Assuming resJson is the array
      } else {
        setQuestionThree(null); // Handle empty array case
      }
    })
    .catch(error => {
      console.error('Failed to fetch question three:', error);
      setQuestionThree(null);
    });
  }, []);

  // QUESTION 9
  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/question_four`)
    .then(res => res.json())
    .then(resJson => {
      setQuestionFour(resJson); // Set the first object from the array
      });
  }, []);


  // QUESTION 10
  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/question_five`)
    .then(res => res.json())
    .then(resJson => {
      setQuestionFive(resJson); // Set the first object from the array
      });
  }, []);


  // QUESTION 11
  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/question_six`)
    .then(res => res.json())
    .then(resJson => {
      setQuestionSix(resJson); // Set the first object from the array
      });
  }, []);




    // this is our bank of questions that the trivia page will pull from and use to quiz the user
// will feature both "static" and "dynamic" questions. What this means is that some answers to
// certain quesitons will be the result of some of our queries to the database, while others will
// will be hard-coded into the questions Array.
  const questions = [
    { id: 1, question: "What is the term used for the year a wine's grapes were harvested?", options: ["Blend", "Vintage", "Reserve", "Estate"], answer: "Vintage" },
    { id: 2, question: "Which country is the largest producer of wine in the world?", options: ["France", "Spain", "Italy", "United States"], answer: "Italy" },
    { id: 3, question: "Select the wine that's < $20 and from the U.S.", options: [questionOne ? questionOne.title : "oops", "Nota Bene 2005 Una Notte Red (Washington)", "Abacela 2006 Estate Tempranillo (Southern Oregon)", "Alpha Omega 2012 Stagecoach Vineyard Cabernet Sauvignon (Atlas Peak)"], answer: questionOne ? questionOne.title : "oops"},
    { id: 4, question: 'What type of wine is "Sherry"?', options: ["A white wine from Portugal", "A red wine from Italy", "A fortified wine from Spain", "A sparkling wine from France"], answer: "A fortified wine from Spain"},
    { id: 5, question: "Which red wine grape is most associated with the Bordeaux region of France?", options: ["Merlot", "Pinot Noir", "Cabernet Sauvignon", "Syrah"], answer: "Cabernet Sauvignon"},
    { id: 6, question: "Which wine is not commonly described as citrusy?", options: [questionTwo ? questionTwo[Math.floor(Math.random() * 50)].title : "oops", questionTwo ? questionTwo[Math.floor(Math.random() * 50)].title : "oops", "Charles Smith 2006 Royal City Syrah (Columbia Valley (WA))", questionTwo ? questionTwo[Math.floor(Math.random() * 50)].title : "oops"], answer: "Charles Smith 2006 Royal City Syrah (Columbia Valley (WA))"},
    { id: 7, question: "What is the process called in which sugars in grape juice are converted to alcohol by yeast?", options: ["Distillation", "Fermentation", "Maceration", "Oxidation"], answer: "Fermentation" },
    { id: 8, question: "Which of these highly rated wines are not from U.S. or Italy", options: [questionFour ? questionFour[3].title : "Italy", questionFour ? questionFour[6].title : "U.S.", questionFour ? questionFour[7].title : "U.S.", questionFour ? questionFour[0].title : "AR"], answer: questionFour ? questionFour[0].title : "AR"},
    { id: 9, question: "What is the average wine price in Argentina for wineries where the average sea level pressure is lower than the mean sea level pressure at Nota Bene?", options: [questionThree ? String(questionThree[0].avg_price) : "26.9623", "30.2", "35.57", "15.234"], answer: questionThree ? questionThree.average_points : "89.2355"},
    { id: 10, question: 'Identify the sommelier who has tasted the most "fruity" wines', options: ["Ben Schroder", questionFive ? questionFive[0].taster_name : "taster_name", "Mark Bo", "Theodore Belmont"], answer: questionFive ? questionFive[0].taster_name : "taster_name"},
    { id: 11, question: "These are 4 countires with the highest avg yearly temp, which country has the lowest avg price for wine?", options: [questionSix ? questionSix[0].country : "ES", questionSix ? questionSix[1].country : "ZA", questionSix ? questionSix[2].country : "AR", questionSix ? questionSix[3].country : "IT"], answer: questionSix ? questionSix[2].country : "AR"},
    { id: 12, question: "Name a wine region in New Zealand famous for its Sauvignon Blanc.", options: ["Marlborough", "Hawke's Bay", "Central Otago", "Gisborne"], answer: "Marlborough"},
  ];


    // handles the logic behind the trivia game
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

    // function to handle resetting the quiz and clearing all the states that stored information
    const resetQuiz = () => {
      setCurrentQuestionIndex(0);
      setScore(0);
      setShowResults(false);
    };
  
    return (
        <div className="App">
          {showResults ? (
            <div className="game-over">
              <h1>Quiz Finished!</h1>
              <p className="score">Your score: {score} out of {questions.length}</p>
              <p>Unfortunately we are not kind enough to provide answers, so please keep trying again if you want to learn :D</p>
              <button onClick={() => {
                console.log("clicked");
                resetQuiz();
                }}>
                    Try Again!
              </button>
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
