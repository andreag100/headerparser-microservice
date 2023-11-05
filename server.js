// Import required modules
const http = require('http');
const { createCanvas, loadImage } = require('canvas');
const pixelmatch = require('pixelmatch');
const urlsToTest = require('./urls.json');
const { sendEmail } = require('./emailService');
const cron = require('node-cron');

// Generate image path
function generateImagePath(url, imageNumber) {
	const formattedUrl = url.replace(/https?:\/\//, 'https___').replace(/[\/:.]/g, '_');
    return `https://entrypage.pageheed.com/imgs/${formattedUrl}/image${imageNumber}/screenshot.png`;
}

// Set up a cron job to run every 2 hours
cron.schedule('0 */1 * * *', () => {
    console.log("Running visual comparison job...");
    urlsToTest.forEach((url, index) => {
        runComparisonForURL(index);
    });
});

function runComparisonForURL(urlIndex) {
    const imagePath1 = generateImagePath(urlsToTest[urlIndex], 1);
    const imagePath2 = generateImagePath(urlsToTest[urlIndex], 2);

    console.log('Trying to load:', imagePath1);
    console.log('Trying to load:', imagePath2);

    Promise.all([loadImage(imagePath1), loadImage(imagePath2)])
            .then(([img1, img2]) => {
                const img1Dimensions = { width: img1.width, height: img1.height };
                const img2Dimensions = { width: img2.width, height: img2.height };

                console.log('Image 1 dimensions:', img1Dimensions);
                console.log('Image 2 dimensions:', img2Dimensions);

                if (img1Dimensions.width !== img2Dimensions.width || img1Dimensions.height !== img2Dimensions.height) {
                    throw new Error('Image sizes do not match.');
                }

                const img1Data = getImageData(img1);
                const img2Data = getImageData(img2);

                return compareImages(img1Data, img2Data, img1Dimensions);
            })
        .then(({ numDiffPixels, differencePercentage }) => {
            if (parseFloat(differencePercentage) > 5) {
                sendEmail('Visual Change Detected', `There was a ${differencePercentage}% change detected in the visuals of ${urlsToTest[urlIndex]}.`);
            }
            // Note: There's no res object here to write responses; it's just a cron job
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Create an HTTP server
const server = http.createServer((req, res) => {
    const urlParts = req.url.split('/');

    if (req.method === 'GET' && urlParts[1] === 'compare' && urlParts[2]) {
        const urlIndex = parseInt(urlParts[2], 10);

        if (isNaN(urlIndex) || urlIndex < 0 || urlIndex >= urlsToTest.length) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            return res.end('Invalid URL index');
        }

        const imagePath1 = generateImagePath(urlsToTest[urlIndex], 1);
        const imagePath2 = generateImagePath(urlsToTest[urlIndex], 2);

        console.log('Trying to load:', imagePath1);
        console.log('Trying to load:', imagePath2);

        Promise.all([loadImage(imagePath1), loadImage(imagePath2)])
            .then(([img1, img2]) => {
                const img1Dimensions = { width: img1.width, height: img1.height };
                const img2Dimensions = { width: img2.width, height: img2.height };

                console.log('Image 1 dimensions:', img1Dimensions);
                console.log('Image 2 dimensions:', img2Dimensions);

                if (img1Dimensions.width !== img2Dimensions.width || img1Dimensions.height !== img2Dimensions.height) {
                    throw new Error('Image sizes do not match.');
                }

                const img1Data = getImageData(img1);
                const img2Data = getImageData(img2);

                return compareImages(img1Data, img2Data, img1Dimensions);
            })
            .then(({ numDiffPixels, differencePercentage }) => {
                if (parseFloat(differencePercentage) > 5) {
                    sendEmail('Visual Change Detected', `There was a ${differencePercentage}% change detected in the visuals of ${urlsToTest[urlIndex]}.`);
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ numDiffPixels, differencePercentage }));
            })
            .catch(error => {
                console.error('Error:', error);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error loading images.');
            });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
    }
});

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Compare images
function compareImages(img1Data, img2Data, img1Dimensions) {
    const { width, height } = img1Dimensions;

    const diff = new Uint8Array(width * height * 4);
    const numDiffPixels = pixelmatch(img1Data, img2Data, diff, width, height, { threshold: 0.1 });

    const totalPixels = width * height;
    const differencePercentage = (numDiffPixels / totalPixels) * 100;

// Log the difference for verification
    console.log(`Difference: ${differencePercentage.toFixed(2)}%`);

    return {
        numDiffPixels,
        differencePercentage: differencePercentage.toFixed(2)
    };
}

// Get image data
function getImageData(image) {
    const canvas = createCanvas(image.width, image.height);
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    return context.getImageData(0, 0, image.width, image.height).data;
}