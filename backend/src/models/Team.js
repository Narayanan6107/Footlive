import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    league: { type: String, required: true },
    color: { type: String, default: '#ffffff' }
}, { timestamps: true });

export default mongoose.model('Team', teamSchema);
