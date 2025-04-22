const mongoose = require('mongoose');

const { Schema } = mongoose;

const projectSchema = new Schema({
  name: { type: String },
  associatedItems: [{
    type: Schema.Types.ObjectId,
    ref: 'Item'
  }],
  allowedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  apiKey: { type: String }
});

projectSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.apiKey;
    return ret;
  }
});

const Project = mongoose.model('Project', projectSchema, 'Project');

module.exports = Project;
