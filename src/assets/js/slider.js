(function () {
  function setupSlider(slider) {
    const slides = Array.from(slider.querySelectorAll('.slide'));
    const prev = slider.querySelector('.slider-prev');
    const next = slider.querySelector('.slider-next');
    const dotsContainer = slider.querySelector('.slider-dots');
    let current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
      Array.from(dotsContainer.children).forEach((dot, i) => dot.classList.toggle('is-active', i === current));
    }

    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `slider-dot${index === 0 ? ' is-active' : ''}`;
      dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
      dot.addEventListener('click', () => showSlide(index));
      dotsContainer.appendChild(dot);
    });

    prev.addEventListener('click', () => showSlide(current - 1));
    next.addEventListener('click', () => showSlide(current + 1));
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-slider]').forEach(setupSlider);
  });
})();
