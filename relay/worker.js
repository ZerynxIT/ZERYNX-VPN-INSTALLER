const ALLOWED_ORIGIN = "https://zerynxit.github.io";
const CF_API = "https://api.cloudflare.com/client/v4";
const PREFIX = "/client/v4";
const RELAY_NAME = "zerynx-installer-core";

const ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "OPTIONS"];
const ALLOWED_HEADERS = ["authorization", "content-type", "accept"];

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": ALLOWED_METHODS.join(", "),
    "Access-Control-Allow-Headers": ALLOWED_HEADERS.join(", "),
    "Access-Control-Max-Age": "86400",
    "Access-Control-Expose-Headers": "Content-Type, Retry-After, X-ZERYNX-Relay, X-ZERYNX-Request-Id",
    "Vary": "Origin"
  };
}

function jsonResponse(data, status, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers
    }
  });
}

function isAccountId(value) {
  return /^[a-f0-9]{32}$/i.test(value);
}

function isDatabaseId(value) {
  return /^[a-f0-9-]{36}$/i.test(value);
}

function isSafeSegment(value) {
  return /^[a-zA-Z0-9_-]{1,128}$/.test(value);
}

function allowedRoute(path, method, searchParams) {
  const m = method.toUpperCase();

  if (path === "/user/tokens/verify") {
    return m === "GET";
  }

  if (path === "/accounts") {
    return m === "GET";
  }

  let match = path.match(/^\/accounts\/([^/]+)\/d1\/database$/);
  if (match) {
    return isAccountId(match[1]) && m === "POST";
  }

  match = path.match(/^\/accounts\/([^/]+)\/d1\/database\/([^/]+)\/query$/);
  if (match) {
    return isAccountId(match[1]) && isDatabaseId(match[2]) && m === "POST";
  }

  match = path.match(/^\/accounts\/([^/]+)\/workers\/assets\/upload$/);
  if (match) {
    return isAccountId(match[1]) && m === "POST" && searchParams.get("base64") === "true";
  }

  match = path.match(/^\/accounts\/([^/]+)\/workers\/scripts$/);
  if (match) {
    return isAccountId(match[1]) && m === "GET";
  }

  match = path.match(/^\/accounts\/([^/]+)\/workers\/scripts\/([^/]+)\/assets-upload-session$/);
  if (match) {
    return isAccountId(match[1]) && isSafeSegment(match[2]) && m === "POST";
  }

  match = path.match(/^\/accounts\/([^/]+)\/workers\/scripts\/([^/]+)$/);
  if (match) {
    return isAccountId(match[1]) && isSafeSegment(match[2]) && (m === "GET" || m === "PUT");
  }

  match = path.match(/^\/accounts\/([^/]+)\/builds\/workers\/([^/]+)$/);
  if (match) {
    return isAccountId(match[1]) && isSafeSegment(match[2]) && (m === "GET" || m === "PATCH");
  }

  return false;
}

function requestedHeadersAreAllowed(value) {
  if (!value) return true;
  return value
    .split(",")
    .map((header) => header.trim().toLowerCase())
    .filter(Boolean)
    .every((header) => ALLOWED_HEADERS.includes(header));
}

function makeRequestId() {
  return crypto.randomUUID();
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const method = request.method.toUpperCase();
    const requestId = makeRequestId();

    if (url.pathname === "/health" && method === "GET") {
      return jsonResponse(
        { success: true, relay: RELAY_NAME, status: "online" },
        200,
        {
          "X-ZERYNX-Relay": RELAY_NAME,
          "X-ZERYNX-Request-Id": requestId
        }
      );
    }

    if (origin !== ALLOWED_ORIGIN) {
      return jsonResponse(
        { success: false, error: "Origin not allowed", relay: RELAY_NAME, requestId },
        403,
        { "X-ZERYNX-Relay": RELAY_NAME, "X-ZERYNX-Request-Id": requestId }
      );
    }

    const cors = corsHeaders(origin);

    if (!url.pathname.startsWith(PREFIX + "/")) {
      return jsonResponse(
        { success: false, error: "Invalid API prefix", relay: RELAY_NAME, requestId },
        404,
        { ...cors, "X-ZERYNX-Relay": RELAY_NAME, "X-ZERYNX-Request-Id": requestId }
      );
    }

    const path = url.pathname.slice(PREFIX.length);
    const routeAllowed = allowedRoute(path, method, url.searchParams);

    if (method === "OPTIONS") {
      const requestedMethod = (request.headers.get("Access-Control-Request-Method") || "").toUpperCase();
      const requestedHeaders = request.headers.get("Access-Control-Request-Headers") || "";

      if (
        !requestedMethod ||
        !ALLOWED_METHODS.includes(requestedMethod) ||
        !allowedRoute(path, requestedMethod, url.searchParams) ||
        !requestedHeadersAreAllowed(requestedHeaders)
      ) {
        return jsonResponse(
          {
            success: false,
            error: "CORS preflight rejected",
            path,
            requestedMethod,
            requestedHeaders,
            relay: RELAY_NAME,
            requestId
          },
          403,
          { ...cors, "X-ZERYNX-Relay": RELAY_NAME, "X-ZERYNX-Request-Id": requestId }
        );
      }

      return new Response(null, {
        status: 204,
        headers: {
          ...cors,
          "X-ZERYNX-Relay": RELAY_NAME,
          "X-ZERYNX-Request-Id": requestId
        }
      });
    }

    if (!ALLOWED_METHODS.includes(method) || !routeAllowed) {
      return jsonResponse(
        { success: false, error: "Route or method not allowed", method, path, relay: RELAY_NAME, requestId },
        403,
        { ...cors, "X-ZERYNX-Relay": RELAY_NAME, "X-ZERYNX-Request-Id": requestId }
      );
    }

    const authorization = request.headers.get("Authorization");
    if (!authorization || !/^Bearer\s+\S+$/i.test(authorization)) {
      return jsonResponse(
        { success: false, error: "A Bearer token is required", relay: RELAY_NAME, requestId },
        401,
        { ...cors, "X-ZERYNX-Relay": RELAY_NAME, "X-ZERYNX-Request-Id": requestId }
      );
    }

    const target = new URL(CF_API + path);
    target.search = url.search;

    const upstreamHeaders = new Headers();
    upstreamHeaders.set("Authorization", authorization);

    const contentType = request.headers.get("Content-Type");
    const accept = request.headers.get("Accept");
    if (contentType) upstreamHeaders.set("Content-Type", contentType);
    if (accept) upstreamHeaders.set("Accept", accept);

    try {
      // Buffer only the asset multipart request. Other request bodies remain streamed.
      const isAssetUpload = path === "/accounts/" +
        path.split("/")[2] + "/workers/assets/upload";

      let body;
      if (method !== "GET" && method !== "HEAD") {
        body = isAssetUpload ? await request.arrayBuffer() : request.body;
      }

      const upstream = await fetch(target.toString(), {
        method,
        headers: upstreamHeaders,
        body,
        redirect: "manual",
        cache: "no-store"
      });

      const responseHeaders = new Headers(cors);
      responseHeaders.set("Cache-Control", "no-store");
      responseHeaders.set("X-ZERYNX-Relay", RELAY_NAME);
      responseHeaders.set("X-ZERYNX-Request-Id", requestId);

      const upstreamContentType = upstream.headers.get("Content-Type");
      const retryAfter = upstream.headers.get("Retry-After");
      if (upstreamContentType) responseHeaders.set("Content-Type", upstreamContentType);
      if (retryAfter) responseHeaders.set("Retry-After", retryAfter);

      return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders
      });
    } catch (error) {
      return jsonResponse(
        {
          success: false,
          error: "Relay upstream connection failed",
          detail: error && error.message ? error.message : String(error),
          method,
          path,
          relay: RELAY_NAME,
          requestId
        },
        502,
        { ...cors, "X-ZERYNX-Relay": RELAY_NAME, "X-ZERYNX-Request-Id": requestId }
      );
    }
  }
};
