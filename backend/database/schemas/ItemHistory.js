const mongoose = require('mongoose');

const { Schema } = mongoose;

const Action = new Schema({
  action: { type: String },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project'
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  comment: { type: String },
  quantity: { type: Number },
  prevStock: { type: Number },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true }
}, { _id: false });

const ItemHistory = mongoose.model('ItemHistory', new Schema({
  item: {
    type: Schema.Types.ObjectId,
    ref: 'Item'
  },
  actionHistory: [Action]
}), 'ItemHistory');

module.exports = ItemHistory;
