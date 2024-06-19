import { RiDownloadLine } from "@remixicon/react";

const VideoMessage = ({
	align,
	message,
	chatTitle,
	ind,
	messagesLength,
	nextSender,
	activeUsername
}) => {
	const { _id, sender, senderUsername } = message;
	const videoSrc = message.message;
	const downloadVideo = async () => {
		try {
			const response = await fetch(videoSrc);
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
			<div className="max-w-96 relative">
				<RiDownloadLine
					size={30}
					color="white"
					className={`p-1 cursor-pointer bg-gray-600 rounded-lg absolute ${align == "start" ? "left-[101%]" : "hidden"}`}
					onClick={downloadVideo}
				/>
				<video
					controls
					className="w-full rounded-2xl"
					src={videoSrc}
				/>
			</div>
			<p className={`${(ind < messagesLength && nextSender == sender) ? "hidden" : ""} text-sm font-light bg-gray-600 rounded-full px-2 py-1 mt-1`}>{senderUsername == activeUsername ? "You" : senderUsername}</p>
    </div>
  )
}

export default VideoMessage;