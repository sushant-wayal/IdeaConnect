import { useEffect, useState } from "react";
import CodeHistory from "../SubComponents/AICode/codeHistory";
import CodeChat from "../SubComponents/AICode/codeChat";
import CodeFiles from "../SubComponents/AICode/codeFiles";
import { getData } from "../../dataLoaders";
import { WebContainer } from "@webcontainer/api";

const AICode = () => {
  const [codeId, setCodeId] = useState(null);
  const [codeTitle, setCodeTitle] = useState("");
  const [codeChats, setCodeChats] = useState([]);
  const [codeFiles, setCodeFiles] = useState([]);
  const [codeStatus, setCodeStatus] = useState("");
  const [codes, setCodes] = useState([]);
  const [webContainer, setWebContainer] = useState(null);
  const [isFirstPreview, setIsFirstPreview] = useState(true);
  const [currentFile, setCurrentFile] = useState(null);
  const [generatingCode, setGeneratingCode] = useState(null);

  const initialize = async () => {
    console.log("Initializing WebContainer...")
    const webContainerInstance = await WebContainer.boot();
    console.log("WebContainer initialized", webContainerInstance)
    setWebContainer(webContainerInstance);
  };

  useEffect(() => {
    initialize();
  }, [])

  useEffect(() => {
    const fetchCodeChats = async () => {
      const { chats : codeChats} = await getData(`/codes/codeChats/${codeId}`, "get", true);
      setCodeChats(codeChats);
    };
    if (codeId) fetchCodeChats();
    else setCodeChats([]);
    const fetchCodeFiles = async () => {
      const { codeFiles } = await getData(`/codes/codeFiles/${codeId}`, "get", true);
      setCodeFiles(codeFiles);
    };
    if (codeId) fetchCodeFiles();
    else setCodeFiles([]);
  }, [codeId]);
  return (
    <div className="h-lvh w-lvw p-2 flex gap-2">
      {/* <button
        onClick={async () => {
          const eventSource = new EventSource(`http://localhost:3000/stream-code?prompt=create a simple todo app`);

          eventSource.onmessage = (event) => {
            console.log("event.data", event.data);
          };

          eventSource.onerror = (error) => {
            console.log("error", error);
          };

          eventSource.onopen = () => {
            console.log("eventSource open");
          };
        }}
      >Get Stream</button> */}
      <CodeHistory codes={codes}  setCodes={setCodes} setCodeId={setCodeId} setCodeTitle={setCodeTitle}/>
      <CodeChat currCodeId={codeId} codeChats={codeChats} setCodeChats={setCodeChats} codes={codes} setCodeFiles={setCodeFiles} setCodeTitle={setCodeTitle} codeStatus={codeStatus} setCodeId={setCodeId} setCodes={setCodes} setIsFirstPreview={setIsFirstPreview} setCurrentFile={setCurrentFile} currentFile={currentFile} setGeneratingCode={setGeneratingCode}/>
      <CodeFiles key={codeId} codeFiles={codeFiles} codeTitle={codeTitle} setCodeStatus={setCodeStatus} webContainer={webContainer} isFirstPreview={isFirstPreview} setIsFirstPreview={setIsFirstPreview} currentFile={currentFile} setCurrentFile={setCurrentFile} generatingCode={generatingCode} codeId={codeId}/>
    </div>
  );
};

export default AICode;