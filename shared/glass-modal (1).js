/**
 * glass-modal.js
 * Manages the high-tier UI rendering engine for glassmorphic interaction popups.
 * Targets `.modal.panel-glass` and hooks `.btn-glitch` on critical actions.
 */

const GlassModal = {
  activeOverlay: null,

  open(title, contentHTML, actionButtons = []) {
    let modal = document.querySelector('.modal.panel-glass');
    
    // Inject structural container if missing
    if (!modal) {
      this.activeOverlay = document.createElement('div');
      this.activeOverlay.className = 'modal-overlay';
      this.activeOverlay.style.position = 'fixed';
      this.activeOverlay.style.inset = '0';
      this.activeOverlay.style.zIndex = '999';
      this.activeOverlay.style.backdropFilter = 'blur(4px)';
      this.activeOverlay.style.background = 'rgba(0,0,0,0.5)';
      this.activeOverlay.style.display = 'none';
      this.activeOverlay.addEventListener('click', () => GlassModal.close());
      document.body.appendChild(this.activeOverlay);
      
      modal = document.createElement('div');
      modal.className = 'modal panel-glass';
      modal.style.position = 'fixed';
      modal.style.top = '50%';
      modal.style.left = '50%';
      modal.style.transform = 'translate(-50%, -50%)';
      modal.style.zIndex = '1000';
      modal.style.display = 'none';
      document.body.appendChild(modal);
    } else {
      this.activeOverlay = document.querySelector('.modal-overlay');
    }
    
    // Mount keyboard listener payload
    this._handleKeydown = this._handleKeydown.bind(this);
    document.addEventListener('keydown', this._handleKeydown);
    
    // Hydrate template variables
    modal.innerHTML = `
      <div class="modal-header">
        <h2 style="margin:0;">${title}</h2>
      </div>
      <div class="modal-body" style="padding: 16px 0;">
        ${contentHTML}
      </div>
      <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:8px;"></div>
    `;
    
    const footer = modal.querySelector('.modal-footer');
    actionButtons.forEach(btn => {
      const btnEl = document.createElement('button');
      btnEl.textContent = btn.label;
      if (btn.type === 'critical') {
        btnEl.classList.add('btn-glitch');
      }
      btnEl.addEventListener('click', () => {
        if (btn.onClick) btn.onClick();
        if (btn.closes !== false) GlassModal.close();
      });
      footer.appendChild(btnEl);
    });
    
    // Flip visibility flags
    if (this.activeOverlay) this.activeOverlay.style.display = 'block';
    modal.style.display = 'block';
  },
  
  close() {
    const modal = document.querySelector('.modal.panel-glass');
    if (modal) modal.style.display = 'none';
    if (this.activeOverlay) this.activeOverlay.style.display = 'none';
    document.removeEventListener('keydown', this._handleKeydown);
  },
  
  _handleKeydown(e) {
    if (e.key === 'Escape') {
      GlassModal.close();
    }
  }
};

window.GlassModal = GlassModal;
