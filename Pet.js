const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    breed: String,
    birthdate: Date,
    medicalConditions: String, // โรคประจำตัว
    foodAllergies: String,     // แพ้อาหาร
    image: String,
    vaccineLogs: [{
        vaccineName: String,
        date: Date
    }],
    appointments: [{
        title: String,
        date: Date
    }],
    dailyLogs: [{
        date: { type: Date, default: Date.now },
        mood: String,
        note: String,
        image: String           // รูปภาพไดอารี่
    }]
});

module.exports = mongoose.model('Pet', PetSchema);