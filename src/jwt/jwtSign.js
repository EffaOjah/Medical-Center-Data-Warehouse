require('dotenv').config();
const jwt = require('jsonwebtoken');

const secret = process.env.SECRET;

async function generateJwtToken(userId) {
    return new Promise((resolve, reject) => {
        const payload = {userId};

        console.log('JWT payload: ', payload);
        
        // Check if the secret is provided
        if(!secret) {
            console.log('No secret provided');
            reject('No secret provided');
            return;
        }

        // Generate the token
        jwt.sign(payload, secret, { expiresIn: '1h' }, (err, result) => {
            if (err) {
                console.log('Error generating token: ', err);
                reject(err);
            } else {
                console.log('Successfully generated token');
                resolve(result);
            }
        });
    })
}

module.exports = { generateJwtToken };