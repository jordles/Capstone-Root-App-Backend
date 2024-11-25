# Capstone Root App Backend

Database for my Root application using MongoDB and Mongoose. This is where the backend of my application is located.

[Demo](https://rootapp.netlify.app/)
[Frontend](https://github.com/jordles/Capstone-Root-App-Frontend)


## Overview Directory
    .
    ├── db                      # connecting to database (mongodb)
    │   ├── connect
    ├── models                  # Models (define Mongoose Schemas)
    │   ├── Login
    │   ├── Message 
    │   ├── Post 
    │   └── User            
    ├── routes                  # routes (logins, messages, posts, users)
    │   ├── logins
    │   ├── messages             
    │   ├── posts
    │   └── users
    ├── utils                   # utility (nodemailer / password reset)
    │   └── email
    ├── .env
    ├── .gitignore
    ├── index
    ├── package-lock.json
    ├── package.json
    └── readme.md

## Requirements

| (20%) Project Structure, Standardization, and Convention | Weight | Finished |
| :-- | :--: | :--: |
| Project is organized into appropriate files and directories, following best practices. | 2% | ✅ |
| Project contains an appropriate level of comments. | 2% | ✅ |
| Project is pushed to GitHub, and contains a README file that documents the project, including an overall description of the project. | 5% | ✅ |
| Standard naming conventions are used throughout the project. | 2% | ✅ |
| Ensure that the program runs without errors (comment out things that do not work, and explain your blockers - you can still receive partial credit). | 4% | ✅ |
| Level of effort displayed in creativity, presentation, and user experience. | 5% | ✅ |

| (12%) Core JavaScript | Weight | Finished |
| :-- | :--: | :--: |
| Demonstrate proper usage of ES6 syntax and tools. | 2% | ✅ |
| Use functions and classes to adhere to the DRY principle. | 2% | ✅ |
| Use Promises and async/await, where appropriate. | 2% | ✅ |
| Use Axios or fetch to retrieve data from an API. | 2% | ✅ |
| Use sound programming logic throughout the application. | 2% | ✅ |
| Use appropriate exception handling. | 2% | ✅ |

| (9%) Database | Weight | Finished |
| :-- | :--: | :--: |
| Use MongoDB to create a database for your application. (used mongoose) | 2% | ✅ |
| Apply appropriate indexes to your database collections. | 2% | ✅ |
| able schemas for your data by following data modeling best practices | 2% | ✅ |

| (19%) Server | Weight | Finished |
| :-- | :--: | :--: |
| Create a RESTful API using Node and Express. <br><br> * For the purposes of this project, you may forgo the HATEOAS aspect of REST APIs. | 7% | ✅ |
| Include API routes for all four CRUD operations. | 5% | ✅ |
| Utilize the native MongoDB driver or Mongoose to interface with your database. | 5% | ✅ |
| ~~Include at least one form of user authentication/authorization within the application.~~ (NOT GRADED ON) | 2% |  |

| (35%) Front-End Development | Weight | Finished |
| :-- | :--: | :--: |
| Use React to create the application’s front-end. | 10% | ✅ |
| Use CSS to style the application. | 5% | ✅ |
| Create at least four different views or pages for the application. | 5% | ✅ |
| Create some form of navigation that is included across the application’s pages, utilizing React Router for page rendering. | 5% | ✅ |
| Use React Hooks or Redux for application state management. | 5% | ✅ |
| Interface directly with the server and API that you created. | 5% | ✅ |

## Features and My Learning Process

Password Reset - to implement this functionality I used NodeMailer to send emails to users with a link that they can click on to reset their password. I also used a token to verify the user's email address and prevent unauthorized access.

Reset Token:  
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
