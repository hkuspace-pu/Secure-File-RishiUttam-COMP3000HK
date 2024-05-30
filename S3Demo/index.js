const http = require('http');
const formidable = require('formidable');

const server = http.createServer((req, res) => {
  if (req.url === '/upload' && req.method.toLowerCase() === 'post') {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('An error occurred');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('File uploaded successfully');
    });
    return;
  }

  // Show a file upload form for any other request
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <form action="/upload" enctype="multipart/form-data" method="post">
      <input type="file" name="upload"><br>
      <input type="submit" value="Upload">
    </form>
  `);
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});