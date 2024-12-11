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
      <CodeHistory codes={codes}  setCodes={setCodes} setCodeId={setCodeId} setCodeTitle={setCodeTitle}/>
      <CodeChat currCodeId={codeId} codeChats={codeChats} setCodeChats={setCodeChats} codes={codes} setCodeFiles={setCodeFiles} setCodeTitle={setCodeTitle} codeStatus={codeStatus} setCodeId={setCodeId} setCodes={setCodes} setIsFirstPreview={setIsFirstPreview}/>
      <CodeFiles key={codeId} codeFiles={codeFiles} codeTitle={codeTitle} setCodeStatus={setCodeStatus} webContainer={webContainer} isFirstPreview={isFirstPreview} setIsFirstPreview={setIsFirstPreview}/>
    </div>
  );
};

export default AICode;