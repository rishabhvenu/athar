import { createServer } from "node:http";

const port = Number(process.argv[2] ?? 54321);

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      if (!body) {
        resolve(null);
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "authorization, apikey, content-type, prefer",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "content-type": "application/json",
  });
  response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

  if (request.method === "OPTIONS") {
    sendJson(response, 200, {});
    return;
  }

  if (url.pathname === "/health") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (url.pathname === "/auth/v1/user") {
    const authorization = request.headers.authorization ?? "";
    if (authorization === "Bearer e2e-token") {
      sendJson(response, 200, {
        id: "user-1",
        aud: "authenticated",
        role: "authenticated",
        email: "e2e@example.com",
      });
      return;
    }

    sendJson(response, 401, { message: "Missing or invalid auth token" });
    return;
  }

  if (request.method === "POST" && url.pathname === "/rest/v1/memories") {
    const body = await readJsonBody(request);
    sendJson(response, 201, {
      id: "memory-1",
      user_id: "user-1",
      surah: body?.surah ?? 2,
      ayah: body?.ayah ?? 286,
      mood: body?.mood ?? "calm",
      note: body?.note ?? "",
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/rest/v1/memory_embeddings") {
    sendJson(response, 201, {});
    return;
  }

  sendJson(response, 404, { message: `Unhandled mock Supabase route: ${request.method} ${url.pathname}` });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Mock Supabase listening on http://127.0.0.1:${port}`);
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
