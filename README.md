#



## Features and My Learning Process

Password Reset - to implement this functionality I used NodeMailer to send emails to users with a link that they can click on to reset their password. I also used a token to verify the user's email address and prevent unauthorized access.

Reset Token is:  
* One-time use only
* Randomly generated using Node's crypto library
* Stored as a hash in the database
* Time-limited (expires in 30 minutes) and will be deleted from the database

Flow: 
1. User clicks "Forgot Password?" -> Backend verifies email
2. Enters email → Backend generates token
3. User gets email with reset link
4. Clicks link → Enters new password
5. Backend verifies token and updates password


# Extra Libraries / Packages
nodemailer - to send emails for password reset
bcryptjs - for password encryption
morgan - for logging requests and responses time


## Attributions

[Password Reset](https://www.npmjs.com/package/nodemailer)