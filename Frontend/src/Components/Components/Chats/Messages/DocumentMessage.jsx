import { RiDownloadLine } from "@remixicon/react";
import { useEffect } from "react";
import { useUser } from "../../../../context/user";

const DocumentMessage = ({
  chatTitle,
  senderUsername,
  fileSrc,
  messageId
}) => {
  const { username } = useUser();
  const urlSplit = fileSrc.split("/");
  const fileName = urlSplit[urlSplit.length-1];
  const downloadFile = async () => {
    try {
      const response = await fetch(fileSrc);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      let a = document.createElement("a");
      a.href = url;
      a.download = `${chatTitle}-${messageId}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image", error);
    }
  }
  useEffect(() => {
    console.log("DocumentMessage mounted");
    console.log("DocumentMessage props", { username, chatTitle, senderUsername, fileSrc, messageId })
    return () => {
      console.log("DocumentMessage unmounted");
    }
  })
  return (
    <div className="bg-[#908D8D] rounded-md flex justify-center items-center p-2 gap-4">
      <RiDownloadLine
        size={30}
        color="white"
        className={`${senderUsername == username ? "hidden" : ""} p-1 cursor-pointer bg-black rounded-md`}
        onClick={downloadFile}
      />
      <p className="font-semibold text-md text-wrap">{`${senderUsername == username ? "Shared " : ""}${fileName}`}</p>
    </div>
  )
}

export default DocumentMessage;