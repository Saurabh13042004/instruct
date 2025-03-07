import React from 'react';


function Contact() {
    return (
        <div>
            {/* preloader end  */}

            {/* slide-bar start */}

            <div className="body-overlay" />
            {/* slide-bar end */}
            <main>
                {/* page-title-area start*/}
                {/* <section>
            <div class="container">
                <div class="row align-items-end">
                    <div class="col-lg-12">
                        <div class="page-title-wrapper mb-50">
                           <h1 class="page-title mb-25">Contact Us</h1>
                           <div class="breadcrumb-list">
                              <ul class="breadcrumb">
                                  <li><a href="index.html">Home - </a></li>
                                  <li><a href="#"> Contact</a></li>
                              </ul>
                           </div>
                      </div>
                    </div>
                </div>
            </div>
        </section> */}
                {/*page-title-area end    */}
                {/*contact-us-area start*/}
                <section className="contact-us-area pt-150 pb-120 pt-md-100 pt-xs-100 pb-md-70 pb-xs-70">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-xl-6 col-lg-6">
                                <div className="contact-img mb-30">
                                    <img className="puzzlecontact" src="assets/img/icon/puzzle.svg" alt="" />
                                    <img className="img-fluid" src="assets/img/contact/phone.svg " alt="" />
                                </div>
                            </div>
                            <div className="col-xl-6 col-lg-6">
                                <div className="contact-wrapper pl-75 mb-30">
                                    <div className="section-title mb-30">
                                        <h2>Get In Touch With Us</h2>
                                        <p>Reach out to us using these options </p>
                                    </div>
                                    <div className="single-contact-box mb-30">
                                        <div className="contact__iocn">
                                            <a href="https://t.me/instruct_support" target="_blank"><img src="assets/img/icon/tele.svg" alt="" /></a>
                                        </div>
                                        <div>
                                            <h5 className="contact__text"> Connect personally on </h5>  <a style={{ color: '#b16901' }} className="highlight-text" href="https://t.me/instruct_support">Telegram</a>
                                        </div>
                                    </div>
                                    <div className="single-contact-box cb-2 mb-30">
                                        <div className="contact__iocn">
                                        <img src="assets/img/icon/phone-alt.svg" alt=""/>
                                        </div>
                                        <div className="contact__text">
                                            <h5>+91 08062180973 </h5>
                                        </div>
                                    </div>
                                    <div className="single-contact-box cb-3 mb-30">
                                        <div className="contact__iocn">
                                            <img src="assets/img/icon/feather-mail.svg" alt="" />
                                        </div>
                                        <div className="contact__text">
                                            <h5> <a href="mailto:contact@instructedu.in"> contact@instructedu.in </a> </h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/*contact-us-area end*/}
                {/* contact-form-area start*/}
                {/* <section class="contact-form-area pt-150 pb-120 pt-md-100 pt-xs-100 pb-md-70 pb-xs-70">
            <div class="container">
                <div class="row align-items-center">
                    <div class="col-lg-6">
                      <div class="contact-form-wrapper mb-30">
                          <h2 class="mb-45">Contact Us</h2>
                          <form action="#" class="row gx-3 comments-form contact-form">
                              <div class="col-lg-6 col-md-6 mb-30">
                                  <input type="text" placeholder="Full Name">
                              </div>
                              <div class="col-lg-6 col-md-6 mb-30">
                                  <input type="text" placeholder="Last Name">
                              </div>
                              <div class="col-lg-6 col-md-6 mb-30">
                                  <input type="text" placeholder="Phone Number">
                              </div>
                              <div class="col-lg-6 col-md-6 mb-30">
                                  <input type="text" placeholder="Address">
                              </div>
                              <div class="col-lg-12 mb-30">
                                  <input type="text" placeholder="Email Name">
                              </div>
                              <div class="col-lg-12 mb-30">
                                  <textarea name="commnent" id="commnent" cols="30" rows="10" placeholder="Write a Message"></textarea>
                              </div>
                          </form>
                          <button class="theme_btn message_btn mt-20">Send Message</button>
                      </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="contact-img contact-img-02 mb-30">
                            <img class="img-fluid" src="assets/img/contact/02.jpg" alt="">
                        </div>
                    </div>
                </div>
            </div>
        </section> */}
                {/*contact-form-area end */}
            </main>
            {/*footer-area start*/}
            <footer className="footer-area pt-70 pb-40">
                <div className="container">
                    <div className="row mb-15">
                        <div className="col-xl-3 col-lg-4 col-md-6  wow fadeInUp2 animated" data-wow-delay=".1s">
                            <div className="footer__widget mb-30">
                                <div className="footer-log mb-20">
                                    <a href="index.html" className="logo">
                                        <img src="assets/img/logo/main logoo.svg" alt="" />
                                    </a>
                                </div>
                                <p>"The goal of education is not to teach the facts, but to teach how to think critically and observe the world."- Founder</p>
                                <div className="social-media footer__social mt-30">
                                    <a href="https://www.youtube.com/@Instruct-edu?sub_confirmation=1" target="_blank"><i className="fab fa-youtube-YT" /></a>
                                    <a href="https://t.me/instructedu" target="_blank"><i className="fab fa-telegram-plane" /></a>
                                    <a href="https://whatsapp.com/channel/0029VapAEFwIt5rn5nNfnx05" target="_blank"><i className="fab fa-whatsapp" /></a>
                                    <a href="https://www.linkedin.com/in/instruct-edu-a81329333/" target="_blank"><i className="fab fa-linkedin-in" /></a>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-md-6 wow fadeInUp2 animated" data-wow-delay=".3s">
                            <div className="footer__widget mb-30 pl-40 pl-md-0 pl-xs-0">
                                <h6 className="widget-title mb-35">Contact us</h6>
                                <ul className="fot-list">
                                    <li><a href="mailto:contact@instructedu.in"> contact@instructedu.in </a></li>
                                    <li><a href="terms.html">Terms &amp; Conditions</a></li>
                                    <li><a href="privacy.policy.html">Privacy Policy</a></li>
                                    <li><a href="contact.html">Contacts</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="copy-right-area border-bot pt-40">
                            <div className="container">
                                <div className="row align-items-center">
                                    <div className="col-lg-12">
                                        <div className="copyright text-center">
                                            <h5>Copyright@ 2024 <a href="index.html">Instruct </a>. All Rights Reserved</h5>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div></div></footer>
            {/*footer-area end*/}
            {/* JS here */}
        </div>
    );
}


export default Contact;