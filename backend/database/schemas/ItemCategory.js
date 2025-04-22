const mongoose = require('mongoose');

const { Schema } = mongoose;

const Property = new Schema({
  name: { type: String },
  unit: { type: String },
}, { _id: false });

const ItemCategory = mongoose.model('ItemCategory', new Schema({
  name: { type: String },
  properties: [Property],
  items: [{
    type: Schema.Types.ObjectId,
    ref: 'Item'
  }]
}), 'ItemCategory');

module.exports = ItemCategory;
