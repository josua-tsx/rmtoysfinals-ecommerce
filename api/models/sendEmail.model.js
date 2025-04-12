import mongoose from 'mongoose'

const SendEmailModelSchema = new mongoose.Schema({
    senderEmail: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, {timestamps: true})


const SendEmail = mongoose.model(`SendEmail`, SendEmailModelSchema)

export default SendEmail

