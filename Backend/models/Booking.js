const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  checkin: { type: Date, required: true },
  checkout: { type: Date, required: true },
  room: { type: String, required: true },
  guests: { type: Number, required: true },
  paymentId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
