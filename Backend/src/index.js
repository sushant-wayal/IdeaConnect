import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';

dotenv.config({
    path: './.env',
});

connectDB()
.then(() => {
    app.on('error', (error) => {
        console.error('Express error:', error);
    });
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
})
.catch((error) => {
    console.error('Error connecting to MongoDB', error);
});