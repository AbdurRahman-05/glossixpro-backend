import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
    category: { type: String, required: true, enum: ['home', 'about', 'general', 'career-globe'] },
    src: { type: String, required: true },
    alt: { type: String, default: '' },
}, {
    timestamps: true
});

export default mongoose.model('Image', ImageSchema);
