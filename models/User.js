import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'] 
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'] 
  },
  role: { 
    type: String, 
    enum: ['seeker', 'recruiter'], 
    default: 'seeker' 
  },
  resume: { 
    type: String, 
    default: '' 
  },
  appliedJobs: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  savedJobs: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }]
}, { 
  timestamps: true 
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
export { User as UserSchemaModel };
