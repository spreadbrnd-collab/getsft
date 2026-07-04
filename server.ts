import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import http from "http";
import https from "https";

// Helper to follow redirects recursively and return the final destination URL
function resolveRedirect(urlStr: string): Promise<string> {
  return new Promise((resolve) => {
    let currentUrl = urlStr.trim();
    if (!currentUrl.startsWith('http://') && !currentUrl.startsWith('https://')) {
      currentUrl = 'https://' + currentUrl;
    }
    
    let redirectCount = 0;
    const maxRedirects = 8;

    function attempt(url: string) {
      if (redirectCount >= maxRedirects) {
        resolve(url);
        return;
      }
      try {
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;

        const req = client.request(
          url,
          {
            method: 'HEAD',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          },
          (res) => {
            if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
              redirectCount++;
              let nextUrl = res.headers.location;
              if (!nextUrl.startsWith('http')) {
                nextUrl = new URL(nextUrl, urlObj.origin).href;
              }
              attempt(nextUrl);
            } else {
              resolve(url);
            }
          }
        );

        req.on('error', () => {
          attemptGet(url);
        });

        req.end();
      } catch {
        resolve(url);
      }
    }

    function attemptGet(url: string) {
      try {
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;

        const req = client.get(
          url,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          },
          (res) => {
            if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
              redirectCount++;
              let nextUrl = res.headers.location;
              if (!nextUrl.startsWith('http')) {
                nextUrl = new URL(nextUrl, urlObj.origin).href;
              }
              attempt(nextUrl);
            } else {
              resolve(url);
            }
          }
        );

        req.on('error', () => {
          resolve(url);
        });
      } catch {
        resolve(url);
      }
    }

    attempt(currentUrl);
  });
}

function parseGoogleMapsUrl(urlStr: string) {
  try {
    const urlObj = new URL(urlStr);
    
    // Check query search params first
    const q = urlObj.searchParams.get('q') || urlObj.searchParams.get('query');
    if (q) {
      return { query: q, source: 'query_param' };
    }
    
    // Check place path /place/Place+Name
    const placeMatch = urlObj.pathname.match(/\/place\/([^/]+)/);
    if (placeMatch && placeMatch[1]) {
      return { query: decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')), source: 'place_path' };
    }
    
    // Check coordinates like @12.9716,77.5946
    const coordMatch = urlObj.pathname.match(/@(-?\d+\.\d+,-?\d+\.\d+)/);
    if (coordMatch && coordMatch[1]) {
      return { query: coordMatch[1], source: 'coordinates' };
    }
    
    // Check search path /search/Search+Query
    const searchMatch = urlObj.pathname.match(/\/search\/([^/]+)/);
    if (searchMatch && searchMatch[1]) {
      return { query: decodeURIComponent(searchMatch[1].replace(/\+/g, ' ')), source: 'search_path' };
    }
    
    return { query: urlStr, source: 'fallback' };
  } catch {
    return { query: urlStr, source: 'fallback' };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON and URL parsing middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API endpoint to resolve and parse maps short URLs
  app.get("/api/resolve-map", async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: "Missing 'url' parameter" });
    }

    try {
      const resolvedUrl = await resolveRedirect(url);
      const parsed = parseGoogleMapsUrl(resolvedUrl);
      
      res.json({
        success: true,
        originalUrl: url,
        resolvedUrl,
        query: parsed.query,
        source: parsed.source
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to resolve maps link" 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
