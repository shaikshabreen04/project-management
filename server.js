import dotenv from 'dotenv';

dotenv.config();

import mongoose from 'mongoose';
import app from './main.js';


const PORT = process.env.PORT || 5000;


async function start() {

    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log('Connected to MongoDB');

        console.log('SMTP USER:', process.env.SMTP_USER);
        console.log(
            'SMTP PASS EXISTS:',
            !!process.env.SMTP_PASS
        );

        app.listen(PORT, () => {

            console.log('Server started');

            console.log(
                `Open http://localhost:${PORT}`
            );

        });

    } catch (err) {

        console.error(
            'Could not connect to MongoDB'
        );

        console.error(err.message);

        process.exit(1);

    }
}


start();