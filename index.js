const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Render-compatible port

app.use(cors({ origin: '*' }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(__dirname));

const firebaseConfig = {
    apiKey: "AIzaSyBnud6_QB0F2JLA_RQKqus1wZYRzp1JYec",
    authDomain: "registration-50099.firebaseapp.com",
    projectId: "registration-50099",
    storageBucket: "registration-50099.firebasestorage.app",
    messagingSenderId: "869320526546",
    appId: "1:869320526546:web:2d771b199f2d0556c6fb0b",
    measurementId: "G-R2RW8CWYNB"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'patelram5002@gmail.com',
        pass: 'nwug edhk ipmb fjps'
    }
});

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/drbp7g1t4/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'emailRegistration';

transporter.verify((error) => {
    if (error) console.error('Email config error:', error);
    else console.log('Email server ready');
});

app.post('/register', async (req, res) => {
    console.log('Received /register request');
    try {
        const { email, image } = req.body;
        if (!email || !email.includes('@')) return res.status(400).json({ message: 'Invalid email' });
        if (!image || !image.startsWith('data:image/')) return res.status(400).json({ message: 'Invalid image' });

        const base64Data = image.replace(/^data:image\/png;base64,/, "");
        const formData = new FormData();
        formData.append('file', `data:image/png;base64,${base64Data}`);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const cloudinaryResponse = await axios.post(CLOUDINARY_URL, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        const imageUrl = cloudinaryResponse.data.secure_url;
        console.log('Cloudinary upload successful:', imageUrl);

        await setDoc(doc(db, 'users', email), { email, imageUrl, timestamp: Date.now() });

        const mailOptions = {
            from: 'patelram5002@gmail.com',
            to: email,
            subject: 'Welcome Cutie 💋',
            html: `<h2>Welcome!</h2><p>"Don't fall in hole focus in goal"</p><img src="${imageUrl}" alt="User Image" style="max-height: 150px;"><p>Thank you for registering with us.</p><p>Best regards,<br>Rachit Patel urff RAM PATEL</p>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);

        res.status(200).json({ message: 'Registration successful! Welcome email sent.', imageUrl });
    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));