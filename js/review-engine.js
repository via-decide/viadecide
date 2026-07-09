/**
 * IDE-Style Inline Review System Engine
 * Connects to /api/reviews for persistence.
 */

class ReviewEngine {
  constructor() {
    this.documentId = window.location.pathname.replace(/[^a-zA-Z0-9]/g, '_') || 'home';
    this.threads = {};
    this.activeParagraphId = null;
    
    // UI Elements
    this.inspector = null;
    this.inspectorContent = null;
    
    // State
    this.isInspectorOpen = false;
    this.paragraphs = []; // Array of wrapped p tags
    this.currentFocusedIndex = -1;

    this.init();
  }

  // Simple string hash for stable IDs
  hashText(text) {
    let hash = 5381;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) + hash) + text.charCodeAt(i);
    }
    return 'pr-' + (hash >>> 0).toString(16);
  }

  async init() {
    this.injectInspector();
    this.wrapParagraphs();
    await this.fetchThreads();
    this.bindKeyboard();
  }

  wrapParagraphs() {
    const pTags = document.querySelectorAll('article p');
    
    pTags.forEach((p, index) => {
      // Calculate stable ID based on content
      const pid = p.id || this.hashText(p.textContent);
      p.id = pid;

      // Wrap in relative container without breaking flow
      const wrapper = document.createElement('div');
      wrapper.className = 'reviewable-p-wrapper';
      
      p.parentNode.insertBefore(wrapper, p);
      wrapper.appendChild(p);
      
      // Inject Anchor
      const anchor = document.createElement('button');
      anchor.className = 'review-anchor';
      anchor.dataset.target = pid;
      anchor.innerHTML = '+';
      anchor.addEventListener('click', () => this.openReview(pid));
      
      wrapper.appendChild(anchor);
      this.paragraphs.push(wrapper);
    });
  }

  async fetchThreads() {
    try {
      const res = await fetch(`/api/reviews?documentId=${this.documentId}`);
      if (res.ok) {
        const data = await res.json();
        this.threads = data;
        this.updateAnchorStates();
      }
    } catch (e) {
      console.warn('Review API unavailable. Operating in local mode.', e);
    }
  }

  updateAnchorStates() {
    Object.keys(this.threads).forEach(pid => {
      const anchor = document.querySelector(`.review-anchor[data-target="${pid}"]`);
      if (anchor) {
        anchor.classList.add('has-thread');
        anchor.innerHTML = '●';
        if (this.threads[pid].status === 'Resolved') {
          anchor.classList.add('status-resolved');
        } else {
          anchor.classList.remove('status-resolved');
        }
      }
    });
  }

  injectInspector() {
    this.inspector = document.createElement('div');
    this.inspector.className = 'review-inspector';
    
    this.inspector.innerHTML = `
      <div class="inspector-header">
        <span class="inspector-title">AI Review Analysis</span>
        <button class="close-inspector">&times;</button>
      </div>
      <div class="inspector-content">
        <!-- Comments injected here -->
      </div>
      <div class="inspector-footer">
        <textarea class="reply-input" placeholder="Reply to thread..."></textarea>
        <div class="reply-actions">
          <button class="btn-resolve">Resolve Thread</button>
          <button class="btn-reply">Add Reply</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.inspector);
    this.inspectorContent = this.inspector.querySelector('.inspector-content');
    
    this.inspector.querySelector('.close-inspector').addEventListener('click', () => this.closeReview());
    this.inspector.querySelector('.btn-reply').addEventListener('click', () => this.submitReply());
    this.inspector.querySelector('.btn-resolve').addEventListener('click', () => this.resolveThread());
  }

  async openReview(pid) {
    this.activeParagraphId = pid;
    this.isInspectorOpen = true;
    this.inspector.classList.add('active');
    
    // Fetch or create thread
    if (!this.threads[pid]) {
      this.inspectorContent.innerHTML = '<div style="color:#999; padding: 20px;">AI Analyzing context...</div>';
      // Simulate AI Review Generation Delay
      setTimeout(async () => {
        await this.createAIReview(pid);
        this.renderThread(pid);
      }, 800);
    } else {
      this.renderThread(pid);
    }
  }

  closeReview() {
    this.isInspectorOpen = false;
    this.inspector.classList.remove('active');
    this.activeParagraphId = null;
  }

  async createAIReview(pid) {
    const pText = document.getElementById(pid).textContent;
    
    // In production, this would call an LLM. We mock it in the API body.
    const aiReviewContent = `
      <h4>Overview</h4>
      <p>This paragraph asserts a strong distinction between search engines and operating systems.</p>
      <h4>Suggestion</h4>
      <p>Consider citing specific examples of failed integrations where search was confused for stateful execution.</p>
    `;

    try {
      const res = await fetch(`/api/reviews?documentId=${this.documentId}&paragraphId=${pid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: 'Zayvora AI',
          content: aiReviewContent,
          ai_metadata: { type: 'Suggestion' }
        })
      });
      if (res.ok) {
        const thread = await res.json();
        this.threads[pid] = thread;
        this.updateAnchorStates();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async submitReply() {
    const input = this.inspector.querySelector('.reply-input');
    const text = input.value.trim();
    if (!text || !this.activeParagraphId) return;

    try {
      const res = await fetch(`/api/reviews?documentId=${this.documentId}&paragraphId=${this.activeParagraphId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: 'Dharam Daxini',
          content: text
        })
      });
      if (res.ok) {
        const thread = await res.json();
        this.threads[this.activeParagraphId] = thread;
        input.value = '';
        this.renderThread(this.activeParagraphId);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async resolveThread() {
    if (!this.activeParagraphId) return;
    
    try {
      const res = await fetch(`/api/reviews?documentId=${this.documentId}&paragraphId=${this.activeParagraphId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Resolved' })
      });
      if (res.ok) {
        const thread = await res.json();
        this.threads[this.activeParagraphId] = thread;
        this.renderThread(this.activeParagraphId);
        this.updateAnchorStates();
      }
    } catch (e) {
      console.error(e);
    }
  }

  renderThread(pid) {
    const thread = this.threads[pid];
    if (!thread) return;

    let html = '';
    
    if (thread.status === 'Resolved') {
      html += '<div style="background: rgba(34, 197, 94, 0.1); color: #22c55e; padding: 10px; border-radius: 6px; margin-bottom: 16px; font-size: 13px; font-weight: 600; text-align: center;">✅ This thread is resolved.</div>';
    }

    html += '<div class="review-thread">';
    
    thread.comments.forEach(cmt => {
      const isAI = cmt.author.includes('AI');
      const badge = isAI ? '<span class="comment-ai-badge">AI Review</span>' : '';
      const date = new Date(cmt.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

      html += `
        <div class="review-comment ${isAI ? 'ai-comment' : ''}">
          <div class="comment-header">
            <div>
              <span class="comment-author">${cmt.author}</span>${badge}
            </div>
            <span class="comment-time">${date}</span>
          </div>
          <div class="comment-body">${cmt.content}</div>
        </div>
      `;
    });

    html += '</div>';
    this.inspectorContent.innerHTML = html;
    
    // Scroll to bottom
    this.inspectorContent.scrollTop = this.inspectorContent.scrollHeight;
  }

  bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      // Escape closes review
      if (e.key === 'Escape' && this.isInspectorOpen) {
        this.closeReview();
        return;
      }

      // Don't intercept arrows if typing in input
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.currentFocusedIndex = Math.min(this.paragraphs.length - 1, this.currentFocusedIndex + 1);
        this.focusParagraph(this.currentFocusedIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.currentFocusedIndex = Math.max(0, this.currentFocusedIndex - 1);
        this.focusParagraph(this.currentFocusedIndex);
      } else if (e.key === 'Enter' && this.currentFocusedIndex >= 0) {
        const pWrapper = this.paragraphs[this.currentFocusedIndex];
        const anchor = pWrapper.querySelector('.review-anchor');
        if (anchor) {
          this.openReview(anchor.dataset.target);
        }
      }
    });
  }

  focusParagraph(index) {
    if (index < 0 || index >= this.paragraphs.length) return;
    const wrapper = this.paragraphs[index];
    
    // Remove focus from all
    this.paragraphs.forEach(p => p.classList.remove('focus-within'));
    
    wrapper.classList.add('focus-within');
    
    // Smooth scroll into view
    wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Boot up when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.ZayvoraReviewEngine = new ReviewEngine();
});
