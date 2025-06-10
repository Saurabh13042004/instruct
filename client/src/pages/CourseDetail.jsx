import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api";
import axios from "axios";
import { Lock } from "lucide-react";
import { Star, StarHalf } from 'lucide-react';
import ReactPlayer from 'react-player/youtube'; // Import the YouTube player
import Loader from '../components/Loader';
import Modal from 'react-modal';
import { toast } from 'react-hot-toast';


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
  const [videoPlaying, setVideoPlaying] = useState(false);

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
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Updated Buy Now handler
  const handleBuyNow = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to purchase the course.");
        // Instead of navigating, dispatch a custom event to open login modal
        const event = new CustomEvent('openLoginModal');
        window.dispatchEvent(event);
        return;
      }

      setIsProcessingPayment(true);
      setShowPaymentModal(true);

      // 1. Create order on the backend
      const orderResponse = await API.post(
        "/payment/create-order",
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { order } = orderResponse.data;

      // 2. Configure Razorpay options
      const options = {
        key: getRazorpayKey(),
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "Instruct",
        description: course.courseName,
        image: "https://instructedu.s3.eu-north-1.amazonaws.com/main+logoo.svg",
        handler: async function (response) {
          try {
            // 3. Verify payment on the server
            const verifyResponse = await API.post(
              "/payment/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                courseId,
                promocodeId: orderResponse.data.appliedPromocode
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyResponse.data.success) {
              toast.success("Payment successful! Course purchased.");
              setPurchased(true);
              setShowPaymentModal(false);
              // Remove the page reload and instead update the state
              setPromoCode("");
              setPromoMessage("");
              setPromoApplied(false);
              setFinalPrice(course.discountPrice);
              // Refresh the course status
              const myCoursesResponse = await API.get("/user/my-courses", {
                headers: { Authorization: `Bearer ${token}` }
              });
              const myCourses = myCoursesResponse.data.courses;
              const isPurchased = myCourses.some((c) => c._id === courseId);
              setPurchased(isPurchased);
            } else {
              toast.error("Payment verification failed.");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Error verifying payment. Please contact support.");
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: localStorage.getItem("userName") || "",
          email: localStorage.getItem("userEmail") || "",
          contact: localStorage.getItem("userPhone") || "",
        },
        theme: {
          color: "#b16901"
        },
        modal: {
          ondismiss: function() {
            setShowPaymentModal(false);
            setIsProcessingPayment(false);
          }
        }
      };

      if (!window.Razorpay) {
        toast.error("Payment system is not available. Please try again later.");
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error during purchase:", error);
      toast.error("Error processing payment. Please try again.");
      setShowPaymentModal(false);
      setIsProcessingPayment(false);
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

  // Updated handler for applying promo code
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    setIsApplyingPromo(true);
    try {
      const response = await API.post("/courses/validate-promocode", {
        code: promoCode.trim(),
        courseId
      });

      if (response.data.success) {
        setFinalPrice(response.data.discountedPrice);
        setPromoApplied(true);
        setPromoMessage(`Promo code applied! You saved ${response.data.discountPercentage}%`);
        toast.success("Promo code applied successfully!");
      } else {
        setPromoApplied(false);
        setPromoMessage(response.data.message || "Invalid promo code");
        toast.error(response.data.message || "Invalid promo code");
      }
    } catch (error) {
      setPromoApplied(false);
      setPromoMessage(error.response?.data?.message || "Error applying promo code");
      toast.error(error.response?.data?.message || "Error applying promo code");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  // Handler to remove applied promo code
  const handleRemovePromo = () => {
    setPromoCode("");
    setPromoMessage("");
    setPromoApplied(false);
    setFinalPrice(course.discountPrice);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-400">Course not found!</p>
      </div>
    );
  }

  return (
    <div className="w-[98vw]">
      <main>
        <section className="course-details-area pt-150 pb-120 pt-md-100 pb-md-70 pt-xs-100 pb-xs-70">
          <div className="container p-8">
            <div className="row">
              {/* Intro Video Section */}
              <div className="col-xxl-8 col-xl-7">
                <div className="courses-details-wrapper mb-60">
                  <div
                    className="course-details-img mb-30"
                  >
                    <ReactPlayer
                      url={course.introVideo}
                      width="100%"
                      height="400px"
                      controls={true}
                      light={true} // This shows a thumbnail before playing
                      playing={videoPlaying}
                      onPlay={() => setVideoPlaying(true)}
                      onPause={() => setVideoPlaying(false)}
                      config={{
                        youtube: {
                          playerVars: { showinfo: 1 }
                        }
                      }}
                    />
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
                  <span className="text-gray-400">
                    Language: {course.languages && course.languages.join(", ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Updated Pricing & Promo Section */}
            <div className="row">
              <div className="col-xl-6 col-lg-7">
                <div className="project-details mt-35">
                  {!purchased && (
                    <>
                      <ul className="cart-list-tag d-sm-inline-flex align-items-center mb-15">
                        <li>
                          <div className="price-list">
                            <h5>
                              <span className="line-through text-gray-500">₹{course.originalPrice}</span>
                              <b className="sub-title ml-2">
                                ₹{finalPrice || course.discountPrice} {promoApplied && <span>🎉</span>}
                              </b>
                            </h5>
                          </div>
                        </li>
                      </ul>
                      
                      {/* Only show promo code section if course is not purchased */}
                      <div className="promo-code-section mt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h6 className="text-white">Apply Promo Code</h6>
                          {promoApplied && (
                            <button
                              onClick={handleRemovePromo}
                              className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={promoCode} 
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())} 
                            placeholder="Enter promo code" 
                            className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 text-white 
                                      transition-all duration-300 focus:outline-none focus:border-[#b16901]" 
                            disabled={promoApplied || isApplyingPromo}
                          />
                          <button 
                            onClick={handleApplyPromo} 
                            className="px-4 py-2 bg-[#b16901] text-white rounded hover:bg-[#c27811] 
                                     transition-all duration-300 hover:scale-105 disabled:opacity-50 
                                     disabled:cursor-not-allowed min-w-[100px] flex items-center justify-center"
                            disabled={!promoCode.trim() || promoApplied || isApplyingPromo}
                          >
                            {isApplyingPromo ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : promoApplied ? (
                              "Applied"
                            ) : (
                              "Apply"
                            )}
                          </button>
                        </div>
                        {promoMessage && (
                          <p 
                            className={`mt-2 text-sm ${promoApplied ? "text-green-500" : "text-red-500"}`}
                            style={{ animation: "fadeIn 0.5s ease-in-out" }}
                          >
                            {promoMessage}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  <div className="cart-btn offer_btn mt-4">
                    {purchased ? (
                      <div 
                        onClick={() => navigate(`/course-content/${courseId}`)}
                        className="w-full  text-center  text-white rounded-lg 
                                  transition-all duration-300 cursor-pointer"
                      >
                        View Course
                      </div>
                    ) : (
                      <div 
                        onClick={handleBuyNow}
                        className="w-full  text-center  text-white rounded-lg 
                                  transition-all duration-300 cursor-pointer"
                      >
                        Buy Now 🎓
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Processing Modal */}
        <Modal
          isOpen={showPaymentModal}
          onRequestClose={() => {
            if (!isProcessingPayment) {
              setShowPaymentModal(false);
            }
          }}
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
          contentLabel="Payment Processing"
        >
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-auto text-center">
            {isProcessingPayment ? (
              <>
                <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-white mb-2">Processing Payment</h3>
                <p className="text-gray-400">Please complete the payment in the popup window.</p>
                <p className="text-gray-400 text-sm mt-2">Do not close this window until the payment is complete.</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-white mb-2">Payment Cancelled</h3>
                <p className="text-gray-400">Your payment was cancelled. You can try again.</p>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </Modal>
      </main>
    </div>
  );
}

export default CourseDetail;
