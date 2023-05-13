const express = require('express');
const app = express();
const multer = require('multer');
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  },
  limits: { fileSize: 1024 * 1024 }
});
const MongoClient = require('mongodb').MongoClient;
const url =
  'mongodb+srv://admin:Dikush@cluster0.nnh08zd.mongodb.net/expressTest?retryWrites=true&w=majority';
const path = require('path');

const collectionName = 'myCollection';

app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'form.html'));
});

app.post('/upload', upload.single('image'), async (req, res) => {
  const imageUrl = req.file.path;
  console.log(imageUrl);
  let client = null;
  try {
    const obj = {
      name: 'Dipendra',
      imageUrl: imageUrl
    };
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    const collection = client.db().collection(collectionName);
    const result = await collection.insertOne(obj);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  } finally {
    if (client) {
      await client.close();
    }
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).send('File upload error');
  } else if (err) {
    res.status(400).send(err.message);
  } else {
    next();
  }
});

app.listen(8000, () => {
  console.log('Server listening on port 8000');
});

module.exports = app;