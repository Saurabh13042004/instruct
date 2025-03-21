import React, { useEffect, useState } from "react";
import API from "../../api";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  // activeTab can be "all" or "my"
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  // Check if the user is authenticated
  const token = localStorage.getItem("token");

  // Fetch all courses - no authentication required
  const fetchAllCourses = async () => {
    try {
      setLoading(true);
      const res = await API.get("/courses/getAllCourses");
      if (res.data.success) {
        setCourses(res.data.courses);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  // Fetch purchased (my) courses – assumes endpoint GET /user/my-courses exists
  const fetchMyCourses = async () => {
    try {
      const res = await API.get("/user/my-courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setMyCourses(res.data.courses);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch your courses");
    }
  };


  useEffect(() => {
    fetchAllCourses();
    if (token) {
      fetchMyCourses();
    }
  }, [token]);

  // Display courses depending on active tab
  const displayCourses = activeTab === "all" ? courses : myCourses;

  return (
    <div className="w-screen">
      <section className="feature-course pt-150 pb-130 pt-md-95 pb-md-80 pt-xs-95 pb-xs-80">
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="section-title text-center mt-50 mb-70">
                <h1>{token ? "My Courses" : "All Courses"}</h1>
              </div>
            </div>
          </div>
          {/* If user is authenticated, show tab buttons */}
          {token && (
            <div className="row justify-content-center mb-4">
              <div className="col-xl-12 text-center">
                <div className="portfolio-menu mb-60">
                  <button
                    className={`gf_btn ${activeTab === "all" ? "active" : ""}`}
                    onClick={() => setActiveTab("all")}
                  >
                    All Courses
                  </button>
                  <button
                    className={`gf_btn ${activeTab === "my" ? "active" : ""}`}
                    onClick={() => setActiveTab("my")}
                  >
                    My Courses
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="grid row">
            {displayCourses && displayCourses.length > 0 ? (
              displayCourses.map((course) => (
                <div className="col-lg-4 col-md-6" key={course._id}>
                  <div className="z-gallery mb-30">
                    <div className="z-gallery__thumb mb-20">
                      {/* Link to CourseDetail page */}
                      <Link to={`/course/${course._id}`}>
                        <img
                          className="img-fluid"
                          src="https://foundr.com/wp-content/uploads/2021/09/Best-online-course-platforms.png"
                          alt={course.courseName}
                        />
                      </Link>
                      <div className="heart-icon">
                        <i className="fas fa-heart" />
                      </div>
                    </div>
                    <div className="z-gallery__content">
                      {/* <div className="course__tag mb-15">
                        {course.includedAssets &&
                          course.includedAssets.slice(0, 2).map((asset, i) => (
                            <span key={i}>{asset}</span>
                          ))}
                        <a className="f-right" href="instructor-details.html">
                          <img src="assets/img/course/in1.png" alt="instructor" />
                        </a>
                      </div> */}
                      <h4 className=" mb-20">
                        <Link to={`/course/${course._id}`} className="!text-2xl !font-bold !text-red-800">
                          {course.courseName}
                        </Link>
                      </h4>
                  
                      <div className="flex mt-2">
                        <span className="line-through">
                          ₹{course.originalPrice}</span>
                        <h4 className="!text-2xl !text-red-950">₹{course.discountPrice} 🎉</h4>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center w-100">No courses available</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Courses;
