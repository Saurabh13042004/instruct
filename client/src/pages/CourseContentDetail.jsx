import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api";
import { PlayCircle, HelpCircle, FileText, Music } from "lucide-react";
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
  const [audioUrl, setAudioUrl] = useState(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  // Add searchTerm state at the top with other state declarations
  const [searchTerm, setSearchTerm] = useState("");

  const [loadingResource, setLoadingResource] = useState({
    pdf: false,
    audio: false,
    video: false,
    quiz: false
  });
  const [resourceError, setResourceError] = useState({
    pdf: null,
    audio: null,
    video: null,
    quiz: null
  });

  // Add this filter function before the return statement
  const filteredChapters = subject?.chapters.filter((chapter) =>
    chapter.chapterName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleQuizClick = async (chapterId) => {
    if (!chapterId) {
      setResourceError(prev => ({ ...prev, quiz: "Quiz not found" }));
      return;
    }

    try {
      setLoadingResource(prev => ({ ...prev, quiz: true }));
      setResourceError(prev => ({ ...prev, quiz: null }));

      const token = localStorage.getItem("token");
      const response = await API.get(`/quiz/chapter/${chapterId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.quizzes.length > 0) {
        const quiz = response.data.quizzes[0];
        // Scroll to top before navigation
        window.scrollTo(0, 0);
        navigate(`/quiz/${chapterId}`, {
          state: {
            quiz,
            courseId,
            subjectId,
            chapterId
          }
        });
      } else {
        setResourceError(prev => ({ ...prev, quiz: "No quiz available for this chapter" }));
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      setResourceError(prev => ({ ...prev, quiz: "Failed to load quiz" }));
    } finally {
      setLoadingResource(prev => ({ ...prev, quiz: false }));
    }
  };


  // Replace the existing Chapters Grid section with this:
  const handleOpenProtectedResource = async (resourceUrl, type) => {
    if (!resourceUrl) {
      setResourceError(prev => ({ ...prev, [type]: "Resource not found" }));
      return;
    }

    try {
      setLoadingResource(prev => ({ ...prev, [type]: true }));
      setResourceError(prev => ({ ...prev, [type]: null }));

      const token = localStorage.getItem("token");
      const key = extractKeyFromUrl(resourceUrl);
      const presignedResponse = await API.get(
        `/presigned-url/presigned-url?key=${encodeURIComponent(key)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const signedUrl = presignedResponse.data.url;
      const response = await fetch(signedUrl);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      if (type === "pdf") {
        setPdfViewerUrl(blobUrl);
        setPdfError(null);
        setPageNumber(1);
      } else if (type === "audio") {
        setAudioUrl(blobUrl);
        setShowAudioPlayer(true);
      }
    } catch (error) {
      console.error("Error opening protected resource:", error);
      setResourceError(prev => ({ ...prev, [type]: error.message }));
      if (type === "pdf") {
        setPdfError(error);
      }
    } finally {
      setLoadingResource(prev => ({ ...prev, [type]: false }));
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
    setAudioUrl(null);
  };

  const renderPage = async (pdf, pageNum) => {
    try {
      setIsRendering(true);
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      const viewport = page.getViewport({ scale: 1.5 });

      // Handle HiDPI displays
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = viewport.width * pixelRatio;
      canvas.height = viewport.height * pixelRatio;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      context.scale(pixelRatio, pixelRatio);

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      setIsRendering(false);
    } catch (error) {
      console.error("Error rendering page:", error);
      setPdfError(error);
      setIsRendering(false);
    }
  };

  // In the same file, update the PDF loading useEffect
  useEffect(() => {
    if (pdfViewerUrl) {
      const loadPdf = async () => {
        try {
          const pdf = await pdfjsLib.getDocument(pdfViewerUrl).promise;
          setPdfDoc(pdf);
          setNumPages(pdf.numPages);
          await renderPage(pdf, pageNumber);
        } catch (error) {
          console.error("Error loading PDF:", error);
          setPdfError(error);
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
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-900">
        <Loader size="large" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-900">
        <p className="text-white text-xl">Subject not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-[98vw] pt-150 text-white p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-opacity-10 hover:bg-opacity-20 bg-dark text-white px-4 py-2 rounded-lg 
                    transition-all duration-300 flex items-center gap-2 hover:translate-x-[-4px]"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-bold text-white text-shadow">
          {subject.subjectName}
        </h1>
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
                    onClick={() =>
                      handleOpenProtectedResource(chapter.pdfLink, "pdf")
                    }
                    className="transform transition-all duration-300 hover:translate-x-2
                       bg-black/20 rounded-lg cursor-pointer"
                  >
                    <div className="p-4 hover:bg-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        <span>Notes PDF</span>
                      </div>
                      {loadingResource.pdf ? (
                        <Loader size="small" />
                      ) : resourceError.pdf ? (
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
                    onClick={() =>
                      handleOpenProtectedResource(chapter.audioLink, "audio")
                    }
                    className="transform transition-all duration-300 hover:translate-x-2
                       bg-black/20 rounded-lg cursor-pointer"
                  >
                    <div className="p-4 hover:bg-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Music className="w-5 h-5" />
                        <span>Audio Book</span>
                      </div>
                      {loadingResource.audio ? (
                        <Loader size="small" />
                      ) : resourceError.audio ? (
                        <span className="text-red-400 text-sm">Not Found</span>
                      ) : (
                        <span className="px-2 py-1 text-sm bg-white/20 rounded-full">
                          Play
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Video Option */}
                  <div
                    className="transform transition-all duration-300 hover:translate-x-2
                         bg-black/20 rounded-lg cursor-pointer"
                  >
                    <div className="p-4 hover:bg-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PlayCircle className="w-5 h-5" />
                        <span>Video Lecture</span>
                      </div>
                      {loadingResource.video ? (
                        <Loader size="small" />
                      ) : resourceError.video ? (
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
                      {loadingResource.quiz ? (
                        <Loader size="small" />
                      ) : resourceError.quiz ? (
                        <span className="text-red-400 text-sm">Not Found</span>
                      ) : (
                        <button 
                          className="px-2 py-1 text-sm bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuizClick(chapter._id);
                          }}
                        >
                          Start
                        </button>
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
          className="fixed inset-0 flex items-center justify-center z-50 p-4 pt-28 pb-16 overflow-hidden"
          overlayClassName="fixed inset-0 bg-black bg-opacity-90 z-40"
        >
          <div className="bg-gray-900 rounded-lg w-full max-w-6xl h-[85vh] flex flex-col p-4 shadow-2xl border border-gray-700">
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">PDF Viewer</h2>
              <button
                onClick={closePdfViewer}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                Close
              </button>
            </div>

            {!pdfDoc && !pdfError ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-300">Loading PDF document...</p>
                </div>
              </div>
            ) : pdfError ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-red-400 p-4 text-center max-w-md">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-lg font-semibold">Error loading PDF</p>
                  <p className="mt-2">{pdfError.message || "Could not load the document. Please try again."}</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-auto relative bg-gray-800 rounded-lg">
                  {isRendering && (
                    <div className="absolute inset-0 bg-gray-800 bg-opacity-80 flex items-center justify-center z-10">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-2 text-gray-300">Rendering page {pageNumber}...</p>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-center min-h-full p-4">
                    <canvas
                      ref={canvasRef}
                      className="border border-gray-700 shadow-lg"
                      style={{ maxHeight: "100%" }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-4 p-3 bg-gray-800 rounded-lg">
                  <button
                    disabled={pageNumber <= 1 || isRendering}
                    onClick={() => setPageNumber((prev) => prev - 1)}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  <div className="px-4 py-2 bg-gray-700 rounded-md shadow-sm">
                    <span className="text-gray-200 font-medium">
                      Page {pageNumber} of {numPages || '?'}
                    </span>
                  </div>
                  <button
                    disabled={!numPages || pageNumber >= numPages || isRendering}
                    onClick={() => setPageNumber((prev) => prev + 1)}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center"
                  >
                    Next
                    <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}



      {showAudioPlayer && audioUrl && (
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

            <EnhancedAudioPlayer audioUrl={audioUrl} />
          </div>
        </Modal>
      )}

    </div>
  );
};

export default CourseContentDetail;
