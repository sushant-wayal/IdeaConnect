import { toast } from "sonner";
import { Download } from "lucide-react";
import { useUser } from "../../../../context/user";

const DocumentMessage = ({
  chatTitle,
  senderUsername,
  fileSrc,
  messageId
}) => {
  const { username } = useUser();
  const urlSplit = fileSrc.split("/");
  const fileName = urlSplit[urlSplit.length-1];
  const downloadFile = async () => {
    const toastId = toast.loading("Downloading file...");
    try {
      const response = await fetch(fileSrc);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      let a = document.createElement("a");
      a.href = url;
      a.download = `${chatTitle}-${messageId}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("File downloaded successfully.", { id: toastId });
    } catch (error) {
      toast.error(error.response.data.message || "Failed to download file.", { id: toastId });
    }
  }
  return (
    <div className="bg-[#908D8D] rounded-md flex justify-center items-center p-2 gap-4">
      <Download
        size={30}
        color="white"
        className={`${senderUsername == username ? "hidden" : ""} p-1 cursor-pointer bg-black rounded-md`}
        onClick={downloadFile}
      />
      <p className="font-semibold text-md text-wrap">{`${senderUsername == username ? "Shared " : ""}${fileName}`}</p>
    </div>
  )
}

export default DocumentMessage;