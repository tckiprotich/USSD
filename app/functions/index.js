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
        response += "2. Login\n";
        response += "3. Forgot PIN";
    } else if (text === "1") {
        // Start the registration process
        response = "CON Enter your registration number: ";
    } else if (text === "2") {
        // Start the login process
        response = "CON Enter your registration number: ";
    } else if (text === "3") {
        // Start the PIN reset process
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
        else if (steps.length === 4) {
            // Handle menu choice
            const choice = steps[3];
            if (choice === "1") {
                response = await viewDetails(steps[1]);
            } else if (choice === "2") {
                response = await viewFeesStatement(steps[1]);
            } else if (choice === "3") {
                response = await viewUnits(steps[1]);
            } else if (choice === "4") {
                // Prompt for unit code
                response = "CON Enter the unit code: ";
            }
        } else if (steps.length === 5 && steps[3] === "4") {
            // Prompt for unit name
            response = "CON Enter the unit name: ";
        } else if (steps.length === 6 && steps[3] === "4") {
            // Handle unit registration
            const registrationNumber = steps[1];
            const unitCode = steps[4];
            const unitName = steps[5];
            response = await registerUnit(registrationNumber, unitCode, unitName);
        }


    }
    else if (text.startsWith("3*")) {
        // Handle PIN reset steps
        const steps = text.split('*');
        if (steps.length === 2) {
            // Prompt for new PIN after registration number
            response = "CON Enter your new PIN: ";
        } else if (steps.length === 3) {
            // Handle PIN reset
            const registrationNumber = steps[1];
            const newPin = steps[2];
            response = await resetPin(registrationNumber, newPin);
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
            // If the PINs match, return a menu
            let response = "CON Choose an option: \n";
            response += "1. View my details \n";
            response += "2. View fees statement \n";
            response += "3. View units\n";
            response += "4. Register units\n";
            return response;
        } else {
            // If the PINs don't match, return an error message
            return "END PIN does not match. Please try again.";
        }
    } else {
        // If the student is not found, return an error message
        return "END You are not enrolled in the system, visit the ICT department to get enrolled";
    }
}

async function viewDetails(registrationNumber) {
    // db connection
    await connectDb();

    // Find the student
    const student = await Student.findOne({ regNo: registrationNumber });

    if (student) {
        // Return the student's details
        return `END Your details:\nName: ${student.name}\nRegistration Number: ${student.regNo}\nPhone Number: ${student.phone}`;
    } else {
        // If the student is not found, return an error message
        return "END You are not enrolled in the system, visit the ICT department to get enrolled";
    }
}

async function viewFeesStatement(registrationNumber) {
    // db connection
    await connectDb();

    // Find the student's fees statement
    const feesStatement = await Student.findOne({ regNo: registrationNumber });

    if (feesStatement) {
        // Return the student's fees statement
        return `END Your fees statement:\nTotal Fees: ${feesStatement.fees}\nPaid: ${feesStatement.paid}\nBalance: ${feesStatement.balance}`;
    } else {
        // If the fees statement is not found, return an error message
        return "END No fees statement found. Please visit the finance department.";
    }
}

async function viewUnits(registrationNumber) {
    // db connection
    await connectDb();

    // Find the student
    const student = await Student.findOne({ regNo: registrationNumber });

    if (student && student.units && student.units.length > 0) {
        // Return the student's units
        let response = "END Your units:\n";
        student.units.forEach(unit => {
            response += `${unit.code}: ${unit.name}\n`;
        });
        return response;
    } else {
        // If no units are found, return an error message
        return "END No units found. Please visit the academic department.";
    }
}

async function registerUnit(registrationNumber, unitCode, unitName) {
    // db connection
    await connectDb();

    // Find the student
    const student = await Student.findOne({ regNo: registrationNumber });

    if (student) {
        // Add the new unit to the student's units
        student.units.push({ code: unitCode, name: unitName });

        // Save the student
        await student.save();

        // Return a success message
        return "END Unit registered successfully!";
    } else {
        // If the student is not found, return an error message
        return "END You are not enrolled in the system, visit the ICT department to get enrolled";
    }
}

async function resetPin(registrationNumber, newPin) {
    // db connection
    await connectDb();

    // Find the student and update their PIN
    const student = await Student.findOneAndUpdate({ regNo: registrationNumber }, { pin: newPin });

    if (student) {
        return "END Your PIN has been reset successfully";
    } else {
        return "END Error resetting PIN. Please try again.";
    }
}