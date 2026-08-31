import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  asgardeoId: {
    type: String,
    unique: true,
    sparse: true
  },
  provider: {
    type: String,
    enum: ['google', 'asgardeo'],
    default: 'google'
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  profilePic: {
    type: String
  },
  role: {
    type: String,
    enum: ['STUDENT', 'RECRUITER', 'ADMIN'],
    default: 'STUDENT'
  },
  bio: {
    type: String,
    maxLength: 500
  },
  technologies: [{
    type: String
  }],
  location: {
    type: String
  },
  institute: {
    type: String
  },
  contactNumber: {
    type: String
  },
  organizationName: {
    type: String
  },
  isNewUser: {
    type: Boolean,
    default: true
  },
  isDisabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;
