const http = require('http');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const pixelmatch = require('pixelmatch');
const sharp = require('sharp');
const chokidar = require('chokidar');

// Set up file system watcher for the image folders
const imageWatcher = chokidar.watch(['image1/1triangles.png', 'image2/2triangles.png'], {
  ignored: /^\./, // Ignore hidden files
  persistent: true,
});

// Create an HTTP server
const server = http.createServer((req, res) => {
  // Handle requests
  if (req.method === 'GET' && req.url === '/compare') {
    // Compare images
    async function compareImages(imagePath1, imagePath2) {
      // Load images
      const img1 = fs.readFileSync(imagePath1);
      const img2 = fs.readFileSync(imagePath2);

      // Get image dimensions
      const img1Dimensions = await getImageDimensions(img1);
      const img2Dimensions = await getImageDimensions(img2);

      if (
        img1Dimensions.width !== img2Dimensions.width ||
        img1Dimensions.height !== img2Dimensions.height
      ) {
        throw new Error('Image sizes do not match.');
      }

      const { width, height } = img1Dimensions;

      // Create canvas for comparison
      const diffCanvas = createCanvas(width, height);
      const diffContext = diffCanvas.getContext('2d');

      // Compare images and get the diff pixels count
      const numDiffPixels = pixelmatch(
        img1, // Reference image
        img2, // Modified image
        diffContext.getImageData(0, 0, width, height).data, // Diff canvas data
        width,
        height,
        { threshold: 0.1 }
      );

      // Do something with the comparison result
      return { numDiffPixels };
    }

    // Helper function to get image dimensions
    async function getImageDimensions(imageBuffer) {
      const metadata = await sharp(imageBuffer).metadata();
      return { width: metadata.width, height: metadata.height };
    }

    // Example usage
    const imagePath1 = 'image1/1triangles.png';
    const imagePath2 = 'image2/2triangles.png';

    compareImages(imagePath1, imagePath2)
  .then(({ numDiffPixels }) => {
    // Do something with the comparison result
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ numDiffPixels }));
  })
  .catch(error => {
    // Handle the error
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  });
