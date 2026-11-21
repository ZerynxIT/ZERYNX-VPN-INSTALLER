/**
 * ZERYNX Cloudflare API Bridge
 * Deploy this Worker in YOUR Cloudflare account.
 * It forwards requests only to Cloudflare's official API and never stores tokens.
 */
const ALLOWED_ORIGIN = "https://zerynxit.github.io";
const UPSTREAM_ORIGIN = "https://api.cloudflare.com";
const ALLOWED_METHODS = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
const ALLOWED_HEADERS = "Authorization,Content-Type,Accept";

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": ALLOWED_METHODS,
    "Access-Control-Allow-Headers": ALLOWED_HEADERS,
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "Cache-Control": "no-store"
  };
}

function json(data, status, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers }
  });
}

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin") || "";
    if (origin !== ALLOWED_ORIGIN) {
      return json({ success: false, errors: [{ message: "Origin not allowed." }] }, 403);
    }

    const headers = cors(origin);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      return json({ success: false, errors: [{ message: "Method not allowed." }] }, 405, headers);
    }

    const incoming = new URL(request.url);
    if (!incoming.pathname.startsWith("/client/v4/") || incoming.pathname.includes("/../")) {
      return json({ success: false, errors: [{ message: "Only Cloudflare API v4 paths are allowed." }] }, 404, headers);
    }

    if (!request.headers.get("Authorization")?.startsWith("Bearer ")) {
      return json({ success: false, errors: [{ message: "A Bearer API token is required." }] }, 401, headers);
    }

    try {
      const target = new URL(incoming.pathname + incoming.search, UPSTREAM_ORIGIN);
      // Re-target the original Request so multipart boundaries and streamed bodies remain intact.
      const upstreamRequest = new Request(target.toString(), request);
      const upstream = await fetch(upstreamRequest);
      const responseHeaders = new Headers(upstream.headers);
      for (const [key, value] of Object.entries(headers)) responseHeaders.set(key, value);
      responseHeaders.delete("Set-Cookie");

      return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders
      });
    } catch (error) {
      return json({
        success: false,
        errors: [{ message: "Bridge could not reach api.cloudflare.com: " + String(error?.message || error) }]
      }, 502, headers);
    }
  }
};
