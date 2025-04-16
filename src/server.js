require('dotenv').config(); // Muat variabel dari .env
const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI; // Ambil dari .env

if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in .env file');
  process.exit(1);
}

// Koneksi ke MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB...');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
  });
})
.catch(err => {
  console.error('Could not connect to MongoDB...', err);
  process.exit(1);
});