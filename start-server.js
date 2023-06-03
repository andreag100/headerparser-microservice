const http = require('http');
const { spawn } = require('child_process');

// Create an HTTP server
const server = http.createServer((req, res) => {
  if (req.url === '/start-server') {
    // Start the server.js script
    const childProcess = spawn('node', ['server.js']);
  
    // Handle the output of the child process
    childProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
  
    childProcess.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
  
    // Send response
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Server started');
  } else {
    // Send 404 Not Found for other routes
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Start the HTTP server
const port = 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
