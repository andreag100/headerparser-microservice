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

    Promise.all([loadImageDimensions(imagePath1), loadImageDimensions(imagePath2)])
      .then(([img1Dimensions, img2Dimensions]) => {
        console.log('Image 1 dimensions:', img1Dimensions);
        console.log('Image 2 dimensions:', img2Dimensions);

        if (img1Dimensions.width !== img2Dimensions.width || img1Dimensions.height !== img2Dimensions.height) {
          throw new Error('Image sizes do not match.');
        }

        return compareImages(imagePath1, imagePath2);
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

// Load image dimensions
function loadImageDimensions(imagePath) {
  return new Promise((resolve, reject) => {
    loadImage(imagePath).then(image => {
      resolve({ width: image.width, height: image.height });
    }).catch(error => {
      reject(error);
    });
  });
}

// Compare images
async function compareImages(imagePath1, imagePath2) {
  const img1 = fs.readFileSync(imagePath1);
  const img2 = fs.readFileSync(imagePath2);

  const { width, height } = await loadImageDimensions(imagePath1);

  console.log('Compare images:', imagePath1, imagePath2);
  console.log('Image dimensions:', width, height);

  const diff = new Uint8Array(width * height * 4);
  const numDiffPixels = pixelmatch(img1, img2, diff, width, height, { threshold: 0.1 });

  // Do something with the comparison result
  return { numDiffPixels };
}
