const mongoose = require('mongoose');
const db = require("./connect.mongo");
const Student = require('./models/student');

// student 1
const student = {
    name: "John Doe",
    regNo: "SC/2018/001",
    phone: "0712345678",
    fees: 100000,
    balance: 0,
    paid: 100000
}

// student 2
const student2 = {
    name: "Jane Doe",
    regNo: "SC/2018/002",
    phone: "0712345679",
    fees: 100000,
    balance: 0,
    paid: 100000
}


// add them to db
const add = async () => {
    console.log('Adding students to db');
    await db()
    console.log('Connected to db');
    const Student = mongoose.model('Student');
    const newStudent = new Student(student);
    const newStudent2 = new Student(student2);
    await newStudent.save();
    await newStudent2.save();
    console.log('Students added successfully');
}

// run the function
add();