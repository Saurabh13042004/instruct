import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api";
import { PlayCircle, HelpCircle, FileText, Music, ArrowLeft } from "lucide-react";
import Modal from "react-modal";
import * as pdfjsLib from "pdfjs-dist";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { Play, Pause, SkipBack, SkipForward, VolumeX, Volume1, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import {toast} from "react-hot-toast";
import Loader from "../components/Loader";
// Set up PDF.js worker URL with dynamic version
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const extractKeyFromUrl = (url) => {
  const parts = url.split("/");
  return parts.slice(3).join("/");
};




// Add this new component at the bottom of your file, before the export statement
const EnhancedAudioPlayer = ({ audioUrl }) => {
  // Reference to the audio element
  const audioRef = useRef(new Audio(audioUrl));

  // State variables to manage audio playback, progress, speed, and volume
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [chapterName, setChapterName] = useState("Audio Chapter");

  useEffect(() => {
    // Set the audio source when the component mounts
    audioRef.current.src = audioUrl;

    // Setup Media Session API for controlling playback from notifications
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: chapterName,
        artist: "Instruct",
        album: "Course Audio",
      });

      navigator.mediaSession.setActionHandler("play", () => togglePlayPause());
      navigator.mediaSession.setActionHandler("pause", () => togglePlayPause());
      navigator.mediaSession.setActionHandler("previoustrack", () => skipTime(-10));
      navigator.mediaSession.setActionHandler("nexttrack", () => skipTime(10));
    }

    // Auto-play when loaded
    audioRef.current.addEventListener('loadedmetadata', () => {
      setDuration(audioRef.current.duration);
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.error("Autoplay failed:", error);
      });
    });

    // Cleanup function
    return () => {
      audioRef.current.pause();
      audioRef.current.src = "";
    };
  }, [audioUrl]);

  // Toggle between play and pause states
  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? "paused" : "playing";
    }
  };

  // Skip forward or backward in the audio
  const skipTime = (time) => {
    audioRef.current.currentTime += time;
  };

  // Change playback speed
  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    audioRef.current.playbackRate = newSpeed;
  };

  // Adjust volume level
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  };

  // Handle progress bar click to seek
  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / progressBar.offsetWidth;
    audioRef.current.currentTime = pos * audioRef.current.duration;
  };

  useEffect(() => {
    // Update progress bar as the audio plays
    const audio = audioRef.current;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Format time in MM:SS
  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Determine the correct volume icon based on the volume level
  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX size={20} className="text-gray-300" />;
    if (volume > 0 && volume <= 0.5) return <Volume1 size={20} className="text-gray-300" />;
    return <Volume2 size={20} className="text-gray-300" />;
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Circular Visualizer */}
      <div className="relative w-48 h-48 flex items-center justify-center mb-4">
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700 rounded-full shadow-lg flex items-center justify-center">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <div className="text-white text-xl font-bold">
              {formatTime(currentTime)}
            </div>
          </div>
        </div>
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" stroke="#222" strokeWidth="3" fill="none" />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#eb9f18"
            strokeWidth="3"
            fill="none"
            strokeDasharray="283"
            strokeDashoffset={`${283 - (progress / 100) * 283}`}
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Song Title and Artist */}
      <h2 className="text-xl font-semibold mt-2 text-white">{chapterName}</h2>
      <p className="text-gray-400 text-sm mb-4">Instruct</p>

      {/* Progress Bar */}
      <div className="w-full mb-2">
        <div
          className="w-full h-2 bg-gray-700 rounded-full cursor-pointer relative"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-[#eb9f18] rounded-full absolute top-0 left-0"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center mt-4 space-x-6">
        <button
          onClick={() => skipTime(-10)}
          className="text-gray-300 hover:text-white transition-colors"
        >
          <SkipBack size={24} />
        </button>
        <button
          onClick={togglePlayPause}
          className="bg-[#eb9f18] p-4 rounded-full shadow-lg hover:bg-[#d99416] transition-all"
        >
          {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </button>
        <button
          onClick={() => skipTime(10)}
          className="text-gray-300 hover:text-white transition-colors"
        >
          <SkipForward size={24} />
        </button>
      </div>

      {/* Speed Control Buttons */}
      <div className="flex items-center justify-center mt-6 space-x-3">
        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((value) => (
          <button
            key={value}
            onClick={() => handleSpeedChange(value)}
            className={`px-2 py-1 rounded-md text-sm transition-all ${speed === value
                ? 'bg-[#eb9f18] text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
          >
            {value}x
          </button>
        ))}
      </div>

      {/* Volume Control */}
      <div className="flex items-center justify-center mt-6 space-x-3 w-full max-w-xs">
        <button
          onClick={() => {
            const newVolume = volume === 0 ? 1 : 0;
            setVolume(newVolume);
            audioRef.current.volume = newVolume;
          }}
          className="text-gray-300 hover:text-white"
        >
          {getVolumeIcon()}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-[#eb9f18]"
        />
      </div>
    </div>
  );
};




const CourseContentDetail = () => {
  const { courseId, subjectId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const pdfContentRef = useRef(null);
  const [subject, setSubject] = useState(null);
  const [activeChapters, setActiveChapters] = useState({});
  const [loading, setLoading] = useState(true);
  const [pdfViewerUrl, setPdfViewerUrl] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);
  const [quizData, setQuizData] = useState(null);

  const [isRendering, setIsRendering] = useState(false);
  const [audioPlayerUrl, setAudioPlayerUrl] = useState(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  // Add searchTerm state at the top with other state declarations
  const [searchTerm, setSearchTerm] = useState("");

  // Replace the single loadingResource and resourceError states with chapter-specific states
  const [chapterStates, setChapterStates] = useState({});

  // Helper function to initialize chapter state
  const initializeChapterState = (chapterId) => {
    setChapterStates(prev => ({
      ...prev,
      [chapterId]: {
        loading: {
          pdf: false,
          audio: false,
          video: false,
          quiz: false
        },
        error: {
          pdf: null,
          audio: null,
          video: null,
          quiz: null
        }
      }
    }));
  };

  // Helper function to update chapter state
  const updateChapterState = (chapterId, resourceType, updates) => {
    setChapterStates(prev => ({
      ...prev,
      [chapterId]: {
        ...prev[chapterId],
        [resourceType]: {
          ...prev[chapterId]?.[resourceType],
          ...updates
        }
      }
    }));
  };

  // Add this filter function before the return statement
  const filteredChapters = subject?.chapters.filter((chapter) =>
    chapter.chapterName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleQuizClick = async (chapterId) => {
    try {
      if (!chapterStates[chapterId]) {
        initializeChapterState(chapterId);
      }

      updateChapterState(chapterId, 'loading', { quiz: true });
      updateChapterState(chapterId, 'error', { quiz: null });

      const token = localStorage.getItem("token");
      const response = await API.get(`/courses/verify-access/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.hasAccess) {
        // Fetch quiz data before navigation
        const quizResponse = await API.get(`/quiz/chapter/${chapterId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (quizResponse.data.success && quizResponse.data.quizzes.length > 0) {
          const quizData = quizResponse.data.quizzes[0];
          navigate(`/quiz/${chapterId}`, { state: { quiz: quizData } });
          console.log("Quiz accessed successfully");
        } else {
          toast.error("No quiz found for this chapter");
          updateChapterState(chapterId, 'error', { quiz: 'No quiz found' });
        }
      } else {
        toast.error("You don't have access to this quiz");
        updateChapterState(chapterId, 'error', { quiz: 'Access denied' });
      }
    } catch (error) {
      console.error("Error accessing quiz:", error);
      updateChapterState(chapterId, 'error', { quiz: error.message });
      toast.error("Failed to access quiz. Please try again.");
    } finally {
      updateChapterState(chapterId, 'loading', { quiz: false });
    }
  };


  // Replace the existing Chapters Grid section with this:
  const handleOpenProtectedResource = async (resourceUrl, type, chapterId) => {
    if (!resourceUrl) {
      updateChapterState(chapterId, 'error', { [type]: 'Resource not found' });
      return;
    }

    try {
      // Initialize chapter state if not exists
      if (!chapterStates[chapterId]) {
        initializeChapterState(chapterId);
      }

      // Set loading state for the specific resource
      updateChapterState(chapterId, 'loading', { [type]: true });
      updateChapterState(chapterId, 'error', { [type]: null });

      const token = localStorage.getItem("token");
      const response = await API.get(`/courses/verify-access/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.hasAccess) {
        switch (type) {
          case "pdf":
            try {
              // Test if the PDF URL is accessible
              const testResponse = await fetch(resourceUrl);
              if (!testResponse.ok) {
                throw new Error('PDF not accessible');
              }
              setPdfViewerUrl(resourceUrl);
            } catch (error) {
              console.error('Error loading PDF:', error);
              updateChapterState(chapterId, 'error', { [type]: 'PDF not accessible' });
              toast.error('Error loading PDF. Please try again later.');
            }
            break;
          case "audio":
            setAudioPlayerUrl(resourceUrl);
            setShowAudioPlayer(true);
            break;
          case "video":
            window.open(resourceUrl, "_blank");
            break;
          default:
            break;
        }
        updateChapterState(chapterId, 'loading', { [type]: false });
      } else {
        toast.error("You don't have access to this resource");
        updateChapterState(chapterId, 'error', { [type]: 'Access denied' });
      }
    } catch (error) {
      console.error(`Error accessing ${type}:`, error);
      updateChapterState(chapterId, 'error', { [type]: error.message });
    } finally {
      updateChapterState(chapterId, 'loading', { [type]: false });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    API.get(`/courses/course/${courseId}/content`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        const subjects = res.data.courseContent;
        const foundSubject = subjects.find((subj) => subj._id === subjectId);
        setSubject(foundSubject);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching course content:", err);
        setLoading(false);
      });
  }, [courseId, subjectId]);
  const closeAudioPlayer = () => {
    setShowAudioPlayer(false);
    setAudioPlayerUrl(null);
  };

  // Update the navigation functions
  const goToFirstPage = () => {
    if (pageNumber > 1 && !isRendering) {
      setPageNumber(1);
      pdfContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToLastPage = () => {
    if (numPages && pageNumber < numPages && !isRendering) {
      setPageNumber(numPages);
      pdfContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (pageNumber > 1 && !isRendering) {
      setPageNumber(prev => prev - 1);
      pdfContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextPage = () => {
    if (numPages && pageNumber < numPages && !isRendering) {
      setPageNumber(prev => prev + 1);
      pdfContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Add useEffect to handle page number changes
  useEffect(() => {
    if (pdfContentRef.current) {
      pdfContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pageNumber]);

  // Update the renderPage function to handle errors better
  const renderPage = async (pdf, pageNum) => {
    try {
      setIsRendering(true);
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      const viewport = page.getViewport({ scale: 1.5 });

      // Set canvas dimensions
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    } catch (error) {
      console.error("Error rendering page:", error);
      setPdfError(error);
      toast.error('Error rendering page. Please try again.');
    } finally {
      setIsRendering(false);
    }
  };

  // In the same file, update the PDF loading useEffect
  useEffect(() => {
    if (pdfViewerUrl) {
      const loadPdf = async () => {
        try {
          setIsRendering(true);
          setPdfError(null);
          const pdf = await pdfjsLib.getDocument({
            url: pdfViewerUrl,
            cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.12.313/cmaps/',
            cMapPacked: true,
          }).promise;
          setPdfDoc(pdf);
          setNumPages(pdf.numPages);
          await renderPage(pdf, pageNumber);
        } catch (error) {
          console.error("Error loading PDF:", error);
          setPdfError(error);
          toast.error('Error loading PDF. Please try again later.');
        } finally {
          setIsRendering(false);
        }
      };
      loadPdf();
    }
  }, [pdfViewerUrl]);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(pdfDoc, pageNumber);
    }
  }, [pageNumber]);

  const toggleChapter = (index) => {
    setActiveChapters((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const closePdfViewer = () => {
    setPdfViewerUrl(null);
    setPdfDoc(null);
    setPageNumber(1);
    setNumPages(null);
    setPdfError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-[98vw] flex items-center justify-center bg-gray-900">
        <Loader size="large" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen w-[98vw] flex items-center justify-center bg-gray-900">
        <p className="text-white text-xl">Subject not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-[98vw] pt-150 text-white p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div
          onClick={() => navigate(-1)}
          className="bg-opacity-10 hover:bg-opacity-20 bg-dark text-white px-4 py-2 rounded-lg 
                    transition-all duration-300 flex items-center gap-2 hover:translate-x-[-4px]"
        >
          <ArrowLeft size={18} /> Back
        </div>
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold text-white text-shadow">
            {subject.subjectName}
          </h1>
          {subject.subjectName === "Vision" && (
            <img 
              src="https://instructedu.s3.eu-north-1.amazonaws.com/main+logoo.svg" 
              alt="Vision Logo" 
              className="h-12 w-auto"
            />
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search chapters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-3 pl-10 rounded-lg bg-white bg-opacity-10 
                     border border-white border-opacity-20 text-gray-800 placeholder-gray-500
                     focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-20 
                     transition-all duration-300 caret-gray-800"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 
                       text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Chapters Grid */}
      {/* Chapters Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChapters?.length > 0 ? (
          filteredChapters.map((chapter, index) => (
            <div key={index} className="relative">
              <div
                className="bg-gradient-to-br from-gray-800 to-gray-900
                       border border-white/10 rounded-2xl overflow-visible transition-all 
                       duration-300 hover:border-white/20 hover:translate-y-[-4px] h-[12rem] p-4"
              >
                {/* Card Header */}
                <div
                  onClick={() => toggleChapter(index)}
                  className="p-6 cursor-pointer"
                >
                  <div
                    className="text-4xl mb-4 transition-transform duration-300 
                           transform hover:scale-110"
                  >
                    {index % 2 === 0 ? "📚" : "🎯"}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {chapter.chapterName}
                  </h3>
                </div>
              </div>

              {/* Card Content - Expandable Section */}
              <div
                className={`mt-2 transition-all duration-500 ease-in-out origin-top
                     ${activeChapters[index]
                    ? "opacity-100 transform scale-y-100"
                    : "opacity-0 transform scale-y-0 h-0"
                  }`}
              >
                <div className="space-y-2 bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                  {/* PDF Option */}
                  <div
                    onClick={() => handleOpenProtectedResource(chapter.pdfLink, 'pdf', chapter._id)}
                    className="transform transition-all duration-300 hover:translate-x-2
                     bg-black/20 rounded-lg cursor-pointer"
                  >
                    <div className="p-4 hover:bg-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        <span>Notes</span>
                      </div>
                      {chapterStates[chapter._id]?.loading?.pdf ? (
                        <Loader size="small" />
                      ) : chapterStates[chapter._id]?.error?.pdf ? (
                        <span className="text-red-400 text-sm">Not Found</span>
                      ) : (
                        <span className="px-2 py-1 text-sm bg-white/20 rounded-full">
                          View
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Audio Option */}
                  <div
                    onClick={() => handleOpenProtectedResource(chapter.audioLink, 'audio', chapter._id)}
                    className="transform transition-all duration-300 hover:translate-x-2
                     bg-black/20 rounded-lg cursor-pointer"
                  >
                    <div className="p-4 hover:bg-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Music className="w-5 h-5" />
                        <span>Audio Lecture</span>
                      </div>
                      {chapterStates[chapter._id]?.loading?.audio ? (
                        <Loader size="small" />
                      ) : chapterStates[chapter._id]?.error?.audio ? (
                        <span className="text-red-400 text-sm">Not Found</span>
                      ) : (
                        <span className="px-2 py-1 text-sm bg-white/20 rounded-full">
                          Listen
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Video Option */}
                  <div
                    onClick={() => handleOpenProtectedResource(chapter.videoLink, 'video', chapter._id)}
                    className="transform transition-all duration-300 hover:translate-x-2
                     bg-black/20 rounded-lg cursor-pointer"
                  >
                    <div className="p-4 hover:bg-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PlayCircle className="w-5 h-5" />
                        <span>Video Lecture</span>
                      </div>
                      {chapterStates[chapter._id]?.loading?.video ? (
                        <Loader size="small" />
                      ) : chapterStates[chapter._id]?.error?.video ? (
                        <span className="text-red-400 text-sm">Not Found</span>
                      ) : (
                        <span className="px-2 py-1 text-sm bg-white/20 rounded-full">
                          Watch
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quiz Option */}
                  <div
                    onClick={() => handleQuizClick(chapter._id)}
                    className="transform transition-all duration-300 hover:translate-x-2
                     bg-black/20 rounded-lg cursor-pointer"
                  >
                    <div className="p-4 hover:bg-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5" />
                        <span>Practice Quiz</span>
                      </div>
                      {chapterStates[chapter._id]?.loading?.quiz ? (
                        <Loader size="small" />
                      ) : chapterStates[chapter._id]?.error?.quiz ? (
                        <span className="text-red-400 text-sm">Not Found</span>
                      ) : (
                        <div 
                          className="px-2 py-1 text-sm bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuizClick(chapter._id);
                          }}
                        >
                          Start
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-400 text-lg">
              No chapters found matching "{searchTerm}"
            </p>
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {pdfViewerUrl && (
        <Modal
          isOpen={true}
          onRequestClose={closePdfViewer}
          contentLabel="PDF Viewer"
          className="fixed inset-0 z-50 overflow-hidden"
          overlayClassName="fixed inset-0 bg-black bg-opacity-90 z-40"
        >
          <div className="h-screen w-screen flex flex-col bg-gray-900">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-white">PDF Viewer</h2>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <span>Page</span>
                  <input
                    type="number"
                    min="1"
                    max={numPages || 1}
                    value={pageNumber}
                    onChange={(e) => {
                      const newPage = Math.min(Math.max(1, parseInt(e.target.value) || 1), numPages || 1);
                      setPageNumber(newPage);
                    }}
                    className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-center"
                  />
                  <span>of {numPages || '?'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={goToFirstPage}
                  disabled={pageNumber <= 1 || isRendering}
                  className="p-2 cursor-pointer text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title="First Page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goToPreviousPage}
                  disabled={pageNumber <= 1 || isRendering}
                  className="p-2 cursor-pointer text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous Page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div
                  onClick={goToNextPage}
                  disabled={!numPages || pageNumber >= numPages || isRendering}
                  className="p-2 cursor-pointer text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next Page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div
                  onClick={goToLastPage}
                  disabled={!numPages || pageNumber >= numPages || isRendering}
                  className="p-2 cursor-pointer text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Last Page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="h-6 w-px bg-gray-600 mx-2"></div>
                <div
                  onClick={closePdfViewer}
                  className="px-4 cursor-pointer py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Close
                </div>
              </div>
            </div>

            {/* Floating Action Buttons */}
            <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
              <div
                onClick={goToPreviousPage}
                disabled={pageNumber <= 1 || isRendering}
                className="p-3 cursor-pointer bg-gray-800 hover:bg-gray-700 text-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110"
                title="Previous Page"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <div
                onClick={goToNextPage}
                disabled={!numPages || pageNumber >= numPages || isRendering}
                className="p-3 cursor-pointer bg-gray-800 hover:bg-gray-700 text-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110"
                title="Next Page"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div
                onClick={closePdfViewer}
                className="p-3 cursor-pointer bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-all hover:scale-110"
                title="Close PDF Viewer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>

            {/* PDF Content Area */}
            <div className="flex-1 overflow-auto bg-gray-800" ref={pdfContentRef}>
              {!pdfDoc && !pdfError ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-300">Loading PDF document...</p>
                  </div>
                </div>
              ) : pdfError ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-red-400 p-4 text-center max-w-md">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-lg font-semibold">Error loading PDF</p>
                    <p className="mt-2">{pdfError.message || "Could not load the document. Please try again."}</p>
                  </div>
                </div>
              ) : (
                <div className="relative min-h-full p-8">
                  {isRendering && (
                    <div className="absolute inset-0 bg-gray-800 bg-opacity-80 flex items-center justify-center z-10">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-2 text-gray-300">Rendering page {pageNumber}...</p>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-center">
                    <canvas
                      ref={canvasRef}
                      className="shadow-2xl"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}



      {showAudioPlayer && audioPlayerUrl && (
        <Modal
          isOpen={true}
          onRequestClose={closeAudioPlayer}
          contentLabel="Audio Player"
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          overlayClassName="fixed inset-0 bg-black bg-opacity-90 z-40"
        >
          <div className="relative bg-gray-900 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-gray-700 flex flex-col items-center">
            <button
              onClick={closeAudioPlayer}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <EnhancedAudioPlayer audioUrl={audioPlayerUrl} />
          </div>
        </Modal>
      )}

    </div>
  );
};

export default CourseContentDetail;
