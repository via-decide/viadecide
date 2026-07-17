/* Premium Article Interactivity Framework */

document.addEventListener('DOMContentLoaded', () => {
  initProgressBar();
  initStickyTOC();
  initCodeCopyButtons();
  initSmoothScroll();
});

function initProgressBar() {
  const progressBar = document.createElement('div');
  progressBar.id = 'progress-bar';
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const scrollPercent = scrollTop / (docHeight - winHeight);
    progressBar.style.width = Math.min(100, Math.max(0, scrollPercent * 100)) + '%';
  });
}

function initStickyTOC() {
  const tocContainer = document.querySelector('.premium-toc-container');
  if (!tocContainer) return;

  const headings = Array.from(document.querySelectorAll('.premium-content h2, .premium-content h3'));
  if (headings.length === 0) return;

  const tocEl = document.createElement('div');
  tocEl.className = 'sticky-toc';
  
  const tocTitle = document.createElement('h4');
  tocTitle.textContent = 'On this page';
  tocEl.appendChild(tocTitle);

  const list = document.createElement('ul');
  
  headings.forEach((heading, index) => {
    if (!heading.id) {
      heading.id = 'heading-' + index + '-' + heading.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    
    const li = document.createElement('li');
    li.style.marginLeft = heading.tagName === 'H3' ? '16px' : '0';
    
    const a = document.createElement('a');
    a.href = '#' + heading.id;
    a.textContent = heading.textContent;
    a.className = 'toc-link';
    a.dataset.targetId = heading.id;
    
    li.appendChild(a);
    list.appendChild(li);
  });

  tocEl.appendChild(list);
  tocContainer.appendChild(tocEl);

  // Intersection Observer for highlighting active TOC item
  const observerOptions = {
    root: null,
    rootMargin: '-10% 0px -80% 0px',
    threshold: 1.0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.toc-link').forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(\`.toc-link[data-target-id="\${entry.target.id}"]\`);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }, observerOptions);

  headings.forEach(heading => observer.observe(heading));
}

function initCodeCopyButtons() {
  const preBlocks = document.querySelectorAll('pre');
  preBlocks.forEach(pre => {
    // Check if it's already wrapped
    if (pre.parentNode.classList.contains('code-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper';
    
    const header = document.createElement('div');
    header.className = 'code-header';
    
    // Attempt to extract language class (e.g. language-js)
    let lang = 'CODE';
    if (pre.children.length > 0 && pre.children[0].tagName === 'CODE') {
      const codeClass = pre.children[0].className;
      const match = codeClass.match(/language-(\w+)/);
      if (match) lang = match[1].toUpperCase();
    }
    
    const langSpan = document.createElement('span');
    langSpan.textContent = lang;
    header.appendChild(langSpan);
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(pre.textContent).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy', 2000);
      });
    };
    header.appendChild(copyBtn);
    
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(header);
    wrapper.appendChild(pre);
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      if (this.getAttribute('href') === '#') return;
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

function shareArticle() {
  if (navigator.share) {
    navigator.share({
      title: document.title,
      url: window.location.href
    }).catch(console.error);
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert('Article link copied to clipboard!');
  }
}
window.shareArticle = shareArticle;
