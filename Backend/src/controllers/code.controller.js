import { model } from "../app.js";
import { Code } from "../models/code.model.js";
import { basePrompt, templatePrompt } from "../prompts.js";


export const getCodes = async (req, res) => {
  const userId = req.user.id;
  try {
    const codes = await Code.findMany({ userId });
    codes = codes.map((code) => {
      return {
        id: code._id,
        title: code.title,
        lastModified: code.updatedAt
      };
    });
    res.status(200).json(codes);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getCodeFiles = async (req, res) => {
  const { codeId } = req.params;
  try {
    const { codeFiles } = await Code.findOne({ _id: codeId });
    res.status(200).json(codeFiles);
  }
  catch (error) {
    res.status(404).json({ message: error.message });
  }
}

export const getChats = async (req, res) => {
  const { codeId } = req.params;
  try {
    const { chats } = await Code.findOne({ _id: codeId });
    res.status(200).json(chats);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

function parseResponse(xmlText) {
  const files = [];
  const responseRegex = /<response>([\s\S]*?)<\/response>/;
  const titleRegex = /<title>([\s\S]*?)<\/title>/;
  const fileRegex = /<file>([\s\S]*?)<\/file>/g;
  const tagRegex = /<(\w+)>([\s\S]*?)<\/\1>/g;

  // Extract <file> blocks
  let fileMatch;
  while ((fileMatch = fileRegex.exec(xmlText)) !== null) {
    const fileContent = fileMatch[1];
    const fileData = {};
    let tagMatch;
    while ((tagMatch = tagRegex.exec(fileContent)) !== null) {
      fileData[tagMatch[1]] = tagMatch[2].trim();
    }
    files.push(fileData);
  }

  // Extract <response> content
  const responseMatch = responseRegex.exec(xmlText);
  const response = responseMatch ? responseMatch[1].trim() : null;

  // Extract <title> content
  const titleMatch = titleRegex.exec(xmlText);
  const title = titleMatch ? titleMatch[1].trim() : null;

  return { files, answer : response, title };
}

export const createCode = async (req, res) => {
  const { prompt } = req.body;
  // const userId = req.user.id;
  const templateResponse = await model.generateContent(templatePrompt);
  console.log("templateResponse :", templateResponse);
  const template = templateResponse.response.text().trim();
  const { response } = await model.generateContent(basePrompt(template) + prompt);
  console.log("response :", response);
  const { title, files, answer } = parseResponse(response.text().trim());
  console.log("title :", title);
  console.log("files :", files);
  console.log("answer :", answer);
  return res.status(200).json({ template, title, files, answer });
}