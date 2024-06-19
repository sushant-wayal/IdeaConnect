import { RiDownloadLine } from "@remixicon/react";

const AudioMessage = ({
  align,
  message,
  chatTitle,
  ind,
  messagesLength,
  nextSender,
  activeUsername
}) => {
  const { _id, sender, senderUsername } = message;
  const audioSrc = message.message;
  const downloadAudio = async () => {
    try {
      const response = await fetch(audioSrc);
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
      <div className="w-72 relative">
        <RiDownloadLine
          size={30}
          color="white"
          className={`p-1 cursor-pointer bg-gray-600 rounded-lg absolute ${align == "start" ? "left-[101%]" : "hidden"}`}
          onClick={downloadAudio}
        />
        <audio
          controls
          className="w-full rounded-2xl"
          src={audioSrc}
        />
      </div>
      <p className={`${(ind < messagesLength-1 && nextSender == sender) ? "hidden" : ""} text-sm font-light bg-gray-600 rounded-full px-2 py-1 mt-1`}>{senderUsername == activeUsername ? "You" : senderUsername}</p>
    </div>
  )
}

export default AudioMessage;