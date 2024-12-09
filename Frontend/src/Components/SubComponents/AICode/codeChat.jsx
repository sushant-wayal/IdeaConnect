import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getData } from "../../../dataLoaders";
import axios from "axios";

const CodeChat = ({ codeChats, setCodeFiles, setCodeTitle }) => {
  const [question, setQuestion] = useState("");
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [codeChats]);
  const handleSend = async () => {
    if (question) {
      // const { files, title } = await getData("/codes/createCode", "post", true, { prompt : question });
      let { data : { files, title } } = await axios.post("http://localhost:3000/api/v1/codes/createCode", { prompt : question }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      files = files.map((file) => ({ ...file, name : file.name.split("/").pop() }));
      console.log("files :", files);
      console.log("title :", title);
      setCodeFiles(files);
      setCodeTitle(title);
      setQuestion("");
      // console.log("response :", response);
    }
  };
  return (
    <div className="h-full w-72 flex-col justify-between items-center relative p-2 bg-[#797270] rounded-2xl">
      <div className="w-full h-10 bg-[#C1EDCC] rounded-2xl flex justify-center items-center">
        <p className="text-xl font-semibold text-center">
          Code Chats
        </p>
      </div>
      <div className="w-full h-0 border-[1px] mt-1 border-black"></div>
      <div className="h-[calc(100%-84px)] overflow-x-hidden overflow-y-scroll" ref={messagesEndRef}>
        {codeChats?.length > 0 ? 
          codeChats.map(({ chatType, content }, ind) => (
            <textarea
              key={ind}
              className={`w-full p-2 resize-none ${chatType === "question" ? "bg-[#C1EDCC]" : "bg-[#908D8D]"} rounded-2xl`}
              style={{ height: "auto" }}
              rows={content.split("\n").length+1}
              readOnly
            >
              {content}
            </textarea>
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