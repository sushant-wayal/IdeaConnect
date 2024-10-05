const TextMessage = ({ displayMessage }) => {
  return (
    <p className={`max-w-96 rounded-2xl text-wrap text-white bg-black p-2`}>{displayMessage}</p>
  )
}

export default TextMessage;