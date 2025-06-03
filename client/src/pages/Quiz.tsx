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
  X,
  Menu,
  Grid
} from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './Quiz.css';
import { toast } from 'react-hot-toast';
import useWindowFocus from '../hooks/useWindowFocus'; // Install this package
import { usePreventCopy } from '../hooks/usePreventCopy';
import API from '../../api.js'
import LoadingSpinner from '../components/LoadingSpinner';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  hasImage?: boolean;
  imageUrl?: string;
}

function Quiz() {
  const [darkMode, setDarkMode] = useState(true);
  const [userName, setUserName] = useState("John Doe");
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [subjectName, setSubjectName] = useState("");
  const [courseName, setCourseName] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const quizData = location.state?.quiz;
  const questions = quizData?.questions || [];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [showResults, setShowResults] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(quizData?.duration || 1800);
  const [flaggedQuestions, setFlaggedQuestions] = useState<boolean[]>(Array(questions.length).fill(false));
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const isWindowFocused = useWindowFocus();
  const [penaltyMarks, setPenaltyMarks] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chapterName, setChapterName] = useState("");
  const [reviewedQuestions, setReviewedQuestions] = useState<boolean[]>(Array(questions.length).fill(false));

  usePreventCopy();
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('You need to be logged in');
          navigate('/login');
          return;
        }

        const response = await API.get('/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          const user = response.data.user;
          setUserName(`${user.firstName} ${user.lastName}`);
        } else {
          toast.error('Failed to fetch user profile');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Error loading user data');
      }
    };

    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    if (!isWindowFocused && !showResults && !showInstructions) {
      setTabSwitchCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 3) {
          setShowResults(true);
          const score = calculateScore();
          const finalScore = score - 4;
          setPenaltyMarks(4);
          toast.error('Test ended due to multiple tab switches. -4 marks penalty applied.');
        }
        toast('Warning: Tab switching detected! ' + `(${newCount}/3)`, {
          icon: '⚠️',
        });
        return newCount;
      });
    }
  }, [isWindowFocused]);

  useEffect(() => {
    const preventSelection = (e) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('dragstart', preventSelection);

    return () => {
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('dragstart', preventSelection);
    };
  }, []);

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!quizData) {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            navigate('/login');
            return;
          }

          const response = await API.get(`/quiz/chapter/${chapterId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.success && response.data.quizzes.length > 0) {
            const quiz = response.data.quizzes[0];
            setSelectedAnswers(Array(quiz.questions.length).fill(-1));
            setTimeRemaining(quiz.duration);
            // Update location state with quiz data
            window.history.replaceState({ ...window.history.state, quiz }, '');
          } else {
            toast.error('No quiz found for this chapter');
            navigate(-1);
          }
        } catch (error) {
          console.error('Error fetching quiz:', error);
          toast.error('Failed to load quiz');
          navigate(-1);
        }
      } else {
        setSelectedAnswers(Array(quizData.questions.length).fill(-1));
        setTimeRemaining(quizData.duration);
      }
    };

    fetchQuizData();
  }, [quizData, chapterId, navigate]);

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
    const fetchChapterAndDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // First get the quiz data to get courseId and subjectId
        const quizResponse = await API.get(`/quiz/chapter/${chapterId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (quizResponse.data.success && quizResponse.data.quizzes.length > 0) {
          const quiz = quizResponse.data.quizzes[0];
          const { courseId, subjectId } = quiz;

          // Now fetch course content
          const courseResponse = await API.get(`/courses/course/${courseId}/content`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (courseResponse.data.courseContent) {
            const subjects = courseResponse.data.courseContent;
            const subject = subjects.find(s => s._id === subjectId);
            
            if (subject) {
              setSubjectName(subject.subjectName);
              const chapter = subject.chapters.find(c => c._id === chapterId);
              
              if (chapter) {
                setChapterName(chapter.chapterName);
                console.log("Found chapter name:", chapter.chapterName);
              }
            }
          }

          // Fetch course name
          const courseNameResponse = await API.get(`/courses/course/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (courseNameResponse.data.course) {
            setCourseName(courseNameResponse.data.course.courseName);
          }
        }
      } catch (error) {
        console.error("Error fetching chapter and details:", error);
      }
    };

    if (chapterId) {
      fetchChapterAndDetails();
    }
  }, [chapterId]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const userResponse = await API.get('/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userResponse.data.success) {
          const user = userResponse.data.user;
          setUserName(`${user.firstName} ${user.lastName}`);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [navigate]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !showResults && !showInstructions) {
        toast('Tab switching detected! This will be recorded.', {
          icon: '⚠️',
        });
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
      setSidebarOpen(false); // Close sidebar on mobile when navigating
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSidebarOpen(false); // Close sidebar on mobile when navigating
    }
  };

  const handleFlagQuestion = () => {
    const newFlagged = [...flaggedQuestions];
    newFlagged[currentQuestion] = !newFlagged[currentQuestion];
    setFlaggedQuestions(newFlagged);
  };

  const handleSubmitTest = () => {
    if (window.confirm("Are you sure you want to submit the test? You cannot change your answers after submission.")) {
      const finalScore = calculateScore() - (tabSwitchCount * 0.5); // Deduct 0.5 marks per tab switch
      setShowResults(true);
      toast.success('Test submitted successfully!');
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
    setSidebarOpen(false); // Close sidebar on mobile after selecting a question
  };

  const getQuestionStatusClass = (index: number) => {
    if (reviewedQuestions[index]) return "reviewed";
    if (selectedAnswers[index] !== -1) return "answered";
    return "unanswered";
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleReviewQuestion = () => {
    const newReviewed = [...reviewedQuestions];
    newReviewed[currentQuestion] = !newReviewed[currentQuestion];
    setReviewedQuestions(newReviewed);
  };

  const handleBack = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.log(err));
    }
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-900">
        <LoadingSpinner fullScreen size="lg" />
      </div>
    );
  }

  if (showInstructions) {
    return (
      <div className={`min-h-screen w-[98vw] ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <header className={`py-3 px-4 sm:px-6 flex justify-between items-center ${darkMode ? 'bg-zinc-900' : 'bg-gray-100'} shadow-md`}>
          <div className="flex items-center gap-2">
            <img
              src="https://instructedu.s3.eu-north-1.amazonaws.com/main+logoo.svg"
              alt="Logo"
              style={{ maxWidth: "100%" }}
            />
          </div>
          {/* <button 
            onClick={toggleDarkMode}
            className={`p-1.5 sm:p-2 rounded-full ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button> */}
        </header>

        <main className="max-w-4xl mx-auto my-4 sm:my-8 px-3 sm:px-4">
          <div className={`rounded-lg shadow-lg p-4 sm:p-6 md:p-8 ${darkMode ? 'bg-zinc-900' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Info size={20} className="text-white" />
              <h2 className="text-xl sm:text-2xl font-bold">Test Instructions</h2>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <section>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">General Information</h3>
                <ul className="list-disc pl-5 space-y-1 sm:space-y-2 text-sm sm:text-base">
                  <li>Test Name: <span className="font-medium">{courseName} - {subjectName}</span></li>
                  <li> Chapter Name: <span className="font-medium">{chapterName}</span></li>
                  
                  <li>Duration: <span className="font-medium">30 minutes</span></li>
                  <li>Total Questions: <span className="font-medium">{questions.length}</span></li>
                  <li>Question Type: <span className="font-medium">Multiple Choice Questions (MCQs)</span></li>

                </ul>
              </section>

              <section>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Rules</h3>
                <ul className="list-disc pl-5 space-y-1 sm:space-y-2 text-sm sm:text-base">
                  <li>This is a <span className="font-medium">proctored test</span>. Your activities will be monitored.</li>
                  <li><span className="font-medium">Tab switching is not allowed</span> during the test.</li>
                  <li>The test will automatically enter <span className="font-medium">fullscreen mode</span> when you start.</li>
                  <li>Each question carries <span className="font-medium">1 mark</span>.</li>
                  <li><span className="font-medium">Negative marking: 0.25 marks</span> will be deducted for each wrong answer.</li>
                  <li>You can <span className="font-medium">flag questions</span> to review them later.</li>
                  <li><span className="font-medium">Copying text and right-clicking</span> are disabled during the test.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Technical Requirements</h3>
                <ul className="list-disc pl-5 space-y-1 sm:space-y-2 text-sm sm:text-base">
                  <li>Ensure you have a <span className="font-medium">stable internet connection</span>.</li>
                  <li>Use a <span className="font-medium">modern browser</span> for the best experience.</li>
                  <li>Allow <span className="font-medium">fullscreen permissions</span> when prompted.</li>
                </ul>
              </section>

              <div className={`p-3 sm:p-4 rounded-lg flex items-start gap-2 sm:gap-3 ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                <AlertTriangle className="mt-1 flex-shrink-0" size={18} />
                <div>
                  <p className="font-medium text-sm sm:text-base">Important Notice</p>
                  <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    By starting this test, you agree to abide by the rules mentioned above. Any violation may result in disqualification.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 flex justify-center">
              <div
                onClick={handleStartTest}
                className={`px-6 sm:px-8 cursor-pointer py-2.5 sm:py-3 rounded-lg font-medium text-white text-sm sm:text-base ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-black hover:bg-gray-800'} transition-colors`}
              >
                I Understand, Start Test
              </div>
            </div>
          </div>

        </main>

        <footer className={`text-center py-3 sm:py-4 text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Powered by Instruct.edu
        </footer>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = (score / questions.length) * 100;
    const negativeMarks = (questions.length - score) * 0.25;
    const finalScore = score - negativeMarks - penaltyMarks;
    const finalPercentage = (finalScore / questions.length) * 100;

    return (
      <div className={`min-h-screen w-[98vw] ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <header className={`py-3 px-4 sm:px-6 flex justify-between items-center ${darkMode ? 'bg-zinc-900' : 'bg-gray-100'} shadow-md`}>
          <div className="flex items-center gap-2">
            <img
              src="https://instructedu.s3.eu-north-1.amazonaws.com/main+logoo.svg"
              alt="Logo"
              style={{ maxWidth: "100%" }}
            />
          </div>
          <div
            onClick={handleBack}
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gray-200 hover:bg-gray-100'}`}
          >
            <ChevronLeft size={18} />
            Back
          </div>
        </header>

        <main className="max-w-4xl mx-auto my-4 sm:my-8 px-3 sm:px-4">
          <div className={`rounded-lg shadow-lg p-4 sm:p-6 md:p-8 ${darkMode ? 'bg-zinc-900' : 'bg-white border border-gray-200'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">
                Your test result are out
              </h2>
              <div
                onClick={handleExitTest}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gray-200 hover:bg-gray-100'
                  }`}
              >
                <Home size={18} />
                Exit to Home
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className={`p-4 sm:p-6 rounded-lg text-center ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Raw Score</p>
                <p className="text-2xl sm:text-4xl font-bold mt-1 sm:mt-2">{score}/{questions.length}</p>
                <p className={`text-xs sm:text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>({percentage.toFixed(1)}%)</p>
              </div>

              <div className={`p-4 sm:p-6 rounded-lg text-center ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Negative Marks</p>
                <p className="text-2xl sm:text-4xl font-bold mt-1 sm:mt-2">-{negativeMarks.toFixed(2)}</p>
                <p className={`text-xs sm:text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({questions.length - score} wrong × 0.25)
                </p>
              </div>

              <div className={`p-4 sm:p-6 rounded-lg text-center ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Penalty Marks</p>
                <p className="text-2xl sm:text-4xl font-bold mt-1 sm:mt-2">-{penaltyMarks}</p>
                <p className={`text-xs sm:text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  (Tab switching violations)
                </p>
              </div>

              <div className={`p-4 sm:p-6 rounded-lg text-center ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                <p className="text-xs sm:text-sm">Final Score</p>
                <p className="text-2xl sm:text-4xl font-bold mt-1 sm:mt-2">
                  {finalScore.toFixed(2)}/{questions.length}
                </p>
                <p className="text-xs sm:text-sm mt-1">
                  ({finalPercentage.toFixed(1)}%)
                </p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4 mt-6 sm:mt-8">
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Question Analysis</h3>
              {questions.map((q, index) => (
                <div
                  key={q.id}
                  className={`rounded-lg p-3 sm:p-4 ${darkMode
                      ? selectedAnswers[index] === q.correctAnswer ? 'bg-zinc-800' : 'bg-zinc-800'
                      : selectedAnswers[index] === q.correctAnswer ? 'bg-gray-100' : 'bg-gray-100'
                    }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    {selectedAnswers[index] === q.correctAnswer ? (
                      <CheckCircle2 className="mt-1 flex-shrink-0 text-white" size={18} />
                    ) : (
                      <XCircle className="mt-1 flex-shrink-0 text-white" size={18} />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium text-sm sm:text-base">Question {index + 1}</p>
                        <p className="text-xs sm:text-sm">
                          {selectedAnswers[index] === q.correctAnswer ? '+1.00' : '-0.25'}
                        </p>
                      </div>
                      <p className="mt-1 text-sm sm:text-base">{q.question}</p>

                      {q.hasImage && q.imageUrl && (
                        <div className="my-2">
                          <img
                            src={q.imageUrl}
                            alt={`Question ${index + 1}`}
                            className="max-h-32 sm:max-h-40 rounded-md object-cover"
                          />
                        </div>
                      )}

                      <div className="mt-2 sm:mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm ${optIndex === q.correctAnswer
                                ? darkMode ? 'bg-zinc-700 border border-white' : 'bg-white border border-black'
                                : optIndex === selectedAnswers[index]
                                  ? darkMode ? 'bg-zinc-700 border border-gray-500' : 'bg-white border border-gray-400'
                                  : darkMode ? 'bg-zinc-700' : 'bg-white border border-gray-300'
                              }`}
                          >
                            {option}
                            {optIndex === q.correctAnswer && (
                              <span className="ml-1 sm:ml-2">✓</span>
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

        <footer className={`text-center py-3 sm:py-4 text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Powered by Instruct.edu
        </footer>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-[98vw] ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Header */}
      <header className={`py-2 sm:py-3 px-3 sm:px-6 flex justify-between items-center ${darkMode ? 'bg-zinc-900' : 'bg-gray-100'} shadow-md`}>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <img
              src="https://instructedu.s3.eu-north-1.amazonaws.com/main+logoo.svg"
              alt="Logo"
              style={{ maxWidth: "100%" }}
            />
          </div>
          <div className={`hidden sm:block h-6 border-l ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}></div>
          <div className="hidden sm:block">
            <p className="text-xs sm:text-sm font-medium">{subjectName} | {chapterName}</p>
            {/* <p className="text-xs text-gray-400">{userName}</p> */}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-1 sm:gap-2">
            <User size={16} />
            <span className="text-xs sm:text-sm font-medium">{userName}</span>
          </div>

          <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${timeRemaining < 300
              ? darkMode ? 'bg-zinc-800 border border-white' : 'bg-white border border-black'
              : darkMode ? 'bg-zinc-800' : 'bg-white border border-gray-300'
            }`}>
            <Clock size={14} />
            <span className="text-xs sm:text-sm font-medium">{formatTime(timeRemaining)}</span>
          </div>

          <button
            onClick={toggleDarkMode}
            className={`p-1 sm:p-1.5 rounded-full ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={toggleSidebar}
            className="sm:hidden p-1 rounded-full"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-48px)] sm:h-[calc(100vh-56px)]">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside
          className={`fixed sm:relative z-50 sm:z-auto w-64 sm:w-64 flex-shrink-0 ${darkMode ? 'bg-zinc-900' : 'bg-gray-100'} shadow-md overflow-y-auto transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
            }`}
        >
          <div className="p-3 sm:p-4">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-xs sm:text-sm font-medium">Questions</h2>
              <span className={`text-xs px-2 py-0.5 sm:py-1 rounded ${darkMode ? 'bg-zinc-800' : 'bg-white border border-gray-300'}`}>
                {selectedAnswers.filter(a => a !== -1).length}/{questions.length}
              </span>
              <button
                className="sm:hidden p-1 rounded-full"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-5 gap-1 sm:gap-2">
              {questions.map((_, index) => (
                <div
                  key={index}
                  onClick={() => jumpToQuestion(index)}
                  className={`
                    w-full aspect-square flex items-center justify-center rounded text-xs sm:text-sm font-medium
                    ${currentQuestion === index ? 'ring-2 ring-offset-1 sm:ring-offset-2 ' + (darkMode ? 'ring-white ring-offset-zinc-900' : 'ring-black ring-offset-white') : ''}
                    ${getQuestionStatusClass(index) === 'flagged'
                      ? darkMode ? 'bg-zinc-800 border border-white' : 'bg-white border border-black'
                      : getQuestionStatusClass(index) === 'answered'
                        ? darkMode ? 'bg-zinc-800 border border-gray-400' : 'bg-white border border-gray-400'
                        : darkMode ? 'bg-zinc-800' : 'bg-white border border-gray-300'
                    }
                  `}
                >
                  {index + 1}
                  {reviewedQuestions[index] && (
                    <span className="absolute top-0 right-0 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white"></span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm ${darkMode ? 'bg-zinc-800 border border-gray-400' : 'bg-white border border-gray-400'}`}></div>
                <span className="text-xs">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm ${darkMode ? 'bg-zinc-800 border border-white' : 'bg-white border border-black'}`}></div>
                <span className="text-xs">Flagged</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm ${darkMode ? 'bg-zinc-800' : 'bg-white border border-gray-300'}`}></div>
                <span className="text-xs">Unanswered</span>
              </div>
            </div>

            <div
              onClick={handleSubmitTest}
              className={`w-full text-center mt-4 sm:mt-6 py-2 rounded-lg font-medium text-xs sm:text-sm ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700 border border-white' : 'bg-white hover:bg-gray-100 border border-black'
                }`}
            >
              Submit Test
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6">
          {/* Mobile question navigation */}
          <div className="sm:hidden flex justify-between items-center mb-3 px-1">
            <button
              className={`p-1.5 rounded-lg flex items-center justify-center ${currentQuestion === 0
                  ? darkMode ? 'bg-zinc-800 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-white hover:bg-gray-100 border border-gray-300'
                }`}
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">
                Question {currentQuestion + 1}/{questions.length}
              </span>
              <button
                onClick={toggleSidebar}
                className={`p-1.5 rounded-lg ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-white hover:bg-gray-100 border border-gray-300'}`}
              >
                <Grid size={16} />
              </button>
            </div>

            <button
              className={`p-1.5 rounded-lg flex items-center justify-center ${currentQuestion === questions.length - 1
                  ? darkMode ? 'bg-zinc-800 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-white hover:bg-gray-100 border border-gray-300'
                }`}
              onClick={handleNext}
              disabled={currentQuestion === questions.length - 1}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className={`max-w-3xl mx-auto rounded-lg shadow-lg p-4 sm:p-6 ${darkMode ? 'bg-zinc-900' : 'bg-white border border-gray-200'}`}>
            {/* Question header */}
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-semibold">Question {currentQuestion + 1}</h2>
                  <button
                    onClick={handleReviewQuestion}
                    className={`p-1 sm:p-1.5 rounded-full ${reviewedQuestions[currentQuestion]
                        ? darkMode ? 'bg-zinc-800 border border-white' : 'bg-white border border-black'
                        : darkMode ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    title={reviewedQuestions[currentQuestion] ? "Remove from review" : "Mark for review"}
                  >
                    <BookOpen size={14} />
                  </button>
                </div>
                <p className={`text-xs mt-0.5 sm:mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selectedAnswers[currentQuestion] === -1 ? 'Not answered yet' : 'Answered'}
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {currentQuestion + 1} of {questions.length}
                </span>
                <div className={`w-16 sm:w-24 h-1.5 sm:h-2 rounded-full ${darkMode ? 'bg-zinc-800' : 'bg-gray-200'}`}>
                  <div
                    className="h-full rounded-full bg-white"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Question content */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-xl font-medium mb-3 sm:mb-4">{questions[currentQuestion].question}</h3>

              {questions[currentQuestion].hasImage && questions[currentQuestion].imageUrl && (
                <div className="mb-3 sm:mb-4">
                  <img
                    src={questions[currentQuestion].imageUrl}
                    alt={`Question ${currentQuestion + 1}`}
                    className="max-h-40 sm:max-h-60 rounded-lg object-cover mx-auto"
                  />
                </div>
              )}

              <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-6">
                {questions[currentQuestion].options.map((option, index) => (
                  <div
                    key={index}
                    className={`w-full text-left p-3 sm:p-4 rounded-lg transition-all flex justify-between items-center ${selectedAnswers[currentQuestion] === index
                        ? darkMode
                          ? 'bg-zinc-800 border-2 border-white'
                          : 'bg-white border-2 border-black'
                        : darkMode
                          ? 'bg-zinc-800 hover:bg-zinc-700 border border-gray-600'
                          : 'bg-white hover:bg-gray-100 border border-gray-300'
                      }`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <span className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                      <span className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-xs sm:text-sm ${selectedAnswers[currentQuestion] === index
                          ? darkMode ? 'bg-white text-black' : 'bg-black text-white'
                          : darkMode ? 'bg-zinc-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option}
                    </span>
                    {selectedAnswers[currentQuestion] === index && (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-6 sm:mt-8">
              <div
                className={`hidden cursor-pointer sm:flex px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg items-center gap-1 sm:gap-2 text-sm ${currentQuestion === 0
                    ? darkMode ? 'bg-zinc-800 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : darkMode ? 'bg-zinc-800 hover:bg-zinc-700 border border-gray-600' : 'bg-white hover:bg-gray-100 border border-gray-300'
                  }`}
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft size={18} />
                Previous
              </div>

              <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <div
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 text-sm ${reviewedQuestions[currentQuestion]
                      ? darkMode ? 'bg-zinc-800 border border-white' : 'bg-white border border-black'
                      : darkMode ? 'bg-zinc-800 hover:bg-zinc-700 border border-gray-600' : 'bg-white hover:bg-gray-100 border border-gray-300'
                    }`}
                  onClick={handleReviewQuestion}
                >
                  <BookOpen size={16} />
                  <span className="hidden sm:inline">{reviewedQuestions[currentQuestion] ? 'Remove from review' : 'Mark for review'}</span>
                </div>

                {currentQuestion === questions.length - 1 ? (
                  <div
                    className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg font-medium text-sm ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700 border border-white' : 'bg-white hover:bg-gray-100 border border-black'
                      }`}
                    onClick={handleSubmitTest}
                  >
                    Submit Test
                  </div>
                ) : (
                  <div
                    className={`hidden sm:flex px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg items-center gap-1 sm:gap-2 text-sm ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700 border border-white' : 'bg-white hover:bg-gray-100 border border-black'
                      }`}
                    onClick={handleNext}
                  >
                    Next
                    <ChevronRight size={18} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile bottom navigation */}
          <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-zinc-900 p-3 flex justify-between items-center shadow-lg">
            {currentQuestion === questions.length - 1 ? (
              <div
                className={`w-full py-2 rounded-lg font-medium text-sm ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700 border border-white' : 'bg-white hover:bg-gray-100 border border-black'
                  }`}
                onClick={handleSubmitTest}
              >
                Submit Test
              </div>
            ) : (
              <>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selectedAnswers.filter(a => a !== -1).length}/{questions.length} answered
                </span>
                <div
                  className={`px-4 py-2 rounded-lg flex items-center gap-1 text-sm ${darkMode ? 'bg-zinc-800 hover:bg-zinc-700 border border-white' : 'bg-white hover:bg-gray-100 border border-black'
                    }`}
                  onClick={handleNext}
                >
                  Next
                  <ChevronRight size={16} />
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Quiz;

