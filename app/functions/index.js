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
app.post("/ussd", async (req, res) => {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    let response = "";

    if (text === "") {
        response = "CON Hello Welcome to your student portal \n";
        response += "1. Register \n";
        response += "2. Login";
    } else if (text === "1") {
        // Start the registration process
        response = "CON Enter your registration number: ";
    } else if (text.startsWith("1*")) {
        // Handle registration steps
        const steps = text.split('*');
        if (steps.length === 2) {
            // Handle registration based on the entered registration number
            const registrationNumber = steps[1];
            response = await createAccount(registrationNumber);
        }
    }

    // Send response
    res.set("Content-Type: text/plain");
    res.status(200).send(response);
});

exports.studentportal = functions.https.onRequest(app);

// function to handle register
async function createAccount(registrationNumber) {
    // db connection
    await connectDb();

    // check if student exists
    const student = await Student.findOne({ regNo: registrationNumber });
    if (student) {
        return "END Student already exists";
    }
    else {
        return "END Your are not enrolled in the system, visit the ICT department to get enrolled";
    }

    // If student doesn't exist, create new student
    const newStudent = new Student({ regNo: registrationNumber });
    await newStudent.save();

    return "END Your account has been created successfully";
}