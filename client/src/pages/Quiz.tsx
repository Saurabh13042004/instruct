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
  ChevronDown,  // Added ChevronDown
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
  Grid,
  ExternalLink,  // Added ExternalLink
  SkipForward  // Added SkipForward
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
  solution?: {
    text?: string;
    videoUrl?: string;
    imageUrl?: string;
  };
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

  console.log("Initial quizData from location.state:", quizData);

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
  const [showSolution, setShowSolution] = useState<boolean[]>(Array(questions.length).fill(false));

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
            console.log("Fetched quiz data from API:", quiz);
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
      <div className="min-h-screen w-[98vw] bg-black text-white">
        <header className="py-3 px-4 sm:px-6 flex justify-between items-center bg-[#111827] shadow-md">
          <div className="flex items-center gap-2">
            <img
              src="https://instructedu.s3.eu-north-1.amazonaws.com/main+logoo.svg"
              alt="Logo"
              style={{ maxWidth: "100%" }}
            />
          </div>
          <div 
            onClick={toggleDarkMode}
            className="p-1.5 sm:p-2 rounded-full bg-[#1a2436] hover:bg-gray-700"
          >
            <Sun size={18} />
          </div>
        </header>

        <main className="max-w-4xl mx-auto my-4 sm:my-8 px-3 sm:px-4">
          <div className="rounded-lg shadow-lg p-4 sm:p-6 md:p-8 bg-[#111827]">
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

              <div className="p-3 sm:p-4 rounded-lg flex items-start gap-2 sm:gap-3 bg-[#1a2436]">
                <AlertTriangle className="mt-1 flex-shrink-0" size={18} />
                <div>
                  <p className="font-medium text-sm sm:text-base">Important Notice</p>
                  <p className="text-xs sm:text-sm text-gray-300">
                    By starting this test, you agree to abide by the rules mentioned above. Any violation may result in disqualification.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 flex justify-center">
              <div
                onClick={handleStartTest}
                className="px-6 sm:px-8 cursor-pointer py-2.5 sm:py-3 rounded-lg font-medium text-white text-sm sm:text-base bg-[#1a2436] hover:bg-gray-700 border border-white transition-colors"
              >
                I Understand, Start Test
              </div>
            </div>
          </div>
        </main>

        <footer className="text-center py-3 sm:py-4 text-xs sm:text-sm text-gray-400">
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

    // Group questions by subject
    const subjectQuestions = questions.reduce((acc, question, index) => {
      const subject = question.subject || "General";
      if (!acc[subject]) acc[subject] = [];
      acc[subject].push({ ...question, index });
      return acc;
    }, {});

    return (
      <div className="min-h-screen w-[98vw] bg-black text-white">
        {/* Header */}
        <header className="py-2 sm:py-3 px-3 sm:px-6 flex justify-between items-center bg-[#111827] shadow-md">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-2">
              <img
                src="https://instructedu.s3.eu-north-1.amazonaws.com/main+logoo.svg"
                alt="Logo"
                style={{ maxWidth: "100%" }}
              />
            </div>
            <div className="hidden sm:block h-6 border-l border-gray-600"></div>
            <div className="hidden sm:block">
              <p className="text-xs sm:text-sm font-medium">{subjectName} | {chapterName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-1 sm:gap-2">
              <User size={16} />
              <span className="text-xs sm:text-sm font-medium">{userName}</span>
            </div>

            <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${
              timeRemaining < 300
                ? 'bg-[#1a2436] border border-white'
                : 'bg-[#1a2436]'
            }`}>
              <Clock size={14} />
              <span className="text-xs sm:text-sm font-medium">{formatTime(timeRemaining)}</span>
            </div>

            <div
              onClick={toggleDarkMode}
              className="p-1 sm:p-1.5 rounded-full bg-[#1a2436] hover:bg-gray-700"
            >
              <Sun size={16} />
            </div>

            <div
              onClick={handleBack}
              className="p-1.5 px-3 flex text-center align-middle items-center gap-2 rounded-2xl  bg-[#1a2436] hover:bg-gray-700"
            >
          <ChevronLeft size={16} /> Go Back 
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto my-4 sm:my-8 px-3 sm:px-4">
          {/* Results Header */}
          <div className="flex justify-between items-center mb-1">
            <h1 className="text-3xl font-bold text-white">Your Quiz Results</h1>
            <div className="relative">
              <div className="bg-gray-700 rounded-md px-3 py-1 text-sm">
                Attempt 1 <ChevronDown className="inline h-4 w-4" />
              </div>
            </div>
          </div>
          <p className="text-[#c6c6c4] mb-8">Completed on April 9, 2025 at 11:32 AM</p>
          
          {/* Score Card */}
          <div className="bg-[#111827] rounded-[2.75rem] p-6 sm:p-8 flex flex-col items-center mt-3 mb-8">
            <h2 className="text-xl text-[#c6c6c4] mb-4">Final Score</h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-4xl sm:text-6xl font-bold text-[#eb9f18]">{finalScore.toFixed(0)}</span>
              <span className="text-2xl sm:text-3xl text-[#c6c6c4]">/{questions.length}</span>
            </div>
            
            <div className="w-full max-w-md mb-2">
              <div className="w-full bg-gray-800 rounded-full h-3">
                <div 
                  className="bg-[#eb9f18] h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${finalPercentage}%` }}
                ></div>
              </div>
            </div>
            
            <p className="text-[#c6c6c4]">{finalPercentage.toFixed(0)}% success rate</p>
          </div>

          {/* Subject Tabs */}
          {/* <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            <div className="px-4 py-2 rounded-full text-sm whitespace-nowrap bg-[#eb9f18] text-black font-medium">
              All Subjects
            </div>
            {Object.keys(subjectQuestions).map((subject) => (
              <div
                key={subject}
                className="px-4 py-2 rounded-full text-sm whitespace-nowrap bg-gray-800 text-white hover:bg-gray-700"
              >
                {subject}
              </div>
            ))}
          </div> */}
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Correct Card */}
            <div className="bg-[#111827] rounded-[1.5rem] p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-green-900/50 text-green-500 rounded-full p-2">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <h3 className="text-base text-white font-medium">Correct</h3>
              </div>
              <p className="text-2xl font-bold text-white mb-2">{score}/{questions.length}</p>
              <p className="text-sm text-green-500">+{score * 4} Marks Obtained</p>
            </div>
            
            {/* Incorrect Card */}
            <div className="bg-[#111827] rounded-[1.5rem] p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-red-900/50 text-red-500 rounded-full p-2">
                  <XCircle className="h-5 w-5" />
                </span>
                <h3 className="text-base text-white font-medium">Incorrect</h3>
              </div>
              <p className="text-2xl font-bold text-white mb-2">{questions.length - score - selectedAnswers.filter(a => a === -1).length}/{questions.length}</p>
              <p className="text-sm text-red-500">-{(questions.length - score - selectedAnswers.filter(a => a === -1).length)} Marks Lost</p>
            </div>
            
            {/* Skipped Card */}
            <div className="bg-[#111827] rounded-[1.5rem] p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-blue-900/50 text-blue-500 rounded-full p-2">
                  <SkipForward className="h-5 w-5" />
                </span>
                <h3 className="text-base text-white font-medium">Skipped</h3>
              </div>
              <p className="text-2xl font-bold text-white mb-2">{selectedAnswers.filter(a => a === -1).length}/{questions.length}</p>
              <p className="text-sm text-blue-500">{selectedAnswers.filter(a => a === -1).length * 4} Marks Skipped</p>
            </div>
            
            {/* Time Taken Card */}
            <div className="bg-[#111827] rounded-[1.5rem] p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-purple-900/50 text-purple-500 rounded-full p-2">
                  <Clock className="h-5 w-5" />
                </span>
                <h3 className="text-base text-white font-medium">Time Taken</h3>
              </div>
              <p className="text-2xl font-bold text-white mb-2">
                {formatTime(quizData?.duration - timeRemaining)}
              </p>
              <p className="text-sm text-[#c6c6c4]">{(score / questions.length * 100).toFixed(1)}% Accuracy</p>
            </div>
          </div>
          
          {/* Question Analysis */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Question Analysis</h2>
              <div className="relative">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 text-white text-sm font-medium hover:bg-black/50">
                  <ChevronDown className="h-4 w-4" /> Sort By
                </div>
              </div>
            </div>
            
            {Object.entries(subjectQuestions).map(([subject, subjectQs]) => (
              <div key={subject} className="mb-8">
                <div className="flex justify-center mb-6">
                  {/* <h3 className="text-xl font-bold text-white px-6 py-2 bg-[#1a2436] rounded-full capitalize">
                    {subject}
                  </h3> */}
                </div>
                <div className="space-y-4">
                  {(subjectQs as any[]).map((question, idx) => {
                    const qIndex = question.index;
                    const isCorrect = selectedAnswers[qIndex] === question.correctAnswer;
                    const statusIcon = isCorrect ? 
                      <CheckCircle2 className="w-6 h-6 text-green-500" /> : 
                      <XCircle className="w-6 h-6 text-red-500" />;
                    
                    return (
                      <div key={idx} className="bg-[#111827] rounded-xl overflow-hidden">
                        <div className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">
                              {statusIcon}
                            </div>
                            
                            <div className="flex-grow">
                              <h4 className="text-md font-medium mb-2">
                                {idx + 1}. {question.question}
                              </h4>
                              
                              <div className="space-y-2 mt-4">
                                {question.options.map((option, optIdx) => (
                                  <div
                                    key={optIdx}
                                    className={`p-3 rounded-lg ${
                                      optIdx === question.correctAnswer
                                        ? 'bg-green-500/20 border border-green-500'
                                        : optIdx === selectedAnswers[qIndex] && optIdx !== question.correctAnswer
                                          ? 'bg-red-500/20 border border-red-500'
                                          : 'bg-gray-700'
                                    }`}
                                  >
                                    {option}
                                  </div>
                                ))}
                              </div>
                              
                              <div className="flex justify-between items-center mt-4">
                                <div
                                  className="text-gray-400 text-sm flex items-center gap-1"
                                >
                                  View More (30 Sec)
                                </div>
                                
                                <div
                                  onClick={() => setShowSolution(prev => {
                                    const newState = [...prev];
                                    newState[qIndex] = !newState[qIndex];
                                    return newState;
                                  })}
                                  className="text-[#eb9f18] text-sm flex items-center gap-1 hover:text-amber-400 transition-colors"
                                >
                                  {showSolution[qIndex] ? 'Hide Solution' : 'View Solution'} <ExternalLink className="h-4 w-4 ml-1" />
                                </div>
                              </div>

                              {showSolution[qIndex] && (
                                <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                                  <h5 className="text-md font-semibold text-white mb-3">Solution:</h5>
                                  {question.solution?.text && (
                                    <p className="text-gray-300 mb-2">{question.solution.text}</p>
                                  )}
                                  {question.solution?.videoUrl && (
                                    <div className="aspect-video w-full mb-2">
                                      <iframe
                                        src={question.solution.videoUrl.replace("watch?v=", "embed/")}
                                        title="Solution Video"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full rounded-md"
                                      ></iframe>
                                    </div>
                                  )}
                                  {question.solution?.imageUrl && (
                                    <img 
                                      src={question.solution.imageUrl}
                                      alt="Solution Image"
                                      className="max-w-full h-auto rounded-md"
                                    />
                                  )}
                                  {!question.solution?.text && !question.solution?.videoUrl && !question.solution?.imageUrl && (
                                    <p className="text-gray-400">No solution provided for this question.</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </main>

        <footer className="text-center py-3 sm:py-4 text-xs sm:text-sm text-gray-400">
          Powered by Instruct.edu
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-[98vw] bg-black text-white">
      {/* Header */}
      <header className="py-2 sm:py-3 px-3 sm:px-6 flex justify-between items-center bg-[#111827] shadow-md">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <img
              src="https://instructedu.s3.eu-north-1.amazonaws.com/main+logoo.svg"
              alt="Logo"
              style={{ maxWidth: "100%" }}
            />
          </div>
          <div className="hidden sm:block h-6 border-l border-gray-600"></div>
          <div className="hidden sm:block">
            <p className="text-xs sm:text-sm font-medium">{subjectName} | {chapterName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-1 sm:gap-2">
            <User size={16} />
            <span className="text-xs sm:text-sm font-medium">{userName}</span>
          </div>

          <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${
            timeRemaining < 300
              ? 'bg-[#1a2436] border border-white'
              : 'bg-[#1a2436]'
          }`}>
            <Clock size={14} />
            <span className="text-xs sm:text-sm font-medium">{formatTime(timeRemaining)}</span>
          </div>

          <div
            onClick={toggleDarkMode}
            className="p-1 sm:p-1.5 rounded-full bg-[#1a2436] hover:bg-gray-700"
          >
            <Sun size={16} />
          </div>

          <div
            onClick={toggleSidebar}
            className="sm:hidden p-1 rounded-full"
          >
            <Menu size={20} />
          </div>
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
          className={`fixed sm:relative z-50 sm:z-auto w-64 sm:w-64 flex-shrink-0 bg-[#111827] shadow-md overflow-y-auto transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
          }`}
        >
          <div className="p-3 sm:p-4">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-xs sm:text-sm font-medium">Questions</h2>
              <span className="text-xs px-2 py-0.5 sm:py-1 rounded bg-[#1a2436]">
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
                    ${currentQuestion === index ? 'ring-2 ring-offset-1 sm:ring-offset-2 ring-white ring-offset-[#111827]' : ''}
                    ${getQuestionStatusClass(index) === 'flagged'
                      ? 'bg-[#1a2436] border border-white'
                      : getQuestionStatusClass(index) === 'answered'
                        ? 'bg-[#1a2436] border border-gray-400'
                        : 'bg-[#1a2436]'
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
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-[#1a2436] border border-gray-400"></div>
                <span className="text-xs">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-[#1a2436] border border-white"></div>
                <span className="text-xs">Flagged</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm bg-[#1a2436]"></div>
                <span className="text-xs">Unanswered</span>
              </div>
            </div>

            <div
              onClick={handleSubmitTest}
              className="w-full text-center mt-4 sm:mt-6 py-2 rounded-lg font-medium text-xs sm:text-sm bg-[#1a2436] hover:bg-gray-700 border border-white"
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
              className={`p-1.5 rounded-lg flex items-center justify-center ${
                currentQuestion === 0
                  ? 'bg-[#1a2436] text-gray-500 cursor-not-allowed'
                  : 'bg-[#1a2436] hover:bg-gray-700'
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
                className="p-1.5 rounded-lg bg-[#1a2436] hover:bg-gray-700"
              >
                <Grid size={16} />
              </button>
            </div>

            <button
              className={`p-1.5 rounded-lg flex items-center justify-center ${
                currentQuestion === questions.length - 1
                  ? 'bg-[#1a2436] text-gray-500 cursor-not-allowed'
                  : 'bg-[#1a2436] hover:bg-gray-700'
              }`}
              onClick={handleNext}
              disabled={currentQuestion === questions.length - 1}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="max-w-3xl mx-auto rounded-lg shadow-lg p-4 sm:p-6 bg-[#111827]">
            {/* Question header */}
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-semibold">Question {currentQuestion + 1}</h2>
                  <button
                    onClick={handleReviewQuestion}
                    className={`p-1 sm:p-1.5 rounded-full ${
                      reviewedQuestions[currentQuestion]
                        ? 'bg-[#1a2436] border border-white'
                        : 'bg-[#1a2436] hover:bg-gray-700'
                    }`}
                    title={reviewedQuestions[currentQuestion] ? "Remove from review" : "Mark for review"}
                  >
                    <BookOpen size={14} />
                  </button>
                </div>
                <p className="text-xs mt-0.5 sm:mt-1 text-gray-400">
                  {selectedAnswers[currentQuestion] === -1 ? 'Not answered yet' : 'Answered'}
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-400">
                  {currentQuestion + 1} of {questions.length}
                </span>
                <div className="w-16 sm:w-24 h-1.5 sm:h-2 rounded-full bg-[#1a2436]">
                  <div
                    className="h-full rounded-full bg-[#eb9f18]"
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
                    className={`w-full text-left p-3 sm:p-4 rounded-lg transition-all flex justify-between items-center ${
                      selectedAnswers[currentQuestion] === index
                        ? 'bg-[#1a2436] border-2 border-[#eb9f18]'
                        : 'bg-[#1a2436] hover:bg-gray-700 border border-gray-600'
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <span className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                      <span className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-xs sm:text-sm ${
                        selectedAnswers[currentQuestion] === index
                          ? 'bg-[#eb9f18] text-black'
                          : 'bg-gray-700 text-gray-300'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option}
                    </span>
                    {selectedAnswers[currentQuestion] === index && (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#eb9f18]" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-6 sm:mt-8">
              <div
                className={`hidden cursor-pointer sm:flex px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg items-center gap-1 sm:gap-2 text-sm ${
                  currentQuestion === 0
                    ? 'bg-[#1a2436] text-gray-500 cursor-not-allowed'
                    : 'bg-[#1a2436] hover:bg-gray-700 border border-gray-600'
                }`}
                onClick={handlePrevious}
              >
                <ChevronLeft size={18} />
                Previous
              </div>

              <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <div
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 text-sm ${
                    reviewedQuestions[currentQuestion]
                      ? 'bg-[#1a2436] border border-white'
                      : 'bg-[#1a2436] hover:bg-gray-700 border border-gray-600'
                  }`}
                  onClick={handleReviewQuestion}
                >
                  <BookOpen size={16} />
                  <span className="hidden sm:inline">{reviewedQuestions[currentQuestion] ? 'Remove from review' : 'Mark for review'}</span>
                </div>

                {currentQuestion === questions.length - 1 ? (
                  <div
                    className="px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg font-medium text-sm bg-[#1a2436] hover:bg-gray-700 border border-white"
                    onClick={handleSubmitTest}
                  >
                    Submit Test
                  </div>
                ) : (
                  <div
                    className="hidden sm:flex px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg items-center gap-1 sm:gap-2 text-sm bg-[#1a2436] hover:bg-gray-700 border border-white"
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
          <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-[#111827] p-3 flex justify-between items-center shadow-lg">
            {currentQuestion === questions.length - 1 ? (
              <div
                className="w-full py-2 rounded-lg text-center font-medium text-sm bg-[#1a2436] hover:bg-gray-700 border border-white"
                onClick={handleSubmitTest}
              >
                Submit Test
              </div>
            ) : (
              <>
                <span className="text-xs text-gray-400">
                  {selectedAnswers.filter(a => a !== -1).length}/{questions.length} answered
                </span>
                <div
                  className="px-4 py-2 rounded-lg flex items-center gap-1 text-sm bg-[#1a2436] hover:bg-gray-700 border border-white"
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

