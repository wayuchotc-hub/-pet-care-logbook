const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const Pet = require('./models/Pet');

const app = express();

// ตั้งค่าอัปโหลดรูป
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// DB Connection
mongoose.connect('mongodb://127.0.0.1:27017/pet_care_db')
    .then(() => console.log('✅ Connected to Local MongoDB!'))
    .catch(err => console.error('❌ Connection Error:', err));

// Routes
app.get('/', async (req, res) => {
    const pets = await Pet.find();
    res.render('index', { pets });
});

app.get('/add-pet', (req, res) => {
    res.render('add-pet');
});

// บันทึกสมาชิกใหม่
app.post('/add-pet', upload.single('image'), async (req, res) => {
    const { name, type, breed, birthdate, medicalConditions, foodAllergies } = req.body;
    const imagePath = req.file ? '/uploads/' + req.file.filename : '';
    await Pet.create({
        name, type, breed, birthdate,
        medicalConditions, foodAllergies,
        image: imagePath
    });
    res.redirect('/');
});

// หน้าดูไดอารี่
app.get('/pet/:id', async (req, res) => {
    const pet = await Pet.findById(req.params.id);
    res.render('pet-detail', { pet });
});

// เพิ่มบันทึกไดอารี่ + รูปภาพ
app.post('/pet/:id/log', upload.single('logImage'), async (req, res) => {
    const { mood, note } = req.body;
    const logImagePath = req.file ? '/uploads/' + req.file.filename : '';
    await Pet.findByIdAndUpdate(req.params.id, {
        $push: { dailyLogs: { mood, note, image: logImagePath } }
    });
    res.redirect(`/pet/${req.params.id}`);
});

// บันทึกวันฉีดวัคซีน
app.post('/pet/:id/vaccine', async (req, res) => {
    const { vaccineName, date } = req.body;
    await Pet.findByIdAndUpdate(req.params.id, {
        $push: { vaccineLogs: { vaccineName, date } }
    });
    res.redirect(`/pet/${req.params.id}`);
});

// บันทึกวันหมอนัด
app.post('/pet/:id/appointment', async (req, res) => {
    const { title, date } = req.body;
    await Pet.findByIdAndUpdate(req.params.id, {
        $push: { appointments: { title, date } }
    });
    res.redirect(`/pet/${req.params.id}`);
});

app.listen(3000, () => {
    console.log('🚀 Server is running on http://localhost:3000');
});