import path from "path";
import { model } from "../app.js";
import { Code } from "../models/code.model.js";
import { basePrompt, modificationPrompt, templatePrompt } from "../prompts.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import { exec } from "child_process";

export const getCodes = async (req, res) => {
  const userId = req.user.id;
  try {
    let codes = await Code.find({ userId });
    codes = codes.map((code) => {
      return {
        id: code._id,
        title: code.title,
        lastModified: code.updatedAt
      };
    });
    res.status(200).json(new ApiResponse(200, { codes }));
  } catch (error) {
    console.log("error : ", error);
    res.status(500).json({ message: error.message });
  }
};

export const getCodeFiles = async (req, res) => {
  const { codeId } = req.params;
  try {
    const { codeFiles } = await Code.findOne({ _id: codeId });
    res.status(200).json(new ApiResponse(200, { codeFiles }));
  }
  catch (error) {
    console.log("error : ", error);
    res.status(404).json({ message: error.message });
  }
}

export const getChats = async (req, res) => {
  const { codeId } = req.params;
  try {
    const { chats } = await Code.findOne({ _id: codeId });
    res.status(200).json(new ApiResponse(200, { chats }));
  } catch (error) {
    console.log("error : ", error);
    res.status(404).json({ message: error.message });
  }
}

function parseResponse(xmlText) {
  xmlText = xmlText.replace(/&#39;/g, "'");
  xmlText = xmlText.replace(/&lt;/g, "<");
  xmlText = xmlText.replace(/&gt;/g, ">");
  xmlText = xmlText.replace(/&quot;/g, "\"");
  xmlText = xmlText.replace(/&amp;/g, "&");

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
  const userId = req.user.id;
  const templateResponse = await model.generateContent(templatePrompt + prompt);
  console.log("templateResponse :", templateResponse.response.text().trim());
  const template = templateResponse.response.text().trim();
  const { response } = await model.generateContent(basePrompt(template) + prompt);
  console.log("response :", response.text().trim());
  const { title, files, answer } = parseResponse(response.text().trim());
  console.log("title :", title);
  console.log("files :", files);
  console.log("answer :", answer);
  const newCode = await Code.create({
    userId,
    title,
    codeFiles: files,
    chats: [
      {
        chatType: "question",
        content: prompt
      },{
        chatType: "answer",
        content: answer
      }
    ]
  });
  const codeId = newCode._id;
  return res.status(201).json(new ApiResponse(201, { template, title, files, answer, codeId }));
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
  const { codeId } = req.params;
  const { prompt } = req.body;
  const { codeFiles, chats } = await Code.findOne({ _id: codeId });
  const filesString = stringifyCodeFiles(codeFiles);
  const { response } = await model.generateContent(modificationPrompt(filesString) + prompt);
  const { files, answer } = parseResponse(response.text().trim());
  console.log("files :", files);
  console.log("answer :", answer);
  await Code.findOneAndUpdate({ _id: codeId }, {
    codeFiles: files,
    chats: [
      ...chats,
      {
        chatType: "question",
        content: prompt
      },{
        chatType: "answer",
        content: answer
      }
    ]
  }, { new: true });
  return res.status(200).json(new ApiResponse(200, { files, answer }));
}

export const getUserCode = async (__dirname, codeId) => {
  const { title, codeFiles } = await Code.findOne({ _id: codeId });
  const codePath = path.join(__dirname, '../../public/userCodes', codeId); 
  await fs.promises.mkdir(codePath, { recursive: true });
  for (const { path: codeFilePath, content } of codeFiles) {
    const filePath = path.join(codePath, codeFilePath);
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, content);
  }
  return { title, codePath };
}

export const downloadCode = async (req, res) => {
  const { codeId } = req.params;
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const { title, codePath } = await getUserCode(__dirname, codeId);
  const outputPath = path.join(__dirname, '../../public/userCodes', codeId + '.zip');
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });
  output.on('close', function() {
    res.download(outputPath, `${title}.zip`, (err) => {
      if (err) {
        console.error('Error while downloading the file:', err);
        res.status(500).send('Server error');
      } else {
        fs.rmdirSync(codePath, { recursive: true });
        fs.unlinkSync(outputPath);
      }
    });
  });
  archive.on('error', function(err) {
    throw err;
  });
  archive.pipe(output);
  archive.directory(codePath, false);
  archive.finalize();
};

export const runCode = async (req, res) => {
  try {
    const { codeId } = req.params;
    console.log("Running code", codeId);
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const { codePath } = await getUserCode(__dirname, codeId);
    exec(`cd ${codePath} && npm install && npm run build`, (_error, stdout, stderr) => {
      console.log(`stdout: ${stdout}`);
      if (stderr) console.error(`stderr: ${stderr}`);
      const indexPath = path.join(codePath, 'dist', 'index.html');
      const indexHtml = fs.readFileSync(indexPath, 'utf8').replaceAll('/assets', `/userCodes/${codeId}/dist/assets`).replace('/vite.svg', `/userCodes/${codeId}/dist/vite.svg`);
      fs.writeFileSync(indexPath, indexHtml);
      setTimeout(() => {
        fs.rmSync(codePath, { recursive: true });
      }, 5000);
      res.status(200).json(new ApiResponse(200, { url: `http://localhost:3000/api/v1/codes/userCodes/${codeId}` }));
    });
    
  } catch (error) {
    console.error(`Execution error: ${error.message}`);
    res.status(500).json({ message: `Error running code: ${error.message}` });
  }
};

export const exposeHtml = async (req, res) => {
  const { codeId } = req.params;
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  res.sendFile(path.join(__dirname, '../../public/userCodes', codeId, 'dist', 'index.html'));
}

export const eraseCode = async (req, res) => {
  const { codeId } = req.params;
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const codePath = path.join(__dirname, '../../public/userCodes', codeId);
  fs.rmSync(codePath, { recursive: true });
  res.status(200).json(new ApiResponse(200, { message: "Code erased successfully" }));
}