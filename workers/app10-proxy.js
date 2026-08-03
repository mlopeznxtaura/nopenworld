// app10.nextaura.fit — static SPA (v16all Dashboard / Wild Breath WebGL)
// /* -> assets from public/app10 (Vite build output)

function securityHeaders(headers, pathname) {
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Frame-Options", "DENY");
  if (pathname === "/" || pathname.endsWith(".html")) {
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    headers.delete("etag");
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      const headers = new Headers({ "content-type": "application/json" });
      securityHeaders(headers, url.pathname);
      return new Response(
        JSON.stringify({
          status: "ok",
          role: "app10-wrangler",
          product: "wild-breath",
        }),
        { headers },
      );
    }

    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    securityHeaders(headers, url.pathname);

    // SPA fallback: unknown paths serve index.html
    if (response.status === 404 && !url.pathname.includes(".")) {
      const indexReq = new Request(new URL("/index.html", url.origin), request);
      const indexRes = await env.ASSETS.fetch(indexReq);
      const indexHeaders = new Headers(indexRes.headers);
      securityHeaders(indexHeaders, "/");
      return new Response(indexRes.body, {
        status: indexRes.status,
        statusText: indexRes.statusText,
        headers: indexHeaders,
      });
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
