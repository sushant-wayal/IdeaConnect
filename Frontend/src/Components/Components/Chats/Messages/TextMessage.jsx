const TextMessage = ({
  align,
  message,
  messagesLength,
  nextSender,
  activeUsername,
  ind
}) => {
  const { _id, sender, senderUsername } = message;
  const displayMessage = message.message;
  return (
    <div
      key={_id}
      className={`flex flex-col ${align == "start" ? "items-start" : "items-end"} mb-1`}
    >
      <p className={`max-w-96 rounded-2xl text-wrap text-white bg-black p-2`}>{displayMessage}</p>
      <p className={`${(ind < messagesLength-1 && nextSender == sender) ? "hidden" : ""} text-sm font-light bg-gray-600 rounded-full px-2 py-1 mt-1`}>{senderUsername == activeUsername ? "You" : senderUsername}</p>
    </div>
  )
}

export default TextMessage;