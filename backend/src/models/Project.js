import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  githubUrl: {
    type: String
  },
  demoUrl: {
    type: String
  },
  tags: [{
    type: String
  }],
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exhibitionName: {
    type: String,
    enum: ['TechExpo 2026', 'CraftFair 2026', 'Bookfair 2026']
  },
  reservationDate: {
    type: Date
  },
  stallType: {
    type: String,
    enum: ['Standard', 'Premium', 'Corner Stall']
  },
  preferredStallSize: {
    type: String,
    enum: ['Small', 'Medium', 'Large']
  },
  numberOfStalls: {
    type: Number,
    min: 1
  },
  businessCategory: {
    type: String,
    enum: ['Food & Beverage', 'Clothing', 'Electronics', 'Handicrafts', 'Services']
  }
}, {
  timestamps: true
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
