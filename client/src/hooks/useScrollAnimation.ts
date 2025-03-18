import React, { useEffect } from 'react';

function useScrollAnimation() {
  useEffect(() => {
    const elements = document.querySelectorAll('.scroll-fade-in');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show');
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}


export default useScrollAnimation;