// Create an HTTP server
const server = http.createServer((req, res) => {
  // Handle requests
  if (req.method === 'GET' && req.url === '/compare') {
    // Load images and perform comparison
    const img1 = fs.readFileSync('images/image1/triangles.png');
    const img2 = fs.readFileSync('images/image2/triangles.png');
    const { width, height } = getImageDimensions(img1); // Replace with your method to get image dimensions

    const diff = new Uint8Array(width * height * 4); // Create an array to store diff data
    const numDiffPixels = pixelmatch(img1, img2, diff, width, height, { threshold: 0.1 });

    // Do something with the comparison result
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ numDiffPixels }));
  } else {
    // Handle other requests
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});