// Restore theme on load
if (localStorage.getItem('vd-theme') === 'light') {
  document.documentElement.classList.add('light-mode');
}

// Ensure DOM is loaded before binding listeners
document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle
  const btnTheme = document.getElementById('btnTheme');
  if (btnTheme) {
    btnTheme.addEventListener('click', () => {
      document.documentElement.classList.toggle('light-mode');
      localStorage.setItem('vd-theme', 
        document.documentElement.classList.contains('light-mode') ? 'light' : 'dark'
      );
    });
  }

  // Language toggle
  let currentLang = localStorage.getItem('vd-lang') || 'en';
  const btnTranslate = document.getElementById('btnTranslate');
  if (btnTranslate) {
    btnTranslate.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'hi' : 'en';
      localStorage.setItem('vd-lang', currentLang);
      location.reload(); // Or re-render if content is dynamic
    });
  }

  // Undo translation
  const btnUndoTranslate = document.getElementById('btnUndoTranslate');
  if (btnUndoTranslate) {
    btnUndoTranslate.addEventListener('click', () => {
      currentLang = 'en';
      localStorage.setItem('vd-lang', currentLang);
      location.reload();
    });
  }
});

// Toast system
window.showToast = function(message, duration = 4000) {
  const toast = document.getElementById('translationToast');
  if (!toast) return;
  const msgElem = document.getElementById('toastMsg');
  if (msgElem) msgElem.textContent = message;
  toast.classList.add('is-visible');
  setTimeout(() => toast.classList.remove('is-visible'), duration);
};

// Intersection observer for section tracking
window.initSectionTracking = function(container, scrollContainer) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-active');
          const idx = parseInt(entry.target.getAttribute('data-index'));
          const total = document.querySelectorAll('.section-wrapper').length;
          
          const secLabel = document.getElementById('secLabel');
          if (secLabel && !isNaN(idx)) {
            secLabel.textContent = `SEC ${idx + 1}/${total}`;
          }
          
          const secName = document.getElementById('secName');
          const nameAttr = entry.target.getAttribute('data-name');
          if (secName && nameAttr) {
            secName.textContent = nameAttr;
          }
        }
      });
    },
    { root: container, threshold: 0.6 }
  );
  
  document.querySelectorAll('.section-wrapper').forEach(w => observer.observe(w));
};
