import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  Check, 
  CheckCircle2, 
  XCircle, 
  BarChart3, 
  AlertTriangle, 
  Home, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Flag, 
  Moon, 
  Sun, 
  User, 
  Info,
  Eye,
  BookOpen,
  X
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import './Quiz.css';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  hasImage?: boolean;
  imageUrl?: string;
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
    correctAnswer: 1,
    hasImage: true,
    imageUrl: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
  },
  {
    id: 3,
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: 1
  },
  {
    id: 4,
    question: "Which of the following is NOT a programming language?",
    options: ["Java", "Python", "HTML", "Photoshop"],
    correctAnswer: 3
  },
  {
    id: 5,
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    correctAnswer: 3,
    hasImage: true,
    imageUrl: "https://images.unsplash.com/photo-1439405326854-014607f694d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: 6,
    question: "Which of these elements has the chemical symbol 'O'?",
    options: ["Gold", "Oxygen", "Osmium", "Oganesson"],
    correctAnswer: 1
  },
  {
    id: 7,
    question: "What is the square root of 144?",
    options: ["12", "14", "16", "18"],
    correctAnswer: 0
  },
  {
    id: 8,
    question: "Which of these animals is a mammal?",
    options: ["Shark", "Snake", "Dolphin", "Crocodile"],
    correctAnswer: 2,
    hasImage: true,
    imageUrl: "https://images.unsplash.com/photo-1607153333879-c174d265f1d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 9,
    question: "Which country is known as the Land of the Rising Sun?",
    options: ["China", "South Korea", "Japan", "Thailand"],
    correctAnswer: 2
  },
  {
    id: 10,
    question: "What is the main component of the Sun?",
    options: ["Helium", "Hydrogen", "Oxygen", "Carbon"],
    correctAnswer: 1
  }
];

function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [showResults, setShowResults] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[]>(Array(questions.length).fill(false));
  const [darkMode, setDarkMode] = useState(true);
  const [userName, setUserName] = useState("John Doe");
  const { courseId, subjectId } = useParams();
  const navigate = useNavigate();
  const [subjectName, setSubjectName] = useState("Data Structures");
  const [courseName, setCourseName] = useState("Computer Science");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Prevent context menu (right-click)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent copy
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
    };
  }, []);

  useEffect(() => {
    // Mock API call to fetch subject name
    const fetchSubjectName = async () => {
      try {
        // In a real app, this would be an actual API call
        // const token = localStorage.getItem("token");
        // const response = await API.get(`/courses/course/${courseId}/content`, {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        // const subjects = response.data.courseContent;
        // const foundSubject = subjects.find((subj) => subj._id === subjectId);
        // setSubjectName(foundSubject?.subjectName || "Subject");
        
        // For demo purposes:
        setSubjectName("Data Structures");
        setCourseName("Computer Science");
      } catch (error) {
        console.error("Error fetching subject name:", error);
        setSubjectName("Subject");
      }
    };

    fetchSubjectName();
  }, [courseId, subjectId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !showResults && !showInstructions) {
        alert("Warning: Tab switching detected! This will be reported.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [showResults, showInstructions]);

  useEffect(() => {
    const handleFullscreen = async () => {
      try {
        if (!isFullscreen && !showInstructions) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch (error) {
        console.error("Fullscreen request failed:", error);
      }
    };

    if (!showInstructions) {
      handleFullscreen();
    }
  }, [isFullscreen, showInstructions]);

  // Timer effect
  useEffect(() => {
    if (showInstructions || showResults) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setShowResults(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [showInstructions, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleExitTest = () => {
    if (window.confirm("Are you sure you want to exit the test? Your progress will be lost.")) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err));
      }
      navigate('/');
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleFlagQuestion = () => {
    const newFlagged = [...flaggedQuestions];
    newFlagged[currentQuestion] = !newFlagged[currentQuestion];
    setFlaggedQuestions(newFlagged);
  };

  const handleSubmitTest = () => {
    if (window.confirm("Are you sure you want to submit the test? You cannot change your answers after submission.")) {
      setShowResults(true);
    }
  };

  const handleStartTest = () => {
    setShowInstructions(false);
  };

  const calculateScore = () => {
    return selectedAnswers.reduce((score, answer, index) => {
      return score + (answer === questions[index].correctAnswer ? 1 : 0);
    }, 0);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const jumpToQuestion = (index: number) => {
    setCurrentQuestion(index);
  };

  const getQuestionStatusClass = (index: number) => {
    if (flaggedQuestions[index]) return "flagged";
    if (selectedAnswers[index] !== -1) return "answered";
    return "unanswered";
  };

  if (showInstructions) {
    return (
      <div className={`min-h-screen w-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <header className={`py-4 px-6 flex justify-between items-center ${darkMode ? 'bg-zinc-900' : 'bg-gray-100'} shadow-md`}>
          <div className="flex items-center gap-2">
            <BookOpen className="text-white" />
            <h1 className="text-xl font-bold">Instruct Test</h1>
          </div>
          <button 
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <main className="max-w-4xl mx-auto my-8 px-4">
          <div className={`rounded-lg shadow-lg p-8 ${darkMode ? 'bg-zinc-900' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-6">
              <Info size={24} className="text-white" />
              <h2 className="text-2xl font-bold">Test Instructions</h2>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold mb-2">General Information</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Test Name: <span className="font-medium">{courseName} - {subjectName}</span></li>
                  <li>Duration: <span className="font-medium">30 minutes</span></li>
                  <li>Total Questions: <span className="font-medium">{questions.length}</span></li>
                  <li>Question Type: <span className="font-medium">Multiple Choice Questions (MCQs)</span></li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">Rules</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>This is a <span className="font-medium">proctored test</span>. Your activities will be monitored.</li>
                  <li><span className="font-medium">Tab switching is not allowed</span> during the test. Any attempt to switch tabs will be recorded.</li>
                  <li>The test will automatically enter <span className="font-medium">fullscreen mode</span> when you start.</li>
                  <li>Each question carries <span className="font-medium">1 mark</span>.</li>
                  <li><span className="font-medium">Negative marking: 0.25 marks</span> will be deducted for each wrong answer.</li>
                  <li>You can <span className="font-medium">flag questions</span> to review them later.</li>
                  <li>You can <span className="font-medium">navigate between questions</span> using the navigation panel or next/previous buttons.</li>
                  <li><span className="font-medium">Copying text and right-clicking</span> are disabled during the test.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">Technical Requirements</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Ensure you have a <span className="font-medium">stable internet connection</span>.</li>
                  <li>Use a <span className="font-medium">modern browser</span> (Chrome, Firefox, Edge) for the best experience.</li>
                  <li>Allow <span className="font-medium">fullscreen permissions</span> when prompted.</li>
                </ul>
              </section>

              <div className={`p-4 rounded-lg flex items-start gap-3 ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                <AlertTriangle className="mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Important Notice</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    By starting this test, you agree to abide by the rules mentioned above. Any violation may result in disqualification.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={handleStartTest}
                className={`px-8 py-3 rounded-lg font-medium text-white ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-black hover:bg-gray-800'} transition-colors`}
              >
                I Understand, Start Test
              </button>
            </div>
          </div>
        </main>

        <footer className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Powered by Instruct.edu
        </footer>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = (score / questions.length) * 100;
    const negativeMarks = (questions.length - score) * 0.25;
    const finalScore = score - negativeMarks;
    const finalPercentage = (finalScore / questions.length) * 100;

    return (
      <div className={`min-h-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <header className={`py-4 px-6 flex justify-between items-center ${darkMode ? 'bg-zinc-900' : 'bg-gray-100'} shadow-md`}>
          <div className="flex items-center gap-2">
            <BarChart3 className="text-white" />
            <h1 className="text-xl font-bold">Test Results</h1>
          </div>
          <button 
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <main className="max-w-4xl mx-auto my-8 px-4">
          <div className={`rounded-lg shadow-lg p-8 ${darkMode ? 'bg-zinc-900' : 'bg-white border border-gray-200'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {courseName} - {subjectName}
              </h2>
              <button
                onClick={handleExitTest}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gray-200 hover:bg-gray-100'
                }`}
              >
                <Home size={20} />
                Exit to Home
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className={`p-6 rounded-lg text-center ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Raw Score</p>
                <p className="text-4xl font-bold mt-2">{score}/{questions.length}</p>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>({percentage.toFixed(1)}%)</p>
              </div>
              
              <div className={`p-6 rounded-lg text-center ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Negative Marks</p>
                <p className="text-4xl font-bold mt-2">-{negativeMarks.toFixed(2)}</p>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({questions.length - score} wrong × 0.25)
                </p>
              </div>
              
              <div className={`p-6 rounded-lg text-center ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                <p className="text-sm">Final Score</p>
                <p className="text-4xl font-bold mt-2">
                  {finalScore.toFixed(2)}/{questions.length}
                </p>
                <p className="text-sm mt-1">
                  ({finalPercentage.toFixed(1)}%)
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-8">
              <h3 className="text-xl font-semibold mb-4">Question Analysis</h3>
              {questions.map((q, index) => (
                <div 
                  key={q.id} 
                  className={`rounded-lg p-4 ${
                    darkMode 
                      ? selectedAnswers[index] === q.correctAnswer ? 'bg-zinc-800' : 'bg-zinc-800' 
                      : selectedAnswers[index] === q.correctAnswer ? 'bg-gray-100' : 'bg-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {selectedAnswers[index] === q.correctAnswer ? (
                      <CheckCircle2 className="mt-1 flex-shrink-0 text-white" />
                    ) : (
                      <XCircle className="mt-1 flex-shrink-0 text-white" />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">Question {index + 1}</p>
                        <p className="text-sm">
                          {selectedAnswers[index] === q.correctAnswer ? '+1.00' : '-0.25'}
                        </p>
                      </div>
                      <p className="mt-1">{q.question}</p>
                      
                      {q.hasImage && q.imageUrl && (
                        <div className="my-2">
                          <img 
                            src={q.imageUrl} 
                            alt={`Question ${index + 1}`} 
                            className="max-h-40 rounded-md object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((option, optIndex) => (
                          <div 
                            key={optIndex}
                            className={`px-3 py-2 rounded text-sm ${
                              optIndex === q.correctAnswer
                                ? darkMode ? 'bg-zinc-700 border border-white' : 'bg-white border border-black'
                                : optIndex === selectedAnswers[index]
                                  ? darkMode ? 'bg-zinc-700 border border-gray-500' : 'bg-white border border-gray-400'
                                  : darkMode ? 'bg-zinc-700' : 'bg-white border border-gray-300'
                            }`}
                          >
                            {option}
                            {optIndex === q.correctAnswer && (
                              <span className="ml-2">✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <footer className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Powered by Instruct.edu
        </footer>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-screen ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Header */}
      <header className={`py-3 px-6 flex justify-between items-center ${darkMode ? 'bg-zinc-900' : 'bg-gray-100'} shadow-md`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Brain className="text-white" />
            <h1 className="text-lg font-bold">Instruct Test</h1>
          </div>
          <div className={`h-6 border-l ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}></div>
          <div>
            <p className="text-sm font-medium">{courseName} | {subjectName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User size={18} />
            <span className="text-sm font-medium">{userName}</span>
          </div>
          
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            timeRemaining < 300 
              ? darkMode ? 'bg-zinc-800 border border-white' : 'bg-white border border-black' 
              : darkMode ? 'bg-zinc-800' : 'bg-white border border-gray-300'
          }`}>
            <Clock size={16} />
            <span className="text-sm font-medium">{formatTime(timeRemaining)}</span>
          </div>
          
          <button 
            onClick={toggleDarkMode}
            className={`p-1.5 rounded-full ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <aside className={`w-20 md:w-64 flex-shrink-0 ${darkMode ? 'bg-zinc-900' : 'bg-gray-100'} shadow-md overflow-y-auto`}>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-medium">Questions</h2>
              <span className={`text-xs px-2 py-1 rounded ${darkMode ? 'bg-zinc-800' : 'bg-white border border-gray-300'}`}>
                {selectedAnswers.filter(a => a !== -1).length}/{questions.length}
              </span>
            </div>
            
            <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => jumpToQuestion(index)}
                  className={`
                    w-full aspect-square flex items-center justify-center rounded text-sm font-medium
                    ${currentQuestion === index ? 'ring-2 ring-offset-2 ' + (darkMode ? 'ring-white ring-offset-zinc-900' : 'ring-black ring-offset-white') : ''}
                    ${
                      getQuestionStatusClass(index) === 'flagged'
                        ? darkMode ? 'bg-zinc-800 border border-white' : 'bg-white border border-black'
                        : getQuestionStatusClass(index) === 'answered'
                          ? darkMode ? 'bg-zinc-800 border border-gray-400' : 'bg-white border border-gray-400'
                          : darkMode ? 'bg-zinc-800' : 'bg-white border border-gray-300'
                    }
                  `}
                >
                  {index + 1}
                  {flaggedQuestions[index] && (
                    <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-white"></span>
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-sm ${darkMode ? 'bg-zinc-800 border border-gray-400' : 'bg-white border border-gray-400'}`}></div>
                <span className="text-xs">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-sm ${darkMode ? 'bg-zinc-800 border border-white' : 'bg-white border border-black'}`}></div>
                <span className="text-xs">Flagged</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-sm ${darkMode ? 'bg-zinc-800' : 'bg-white border border-gray-300'}`}></div>
                <span className="text-xs">Unanswered</span>
              </div>
            </div>
            
            <button
              onClick={handleSubmitTest}
              className={`w-full mt-6 py-2 rounded-lg font-medium ${
                darkMode ? 'bg-zinc-800 hover:bg-zinc-700 border border-white' : 'bg-white hover:bg-gray-100 border border-black'
              }`}
            >
              Submit Test
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className={`max-w-3xl mx-auto rounded-lg shadow-lg p-6 ${darkMode ? 'bg-zinc-900' : 'bg-white border border-gray-200'}`}>
            {/* Question header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">Question {currentQuestion + 1}</h2>
                  <button
                    onClick={handleFlagQuestion}
                    className={`p-1.5 rounded-full ${
                      flaggedQuestions[currentQuestion]
                        ? darkMode ? 'bg-zinc-800 border border-white' : 'bg-white border border-black'
                        : darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    title={flaggedQuestions[currentQuestion] ? "Unflag question" : "Flag for review"}
                  >
                    <Flag size={16} />
                  </button>
                </div>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selectedAnswers[currentQuestion] === -1 ? 'Not answered yet' : 'Answered'}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {currentQuestion + 1} of {questions.length}
                </span>
                <div className={`w-24 h-2 rounded-full ${darkMode ? 'bg-zinc-800' : 'bg-gray-200'}`}>
                  <div 
                    className="h-2 rounded-full bg-white"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Question content */}
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-4">{questions[currentQuestion].question}</h3>
              
              {questions[currentQuestion].hasImage && questions[currentQuestion].imageUrl && (
                <div className="mb-4">
                  <img 
                    src={questions[currentQuestion].imageUrl} 
                    alt={`Question ${currentQuestion + 1}`} 
                    className="max-h-60 rounded-lg object-cover mx-auto"
                  />
                </div>
              )}
              
              <div className="space-y-3 mt-6">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    className={`w-full text-left p-4 rounded-lg transition-all flex justify-between items-center ${
                      selectedAnswers[currentQuestion] === index
                        ? darkMode 
                          ? 'bg-zinc-800 border-2 border-white' 
                          : 'bg-white border-2 border-black'
                        : darkMode 
                          ? 'bg-zinc-800 hover:bg-zinc-700 border border-gray-600' 
                          : 'bg-white hover:bg-gray-100 border border-gray-300'
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`flex items-center justify-center w-6 h-6 rounded-full text-sm ${
                        selectedAnswers[currentQuestion] === index
                          ? darkMode ? 'bg-white text-black' : 'bg-black text-white'
                          : darkMode ? 'bg-zinc-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option}
                    </span>
                    {selectedAnswers[currentQuestion] === index && (
                      <Check className="w-5 h-5" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              <button
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                  currentQuestion === 0
                    ? darkMode ? 'bg-zinc-800 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : darkMode ? 'bg-zinc-800 hover:bg-zinc-700 border border-gray-600' : 'bg-white hover:bg-gray-100 border border-gray-300'
                }`}
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft size={20} />
                Previous
              </button>
              
              <div className="flex gap-2">
                <button
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    flaggedQuestions[currentQuestion]
                      ? darkMode ? 'bg-zinc-800 border border-white' : 'bg-white border border-black'
                      : darkMode ? 'bg-zinc-800 hover:bg-zinc-700 border border-gray-600' : 'bg-white hover:bg-gray-100 border border-gray-300'
                  }`}
                  onClick={handleFlagQuestion}
                >
                  <Flag size={20} />
                  {flaggedQuestions[currentQuestion] ? 'Unflag' : 'Flag'}
                </button>
                
                {currentQuestion === questions.length - 1 ? (
                  <button
                    className={`px-6 py-2 rounded-lg font-medium ${
                      darkMode ? 'bg-zinc-800 hover:bg-zinc-700 border border-white' : 'bg-white hover:bg-gray-100 border border-black'
                    }`}
                    onClick={handleSubmitTest}
                  >
                    Submit Test
                  </button>
                ) : (
                  <button
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      darkMode ? 'bg-zinc-800 hover:bg-zinc-700 border border-white' : 'bg-white hover:bg-gray-100 border border-black'
                    }`}
                    onClick={handleNext}
                  >
                    Next
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Quiz;