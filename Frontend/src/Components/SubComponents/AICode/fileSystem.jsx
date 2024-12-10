import { RiFile2Line } from '@remixicon/react';
import { Folder } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

const FileSystem = ({ name, system, setCurrentFile }) => {
  const subPathRef = useRef(null);
  const handleClick = () => {
    if (subPathRef.current) {
      subPathRef.current.classList.toggle('hidden');
    }
  }
  useEffect(() => {
    console.log("System", system);
  }, [])
  return (
    <div className={`${name ? "ml-1" : ""}`}>
      {name &&
        <div
          onClick={handleClick}
          className='cursor-pointer hover:bg-[#B0C0BC] w-full flex justify-start gap-1 items-center'
        >
          <Folder size={16} />
          <p> {name} </p>
        </div>
      }
      <div className={`ml-1 ${name ? "hidden" : ""}`} ref={subPathRef}>
        {system && system.map((file, index) => {
          if (file.files) {
            return (
              <FileSystem key={index} name={file.name} system={file.files} setCurrentFile={setCurrentFile}/>
            )
          } else {
            return (
              <div
                onClick={() => setCurrentFile({
                  name: file.name,
                  content: file.content
                })}
                className='p-1 flex justify-start items-center cursor-pointer gap-1 hover:bg-[#B0C0BC]'
              >
                <RiFile2Line size={16} />
                <p key={index}>{file.name}</p>
              </div>
            )
          }
        })}
      </div>
    </div>
  )
}

export default FileSystem;