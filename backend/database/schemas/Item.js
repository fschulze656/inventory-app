const mongoose = require('mongoose');

const { Schema } = mongoose;

const BomItem = new Schema({
  itemId: {
    type: Schema.Types.ObjectId,
    ref: 'Item'
  },
  requiredQuantity: { type: Number }
}, { _id: false });

const Property = new Schema({
  name: { type: String },
  unit: { type: String },
  value: { type: Number }
}, { _id: false });

const Item = mongoose.model('Item', new Schema({
  name: { type: String },
  inStock: { type: Number, default: 0 },
  measurementUnit: { type: String },
  unitPrice: { type: Number },
  associatedProjects: [{
    type: Schema.Types.ObjectId,
    ref: 'Project'
  }],
  bom: [BomItem],
  history: {
    type: Schema.Types.ObjectId,
    ref: 'ItemHistory'
  },
  isAssembly: { type: Boolean, default: false },
  minAllowedQuantity: { type: Number, default: 0 },
  shopLink: { type: String },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'ItemCategory'
  },
  properties: [Property],
  location: { type: String },
  totalIn: { type: Number, default: 0 },
  totalOut: { type: Number, default: 0 },
  totalAssembled: { type: Number, default: 0 },
  documentations: [{ type: Schema.Types.ObjectId }],
  productImage: {}
}), 'Item');

module.exports = Item;
