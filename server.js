const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

const MIME_TYPES = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
    let cleanUrl = req.url.split("?")[0];
    if (cleanUrl === "/") cleanUrl = "/index.html";

    let filePath = path.join(__dirname, cleanUrl);

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("404 Not Found");
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";

        fs.readFile(filePath, (readErr, content) => {
            if (readErr) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Server Error");
                return;
            }

            res.writeHead(200, { "Content-Type": contentType });
            res.end(content);
        });
    });
});

server.listen(PORT, () => {
    console.log(`Student Management System running at http://localhost:${PORT}/Project/index.html`);
});
