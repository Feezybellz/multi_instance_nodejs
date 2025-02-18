class Waf {
  constructor() {
    this.maliciousIPs = new Set(["192.168.1.100", "203.0.113.1"]); // Example blocked IPs
    this.requestLogs = new Map(); // Stores request logs for rate limiting
    this.csrfTokens = new Map(); // Store CSRF tokens for validation

    this.rateLimitConfig = {
      windowMs: 15 * 60 * 1000, // 15 minutes window
      maxRequests: 100, // Max requests per IP
    };
    this.manyRequestsMessage = "Too many requests"; // Default 429 response message
  }

  setMaliciousIPs(ips) {
    this.maliciousIPs = new Set(ips);
  }
  setManyRequestsMessage(message) {
    this.manyRequestsMessage = message;
  }
  // 1. Apply Secure HTTP Headers
  applySecurityHeaders(req, res) {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
    res.setHeader("Referrer-Policy", "no-referrer");
  }

  // 2. Prevent SQL Injection & XSS Attacks
  sanitizeRequest(req, res) {
    const sqlRegex =
      /(\b(union|select|insert|delete|update|drop|alter|truncate|exec)\b)/gi;
    const xssRegex = /(<script.*?>.*?<\/script>)/gi;

    const checkPayload = (payload) => {
      if (typeof payload === "string") {
        return sqlRegex.test(payload) || xssRegex.test(payload);
      }
      if (typeof payload === "object" && payload !== null) {
        return Object.values(payload).some((value) => checkPayload(value));
      }
      return false;
    };

    if (
      checkPayload(req.body) ||
      checkPayload(req.query) ||
      checkPayload(req.params)
    ) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Malicious request detected!" }));
      return false;
    }
    return true;
  }

  // 3. CSRF Protection
  generateCSRFToken(sessionID) {
    const token = Math.random().toString(36).substring(2);
    this.csrfTokens.set(sessionID, token);
    return token;
  }

  validateCSRFToken(req, res) {
    const sessionID = req.headers["x-session-id"];
    const token = req.headers["x-csrf-token"];

    if (!sessionID || !token || this.csrfTokens.get(sessionID) !== token) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "CSRF token invalid" }));
      return false;
    }
    return true;
  }

  // 4. Custom Rate Limiting Logic
  rateLimiter(req, res) {
    const ip = req.socket.remoteAddress;
    const now = Date.now();

    if (!this.requestLogs.has(ip)) {
      this.requestLogs.set(ip, []);
    }

    // Remove expired logs (older than the rate limit window)
    this.requestLogs.set(
      ip,
      this.requestLogs
        .get(ip)
        .filter((timestamp) => now - timestamp < this.rateLimitConfig.windowMs)
    );

    // Check if request limit is exceeded
    if (this.requestLogs.get(ip).length >= this.rateLimitConfig.maxRequests) {
      res.writeHead(429, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: this.manyRequestsMessage || "Too many requests",
        })
      );
      return false;
    }

    // Log the new request
    this.requestLogs.get(ip).push(now);
    return true;
  }

  // 5. Block Malicious IPs
  blockMaliciousIPs(req, res) {
    const ip = req.socket.remoteAddress;
    if (this.maliciousIPs.has(ip)) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ message: "Access blocked due to security reasons." })
      );
      return false;
    }
    return true;
  }

  // 6. Sanitize User Inputs
  sanitizeInputs(req) {
    const sanitize = (input) =>
      typeof input === "string" ? input.replace(/<\/?[^>]+(>|$)/g, "") : input;
    req.body = JSON.parse(JSON.stringify(req.body), (_, value) =>
      sanitize(value)
    );
    req.query = JSON.parse(JSON.stringify(req.query), (_, value) =>
      sanitize(value)
    );
    req.params = JSON.parse(JSON.stringify(req.params), (_, value) =>
      sanitize(value)
    );
  }

  // 7. Apply All Security Measures
  applyAll(req, res, next) {
    if (
      this.apply("blockMaliciousIPs", req, res, next) &&
      this.apply("rateLimiter", req, res, next) &&
      this.apply("sanitizeRequest", req, res, next) &&
      this.apply("sanitizeInputs", req, res, next)
    ) {
      next();
    }
  }

  apply(which, req, res, next) {
    this.applySecurityHeaders(req, res);

    if (which === "blockMaliciousIPs" && !this.blockMaliciousIPs(req, res))
      return false;
    if (which === "rateLimiter" && !this.rateLimiter(req, res)) return false;
    if (which === "sanitizeRequest" && !this.sanitizeRequest(req, res))
      return false;
    if (which === "sanitizeInputs") this.sanitizeInputs(req);
  }
}

module.exports = Waf;
