import { NextResponse } from 'next/server'
import dotenv from 'dotenv'

export async function GET(request: Request) {
    const credentials = {
        apiKey: process.env.apiKey,
        username: process.env.username,
    };
    console.log("Your data", credentials)

    // africastalking.initialize(credentials);
    const AfricasTalking = require('africastalking')(credentials);
    const ussd = AfricasTalking.USSD;

    const { sessionId, serviceCode, phoneNumber, text } = await request.json()

    const data = {
        sessionId,
        serviceCode,
        phoneNumber,
        text
    }

    console.log("Your data", data)

    let response = '';
    if (text === '') {
        // This is the first request. Note how we start the response with CON
        response = 'CON Welcome to our service. Please choose an option:\n1. Check balance\n2. Top up';
    } else if (text === '1') {
        // Business logic for first level response
        response = 'CON Your balance is $10';
    } else if (text === '2') {
        // Business logic for first level response
        response = 'CON Please enter the amount you want to top up';
    } else {
        response = 'END Invalid option';
    }

    return NextResponse.json({ message: response })
}