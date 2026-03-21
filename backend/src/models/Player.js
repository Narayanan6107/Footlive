import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    position: { type: String, required: true }, // GK, DEF, MID, FWD
    specificPosition: { type: String }, // RB, LB, CB, etc.
    number: { type: Number, required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true }
}, { timestamps: true });

export default mongoose.model('Player', playerSchema);
