
const mongoose = require('mongoose');
// const slug = require('mongoose-slug-generator');
// mongoose.plugin(slug);

const Schema = mongoose.Schema;

const Customers  = new Schema({
  Ho: {type: String },
  Ten: {type: String},
  TenDem: {type: String},
  HoTenDayDu: {type: String},
  Sdt: {type: String},
  Email: {type: String},
  DateOfBirth: {type: String},
  Gender: {type: String},
  Province: {type: String},
  District: {type: String},
  Ward: {type: String},
  // slug: { type: String, slug: 'Ten', unique: true }

}, { timestamps: true });

module.exports = mongoose.model('Customers', Customers);