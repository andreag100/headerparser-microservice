// Import required modules
const http = require('http');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const pixelmatch = require('pixelmatch');
const sharp = require('sharp');

// Create an HTTP server
const server = http.createServer((req, res) => {
  // Handle requests
  if (req.method === 'GET' && req.url === '/compare') {
    // Load images and perform comparison
    const imagePath1 = 'image1/1triangles.png';
    const imagePath2 = 'image2/2triangles.png';

    Promise.all([loadImage(imagePath1), loadImage(imagePath2)])
      .then(([img1, img2]) => {
        const img1Dimensions = { width: img1.width, height: img1.height };
        const img2Dimensions = { width: img2.width, height: img2.height };

        console.log('Image 1 dimensions:', img1Dimensions);
        console.log('Image 2 dimensions:', img2Dimensions);

        if (img1Dimensions.width !== img2Dimensions.width || img1Dimensions.height !== img2Dimensions.height) {
          throw new Error('Image sizes do not match.');
        }

        return compareImages(img1, img2, img1Dimensions);
      })
      .then(({ numDiffPixels }) => {
        // Do something with the comparison result
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ numDiffPixels }));
      })
      .catch(error => {
        console.error('Error:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      });
  } else {
    // Handle other requests
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

// Start the server
const port = process.env.PORT || 80; // Use the default HTTP port 80
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Compare images
function compareImages(img1, img2, img1Dimensions) {
  const { width, height } = img1Dimensions;

  console.log('Compare images:', img1, img2);
  console.log('Image dimensions:', width, height);

  const diff = new Uint8Array(width * height * 4);
  const numDiffPixels = pixelmatch(img1.data, img2.data, diff, width, height, { threshold: 0.1 });

  // Do something with the comparison result
  return { numDiffPixels };
}
