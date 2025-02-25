import React, { useState, useEffect } from 'react';
import  { Brain, Check, CheckCircle2, XCircle, BarChart3, AlertTriangle, Home } from 'lucide-react';
import API from "../../api";
import { useParams, useNavigate } from 'react-router-dom';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const questions: Question[] = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2
  },
  {
    id: 2,
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: 1
  }
];

function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [showResults, setShowResults] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { courseId, subjectId } = useParams();
  const navigate = useNavigate();
  const [subjectName, setSubjectName] = useState("Loading...");

  useEffect(() => {
    const fetchSubjectName = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await API.get(`/courses/course/${courseId}/content`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const subjects = response.data.courseContent;
        const foundSubject = subjects.find((subj) => subj._id === subjectId);
        setSubjectName(foundSubject?.subjectName || "Subject");
      } catch (error) {
        console.error("Error fetching subject name:", error);
        setSubjectName("Subject");
      }
    };

    fetchSubjectName();
  }, [courseId, subjectId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !showResults) {
        alert("Please don't switch tabs during the test!");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [showResults]);

  useEffect(() => {
    const handleFullscreen = async () => {
      try {
        if (!isFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch (error) {
        console.error("Fullscreen request failed:", error);
      }
    };

    handleFullscreen();
  }, []);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };
  const handleExitTest = () => {
    if (window.confirm("Are you sure you want to exit the test? Your progress will be lost.")) {
      document.exitFullscreen().catch(err => console.log(err));
      navigate('/');
    }
  };
  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    return selectedAnswers.reduce((score, answer, index) => {
      return score + (answer === questions[index].correctAnswer ? 1 : 0);
    }, 0);
  };

  if (showResults) {
    const score = calculateScore();
    const percentage = (score / questions.length) * 100;

    return (
        <div className="min-h-screen w-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <BarChart3 className="text-blue-400" />
                {subjectName} - Test Results
              </h2>
              <button
                onClick={handleExitTest}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
              >
                <Home size={20} />
                Exit to Home
              </button>
            </div>

            <div className="mb-8">
              <div className="text-5xl font-bold text-center text-blue-400 mb-2">{percentage}%</div>
              <p className="text-center text-gray-400">You got {score} out of {questions.length} questions correct</p>
            </div>
            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={q.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    {selectedAnswers[index] === q.correctAnswer ? (
                      <CheckCircle2 className="text-green-400 mt-1" />
                    ) : (
                      <XCircle className="text-red-400 mt-1" />
                    )}
                    <div>
                      <p className="font-medium">{q.question}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Your answer: {q.options[selectedAnswers[index]]}
                      </p>
                      {selectedAnswers[index] !== q.correctAnswer && (
                        <p className="text-sm text-green-400 mt-1">
                          Correct answer: {q.options[q.correctAnswer]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <footer className="text-center mt-8 text-gray-400">
            Powered by Instruct.edu
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-8 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Brain className="text-blue-400" />
                <h1 className="text-2xl font-bold">Online Assessment</h1>
              </div>
              <p className="text-gray-400 mt-1">{subjectName}</p>
            </div>
            <button
              onClick={handleExitTest}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              <Home size={20} />
              Exit Test
            </button>
          </div>
          
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-medium mb-4">{questions[currentQuestion].question}</h2>
            <div className="space-y-3">
            {questions[currentQuestion].options.map((option, index) => (
    <button
      key={index}
      className={`w-full text-left p-4 rounded-lg transition-all flex justify-between items-center ${
        selectedAnswers[currentQuestion] === index
        ? 'bg-blue-500 text-white font-medium border-2 border-blue-500'
        : 'bg-gray-700 hover:bg-gray-600 hover:transform hover:scale-102'
      }`}
      onClick={() => handleAnswerSelect(index)}
    >
      <span>{option}</span>
      {selectedAnswers[currentQuestion] === index && (
        <Check className="w-5 h-5 text-white" />
      )}
    </button>
  ))}
            </div>
          </div>

          <button
            className={`w-full py-3 rounded-lg font-medium transition-all ${
              selectedAnswers[currentQuestion] === -1
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestion] === -1}
          >
            {currentQuestion === questions.length - 1 ? 'Submit Test' : 'Next Question'}
          </button>
        </div>
        
        <footer className="text-center mt-8 text-gray-400">
          Powered by Instruct.edu
        </footer>
      </div>
    </div>
  );
}

export default Quiz;