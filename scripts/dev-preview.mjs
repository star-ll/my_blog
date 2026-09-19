import { createReadStream, existsSync, statSync } from "node:fs"
import { createServer } from "node:http"
import { extname, join, normalize } from "node:path"

const args = process.argv.slice(2)
const portIndex = args.indexOf("--port")
const port = Number(portIndex >= 0 ? args[portIndex + 1] : 4173)
const publicDir = join(process.cwd(), "public")

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".xml": "application/xml; charset=utf-8",
}

const server = createServer((request, response) => {
  const requestPath = decodeURIComponent(
    new URL(request.url ?? "/", "http://preview.local").pathname,
  )
  const safePath = normalize(requestPath).replace(/^(\.\.(\/|\\|$))+/, "")
  const candidates = [
    join(publicDir, safePath),
    join(publicDir, safePath, "index.html"),
    join(publicDir, `${safePath}.html`),
  ]
  const filePath = candidates.find(
    (candidate) => existsSync(candidate) && statSync(candidate).isFile(),
  )

  if (!filePath) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" })
    response.end("Not found")
    return
  }

  response.writeHead(200, {
    "content-type": contentTypes[extname(filePath)] ?? "application/octet-stream",
  })
  createReadStream(filePath).pipe(response)
})

server.listen(port, "0.0.0.0", () => {
  console.log(`Quartz preview listening on port ${port}`)
})
