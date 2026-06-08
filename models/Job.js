import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Job title is required'],
    trim: true
  },
  company: { 
    type: String, 
    required: [true, 'Company name is required'],
    trim: true
  },
  description: { 
    type: String, 
    required: [true, 'Job description is required'] 
  },
  location: { 
    type: String, 
    required: [true, 'Job location is required'],
    trim: true
  },
  salary: { 
    type: String, 
    required: [true, 'Salary range is required'],
    trim: true
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  applicants: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  // Extra professional features:
  experience: { 
    type: String, 
    default: '1-2 Years' 
  },
  jobType: { 
    type: String, 
    enum: ['Remote', 'Hybrid', 'Onsite'], 
    default: 'Remote' 
  },
  category: { 
    type: String, 
    default: 'Other' 
  },
  companyLogo: { 
    type: String, 
    default: '💼' 
  }
}, { 
  timestamps: true 
});

const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);

export default Job;
export { Job as JobSchemaModel };
