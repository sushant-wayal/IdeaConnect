import Idea from "../../Main/Idea";

const IdeaMessage = ({
  align,
  message,
  thisIdea,
  ind,
  messagesLength,
  nextSender,
  activeUsername
}) => {
  const { _id, sender, senderUsername } = message;
  return (
    <div
      key={_id}
      className={`flex flex-col ${align == "start" ? "items-start" : "items-end"} mb-1`}
    >
      <Idea thisIdea={thisIdea}/>
      <p className={`${(ind < messagesLength-1 && nextSender == sender) ? "hidden" : ""} text-sm font-light bg-gray-600 rounded-full px-2 py-1 mt-1`}>{senderUsername == activeUsername ? "You" : senderUsername}</p>
    </div>
  )
}

export default IdeaMessage;