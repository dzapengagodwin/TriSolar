const http = require("http")
const fs = require("fs")
const path = require("path")
const { exec } = require("child_process")

const PORT = 3333
const DOCS_DIR = path.resolve(__dirname, "../docs")

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
}

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split("?")[0])
  if (reqPath === "/" || reqPath === "") reqPath = "/index.html"

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, "")
  const filePath = path.join(DOCS_DIR, safePath)

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" })
      res.end(`404 Not Found: ${reqPath}`)
      return
    }

    const ext = path.extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] || "application/octet-stream"

    res.writeHead(200, {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache",
    })
    fs.createReadStream(filePath).pipe(res)
  })
})

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`
  console.log(`\n======================================================`)
  console.log(`📚 Laptopzone Documentation Browser Viewer is live!`)
  console.log(`👉 Open: ${url}`)
  console.log(`======================================================\n`)

  // Automatically open the user's default browser on Windows
  exec(`start ${url}`)
})
