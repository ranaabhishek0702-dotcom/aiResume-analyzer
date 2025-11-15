import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

interface FileUploaderProps{
  onFileSelect?:(file: File | null) => void;
  selectedFile?: File | null;
}

const FileUploader = ({onFileSelect, selectedFile}: FileUploaderProps) => {
    const onDrop = useCallback((acceptedFiles:File[]) => {
        const file = acceptedFiles[0] || null;
        
        // Debug: Log file info
        if (file) {
          console.log('File selected:', {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
          });
          
          // Validate file size
          if (file.size === 0) {
            console.error('WARNING: File size is 0! This file may be corrupted or not fully loaded.');
            alert('Warning: The selected file appears to be empty. Please try selecting the file again.');
            return;
          }
        }
        
        onFileSelect?.(file)
    }, [onFileSelect])

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop, 
    multiple:false,
    accept: {'application/pdf' : ['.pdf']}, 
    maxSize: 20 * 1024 * 1024,
    // Add these options to ensure file is properly read
    noClick: false,
    noKeyboard: false,
  })
  
  const file = selectedFile;
  
  return (
    <div className='w-full gradient-border'>
       <div {...getRootProps()}>
      <input {...getInputProps()} />
      <div className='space-y-4 cursor-pointer'>
        <div className='mx-auto w-16 h-16 flex items-center justify-center '>
          <img src ='/public/icons/info.svg' alt = "upload" className='size-20' />
        </div>
        {file ? (
          <div className='text-center'>
            <p className='text-lg text-gray-700 font-semibold'>
              {file.name}
            </p>
            <p className='text-sm text-gray-500 mt-2'>
              {file.size > 0 
                ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                : '⚠️ File size: 0 bytes (File may be corrupted)'}
            </p>
            {file.size === 0 && (
              <p className='text-xs text-red-500 mt-1'>
                Please try selecting the file again
              </p>
            )}
          </div>
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