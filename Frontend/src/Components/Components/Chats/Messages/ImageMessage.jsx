import { RiDownloadLine } from "@remixicon/react";

const ImageMessage = ({
  align,
  chatTitle,
  messageId,
  imageSrc,
}) => {
  const downloadImage = async () => {
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
    } catch (error) {
      console.error("Failed to download image", error);
    }
  }
  return (
    <div className="max-w-96 relative">
      <RiDownloadLine
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