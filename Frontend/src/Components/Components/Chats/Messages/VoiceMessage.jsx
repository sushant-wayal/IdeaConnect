import { RiPauseCircleFill, RiPlayCircleFill } from "@remixicon/react";

const VoiceMessage = ({
  align,
  message,
  ind,
  messagesLength,
  nextSender,
  activeUsername
}) => {
  const { _id, sender, senderUsername } = message;
  const handleClick = (e) => {
    e.stopPropagation();
    let currNode = e.target;
    if (e.target.tagName == "svg") currNode = e.target.parentNode;
    else if (e.target.tagName == "path") currNode = e.target.parentNode.parentNode;
    const audioNode = currNode.parentNode.previousSibling;
    const playNode = currNode.firstChild;
    const pauseNode = currNode.lastChild;
    if (audioNode.paused) audioNode.play();
    else audioNode.pause();
    audioNode.onended = () => {
      playNode.classList.remove("hidden");
      pauseNode.classList.add("hidden");
    }
    audioNode.onplay = () => {
      playNode.classList.add("hidden");
      pauseNode.classList.remove("hidden");
    }
    audioNode.onpause = () => {
      playNode.classList.remove("hidden");
      pauseNode.classList.add("hidden");
    }
    audioNode.addEventListener("timeupdate", () => {
      let { currentTime, duration } = audioNode;
      const durSec = Math.floor(duration%60);
      const progress = isNaN(durSec) ? Math.floor(Math.random()*(11)) + 70 : (currentTime/duration)*100;
      currNode.nextSibling.value = progress;
      const currMin = Math.floor(currentTime/60);
      const currSec = Math.floor(currentTime%60);
      const durMin = Math.floor(duration/60);
      const currTimeText = `${currMin}:${currSec.toString().padStart(2,'0')}`
      const durTimeText = isNaN(durSec) ? "" : ` / ${durMin}:${durSec.toString().padStart(2,'0')}`;
      currNode.nextSibling.nextSibling.innerText = `${currTimeText}${durTimeText}`;
    })
    audioNode.addEventListener("loadedmetadata", () => {
      let { currentTime, duration } = audioNode;
      const currMin = Math.floor(currentTime/60);
      const currSec = Math.floor(currentTime%60);
      const durMin = Math.floor(duration/60);
      const durSec = Math.floor(duration%60);
      const currTimeText = `${currMin}:${currSec.toString().padStart(2,'0')}`
      const durTimeText = isNaN(durSec) == "infinity" ? "" : ` / ${durMin}:${durSec.toString().padStart(2,'0')}`;
      currNode.nextSibling.nextSibling.innerText = `${currTimeText}${durTimeText}`;
      currNode.nextSibling.readOnly = false;
    });
  }
  return (
    <div
      key={_id}
      className={`flex flex-col ${align == "start" ? "items-start" : "items-end"} mb-1 relative`}
    >
      <audio
        controls
        src={message.message}
      />
      <div className={`absolute top-0 ${align == "start" ? "left-0" : "right-0"} bg-green-600 h-[65%] w-80 rounded-full flex p-2 justify-between items-center`}>
        <button onClick={handleClick}>
          <RiPlayCircleFill size={40}/>
          <RiPauseCircleFill size={40} className="hidden"/>
        </button>
        <input
          onChange={(e) => {
            const currNode = e.target;
            const audioNode = currNode.parentNode.previousSibling;
            audioNode.currentTime = (parseInt(e.target.value)/100)*audioNode.duration;
            audioNode.play();
          }}
          readOnly
          type="range"
          defaultValue={0}
          max={100}
          className="w-4/5"
        />
        <p className="absolute bottom-0 right-7 text-sm">0:00</p>
      </div>
      <p className={`${(ind < messagesLength-1 && nextSender == sender) ? "hidden" : ""} text-sm font-light bg-gray-600 rounded-full px-2 py-1 mt-1`}>{senderUsername == activeUsername ? "You" : senderUsername}</p>
    </div>
  )
}

export default VoiceMessage;