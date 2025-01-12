import { model } from "../app.js";
import { Code } from "../models/code.model.js";
import { basePrompt, modificationPrompt, templatePrompt } from "../prompts.js";
import { GeminiCodeParser } from "gemini-code-parser";

const writeResponse = (res, data) => {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

const generateresponse = async (prompt, res) => {
  const codeParser = new GeminiCodeParser(process.env.GOOGLE_GEN_AI_API_KEY, "gemini-1.5-flash");
  codeParser.on('title', (data) => writeResponse(res, data));
  codeParser.on('file', (data) => {
    data.name = data.name.split('/').pop();
    writeResponse(res, data)
  });
  codeParser.on('response', (data) => writeResponse(res, data));
  const response = await codeParser.generateParsedCodeStream(prompt);
  return response;
}

export const createCode = async (req, res) =>{
  const { prompt } = req.query;
  const templateResponse = await model.generateContent(templatePrompt + prompt);
  const template = templateResponse.response.text().trim();
  const response = await generateresponse(basePrompt(template) + prompt, res);
  const userId = req.user.id;
  const newCode = await Code.create({
    userId,
    title: response.title,
    codeFiles: response.files,
    chats: [
      {
        chatType: "question",
        content: prompt
      },{
        chatType: "answer",
        content: response.response
      }
    ]
  });
  const codeId = newCode._id.toString();
  const data = {
    codeId,
    title: response.title
  }
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

const stringifyCodeFiles = (codeFiles) => {
  let codeFilesString = "";
  codeFiles.forEach(({ name, path, content }) => {
    codeFilesString +=
    `<file>
      <name>${name}</name>
      <path>${path}</path>
      <content>
        ${content}
      </content>
    </file>\n`;
  });
  return codeFilesString;
}

export const updateCode = async (req, res) => {
  const { codeId, prompt } = req.query;
  const userId = req.user.id;
  const code = await Code.findOne({
    _id: codeId,
    userId
  });
  let codeFiles = code.codeFiles;
  const filesString = stringifyCodeFiles(codeFiles);
  const response = await generateresponse(modificationPrompt(filesString) + prompt, res);
  response.files.forEach(file => {
    const index = codeFiles.findIndex(cf => cf.name === file.name && cf.path === file.path);
    if (index !== -1) {
      codeFiles[index].content = file.content;
    } else {
      codeFiles.push(file);
    }
  });
  let codeChats = code.chats;
  codeChats.push({
    chatType: "question",
    content: prompt
  });
  codeChats.push({
    chatType: "answer",
    content: response.response
  });
  await Code.findOneAndUpdate({
    _id: codeId,
    userId
  }, {
    title: response.title || code.title,
    codeFiles,
    chats: codeChats
  });
  const data = {
    codeId,
    title: response.title
  }
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}