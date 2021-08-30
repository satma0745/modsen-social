const { Schema } = require('mongoose')

const contactSchema = new Schema({
  type: {
    type: String,
    required: true,
    maxLength: 20,
    trim: true,
  },
  value: {
    type: String,
    required: true,
    maxLength: 100,
    trim: true,
  },
})

module.exports = contactSchema
