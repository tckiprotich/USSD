const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const connectDb = require("./connect.mongo");
const Student = require("./models/student");

const firebase = require("firebase/app");
require("firebase/firestore");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// function to handle ussd
app.post("/ussd", async(req, res) => {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    let response = "";

    if (text === "") {
        response = "CON Hello Welcome to your student portal \n";
        response += "1. Register \n";
        response += "2. Login";
    } else if (text === "1") {
        // Start the registration process
        response = "CON Enter your registration number: ";
    } else if (text === "2") {
        // Start the login process
        response = "CON Enter your registration number: ";
    } else if (text.startsWith("1*")) {
        // Handle registration steps
        const steps = text.split('*');
        if (steps.length === 2) {
            // Handle registration based on the entered registration number
            const registrationNumber = steps[1];
            response = await createAccount(registrationNumber);
        } else if (steps.length === 3) {
            // Handle PIN setting
            const registrationNumber = steps[1];
            const pin = steps[2];
            response = await setPin(registrationNumber, pin);
        }
    } else if (text.startsWith("2*")) {
        // Handle login steps
        const steps = text.split('*');
        if (steps.length === 2) {
            // Prompt for PIN after registration number
            response = "CON Enter your PIN: ";
        } else if (steps.length === 3) {
            // Handle PIN verification
            const registrationNumber = steps[1];
            const providedPin = steps[2];
            response = await login(registrationNumber, providedPin);
        }
    }

    // Send response
    res.set("Content-Type: text/plain");
    res.status(200).send(response);
});

exports.studentportal = functions.https.onRequest(app);

// function to handle register
async function createAccount(registrationNumber){
    // db connection
    await connectDb();

    // check if student exists and has no PIN set
    const student = await Student.findOne({ regNo: registrationNumber });
    if (student) {
        if (student.pin == null) {
            // If the student doesn't have a PIN, prompt them to provide a PIN
            return "CON You have not set a PIN. Please enter a new PIN:";
        } else {
            // If the student already has a PIN, return a different message
            return "END You already have a PIN set.";
        }
    } else {
        return "END You are not enrolled in the system, visit the ICT department to get enrolled";
    }
}

async function setPin(registrationNumber, pin) {
    // db connection
    await connectDb();

    // Find the student and update their PIN
    const student = await Student.findOneAndUpdate({ regNo: registrationNumber }, { pin: pin });

    if (student) {
        return "END Your PIN has been set successfully";
    } else {
        return "END Error setting PIN. Please try again.";
    }
}

async function login(registrationNumber, providedPin) {
    // db connection
    await connectDb();

    // Find the student
    const student = await Student.findOne({ regNo: registrationNumber });

    if (student) {
        if (student.pin === Number(providedPin)) {
            // If the PINs match, return a success message
            return "END You're logged in!";
        } else {
            // If the PINs don't match, return an error message
            return "END PIN does not match. Please try again.";
        }
    } else {
        // If the student is not found, return an error message
        return "END You are not enrolled in the system, visit the ICT department to get enrolled";
    }
}