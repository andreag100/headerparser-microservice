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

    compareImages(imagePath1, imagePath2)
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
async function compareImages(imagePath1, imagePath2) {
  const img1 = fs.readFileSync(imagePath1);
  const img2 = fs.readFileSync(imagePath2);

  const img1Dimensions = await getImageDimensions(img1);
  const img2Dimensions = await getImageDimensions(img2);

  if (img1Dimensions.width !== img2Dimensions.width || img1Dimensions.height !== img2Dimensions.height) {
    throw new Error('Image sizes do not match.');
  }

  const { width, height } = img1Dimensions;

  const diff = new Uint8Array(width * height * 4);
  const numDiffPixels = pixelmatch(img1, img2, diff, width, height, { threshold: 0.1 });

  // Do something with the comparison result
  return { numDiffPixels };
}

// Helper function to get image dimensions
async function getImageDimensions(imageBuffer) {
  const metadata = await sharp(imageBuffer).metadata();
  return { width: metadata.width, height: metadata.height };
}
