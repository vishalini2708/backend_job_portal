import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('❌ Error: MONGO_URI is not defined in the environment variables!');
    process.exit(1);
  }

  try {
    mongoose.set('strictQuery', false);
    
    // Connect to MongoDB Atlas
    const conn = await mongoose.connect(mongoUri);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};
