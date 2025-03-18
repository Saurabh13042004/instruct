import React from 'react';
// 1) Import Swiper & modules
import { Swiper, SwiperSlide } from 'swiper/react';
import { BookAIcon, BookOpen } from 'lucide-react';
// 2) Import ONLY what you need from 'swiper/modules'
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// 3) Import Swiper styles
import 'swiper/css';              // core Swiper CSS
import 'swiper/css/navigation';   // Navigation module
import 'swiper/css/pagination';   // Pagination module
import 'swiper/css/autoplay';     // Autoplay module


function HomePage() {
  return (
    <>
      <main className="w-screen">
        {/* --------------------------------
            Slider Section (Hero / Banner)
        -------------------------------- */}
        <section className="slider-area pt-180 pt-xs-150 pt-150 pb-xs-35">
          <img className="sl-shape shape_01" src="./assets/img/icon/01.svg" alt="" />
          <img className="sl-shape shape_02" src="assets/img/icon/puzzle.svg" alt="" />
          <img className="sl-shape shape_03" src="assets/img/icon/03.svg" alt="/" />
          <img className="sl-shape shape_04" src="assets/img/icon/04.svg" alt="" />
          <img className="sl-shape shape_05" src="assets/img/icon/05.svg" alt="" />
          <img className="sl-shape shape_06" src="assets/img/icon/puzzle.svg" alt="/" />
          <img className="sl-shape shape_07" src="assets/img/shape/dot-box-5.svg" alt="" />

          <div className="main-slider pt-10">
            <div className="container">
              <div className="row align-items-center">
                {/* Left Image/Video */}
                <div className="col-xl-6 col-lg-6 order-last order-lg-first">
                  <div className="slider__img__box mb-50 pr-30">
                    <video
                      className="img-one mt-150 pr-0"
                      id="videop"
                      src="assets/img/video/4K_Render (1).webm"
                      muted
                      loop
                      autoPlay
                      playsInline
                    >
                      Your browser does not support.
                    </video>
                    <img className="slide-shape img-two" src="../assets/img/icon/dot-plan-1.svg" alt="" />
                    <img className="slide-shape img-three" src="./assets/img/shape/target.svg" alt="" />
                    <img className="slide-shape img-four" src="./assets/img/shape/dot-box-1.svg" alt="" />
                    <img className="slide-shape img-five" src="./assets/img/shape/dot-box-2.svg" alt="" />
                    <img className="slide-shape img-six" src="./assets/img/shape/zigzg-1.svg" alt="" />
                    <img
                      className="slide-shape img-seven wow fadeInRight animated"
                      data-delay="1.5s"
                      src="assets/img/shape/zigzg-1.svg"
                      alt=""
                    />
                    <img className="slide-shape img-eight" src="./assets/img/slider/earth-bg.svg" alt="" />
                  </div>
                </div>
                {/* Right Text Content */}
                <div className="col-xl-6 col-lg-6">
                  <div className="slider__content pt-15">
                    <h1
                      className="main-title mb-40 wow fadeInUp2 animated"
                      data-wow-delay=".1s"
                    >
                      Learn Lead Excel <br />
                      with
                      <span className="vec-shape">
                        <img src="assets/img/logo/instvec.svg" alt="" />
                      </span>
                    </h1>
                    <h5
                      className="mb-35 wow fadeInUp2 animated"
                      data-wow-delay=".2s"
                    >
                      Our courses emphasize critical thinking and real-world application,
                      preparing students to analyze, question, and engage effectively with the world.
                    </h5>
                    <p className="highlight-text">
                      <span>Be #1</span> Begin your educational journey today.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --------------------------------
            Features Carousel Section
        -------------------------------- */}
        <section className="great-deal-area pt-150 pb-90 pt-md-100 pb-md-40 pt-xs-100 pb-xs-40">
          <div className="container">
            <div className="row justify-content-lg-center justify-content-start">
              <div className="col-xl-3 col-lg-8">
                <div className="deal-box mb-30 text-center text-xl-start">
                  <h2 className="mb-20">
                    <b>Features</b> You'll Love The Most
                  </h2>
                  <p className="sub-sub-title">
                    Discover what sets our courses apart— creative-designed content,
                    interactive tools, and much more
                  </p>
                </div>
              </div>
              <div className="col-xl-8">
                {/* 
                  Swiper Carousel for Features 
                  We'll enable navigation & autoplay via modules
                */}
                <Swiper
                  modules={[Autoplay]}
                  spaceBetween={30}
                  slidesPerView={3}
                  navigation={false}
                  loop
                  speed={500}
                  autoplay={{ delay: 3000, disableOnInteraction: false }}
                  breakpoints={{
                    0: { slidesPerView: 1 },
                    576: { slidesPerView: 2 },
                    992: { slidesPerView: 3 },
                  }}
                  className="mb-30"
                >
                  <SwiperSlide>
                    <div className="single-box mb-30">
                      <div className="single-box__icon mb-25">
                        <img src="assets/img/icon/creative.svg" alt="" />
                      </div>
                      <h4 className="sub-title mb-20">Creative Content</h4>
                      <p className="sub-sub-title">
                        We blend visuals and real-world examples for engagement.
                      </p>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide>
                    <div className="single-box s-box2 mb-30">
                      <div className="single-box__icon mb-25">
                        <img src="assets/img/icon/community.svg" alt="" />
                      </div>
                      <h4 className="sub-title mb-20">Community Access</h4>
                      <p className="sub-sub-title">
                        Connect with community and discuss with peers and experts.
                      </p>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide>
                    <div className="single-box s-box3 mb-30">
                      <div className="single-box__icon mb-25">
                        <img src="assets/img/icon/problem solving.svg" alt="" />
                      </div>
                      <h4 className="sub-title mb-20">Practical Exercises</h4>
                      <p className="sub-sub-title">
                        The more you use it, the better you'll recall it.
                      </p>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide>
                    <div className="single-box mb-30">
                      <div className="single-box__icon mb-25">
                        <img src="assets/img/icon/studymaterial1.svg" alt="" />
                      </div>
                      <h4 className="sub-title mb-20">Course Materials</h4>
                      <p className="sub-sub-title">
                        All-inclusive materials and simulations provided.
                      </p>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide>
                    <div className="single-box s-box2 mb-30">
                      <div className="single-box__icon mb-25">
                        <img src="assets/img/icon/Instruct.svg" alt="" />
                      </div>
                      <h4 className="sub-title mb-20">Quality Instructors</h4>
                      <p className="sub-sub-title">
                        Instructors that Empower Minds and Inspire Excellence.
                      </p>
                    </div>
                  </SwiperSlide>
                </Swiper>
              </div>
            </div>
          </div>
        </section>

        {/* --------------------------------
            What Are You Looking For?
        -------------------------------- */}
        <section className="what-looking-for pos-rel">
          <div className="what-blur-shape-one"></div>
          <div className="what-blur-shape-two"></div>
          <div className="what-look-bg gradient-bg pt-145 pb-130 pt-md-95 pb-md-80 pt-xs-95 pb-xs-80">
            <div id="courses" className="container">
              <div className="row justify-content-center">
                <div className="col-lg-8">
                  <div className="section-title text-center mb-55">
                    <h5 className="bottom-line mb-25">Our Courses</h5>
                    <h2>What you Looking For?</h2>
                  </div>
                </div>
              </div>
              <div className="row mb-85">
                <div className="col-xl-6 col-lg-6 col-md-6">
                  <div
                    className="what-box text-center mb-35 wow fadeInUp2 animated"
                    data-wow-delay=".3s"
                  >
                    <div className="what-box__icon mb-30">
                      <img src="assets/img/slider/1.svg" alt="" />
                    </div>
                    <h3>Vision</h3>
                    <p>
                      "The only thing worse than being blind <br />
                      is having sight but no vision."
                      <br />
                      ~ Helen Keller
                    </p>
                    <a href="course-details.html" className="theme_btn border_btn">
                      Explore Now
                    </a>
                  </div>
                </div>
                <div className="col-xl-6 col-lg-6 col-md-6">
                  <div
                    className="what-box flex flex-col items-center justify-center text-center mb-35 wow fadeInUp2 animated"
                    data-wow-delay=".3s"
                  >
                    <div className="what-box__icon mb-30" />
                    <img src="assets/img/slider/more courses.svg" alt="" />
                    <h3>More Courses Offered by us</h3>
                    <a href="coming soon.html" className="theme_btn border_btn">
                      Explore Now
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --------------------------------
            Why Choose Us
        -------------------------------- */}
        <div className="why-chose-section-wrapper gradient-bg mr-100 ml-100">
          <section className="why-chose-us">
            <div className="why-chose-us-bg pt-150 pb-175 pt-md-95 pb-md-90 pt-xs-95 pb-xs-90">
              <div className="container">
                <div className="row align-items-center">
                  <div className="col-xl-7 col-lg-7">
                    <div className="chose-img-wrapper mb-50 pos-rel">
                      <div className="feature tag_01">
                      <span className="flex items-center justify-center w-full h-full">
                          <BookAIcon size={24} className="text-current" />
                        </span>
                        Quality education
                      </div>
                      <div className="feature tag_02">
                        <span className="flex items-center justify-center w-full h-full">
                          <BookOpen size={24} className="text-current" />
                        </span>
                        Quality Material
                      </div>
                      <div className="video-wrapper">
                        <a
                          href="https://www.youtube.com/watch?v=7omGYwdcS04"
                          className="popup-video"
                        >
                          <i className="fas fa-play"></i>
                        </a>
                      </div>
                      <div className="img-bg pos-rel">
                        <img
                          className="chose_05 pl-70 pl-lg-0 pl-md-0 pl-xs-0"
                          src="assets/img/chose/why-2.svg"
                          alt="Chose-img"
                        />
                      </div>
                      <img
                        className="chose chose_06"
                        src="../assets/img/shape/dot-box3.svg"
                        alt="Chose-img"
                      />
                    </div>
                  </div>
                  <div className="col-xl-5 col-lg-5">
                    <div className="chose-wrapper pl-25 pl-lg-0 pl-md-0 pl-xs-0">
                      <div
                        className="section-title mb-30 wow fadeInUp2 animated"
                        data-wow-delay=".1s"
                      >
                        <h5 className="bottom-line mb-25">Explore Instruct</h5>
                        <h2 className="mb-25">Why Choose Us?</h2>
                        <p>
                          Our main goal is to provide practical, transformative education
                          that equips students with real-world skills. While passing exams
                          is important, mastering concepts for lifelong learning is our priority.
                        </p>
                      </div>
                      <ul
                        className="text-list mb-40 wow fadeInUp2 animated"
                        data-wow-delay=".2s"
                      >
                        <li>
                          Self-Paced Learning - Progress at a comfortable speed
                          without deadlines.
                        </li>
                        <li>
                          Supplemental Resources - Access additional readings,
                          tools, and materials.
                        </li>
                        <li>
                          Progressive Skill Building - Develop skills step-by-step
                          from basic to advanced levels
                        </li>
                      </ul>
                      <a
                        href="about.html"
                        className="theme_btn wow fadeInUp2 animated"
                        data-wow-delay=".3s"
                      >
                        More Details
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* --------------------------------
            Testimonial Carousel Section
        -------------------------------- */}
        <section className="testimonial-area testimonial-pad pt-150 pb-120 pt-md-95 pb-md-70 pt-xs-95 pb-xs-70">
          <div className="container custom-container-testimonial">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <div className="section-title text-center text-md-start mb-35">
                  <h2 className="mb-25">Our driving forces</h2>
                </div>
              </div>
            </div>

            {/*
              Swiper Carousel for Testimonials 
            */}
            <Swiper
              modules={[Autoplay]}
              spaceBetween={30}
              slidesPerView={3}
              navigation={false}
              loop
              speed={500}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
              }}
              breakpoints={{
                0: { slidesPerView: 1 },
                576: { slidesPerView: 2 },
                992: { slidesPerView: 3 },
              }}
              className="testimonial-active-01 mt-4"
            >
              {/* Slide 1 */}
              <SwiperSlide>
                <div className="testimonial-wrapper mb-30">
                  <div className="testimonial-authors overflow-hidden mb-15">
                    <div className="testimonial-authors__avatar">
                      <img
                        src="assets/img/testimonial/ambedkar.svg"
                        alt="testi-author"
                      />
                    </div>
                    <div className="testimonial-authors__content mt-10">
                      <h4 className="sub-title">Dr. B.R. Ambedkar</h4>
                    </div>
                  </div>
                  <p>
                    "Cultivation of mind should be the ultimate aim of human existence."
                  </p>
                  <div className="quote-icon mt-20">
                    <img src="assets/img/icon/quote.svg" alt="quote-icon" />
                  </div>
                </div>
              </SwiperSlide>

              {/* Slide 2 */}
              <SwiperSlide>
                <div className="testimonial-wrapper mb-30">
                  <div className="testimonial-authors overflow-hidden mb-15">
                    <div className="testimonial-authors__avatar">
                      <img
                        src="assets/img/testimonial/nheru.svg"
                        alt="testi-author"
                      />
                    </div>
                    <div className="testimonial-authors__content mt-10">
                      <h4 className="sub-title">Shri Jawaharlal Nehru</h4>
                    </div>
                  </div>
                  <p>
                    "The most important thing that education can give us is the ability
                    to think and reason for ourselves."
                  </p>
                  <div className="quote-icon mt-20">
                    <img src="assets/img/icon/quote.svg" alt="quote-icon" />
                  </div>
                </div>
              </SwiperSlide>

              {/* Slide 3 */}
              <SwiperSlide>
                <div className="testimonial-wrapper mb-30">
                  <div className="testimonial-authors overflow-hidden mb-15">
                    <div className="testimonial-authors__avatar">
                      <img
                        src="assets/img/testimonial/socrates.svg"
                        alt="testi-author"
                      />
                    </div>
                    <div className="testimonial-authors__content mt-10">
                      <h4 className="sub-title">Socrates</h4>
                    </div>
                  </div>
                  <p>"I cannot teach anybody anything, I can only make them think."</p>
                  <div className="quote-icon mt-20">
                    <img src="assets/img/icon/quote.svg" alt="quote-icon" />
                  </div>
                </div>
              </SwiperSlide>

              {/* Slide 4 */}
              <SwiperSlide>
                <div className="testimonial-wrapper mb-30">
                  <div className="testimonial-authors overflow-hidden mb-15">
                    <div className="testimonial-authors__avatar">
                      <img
                        src="assets/img/testimonial/kalam.svg"
                        alt="testi-author"
                      />
                    </div>
                    <div className="testimonial-authors__content mt-10">
                      <h4 className="sub-title">Dr. APJ Abdul Kalam</h4>
                    </div>
                  </div>
                  <p>
                    "Dream is not that which you see while sleeping, it is something
                    that does not let you sleep."
                  </p>
                  <div className="quote-icon mt-20">
                    <img src="assets/img/icon/quote.svg" alt="quote-icon" />
                  </div>
                </div>
              </SwiperSlide>

              {/* Slide 5 */}
              <SwiperSlide>
                <div className="testimonial-wrapper mb-30">
                  <div className="testimonial-authors overflow-hidden mb-15">
                    <div className="testimonial-authors__avatar">
                      <img
                        src="assets/img/testimonial/albert.svg"
                        alt="testi-author"
                      />
                    </div>
                    <div className="testimonial-authors__content mt-10">
                      <h4 className="sub-title">Albert Einstein</h4>
                    </div>
                  </div>
                  <p>
                    "Education is not the learning of facts, but the training of the mind to think."
                  </p>
                  <div className="quote-icon mt-20">
                    <img src="assets/img/icon/quote.svg" alt="quote-icon" />
                  </div>
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </section>
      </main>
    </>
  );
}

export default HomePage;
