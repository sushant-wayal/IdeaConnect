import { useEffect, useState } from "react";
import CodeHistory from "../SubComponents/AICode/codeHistory";
import CodeChat from "../SubComponents/AICode/codeChat";
import CodeFiles from "../SubComponents/AICode/codeFiles";
import { getData } from "../../dataLoaders";

const AICode = () => {
  const [codeId, setCodeId] = useState(null);
  const [codeTitle, setCodeTitle] = useState("");
  const [codeChats, setCodeChats] = useState([]);
  const [codeFiles, setCodeFiles] = useState([]);
  const [codeStatus, setCodeStatus] = useState("");
  const [codes, setCodes] = useState([]);
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
      <CodeChat codeChats={codeChats} setCodeChats={setCodeChats} codes={codes} setCodeFiles={setCodeFiles} setCodeTitle={setCodeTitle} codeStatus={codeStatus} setCodeId={setCodeId} setCodes={setCodes}/>
      <CodeFiles key={codeId} codeFiles={codeFiles} codeTitle={codeTitle} setCodeStatus={setCodeStatus}/>
    </div>
  );
};

export default AICode;