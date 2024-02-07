const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define your schema here
const studentSchema = new Schema({
    // schema definition
    name: {
        type: String,
        required: true
    },
    regNo: {
        type: String,
        required: true
    },
    phone: {
        type: Date,
        required: true
    },
    fees: {
        type: Number,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    paid: {
        type: Number,
        required: true
    }

});


let Student;
try {
    Student = mongoose.model('Student');
} catch (error) {
    Student = mongoose.model('Student', studentSchema);
}

module.exports = Student;