import { useEffect, useState } from "react";
import CodeHistory from "../SubComponents/AICode/codeHistory";
import CodeChat from "../SubComponents/AICode/codeChat";
import CodeFiles from "../SubComponents/AICode/codeFiles";
import { getData } from "../../dataLoaders";
import { WebContainer } from "@webcontainer/api";

const AICode = () => {
  const [codeId, setCodeId] = useState(null);
  const [prevCodeId, setPrevCodeId] = useState(null);
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
      console.log("fetchCodeChats", codeId);
      const { chats : codeChats} = await getData(`/codes/codeChats/${codeId}`, "get", true);
      setCodeChats(codeChats);
    };
    if (codeId) fetchCodeChats();
    else setCodeChats([]);
    const fetchCodeFiles = async () => {
      console.log("fetchCodeFiles", codeId);
      const { codeFiles } = await getData(`/codes/codeFiles/${codeId}`, "get", true);
      setCodeFiles(codeFiles);
    };
    if (codeId) fetchCodeFiles();
    else setCodeFiles([]);
  }, [codeId]);

  useEffect(() => {
    const eraseCode = async () => {
      console.log("eraseCode", prevCodeId);
      await getData(`/codes/eraseCodes/${prevCodeId}`, "post", true);
    };
    if (prevCodeId) eraseCode();
  }, [prevCodeId]);

  useEffect(() => {
    const handleUnload = async () => {
      if (!codeId) return;
      console.log("handleUnload", codeId);
      await getData(`/codes/eraseCodes/${codeId}`, "post", true);
    }
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  return (
    <div className="h-lvh w-lvw p-2 flex gap-2">
      <CodeHistory codes={codes}  setCodes={setCodes} setCodeId={setCodeId} setCodeTitle={setCodeTitle} setPrevCodeId={setPrevCodeId}/>
      <CodeChat currCodeId={codeId} codeChats={codeChats} setCodeChats={setCodeChats} codes={codes} setCodeFiles={setCodeFiles} setCodeTitle={setCodeTitle} codeStatus={codeStatus} setCodeId={setCodeId} setCodes={setCodes} setIsFirstPreview={setIsFirstPreview} setCurrentFile={setCurrentFile} currentFile={currentFile} setGeneratingCode={setGeneratingCode}/>
      <CodeFiles key={codeId} codeFiles={codeFiles} codeTitle={codeTitle} setCodeStatus={setCodeStatus} webContainer={webContainer} isFirstPreview={isFirstPreview} setIsFirstPreview={setIsFirstPreview} currentFile={currentFile} setCurrentFile={setCurrentFile} generatingCode={generatingCode} codeId={codeId}/>
    </div>
  );
};

export default AICode;