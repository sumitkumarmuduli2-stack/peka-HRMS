import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/peka_hrms'
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Log helpful notice if MongoDB server isn't running
    console.log('Ensure you have a local MongoDB server active, or configure MONGODB_URI in your .env file.');
    process.exit(1);
  }
};

export default connectDB;
