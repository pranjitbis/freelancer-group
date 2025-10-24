const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { initSocketServer } = require("./lib/socket-server");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT, 10) || 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = createServer(async (req, res) => {
      try {
        // Parse the URL
        const parsedUrl = parse(req.url, true);
        const { pathname } = parsedUrl;

        // Handle socket.io requests
        if (pathname.startsWith("/api/socketio")) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Socket.io endpoint" }));
          return;
        }

        // Let Next.js handle all other requests
        await handler(req, res, parsedUrl);
      } catch (err) {
        console.error("Error handling request:", err);
        res.statusCode = 500;
        res.end("Internal server error");
      }
    });

    // Initialize Socket.io server
    initSocketServer(server);

    server
      .once("error", (err) => {
        console.error("Server error:", err);
        process.exit(1);
      })
      .listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
        console.log(`> Environment: ${dev ? "development" : "production"}`);
      });
  })
  .catch((err) => {
    console.error("Next.js preparation error:", err);
    process.exit(1);
  });