import { Schema } from 'mongoose'

interface IContactSchema {
  type: string
  value: string
}

const contactSchema = new Schema<IContactSchema>({
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

export { contactSchema, IContactSchema }
