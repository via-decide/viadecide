/**
 * terminal-logger.js
 * Streams JSON payloads into the UI with a retro CRT typewriter effect.
 * Targets `.hud-terminal`, `.status-ok`, `.btn-glitch`, and `.cursor-blink`.
 */

class TerminalLogger {
  async streamToUI(containerSelector, jsonPayload) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    for (const [key, value] of Object.entries(jsonPayload)) {
      const line = document.createElement('div');
      const text = `${key}: ${value}`;
      line.textContent = '';
      
      // Inject hardware-accelerated status colors
      if (value === 'Success' || value === 'success') {
        line.classList.add('status-ok');
      } else if (value === 'Error' || value === 'error') {
        line.classList.add('btn-glitch');
      }

      line.classList.add('cursor-blink');
      container.appendChild(line);

      // Simulate 20ms per-character typing delay
      for (let i = 0; i < text.length; i++) {
        line.textContent += text[i];
        // Auto-scroll logic utilizing layout recalcs
        container.scrollTop = container.scrollHeight;
        await new Promise(r => setTimeout(r, 20));
      }
      
      // Conclude typing state
      line.classList.remove('cursor-blink');
    }
  }
}

window.TerminalLogger = TerminalLogger;
