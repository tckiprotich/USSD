/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// post
app.post("/ussd", (req, res) => {
    const {sessionId, serviceCode, phoneNumber, text} = req.body;
    
    let response = "";

    if (text === "") {
        response = "CON What would you want to check \n";
        response += "1. My Account \n";
        response += "2. My phone number";
    } else if (text === "1") {
        response = "CON Choose account information you want to view \n";
        response += "1. Account number \n";
        response += "2. Account balance";
    } else if (text === "2") {
        const phoneNumber = "08765432";
        response = `END Your phone number is ${phoneNumber}`;
    } else if (text === "1*1") {
        response = `END Your account number is 1234567890`;
    } else if (text === "1*2") {
        response = `END Your account balance is KES 100`;
    }

    // Send response
    res.set("Content-Type: text/plain");
    res.status(200).send(response);


});




exports.studetportal = onRequest(app);
