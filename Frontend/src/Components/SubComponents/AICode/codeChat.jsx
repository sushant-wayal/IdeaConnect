import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

const CodeChat = ({ currCodeId, codeStatus, codeChats, codes, setCodeChats, setCodeFiles, setCodeTitle, setCodeId, setCodes, setIsFirstPreview }) => {
  const [question, setQuestion] = useState("");
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollTo({
      top: messagesEndRef.current?.scrollHeight,
      behavior: "smooth",
    });
  }, [codeChats]);
  const handleSend = async () => {
    if (question) {
      let updateCode = codes.length > 0;
      let { data : { data : { files, title, codeId, answer }} } = await axios.post(`http://localhost:3000/api/v1/codes/${updateCode ? `updateCode/${currCodeId}` : "createCode"}`, { prompt : question }, { headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } });
      files = files.map((file) => ({ ...file, name : file.name.split("/").pop() }));
      console.log("files :", files);
      console.log("title :", title);
      setCodeFiles(files);
      if (title) setCodeTitle(title);
      if (codeId) setCodeId(codeId);
      setIsFirstPreview(true);
      const alreadyExists = codes.find(({ codeId : id }) => id === codeId);
      if (!alreadyExists) setCodes(prev => [{ codeId, title }, ...prev]);
      else setCodes(prev => {
        const updatedCodes = [...prev];
        const index = updatedCodes.findIndex(({ codeId : id }) => id === codeId);
        const thisCode = updatedCodes[index];
        updatedCodes.splice(index, 1);
        updatedCodes.unshift(thisCode);
        return updatedCodes;
      })
      console.log("question :", question);
      console.log("answer :", answer);
      setCodeChats(prev => [
        ...prev,
        {
          chatType: "question",
          content: question
        },
        {
          chatType: "answer",
          content: answer
        }
      ]);
      setQuestion("");
    }
  };
  return (
    <div className="h-full w-72 flex-col justify-between items-center relative p-2 bg-[#797270] rounded-2xl">
      <div className="w-full h-10 bg-[#C1EDCC] rounded-2xl flex justify-center items-center gap-2">
        {codeStatus && <Loader2 size={24} className="animate-spin"/>}
        <p className="text-xl font-semibold text-center">
          {codeStatus || "Code Chat"}
        </p>
      </div>
      <div className="w-full h-0 border-[1px] mt-1 border-black"></div>
      <div className="h-[calc(100%-84px)] overflow-x-hidden overflow-y-scroll flex justify-start items-center flex-col gap-3 pt-2 pb-2" ref={messagesEndRef}>
        {codeChats?.length > 0 ? 
          codeChats.map(({ chatType, content }, ind) => (
            <p
              key={ind}
              className={`w-full p-2 ${chatType === "question" ? "bg-[#C1EDCC]" : "bg-[#908D8D]"} rounded-2xl`}
            >
              {content}
            </p>
          ))
          :
          <div className="flex justify-center items-center h-full w-full">
            <p className="text-2xl">
              Start a Code Chat
            </p>
          </div> 
        }
      </div>
      <div className="flex bottom-0 justify-between w-full h-[44px] items-center border-t-2 pt-1 border-black">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          type="text" placeholder="Ask Me..." className="bg-[#C1EDCC] rounded-full px-2 h-full"/>
        <Send
          onClick={handleSend}
          className="h-full max-h-8 w-12 rounded-full bg-[#C1EDCC] text-black font-semibold flex justify-center items-center gap-2 hover:bg-[#B0C0BC] p-1"/>
      </div>
    </div>
  )
}

export default CodeChat;