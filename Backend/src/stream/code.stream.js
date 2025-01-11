import { model } from "../app.js";
import { Code } from "../models/code.model.js";
import { basePrompt, modificationPrompt, templatePrompt } from "../prompts.js";

const possibleTagChar = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/".split("");

const parseResponse = async (prompt, res) => {
  const result = await model.generateContentStream(prompt);

  let onGoingTag = "";
  let onGoingData = "";

  let currentTag = "";
  let onGoingCurrentTag = false;

  let name = "";
  let path = "";
  let content = "";

  const response = {
    files: []
  }

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    for (const char of chunkText) {
      if (char === `<`) {
        currentTag = "";
        onGoingCurrentTag = true;
      } else if (char === ">" && onGoingCurrentTag) {
        onGoingCurrentTag = false;
        if (currentTag === "IdeaConnectFile") {
          onGoingTag = "IdeaConnectFile";
        } else if (currentTag === "IdeaConnectName") {
          onGoingTag = "IdeaConnectName";
        } else if (currentTag === "IdeaConnectPath") {
          onGoingTag = "IdeaConnectPath";
        } else if (currentTag === "IdeaConnectContent") {
          onGoingTag = "IdeaConnectContent";
        } else if (currentTag === "IdeaConnectResponse") {
          onGoingTag = "IdeaConnectResponse";
        } else if (currentTag == "IdeaConnectTitle") {
          onGoingTag = "IdeaConnectTitle";
        } else if (currentTag === "/IdeaConnectFile" || currentTag === "/IdeaConnectResponse" || currentTag === "/IdeaConnectName" || currentTag === "/IdeaConnectPath" || currentTag === "/IdeaConnectContent" || currentTag === "/IdeaConnectTitle") {
          onGoingTag = "";
          if (currentTag == "/IdeaConnectFile") {
            response.files.push({
              name,
              path,
              content
            });
          }
          else if (currentTag == "/IdeaConnectResponse") {
            const data = {
              response : onGoingData.trimStart('\n').trimStart(),
              end: true
            }
            response.response = data.response;
            res.write(`data: ${JSON.stringify(data)}\n\n`);
          } else if (currentTag == "/IdeaConnectName") {
            onGoingData = onGoingData.replace("```xml", "");
            name = onGoingData.trimStart('\n').trimStart();
          } else if (currentTag == "/IdeaConnectPath") {
            const data = {
              name,
              path : onGoingData.trimStart('\n').trimStart()
            };
            path = data.path;
            res.write(`data: ${JSON.stringify(data)}\n\n`);
          } else if (currentTag == "/IdeaConnectContent") {
            const data = {
              name,
              path,
              content : onGoingData.trimStart('\n').trimStart(),
              end: true
            };
            content = data.content;
            res.write(`data: ${JSON.stringify(data)}\n\n`);
          } else if (currentTag == "/IdeaConnectTitle") {
            const data = {
              title : onGoingData.split('\n')[1]
            };
            response.title = data.title;
            res.write(`data: ${JSON.stringify(data)}\n\n`);
          }
          onGoingData = "";
        } else {
          onGoingData += "<" + currentTag + ">";
        }
      } else {
        if (onGoingCurrentTag) {
          currentTag += char;
          if (!possibleTagChar.includes(char)) {
            onGoingCurrentTag = false;
            onGoingData += "<" + currentTag;
          }
        } else {
          onGoingData += char;
        }
      }
      if (onGoingTag === "IdeaConnectContent") {
        const data = {
          name,
          path,
          content : onGoingData.trimStart('\n').trimStart()
        };
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      } else if (onGoingTag === "IdeaConnectResponse") {
        const data = {
          response : onGoingData.trimStart('\n').trimStart()
        }
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    }
  }
  return response;
}

export const createCode = async (req, res) =>{
  const { prompt } = req.query;
  const templateResponse = await model.generateContent(templatePrompt + prompt);
  const template = templateResponse.response.text().trim();
  const response = await parseResponse(basePrompt(template) + prompt, res);
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
  console.log("updateCode");
  const { codeId, prompt } = req.query;
  const userId = req.user.id;
  const code = await Code.findOne({
    _id: codeId,
    userId
  });
  let codeFiles = code.codeFiles;
  const filesString = stringifyCodeFiles(codeFiles);
  const response = await parseResponse(modificationPrompt(filesString) + prompt, res);
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