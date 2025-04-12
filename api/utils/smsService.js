
import axios from 'axios'

export const sendSMS = async (phoneNumber, message) => {
    try {
        
    
        const response = await axios.post(
            'https://sms.iprogtech.com/api/v1/sms_messages', null,
            {
                params: {
                    api_token: process.env.SMS_API_TOKEN,
                    phone_number: phoneNumber, 
                    message: message,
                },
            }
        );

       console.log(response.data)
    } catch (error) {s
        console.log(error)
        throw error;
    }
};