import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    bio: { type: String, required: true },
    image: { type: String }, // URL or base64
    order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('TeamMember', teamMemberSchema);
