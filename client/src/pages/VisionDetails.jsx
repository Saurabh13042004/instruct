// components/VisionDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api";

function VisionDetails() {
  const { courseId } = useParams(); // expects a route parameter, e.g. /vision/123
  const navigate = useNavigate();
  const [pdfUrl, setPdfUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Fetch secure PDF URL
    API.get(`/courses/course/${courseId}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        // In production, res.data.url contains the signed URL.
        // In local mode, use the same endpoint as the src.
        setPdfUrl(res.data.url || `/api/courses/course/${courseId}/pdf`);
      })
      .catch((err) => console.error(err));

    // Fetch secure Audio URL
    API.get(`/courses/course/${courseId}/audio`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        setAudioUrl(res.data.url || `/api/courses/course/${courseId}/audio`);
      })
      .catch((err) => console.error(err));
  }, [courseId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      <div className="container mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded hover:bg-gray-700 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold">Vision Details</h1>
        </header>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* PDF Card */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Course PDF</h2>
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                title="Course PDF"
                className="w-full h-96 border-none rounded"
                sandbox="allow-scripts allow-same-origin"
                onContextMenu={(e) => e.preventDefault()}
              ></iframe>
            ) : (
              <p>Loading PDF...</p>
            )}
          </div>

          {/* Audio Card */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Course Audio</h2>
            {audioUrl ? (
              <audio
                controls
                controlsList="nodownload noplaybackrate"
                onContextMenu={(e) => e.preventDefault()}
                className="w-full"
              >
                <source src={audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <p>Loading Audio...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VisionDetails;
