import mongoose from 'mongoose';
import dns from 'dns';

// Force DNS lookup ordering to resolve SRV records properly in Node.js on Windows
dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/equilibrium';
    const conn = await mongoose.connect(connUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Ensure MongoDB is running locally, or configure MONGODB_URI in your .env file.');
    // Graceful degradation for testing scaffolding without failing the app start
  }
};

export default connectDB;
