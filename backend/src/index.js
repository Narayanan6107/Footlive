import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import footballRoutes from './routes/footballRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import lineupRoutes from './routes/lineupRoutes.js';
import User from './models/User.js';
import { seedLineups } from './seeders/lineupSeeder.js';

dotenv.config();

const app = express();
app.use(cors({
    origin: ["http://localhost:5173", "https://footlive-nara.vercel.app"],
    credentials: true
}));
app.use(express.json());

// Root route (for health check)
app.get('/', (req, res) => {
    res.json({ status: 'success', message: 'Footlive Modular Backend is Running!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/football', footballRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/lineup', lineupRoutes);

const PORT = process.env.PORT || 5000;

const seedUsers = async () => {
    try {
        const count = await User.countDocuments();
        if (count === 0) {
            console.log('🌱 Seeding initial fan profiles...');
            const pep = new User({
                username: 'PepGuardiola',
                email: 'pep@city.com',
                password: 'password123',
                bio: 'Playing out from the back is non-negotiable.',
                favoriteFormation: '4-3-3'
            });
            const jose = new User({
                username: 'JoseMourinho',
                email: 'j@s.com',
                password: '123456',
                bio: 'I prefer not to speak. If I speak, I am in big trouble.',
                favoriteFormation: '4-2-3-1'
            });
            await pep.save();
            await jose.save();
            console.log('✅ Seed complete! Login: pep@city.com / password123');
        }
    } catch (e) {
        console.error('Seed error:', e);
    }
};

const startServer = async () => {
    await connectDB();
    
    // Check for seed flag or auto-seed if empty
    if (process.argv.includes('--seed')) {
        await seedUsers();
        await seedLineups();
    } else {
        // Optional: auto-seed logic from original server.js
        await seedUsers();
    }

    app.listen(PORT, () => {
        console.log(`🚀 Footlive Modular Server running on port ${PORT}`);
    });
};

startServer();
