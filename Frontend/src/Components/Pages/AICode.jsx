import { useEffect, useState } from "react";
import CodeHistory from "../SubComponents/AICode/codeHistory";
import CodeChat from "../SubComponents/AICode/codeChat";
import CodeFiles from "../SubComponents/AICode/codeFiles";

const AICode = () => {
  const [codeId, setCodeId] = useState(null);
  const [codeTitle, setCodeTitle] = useState("");
  const [codeChats, setCodeChats] = useState([]);
  const [codeFiles, setCodeFiles] = useState([]);
  useEffect(() => {
    const fetchCodeChats = async () => {
      const codeChats = await getData(`/codeChats/${codeId}`, "get", true);
      setCodeChats(codeChats);
    };
    if (codeId) fetchCodeChats();
    else setCodeChats([]);
    const fetchCodeFiles = async () => {
      const codeFiles = await getData(`/codeFiles/${codeId}`, "get", true);
      setCodeFiles(codeFiles);
    };
    if (codeId) fetchCodeFiles();
    else setCodeFiles([]);
  }, [codeId]);
  return (
    <div className="h-lvh w-lvw p-2 flex gap-2">
      <CodeHistory setCodeId={setCodeId} setCodeTitle={setCodeTitle}/>
      <CodeChat codeChats={codeChats} setCodeFiles={setCodeFiles} setCodeTitle={setCodeTitle}/>
      <CodeFiles codeFiles={codeFiles} codeTitle={codeTitle}/>
    </div>
  );
};

export default AICode;