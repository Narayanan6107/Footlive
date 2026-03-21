import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const { MONGO_USER, MONGO_PASS, MONGO_HOST, MONGO_DB } = process.env;
        
        // Safety check for required vars
        if (!MONGO_USER || !MONGO_PASS || !MONGO_HOST) {
            throw new Error('Missing MongoDB configuration in .env');
        }

        const encodedPass = encodeURIComponent(MONGO_PASS);
        const dbName = MONGO_DB || 'footlive';
        const uri = `mongodb+srv://${MONGO_USER}:${encodedPass}@${MONGO_HOST}/${dbName}?retryWrites=true&w=majority`;

        console.log(`📡 Connecting to cluster: ${MONGO_HOST}...`);
        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ Error Details: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
