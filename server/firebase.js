const admin = require('firebase-admin');
const serviceAccount = require('./path/to/your/serviceAccountKey.json'); // Update with the path to your Firebase service account key

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'YOUR_PROJECT_ID.appspot.com', // Replace with your storage bucket
});

const bucket = admin.storage().bucket();
module.exports = bucket;
