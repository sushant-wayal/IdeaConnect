import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const CodeChat = ({ currCodeId, codeStatus, codeChats, codes, setCodeChats, setCodeFiles, setCodeTitle, setCodeId, setCodes, setIsFirstPreview, setCurrentFile, setGeneratingCode }) => {
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
      setCodeChats(prev => [
        ...prev,
        {
          chatType: "question",
          content: question
        }
      ]);

      let eventSource = new EventSource(`http://localhost:3000/stream-code?prompt=${question}&token=${localStorage.getItem("accessToken")}${currCodeId ? `&codeId=${currCodeId}` : ""}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("data", data);
        if (data.codeId) {
          console.log("data.codeId :", data.codeId);
          setCodeId(data.codeId);
          setIsFirstPreview(true);
          const { codeId , title } = data;
          const alreadyExists = codes.find(({ codeId : id }) => id === codeId);
          if (!alreadyExists) {
            setCodes(prev => [{ codeId, title }, ...prev]);
            console.log("codes :", codes);
          }
          else setCodes(prev => {
            const updatedCodes = [...prev];
            const index = updatedCodes.findIndex(({ codeId : id }) => id === codeId);
            const thisCode = updatedCodes[index];
            updatedCodes.splice(index, 1);
            updatedCodes.unshift(thisCode);
            return updatedCodes;
          })
        } else if (data.title) setCodeTitle(data.title);
        else if (data.name && data.path) {
          if (data.name != undefined) setGeneratingCode(data.name);
          if (!data.content) {
            setCodeFiles(prev => {
              if (prev.find((file) => file.name === data.name)) return prev;
              return [...prev, { name: data.name, path: data.path, content: "" }]
            });
            setCurrentFile({ name: data.name, path: data.path, content: "" });
            const pathArray = data.path.split("/");
            for (let i = 0; i < pathArray.length-1; i++) {
              const folderName = pathArray[i];
              document.getElementById(folderName)?.classList.remove("hidden");
            }
          } else {
            setCurrentFile({ name: data.name, path: data.path, content: data.content });
            const pathArray = data.path.split("/");
            for (let i = 0; i < pathArray.length-1; i++) {
              const folderName = pathArray[i];
              document.getElementById(folderName)?.classList.remove("hidden");
            }
            if (data.end) {
              setCodeFiles(prev => prev.map((file) => {
                if (file.name === data.name) return { ...file, content: data.content };
                return file;
              }));
            }
          }
        } else if (data.response) {
          setGeneratingCode(null);
          if (data.response.length == 1) {
            setCodeChats(prev => [
              ...prev,
              {
                chatType: "answer",
                content: data.response
              }
            ]);
          } else {
            setCodeChats(prev => prev.map((chat, ind) => {
              if (ind === prev.length - 1) return { ...chat, content: data.response };
              return chat;
            }));
          }
        }
      };

      eventSource.onerror = (error) => {
        console.log("error", error);
      };

      eventSource.onopen = () => {
        console.log("eventSource open");
      };
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