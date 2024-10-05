const Uploading = ({ loading, size, className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size?.toString() || "24"} height={size?.toString() || "24"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className={`lucide lucide-upload ${className}`}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline
        className={loading ? "animate-uploading" : ""}
        points="17 8 12 3 7 8"
      />
      <line
        className={loading ? "animate-uploading" : ""}
        x1="12"
        x2="12"
        y1="3"
        y2="15"
      />
    </svg>
  )
};

export default Uploading;