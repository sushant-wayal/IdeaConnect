import { toast } from "sonner";
import { Download } from "lucide-react";

const ImageMessage = ({
  align,
  chatTitle,
  messageId,
  imageSrc,
}) => {
  const downloadImage = async () => {
    const toastId = toast.loading("Downloading image...");
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      let a = document.createElement("a");
      a.href = url;
      a.download = `${chatTitle}-${messageId}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Image downloaded successfully.", { id: toastId });
    } catch (error) {
      toast.error(error.response.data.message || "Failed to download image.", { id: toastId });
    }
  }
  return (
    <div className="max-w-96 relative">
      <Download
        size={30}
        color="white"
        className={`p-1 cursor-pointer bg-gray-600 rounded-lg absolute ${align == "start" ? "left-[101%]" : "hidden"}`}
        onClick={downloadImage}
      /> 
      <img
        className="w-full rounded-2xl"
        src={imageSrc}
      />
    </div>
  )
}

export default ImageMessage;