const multer = require('multer');
const admin = require('firebase-admin');
// const serviceAccount = require('./serviceAccountKey.json'); // Update with the path to your Firebase service account key
require('dotenv').config()


// Initialize Firebase Admin SDK
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

const bucket = admin.storage().bucket();

// Configure Multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });
const directoryPath = 'uploads/';

// Middleware to handle file upload
const uploadFileToFirebase = (userEmail, req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const blob = bucket.file(`${userEmail}/${directoryPath}${req.file.originalname}`); // Create a reference to the file in Firebase
  const stream = blob.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
    },
  });

  stream.on('error', (err) => {
    console.error('Error uploading file:', err);
    return res.status(500).send('Error uploading file to Firebase.');
  });

  stream.on('finish', () => {
    // File uploaded successfully, proceed to the next middleware
    console.log('File uploaded successfully to Firebase:', req.file.originalname);
  });

  stream.end(req.file.buffer); // Upload the file buffer
};

// Export upload middleware and the Firebase upload function
module.exports = { upload, uploadFileToFirebase, bucket };
