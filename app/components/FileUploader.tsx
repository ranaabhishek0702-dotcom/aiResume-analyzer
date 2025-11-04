import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
interface FileUploaderProps{
  onFileSelect?:(File:File | null) => void;

}

const FileUploader = ({onFileSelect} : FileUploaderProps) => {
    const onDrop = useCallback((acceptedFiles:File[]) => {
        const file = acceptedFiles[0] || null;
        onFileSelect?.(file)
    }, [onFileSelect])


  const {getRootProps, getInputProps, isDragActive , acceptedFiles} = useDropzone({onDrop , multiple:false,accept: {'application/pdf' : ['.pdf']} , maxSize: 20 * 1024 * 1024})
  const file = acceptedFiles[0] || null;

  return (
    <div className='w-full gradient-border'>
       <div {...getRootProps()}>
      <input {...getInputProps()} />
      <div className='space-y-4 cursor-pointer'>
        <div className='mx-auto w-16 h-16 flex items-center justify-center '>
          <img src ='public/public/icons/info.svg' alt = "upload" className='size-20' />
        </div>
        {file ? (
          <div></div>
        ): (
          <div>
            <p className='text-lg text-gray-500'>
              <span className='font-semibold'>
                Click to Upload
              </span> or Drag and Drop
            </p>
            <p className='text-lg text-gray-500'>PDF (max 20 MB)</p>
          </div>
        )}

      </div>
   
    </div>
    </div>
  )
}

export default FileUploader