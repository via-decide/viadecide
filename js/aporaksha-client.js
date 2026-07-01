/**
 * Aporaksha SSO Client
 * Secure cross-domain session management via hidden iframe bridge.
 */
class AporakshaClient {
  constructor(bridgeUrl = 'https://aporaksha.com/passport/sso-bridge.html') {
    this.bridgeUrl = bridgeUrl;
    this.iframe = null;
    this.ready = false;
    this.pendingResolves = {};
    this.msgId = 0;
    this.init();
  }

  init() {
    if (document.getElementById('aporaksha-sso-bridge')) return;
    
    this.iframe = document.createElement('iframe');
    this.iframe.id = 'aporaksha-sso-bridge';
    this.iframe.src = this.bridgeUrl;
    this.iframe.style.display = 'none';
    document.body.appendChild(this.iframe);

    window.addEventListener('message', (event) => {
      // Must match the origin of the bridgeUrl
      const bridgeOrigin = new URL(this.bridgeUrl).origin;
      if (event.origin !== bridgeOrigin && event.origin !== 'http://localhost:7002') return;

      const data = event.data;
      if (data && data.type === 'SSO_RESPONSE') {
        const id = data.msgId; // If we sent msgId, we would match it. We didn't in the raw bridge, so we match by action/key.
        // Actually, the original sso-bridge.html doesn't echo a msgId, it just echoes action and key.
        const pendingKey = `${data.action}_${data.key}`;
        if (this.pendingResolves[pendingKey]) {
          this.pendingResolves[pendingKey](data.value || data.success);
          delete this.pendingResolves[pendingKey];
        }
      }
    });

    this.iframe.onload = () => {
      this.ready = true;
    };
  }

  async _waitReady() {
    if (this.ready) return;
    return new Promise(resolve => {
      const check = setInterval(() => {
        if (this.ready) {
          clearInterval(check);
          resolve();
        }
      }, 50);
    });
  }

  async getSessionToken() {
    await this._waitReady();
    return new Promise(resolve => {
      const key = 'zayvora_passport_session_v1';
      this.pendingResolves[`get_${key}`] = (val) => resolve(val ? JSON.parse(val) : null);
      this.iframe.contentWindow.postMessage({ action: 'get', key }, '*');
      
      // Fallback timeout
      setTimeout(() => {
        if (this.pendingResolves[`get_${key}`]) {
          resolve(null);
          delete this.pendingResolves[`get_${key}`];
        }
      }, 2000);
    });
  }

  async requireAuth(redirectUrl = window.location.href) {
    const session = await this.getSessionToken();
    if (!session || !session.token) {
      window.location.href = `https://aporaksha.com/passport/index.html?redirect=${encodeURIComponent(redirectUrl)}`;
      return false;
    }
    return session;
  }
}

window.Aporaksha = new AporakshaClient();
