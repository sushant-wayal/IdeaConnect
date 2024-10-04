import { io } from "../app.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAi = new GoogleGenerativeAI(process.env.GOOGLE_GEN_AI_API_KEY);
const model = genAi.getGenerativeModel({model: "gemini-1.5-flash"})

const textSuggestions = () => {
  io.on("connection", (socket) => {
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
    socket.on("requestSuggestions", async ({text}) => {
      text = text.trim();
      console.log("text :", text);
      if (!text) return;
      const prompt = "Given the following text, please provide a suggestion for the next sentence, response should contain only next 5 words, also avoid repeating the text : " + text;
      try {
        const { response } = await model.generateContent(prompt);
        const responseText = response.text().replace(/[\n\t\s]+$/, "");
        console.log("response text :", responseText);
        socket.emit("reciveSuggestions", { suggestion: responseText });
      } catch (error) {
        console.log("error :", error);
        socket.emit("reciveSuggestions", { suggestion: "Sorry, I am not able to generate suggestions for this text." });
      }
    })
  });
}

export {
  textSuggestions
}