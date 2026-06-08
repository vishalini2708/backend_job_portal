import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  jobId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true 
  },
  resume: { 
    type: String, 
    required: [true, 'Resume document is required'] 
  },
  status: { 
    type: String, 
    enum: ['applied', 'reviewing', 'shortlisted', 'rejected'], 
    default: 'applied' 
  },
  // Extra descriptive fields:
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  appliedDate: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);

export default Application;
export { Application as ApplicationSchemaModel };
