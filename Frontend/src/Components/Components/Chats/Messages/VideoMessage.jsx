import { toast } from "sonner";
import { Download } from "lucide-react";

const VideoMessage = ({
	align,
	chatTitle,
	videoSrc,
	messageId
}) => {
	const downloadVideo = async () => {
		const toastId = toast.loading("Downloading video...");
		try {
			const response = await fetch(videoSrc);
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			let a = document.createElement("a");
			a.href = url;
			a.download = `${chatTitle}-${messageId}`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			toast.success("Video downloaded successfully.", { id: toastId });
		} catch (error) {
			toast.error(error.response.data.message || "Failed to download video.", { id: toastId });
		}
	}
  return (
		<div className="max-w-96 relative">
			<Download
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
  )
}

export default VideoMessage;