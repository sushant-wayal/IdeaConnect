import { RiDownloadLine } from "@remixicon/react";

const DocumentMessage = ({
  align,
  message,
  activeUsername,
  chatTitle,
  ind,
  messagesLength,
  nextSender
}) => {
  const { _id, senderUsername, sender } = message;
  const fileSrc = message.message;
  const urlSplit = fileSrc.split("/");
  const fileName = urlSplit[urlSplit.length-1];
  const downloadFile = async () => {
    try {
      const response = await fetch(fileSrc);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      let a = document.createElement("a");
      a.href = url;
      a.download = `${chatTitle}-${message._id}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image", error);
    }
  }
  return (
    <div
      key={_id}
      className={`flex flex-col ${align == "start" ? "items-start" : "items-end"} mb-1`}
    >
      <div className="bg-gray-600 rounded-md flex justify-center items-center p-2 gap-4">
        <RiDownloadLine
          size={30}
          color="white"
          className={`${senderUsername == activeUsername ? "hidden" : ""} p-1 cursor-pointer bg-black rounded-md`}
          onClick={downloadFile}
        />
        <p className="font-semibold text-md text-wrap">{`${senderUsername == activeUsername ? "Shared " : ""}${fileName}`}</p>
      </div>
      <p className={`${(ind < messagesLength-1 && nextSender == sender) ? "hidden" : ""} text-sm font-light bg-gray-600 rounded-full px-2 py-1 mt-1`}>{senderUsername == activeUsername ? "You" : senderUsername}</p>
    </div>
  )
}

export default DocumentMessage;