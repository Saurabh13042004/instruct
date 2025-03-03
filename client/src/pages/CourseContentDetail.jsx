import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api";
import { PlayCircle, HelpCircle, FileText, Music } from "lucide-react";
import Modal from "react-modal";
import * as pdfjsLib from "pdfjs-dist";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { Link } from "react-router-dom";
// Set up PDF.js worker URL with dynamic version
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const extractKeyFromUrl = (url) => {
  const parts = url.split("/");
  return parts.slice(3).join("/");
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

  // Add this filter function before the return statement
  const filteredChapters = subject?.chapters.filter((chapter) =>
    chapter.chapterName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleQuizClick = async (chapterId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get(`/quiz/chapter/${chapterId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      if (response.data.success && response.data.quizzes.length > 0) {
        navigate(`/quiz`, {
          state: { 
            quiz: response.data.quizzes[0],
            courseId,
            subjectId,
            chapterId
          }
        });
      } else {
        toast.error("No quiz available for this chapter");
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast.error("Failed to load quiz");
    }
  };
  

  // Replace the existing Chapters Grid section with this:

  const handleOpenProtectedResource = async (resourceUrl, type) => {
    try {
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
      setPdfError(error);
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
      <div className="min-h-screen w-screen  flex items-center justify-center bg-gray-900">
        <p className="text-white text-xl">Loading subject content...</p>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-white text-xl">Subject not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen  w-screen pt-150 text-white p-8">
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
                className="card bg-gradient-to-br from-gray-800 to-gray-900
                       border border-white/10 rounded-2xl overflow-visible transition-all 
                       duration-300 hover:border-white/20 hover:translate-y-[-4px]"
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
                     ${
                       activeChapters[index]
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
                      <span className="px-2 py-1 text-sm bg-white/20 rounded-full">
                        View
                      </span>
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
                      <span className="px-2 py-1 text-sm bg-white/20 rounded-full">
                        Play
                      </span>
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
                      <span className="px-2 py-1 text-sm bg-white/20 rounded-full">
                        Watch
                      </span>
                    </div>
                  </div>

                  {/* Quiz Option */}
                  <div
                    className="transform transition-all duration-300 hover:translate-x-2
                         bg-black/20 rounded-lg cursor-pointer"
                  >
                    <div className="p-4 hover:bg-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5" />
                        <span>Practice Quiz</span>
                      </div>
                      <span className="px-2 py-1 text-sm bg-white/20 rounded-full">
                        <Link
                          onClick={() => handleQuizClick(chapter._id)}
                          className="px-2 py-1 text-sm bg-white/20 rounded-full"
                        >
                          Start
                        </Link>
                      </span>
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
          className="fixed pt-250 inset-0 flex items-center justify-center p-4 z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-75 z-40"
        >
          <div className=" bg-dark rounded-lg w-full max-w-6xl max-h-[90vh] overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">PDF Viewer</h2>
              <button
                onClick={closePdfViewer}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                Close
              </button>
            </div>

            {pdfError ? (
              <div className="text-red-600 p-4 text-center">
                <p>Error loading PDF: {pdfError.message}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div
                  className="w-full overflow-auto mb-4 relative"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {isRendering && (
                    <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center">
                      <p className="text-gray-600">Loading page...</p>
                    </div>
                  )}
                  <canvas
                    ref={canvasRef}
                    className="mx-auto border border-gray-300 shadow-lg"
                  />
                </div>

                <div className="flex items-center justify-center gap-4 p-2 bg-gray-100 rounded-lg w-full">
                  <button
                    disabled={pageNumber <= 1}
                    onClick={() => setPageNumber((prev) => prev - 1)}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-gray-700 font-medium">
                    Page {pageNumber} of {numPages}
                  </span>
                  <button
                    disabled={pageNumber >= numPages}
                    onClick={() => setPageNumber((prev) => prev + 1)}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                  >
                    Next
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
          className="fixed pt-250 inset-0 flex items-center justify-center p-4 z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-75 z-40"
        >
          <div className="bg-dark rounded-lg w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Audio Player</h2>
              <button
                onClick={closeAudioPlayer}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                Close
              </button>
            </div>
            <AudioPlayer
              autoPlay
              src={audioUrl}
              onPlay={(e) => console.log("onPlay")}
              showJumpControls={true}
              customProgressBarSection={["PROGRESS_BAR"]}
              customControlsSection={["MAIN_CONTROLS", "VOLUME_CONTROLS"]}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CourseContentDetail;
