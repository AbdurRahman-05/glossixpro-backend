import mongoose from 'mongoose';

const PageContentSchema = new mongoose.Schema({
    pageId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    content: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const PageContent = mongoose.model('PageContent', PageContentSchema);

export default PageContent;
