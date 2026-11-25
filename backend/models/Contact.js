const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
    },
    age: {
      type: Number,
    },
    disease: {
      type: String,
    },
    subject: {
      type: String,
      default: 'Dietitian Appointment Request',
    },
    message: {
      type: String,
      required: [true, 'Please provide a message'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

ContactSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Contact', ContactSchema);
