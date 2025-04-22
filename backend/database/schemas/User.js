const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  lastLogin: { type: Date },
  allowedProjects: [{
    type: Schema.Types.ObjectId,
    ref: 'Project'
  }],
  profilePicture: {}
});

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  }
});

const User = mongoose.model('User', userSchema, 'User');

module.exports = User;
