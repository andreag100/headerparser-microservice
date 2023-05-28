// Import required modules
const http = require('http');
const fs = require('fs');
const pixelmatch = require('pixelmatch');

// Create an HTTP server
const server = http.createServer((req, res) => {
  // Handle requests
  if (req.method === 'GET' && req.url === '/compare') {
    // Load images and perform comparison
const img1 = fs.readFileSync('images/image1/_triangles.png');
const img2 = fs.readFileSync('images/image2/_triangles.png');
const { createCanvas, loadImage } = require('canvas');

// Helper function to get image dimensions
function getImageDimensions(imageBuffer) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = (error) => {
      reject(error);
    };
    img.src = imageBuffer;
  });
}



if (img1Dimensions.width !== img2Dimensions.width || img1Dimensions.height !== img2Dimensions.height) {
  throw new Error('Image sizes do not match.');
}

const { width, height } = img1Dimensions;

const diff = new Uint8Array(width * height * 4);
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

// Start the server
const port = process.env.PORT || 80; // Use the default HTTP port 80
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Helper function to get image dimensions
const sharp = require('sharp');

// Helper function to get image dimensions
async function getImageDimensions(imageBuffer) {
  const metadata = await sharp(imageBuffer).metadata();
  return { width: metadata.width, height: metadata.height };
}
