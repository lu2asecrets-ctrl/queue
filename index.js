// Simple Node.js server for Queue Management System
// يمكن تشغيل هذا الملف باستخدام: node index.js

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.wav': 'audio/wav',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'font/eot'
};

// Create server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Default to index.html
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Remove leading slash
    const filePath = path.join(__dirname, pathname);
    
    // Get file extension
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    // Read file
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
                    <!DOCTYPE html>
                    <html lang="ar" dir="rtl">
                    <head>
                        <meta charset="UTF-8">
                        <title>404 - الصفحة غير موجودة</title>
                        <style>
                            body {
                                font-family: 'Cairo', sans-serif;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                margin: 0;
                                color: white;
                                text-align: center;
                            }
                            .error-container {
                                background: rgba(255, 255, 255, 0.1);
                                backdrop-filter: blur(10px);
                                padding: 2rem;
                                border-radius: 1rem;
                                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                            }
                            h1 { font-size: 4rem; margin: 0; }
                            p { font-size: 1.2rem; margin: 1rem 0; }
                            a {
                                color: white;
                                text-decoration: none;
                                background: rgba(255, 255, 255, 0.2);
                                padding: 0.5rem 1rem;
                                border-radius: 0.5rem;
                                display: inline-block;
                                margin-top: 1rem;
                            }
                            a:hover { background: rgba(255, 255, 255, 0.3); }
                        </style>
                    </head>
                    <body>
                        <div class="error-container">
                            <h1>404</h1>
                            <p>الصفحة المطلوبة غير موجودة</p>
                            <a href="/">العودة إلى الرئيسية</a>
                        </div>
                    </body>
                    </html>
                `);
            } else {
                // Server error
                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>500 - خطأ في الخادم</h1>');
            }
        } else {
            // Success
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
            });
            res.end(content, 'utf-8');
        }
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Queue Management System Server`);
    console.log(`🌐 Server running at: http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log(`🔊 Audio files: /audio/`);
    console.log(`🎥 Video files: /media/`);
    console.log('Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});