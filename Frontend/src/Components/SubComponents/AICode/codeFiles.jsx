import { useCallback, useEffect, useState } from "react";
import FileSystem from "./fileSystem";
import Editor from '@monaco-editor/react';
import { WebContainer } from "@webcontainer/api";
import { Loader } from "lucide-react";

const updateFileSystem = (fileSystem, pathArray, name, content, start) => {
  const newFileSystem = [...fileSystem];
  if (start === pathArray.length - 1) {
    newFileSystem.push({
      name,
      content,
    });
    return newFileSystem
  }
  let folderIndex = newFileSystem.findIndex(({ name }) => name === pathArray[start]);
  if (folderIndex === -1) {
    newFileSystem.push({
      name: pathArray[start],
      files: [],
    });
    folderIndex = newFileSystem.length - 1;
  }
  newFileSystem[folderIndex] = {
    ...newFileSystem[folderIndex],
    files: updateFileSystem(newFileSystem[folderIndex].files, pathArray, name, content, start + 1),
  };
  return newFileSystem;
};

const updateContent = (fileSystem, name, content) => {
  const newFileSystem = [...fileSystem];
  const fileIndex = newFileSystem.findIndex(({ name : fileName }) => fileName === name);
  if (fileIndex !== -1) {
    newFileSystem[fileIndex] = {
      ...newFileSystem[fileIndex],
      content,
    };
  } else {
    newFileSystem.forEach((file, ind) => {
      if (file.files) {
        newFileSystem[ind] = {
          ...file,
          files: updateContent(file.files, name, content),
        };
      }
    });
  }
  return newFileSystem;
}

const convertTofileSystemTree = (fileSystem) => {
  const fileSystemTree = {};
  fileSystem.forEach(({ name, content, files }) => {
    if (files) {
      fileSystemTree[name] = {
        directory: convertTofileSystemTree(files),
      };
    } else {
      fileSystemTree[name] = {
        file: {
          contents : content,
        }
      }
    }
  });
  return fileSystemTree;
}

const getFileLanguage = (name) => {
  const extension = name.split(".").pop();
  switch (extension) {
    case "js":
      return "javascript";
    case "jsx":
      return "javascript";
    case "ts":
      return "typescript";
    case "tsx":
      return "typescript";
    case "css":
      return "tailwindcss";
    case "html":
      return "html";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "svg":
      return "xml";
    default:
      return "plaintext";
  }
}

const CodeFiles = ({ codeFiles, codeTitle, setCodeStatus }) => {
  const [fileSystem, setFileSystem] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [webContainer, setWebContainer] = useState(null);
  const [isFirstPreview, setIsFirstPreview] = useState(true);
  const [isWebContainerReady, setIsWebContainerReady] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const webContainerInstance = await WebContainer.boot();
      setWebContainer(webContainerInstance);
      setIsWebContainerReady(true);
    };
    initialize();
  }, []);  
  
  const startDevServer = useCallback(async () => {
    if (!isFirstPreview) return;
    console.log("Starting dev server");
    setIsFirstPreview(false);
    if (!isWebContainerReady) {
      console.error("Web container not initialized");
      return;
    }
    console.log("Mounting file system");
    setCodeStatus("Mounting files");
    const fileSystemTree = convertTofileSystemTree(fileSystem);
    if (!fileSystemTree["package.json"]) {
      setIsFirstPreview(true);
      console.error("Error: package.json is missing in the file system tree");
      setCodeStatus("")
      return;
    }
    await webContainer.mount(fileSystemTree);
    console.log("File system mounted");
    console.log("Installing dependencies");
    setCodeStatus("Installing dependencies");
    const installProcess = await webContainer.spawn("npm", ["install"]);
    const exitCode = await installProcess.exit;
    if (exitCode !== 0) {
      setIsFirstPreview(true);
      console.error("npm install failed.");
      setCodeStatus("");
      return;
    }
    console.log("Dependencies installed");
    console.log("Starting dev server");
    setCodeStatus("Starting dev server");
    await webContainer.spawn("npm", ["run", "dev"]);
    webContainer.on("server-ready", (_port, url) => {
      console.log("Server ready at", url);
      setPreviewUrl(url);
      setCodeStatus("");
    });
  }, [webContainer, fileSystem]);
  
  useEffect(() => {
    let updatedFileSystem = [];
    codeFiles.forEach(({ path, name, content }) => {
      const pathArray = path.split("/");
      updatedFileSystem = updateFileSystem(updatedFileSystem, pathArray, name, content, 0);
    });
    setFileSystem((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(updatedFileSystem)) {
        return updatedFileSystem;
      }
      return prev;
    });
  }, [codeFiles, webContainer]);

  const handlePreview = async () => {
    if (!showPreview) await startDevServer();
    setShowPreview((prev) => !prev);
  };

  const handleFileContentChange = (newContent) => {
    console.log("File content changed to", newContent);
    setIsFirstPreview(true);
    // const newFileSystem = [...fileSystem];
    // const updatedFileSystem = newFileSystem.map((file) => {
    //   if (file.name === currentFile.name) {
    //     return {
    //       ...file,
    //       content: newContent,
    //     };
    //   }
    //   return file;
    // });
    // setFileSystem(updatedFileSystem);
    const updatedFileSystem = updateContent(fileSystem, currentFile.name, newContent);
    setFileSystem(updatedFileSystem);
    setCurrentFile({
      ...currentFile,
      content: newContent,
    })
    console.log("File system updated", updatedFileSystem);
  }
  
  if (codeFiles.length === 0) {
    return (
      <div className="bg-[#797270] rounded-2xl flex-grow h-full flex justify-center items-center flex-col text-3xl">
        <p>No code files to display</p>
      </div>
    );
  }
  return (
    <div className="bg-[#797270] rounded-2xl flex-grow h-full p-2 flex flex-col justify-between items-center">
      <div className="w-full h-10 bg-[#C1EDCC] rounded-2xl flex justify-center items-center">
        <p className="text-2xl font-semibold text-center">
          {codeTitle || "Code Files"}
        </p>
      </div>
      <div className="w-full flex-grow flex p-2 justify-between gap-2 overflow-y-scroll">
        <div className="bg-[#908D8D] h-full w-64 overflow-scroll rounded-2xl">
          <FileSystem system={fileSystem} setCurrentFile={setCurrentFile}/>
        </div>
        <div className="h-full flex-grow flex flex-col items-center justify-start gap-2">
          <div className="w-full h-10 rounded-2xl items-center bg-[#C1EDCC] flex justify-between p-2">
            <h3 className="text-xl h-full text-center ">{currentFile?.name}</h3>
            <div className="flex gap-1">
              <button
                onClick={handlePreview}
                className="px-2 py-1 rounded-2xl text-white bg-[#333333]"
              >
                {showPreview ? "Go to Code" : "See Preview"}
              </button>
            </div>
          </div>
          <div className={`${showPreview ? "" : "bg-[#333333]"} w-full rounded-2xl flex-grow overflow-y-scroll`}>
            {showPreview ? 
              <iframe src={previewUrl} className="w-full h-full border-2 border-black rounded-2xl"/>
              :
              currentFile && (
                <Editor
                  value={currentFile.content}
                  onChange={(code) => handleFileContentChange(code)}
                  loading={
                    <Loader size={24} className="animate-spin" color="white"/>
                  }
                  language={getFileLanguage(currentFile.name)}
                  padding={10}
                  theme="vs-dark"
                  className="text-white w-[650px] whitespace-pre-wrap focus:outline-none focus:border-none"
                />
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeFiles;