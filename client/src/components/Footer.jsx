import React from 'react';
import { Youtube, Send, Linkedin, MessageCircleMore } from 'lucide-react';

function Footer() {
  return (
    <footer className="footer-area pt-70 pb-40">
      <div className="container">
        <div className="row mb-15">
          <div className="col-xl-3 col-lg-4 col-md-6 wow fadeInUp2 animated" data-wow-delay='.1s'>
            <div className="footer__widget mb-30">
              <div className="footer-log mb-20">
                <a href="index.html" className="logo">
                  <img src="assets/img/logo/main logoo.svg" alt="Instruct Logo" />
                </a>
              </div>
              <p>"The goal of education is not to teach the facts, but to teach how to think critically and observe the world."- Founder</p>
              <div className="social-media footer__social mt-30">
                <a href="https://www.youtube.com/@Instruct-edu?sub_confirmation=1" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></a>
                <a href="https://t.me/instructedu" target="_blank" rel="noopener noreferrer"><i className="fab fa-telegram-plane"></i></a>
                <a href="https://whatsapp.com/channel/0029VapAEFwIt5rn5nNfnx05" target="_blank" rel="noopener noreferrer"><i className="fab fa-whatsapp"></i></a>
                <a href="https://www.linkedin.com/in/instruct-edu-a81329333/" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></a>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-4 col-md-6 wow fadeInUp2 animated" data-wow-delay='.3s'>
            <div className="footer__widget mb-30 pl-40 pl-md-0 pl-xs-0">
              <h6 className="widget-title mb-35">Contact us</h6>
              <ul className="fot-list">
                <li><a href="mailto:contact@instructedu.in">contact@instructedu.in</a></li>
                <li><a href="terms.html">Terms & Conditions</a></li>
                <li><a href="privacy.policy.html">Privacy Policy</a></li>
                <li><a href="contact.html">Contacts</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="copy-right-area border-bot pt-40">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-12">
                <div className="copyright text-center">
                  <h5>Copyright@ 2024 <a href="login2.html">Instruct</a>. All Rights Reserved</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;