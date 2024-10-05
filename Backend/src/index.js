import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';
import path from 'path';
import express from 'express';

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
    
    // Deployement code

    const __dirname1 = path.resolve();
    if (process.env.PROJECT_MODE === 'production') {
      app.use(express.static(path.join(__dirname1, '/Frontend/dist')));
      app.get('*', (_req, res) =>
        res.sendFile(path.resolve(__dirname1, 'Frontend', 'dist', 'index.html'))
      );
    }

    // Deployement code
  });
})
.catch((error) => {
  console.error('Error connecting to MongoDB', error);
});