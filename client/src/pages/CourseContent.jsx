// components/CourseContent.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api";
import { Atom, Droplet, BookOpen, Cpu, Activity, Code } from "lucide-react";

const gradients = {
  physics: "bg-gradient-to-br from-[#1a237e] to-[#3949ab]",
  chemistry: "bg-gradient-to-br from-[#006064] to-[#00838f]",
  biology: "bg-gradient-to-br from-[#2e7d32] to-[#388e3c]",
  math: "bg-gradient-to-br from-[#4a148c] to-[#6a1b9a]",
  default: "bg-gradient-to-br from-gray-800 to-gray-600"
};

// Array of icon components to choose randomly from.
const icons = [Atom, Droplet, BookOpen, Cpu, Activity, Code];

const CourseContent = () => {
  const { courseId } = useParams();
  const [courseName, setCourseName] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    // First, fetch the detailed content (subjects) from the backend.
    API.get(`/courses/course/${courseId}/content`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        // Expecting: { courseContent: [ { subjectName, chapters: [...] }, ... ] }
        setSubjects(res.data.courseContent || []);
        // Then, fetch the basic course details (for course name)
        return API.get(`/courses/course/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((res) => {
        setCourseName(res.data.course.courseName);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching course content:", err);
        setLoading(false);
      });
  }, [courseId]);

  if (loading) return <p className="text-white">Loading course content...</p>;


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="batch-heading flex flex-col items-center mb-16 pt-32">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {courseName}
        </h1>
        <img
          className="h-16 md:h-20"
          src="/assets/img/slider/1.svg"
          alt="course banner"
        />
      </div>

      <div className="flex justify-center">
        <div className={`grid gap-8 ${
          subjects.length === 1 
            ? 'grid-cols-1 w-[356px]'
            : subjects.length === 2
              ? 'grid-cols-1 md:grid-cols-2 w-full max-w-[744px]'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full max-w-[1100px]'
        }`}>
          {subjects.map((subject, index) => {
            const IconComponent = icons[index % icons.length];
            const gradientClass = gradients[subject.subjectName.toLowerCase()] || gradients.default;
            
            return (
              <a
                key={index}
                href={`/course-content-detail/${courseId}/${subject._id}`}
                className={`card group relative w-full h-[280px] p-6 
                  rounded-[3rem] overflow-hidden cursor-pointer 
                  transition-all duration-300 ease-in-out hover:-translate-y-2 hover:scale-[1.02]
                  ${gradientClass} backdrop-blur-sm shadow-lg hover:shadow-2xl
                  hover:shadow-white/10`}
              >
                <div className="relative z-10 h-full flex flex-col justify-between text-white">
                  <div>
                    <div className="card-icon text-4xl mb-4 w-12 h-12 flex items-center justify-center">
                      <IconComponent className="w-8 h-8 drop-shadow-glow" />
                    </div>

                    <h3 className="text-2xl font-bold mb-3 text-shadow">
                      {subject.subjectName}
                    </h3>

                    <p className="text-sm opacity-90 mb-4">
                      {subject.chapters.length > 0
                        ? `${subject.chapters.length} chapters available`
                        : "No chapters available"}
                    </p>
                  </div>

                  {subject.chapters.length > 0 && (
                    <div className="text-sm opacity-75 space-y-1">
                      {subject.chapters.slice(0, 3).map((chapter, idx) => (
                        <p key={idx} className="flex items-center">
                          <span className="mr-2">•</span>
                          {chapter.chapterName}
                        </p>
                      ))}
                      {subject.chapters.length > 3 && (
                        <p className="italic">
                          And {subject.chapters.length - 3} more...
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CourseContent;