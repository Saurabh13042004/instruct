import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api";
import axios from "axios";
import { Lock } from "lucide-react";
import { Star, StarHalf } from 'lucide-react';


// Helper to get Razorpay key from environment variables (for Vite/CRA)
const getRazorpayKey = () => {
  if (import.meta && import.meta.env && import.meta.env.VITE_RAZORPAY_KEY_ID) {
    return import.meta.env.VITE_RAZORPAY_KEY_ID;
  }
  return process.env.REACT_APP_RAZORPAY_KEY_ID || "";
};

function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const [rating, setRating] = useState(0);
const [feedback, setFeedback] = useState('');
const [reviews, setReviews] = useState([]);
const [hoveredRating, setHoveredRating] = useState(0);

  // New states for promocode functionality.
  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [finalPrice, setFinalPrice] = useState(null);

  // Buy Now handler triggers Razorpay checkout flow.
  const handleBuyNow = async () => {
    try {


      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to purchase the course.");
        navigate("/login");
        return;
      }
      // 1. Create order on the backend.
      const orderResponse = await API.post(
        "/payment/create-order",
        { courseId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const { order } = orderResponse.data;
      console.log("Order received:", order);

      // 2. Configure Razorpay options.
      const options = {
        key: getRazorpayKey(),
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "Your Course Platform",
        description: "Purchase Course",
        handler: async function (response) {
          console.log("Payment response:", response);
          // 3. Verify payment on the server.
          const verifyResponse = await API.post(
            "/payment/verify-payment",
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId,
            },
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
          console.log("Verification response:", verifyResponse.data);
          if (verifyResponse.data.success) {
            alert("Payment successful and course purchased!");
            setPurchased(true);
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: {
          // Optionally add prefill details here.
        },
      };

      console.log("Razorpay options:", options);
      if (!window.Razorpay) {
        alert("Razorpay script is not loaded. Please include the Razorpay checkout script.");
        return;
      }
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error during purchase", error);
      alert("There was an error processing your purchase.");
    }
  };
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await API.get(`/courses/${courseId}/reviews`);
        setReviews(response.data.reviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    fetchReviews();
  }, [courseId]);

  const handleSubmitReview = async () => {
    try {
      const response = await API.post(
        `/courses/${courseId}/reviews`,
        { rating, feedback },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setReviews([...reviews, response.data.review]);
      setRating(0);
      setFeedback('');
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    }
  };


  const StarRating = ({ rating, hoverable = false, onRatingChange = null }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={`text-2xl ${
              star <= (hoverable ? hoveredRating || rating : rating)
                ? 'text-yellow-400'
                : 'text-gray-400'
            }`}
            onMouseEnter={() => hoverable && setHoveredRating(star)}
            onMouseLeave={() => hoverable && setHoveredRating(0)}
            onClick={() => onRatingChange && onRatingChange(star)}
          >
            <Star className="w-6 h-6" />
          </button>
        ))}
      </div>
    );
  };


//   const promoCodeSection = `
//   <div className="promo-code-section mt-4">
//     <input 
//       type="text" 
//       value={promoCode} 
//       onChange={(e) => setPromoCode(e.target.value)} 
//       placeholder="Enter promo code" 
//       className="p-2 rounded bg-gray-800 border border-gray-600 text-white 
//                 transition-all duration-300 focus:outline-none focus:border-[#b16901]" 
//     />
//     <button 
//       onClick={handleApplyPromo} 
//       className="ml-2 bg-[#b16901] text-white px-3 py-2 rounded 
//                 hover:bg-[#c27811] transition-transform duration-300 hover:scale-105"
//     >
//       Apply
//     </button>
//     {promoMessage && (
//       <p 
//         className={`mt-2 text-sm ${
//           promoApplied ? "text-green-400" : "text-red-400"
//         }`}
//         style={{ animation: "fadeIn 0.5s ease-in-out" }}
//       >
//         {promoMessage}
//       </p>
//     )}
//   </div>
// `;



const reviewSection = `
  {purchased && (
    <div className="row mt-8">
      <div className="col-12">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-white">Leave a Review</h3>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Rating</label>
            <StarRating 
              rating={rating} 
              hoverable={true} 
              onRatingChange={setRating} 
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 border border-gray-600 
                        text-white focus:outline-none focus:border-[#b16901]"
              rows="4"
            /> </div>
          <button
            onClick={handleSubmitReview}
            className="bg-[#b16901] text-white px-4 py-2 rounded
                     hover:bg-[#c27811] transition-transform duration-300 hover:scale-105"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  )}

  <div className="row mt-8">
    <div className="col-12">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-white">Course Reviews</h3>
        {reviews.length === 0 ? (
          <p className="text-gray-400">No reviews yet</p>
        ) : (
          reviews.map((review, index) => (
                      reviews.map((review, index) => (
            <div key={index} className="mb-4 border-b border-gray-700 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={review.rating} />
                <span className="text-gray-300">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-300">{review.feedback}</p>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
`;
  // Fetch course details.
  useEffect(() => {
    // const token = localStorage.getItem("token");
    API.get(`/courses/course/${courseId}`)
      .then((res) => {
        setCourse(res.data.course);
        // Set the finalPrice initially to the discountPrice.
        setFinalPrice(res.data.course.discountPrice);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching course details:", err);
        setLoading(false);
      });
  }, [courseId]);

  // Check if the course is already purchased.
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      API.get("/user/my-courses", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          const myCourses = res.data.courses;
          const isPurchased = myCourses.some((c) => c._id === courseId);
          setPurchased(isPurchased);
        })
        .catch((err) => {
          console.error("Error fetching user profile:", err);
        });
    }
  }, [courseId]);

  // Handler for applying promo code.
  const handleApplyPromo = () => {
    // Demo promo: if the user enters "SAVE10" (case-insensitive), give an extra 10% off.
    if (promoCode.trim().toUpperCase() === "SAVE10") {
      const newPrice = (course.discountPrice * 0.9).toFixed(2);
      setFinalPrice(newPrice);
      setPromoMessage("Promo code applied! Enjoy an extra 10% discount.");
      setPromoApplied(true);
    } else {
      setPromoMessage("Invalid promo code.");
      setPromoApplied(false);
    }
  };

  if (loading) return <p>Loading course details...</p>;
  if (!course) return <p>Course not found!</p>;

  return (
    <div className="w-screen">
      <main>
        <section className="course-details-area pt-150 pb-120 pt-md-100 pb-md-70 pt-xs-100 pb-xs-70">
          <div className="container p-8">
            <div className="row">
              {/* Intro Video Section */}
              <div className="col-xxl-8 col-xl-7">
                <div className="courses-details-wrapper mb-60">
                  <div
                    className="course-details-img mb-30"
                    style={{
                      backgroundImage: `url(${course.introVideo})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="video-wrapper">
                      <a
                        href={course.introVideo}
                        className="popup-video"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <i className="fas fa-play"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assets Section */}
              <div className="col-xxl-4 col-xl-5">
                <div className="learn-area mb-30">
                  <div className="learn-box">
                    <h5>Included Assets 📚</h5>
                    <ul className="learn-list">
                      {course.includedAssets &&
                        course.includedAssets.map((asset, index) => (
                          <li key={index}>
                            <a href="#" className="!flex align-items-center gap-2">
                              <span className="play-video">
                                <Lock />
                              </span>
                              {asset}
                            </a>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Info Section */}
            <div className="row">
              <div className="col-12">
                <h2 className="courses-title mb-30">{course.courseName}</h2>
                <p>{course.description}</p>
                <h5 className="mt-20 mb-20">
                  <span>Created by</span> Instruct team
                </h5>
                <div className="date-lang">
                  <span>
                    <b>Language:</b> {course.languages && course.languages.join(", ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing & Promo Section */}
            <div className="row">
              <div className="col-xl-6 col-lg-7">
                <div className="project-details mt-35">
                  <ul className="cart-list-tag d-sm-inline-flex align-items-center mb-15">
                    <li>
                      <div className="price-list">
                        <h5>
                          {/* Display original price struck through */}
                          <span className="line-through text-gray-500">₹{course.originalPrice}</span>
                          <b className="sub-title ml-2">
                            ₹{finalPrice} {promoApplied && <span>🎉</span>}
                          </b>
                        </h5>
                      </div>
                    </li>
                  </ul>
                  {/* Promocode UI */}
                  <div className="promo-code-section mt-4">
                    <input 
                      type="text" 
                      value={promoCode} 
                      onChange={(e) => setPromoCode(e.target.value)} 
                      placeholder="Enter promo code" 
                      className="p-2 rounded border border-gray-700 transition-all duration-300 focus:outline-none focus:border-[#b16901]" 
                    />
                    <button 
                      onClick={handleApplyPromo} 
                      className="ml-2 bg-[#b16901] text-white px-3 py-2 rounded hover:bg-[#c27811] transition-transform duration-300 hover:scale-105"
                    >
                      Apply
                    </button>
                    {promoMessage && (
                      <p 
                        className={`mt-2 text-sm ${promoApplied ? "text-green-500" : "text-red-500"}`}
                        style={{ animation: "fadeIn 0.5s ease-in-out" }}
                      >
                        {promoMessage}
                      </p>
                    )}
                  </div>
                  <div className="cart-btn offer_btn mt-4">




                    {purchased ? (
                      <div onClick={() => navigate(`/course-content/${courseId}`)}>
                        View Course
                      </div>
                    ) : (

                      <div onClick={handleBuyNow}>Buy Now 🎓</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default CourseDetail;
