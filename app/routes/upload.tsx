import {useState, type FormEvent} from 'react'
import Navbar from '~/components/Navbar'
import FileUploader from '~/components/FileUploader'
import { useNavigate } from 'react-router';
import { usePuterStore } from '~/lib/puter';
import { convertPdfToImage } from '~/lib/pdf2img';
import { generateUUID } from '~/lib/utils';
import { prepareInstructions } from '../../constants';


const upload = () => {
  const{auth , isLoading , fs , ai , kv , puterReady, error } = usePuterStore(); // Add puterReady and error
  const navigate = useNavigate();
  const[file , setFile] = useState<File|null>(null)
  const[isProcessing , setIsProcessing] = useState(false);
  const[statusText , setStatusText] = useState('');

  const handleFileSelect = (file : File | null) => {
    if (file) {
      console.log('File received in parent:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Validate file before setting state
      if (file.size === 0) {
        console.error('File size is 0, rejecting file');
        setStatusText('Error: The selected file appears to be empty. Please try again.');
        return;
      }
    }
    setFile(file)
  }

  const handleAnalyze = async({companyName , jobTitle , jobDescription , file} : {companyName : string , jobTitle : string , jobDescription : string , file : File}) => {
    try {
      // Check if Puter is ready
      if (!puterReady) {
        setStatusText('Error: Puter.js is not ready. Please wait a moment and try again.');
        return;
      }

      // Check if user is authenticated (file uploads may require auth)
      if (!auth.isAuthenticated) {
        setStatusText('Error: Please sign in to upload files.');
        navigate('/auth?next=/upload');
        return;
      }

      setIsProcessing(true)
      setStatusText('Uploading the file...')
      
      console.log('Starting upload...', file.name);
      console.log('Puter ready:', puterReady);
      console.log('Auth status:', auth.isAuthenticated);
      
      const uploadedFile = await fs.upload([file])
      console.log('Upload result:', uploadedFile);
      
      if(!uploadedFile) {
        console.error('Upload failed - uploadedFile is:', uploadedFile);
        console.error('Puter error:', error);
        setStatusText(`Error: Failed to upload file. ${error || 'Puter.js may not be available or you may need to sign in.'}`)
        setIsProcessing(false)
        return
      }

      setStatusText('Converting to image...')
      const imageFile = await convertPdfToImage(file);
      if(!imageFile || !imageFile.file) {
        setStatusText('Failed Converting PDF to Image')
        setIsProcessing(false)
        return
      }

      setStatusText('Uploading the Image...');
      const uploadedImage = await fs.upload([imageFile.file]);
      if(!uploadedImage) {
        setStatusText('Error : Failed to Upload Image')
        setIsProcessing(false)
        return
      }

      setStatusText('Preparing Data...');
      const uuid = generateUUID();
      const data = {
        id : uuid,
        resumePath : uploadedFile.path,
        imagePath : uploadedImage.path,
        companyName : companyName,
        jobTitle : jobTitle,
        jobDescription : jobDescription,
        feedback : ''
      }

      await kv.set(`resume:${uuid}`, JSON.stringify(data));
      setStatusText('Analyzing the Resume...');
      const feedback = await ai.feedback(
        uploadedFile.path,
        prepareInstructions({jobTitle , jobDescription })
      )

      if(!feedback) {
        setStatusText('Error: Failed to Analyze Resume')
        setIsProcessing(false)
        return
      }
      
      // Safe access to feedback content
      let feedbackText: string;
      if (typeof feedback.message.content === 'string') {
        feedbackText = feedback.message.content;
      } else if (Array.isArray(feedback.message.content) && feedback.message.content.length > 0) {
        const firstContent = feedback.message.content[0];
        feedbackText = firstContent?.text || '';
      } else {
        setStatusText('Error: Invalid feedback format')
        setIsProcessing(false)
        return
      }

      try {
        data.feedback = JSON.parse(feedbackText);
      } catch (parseError) {
        setStatusText('Error: Failed to parse feedback')
        setIsProcessing(false)
        return
      }

      await kv.set(`resume:${uuid}`, JSON.stringify(data));
      setStatusText('Resume Analyzed Successfully, redirecting...');
      
      // Navigate to result page (adjust path as needed)
      setTimeout(() => {
        navigate(`/resume/${uuid}`)
      }, 1500)
    } catch (error) {
      setStatusText(`Error: ${error instanceof Error ? error.message : 'An unexpected error occurred'}`)
      setIsProcessing(false)
    }
  }
  const handleSubmit = (e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    const form = e.currentTarget; // Fix: use currentTarget directly, not closest
    const formData = new FormData(form)
    const companyName = formData.get('company-name') as string;
    const jobTitle = formData.get('job-title') as string;
    const jobDescription = formData.get('job-description') as string;

    if(!file) {
      setStatusText('Please select a file first');
      return;
    }

    // Validate file size before processing
    if (file.size === 0) {
      setStatusText('Error: The selected file is empty. Please select a valid PDF file.');
      return;
    }

    // Validate required fields
    if(!companyName || !jobTitle || !jobDescription) {
      setStatusText('Please fill in all fields');
      return;
    }

    handleAnalyze({companyName , jobTitle , jobDescription , file});
  }

  return (
    <main className="bg-[url('public/public/images/bg-main.svg')] bg-cover">
          <Navbar/>
          <section className="main-section">
            <div className='page-heading py-16'>
              <h1>Smart feedback for your dream job</h1>
              
              {/* Show Puter status */}
              {!puterReady && (
                <div className='mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded'>
                  Loading Puter.js... Please wait.
                </div>
              )}
              
              {puterReady && !auth.isAuthenticated && (
                <div className='mt-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded'>
                  Please sign in to upload and analyze resumes.
                </div>
              )}
              
              {error && (
                <div className='mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded'>
                  Error: {error}
                </div>
              )}
              
              {isProcessing ? (
                <>
                  <h2>{statusText}</h2>
                  <img src = '/public/images/resume-scan.gif' className = 'w-full'/>
                </>

              ):(<h2>Drop your Resume for score and Improvement tips</h2>)}
              
              {/* Show error message if not processing */}
              {!isProcessing && statusText && statusText.startsWith('Error:') && (
                <div className='mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded'>
                  {statusText}
                </div>
              )}
              
              {!isProcessing && (
                <form id="upload-form" onSubmit={handleSubmit} className='flex flex-col items-center gap-4 mt-8 w-full max-w-3xl mx-auto'>
                  <div className='form-div'>
                    <label htmlFor='company-name'>Company Name
                    </label>
                    <input type='text' name='company-name' placeholder="Company Name" id="company-name" required />
                  </div>
                  <div className='form-div'>
                    <label htmlFor='job-title'>Job Title
                    </label>
                    <input type='text' name='job-title' placeholder="Job Title" id="job-title" required />
                  </div>
                  <div className='form-div'>
                    <label htmlFor='job-description'>Job Description
                    </label>
                    <textarea rows={5} name='job-description' placeholder="Job Description" id="job-description" required />
                  </div>

                  <button className='primary-button' type='submit'>
                    Analyze Resume
                  </button>

                </form>
              )}
            </div>

            {/* Show file info even during processing */}
            {file && (
              <div className='w-full mt-8 flex justify-center'>
                <div className='w-full max-w-3xl mx-auto px-4'>
                  <div className='bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20'>
                    <p className='text-lg text-gray-700 font-semibold'>
                      Selected: {file.name}
                    </p>
                    <p className='text-sm text-gray-500'>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {!isProcessing && (
              <div className='w-full mt-8 flex justify-center'>
                <div className='w-full max-w-3xl mx-auto px-0'>
                  <FileUploader onFileSelect={handleFileSelect} selectedFile={file} />
                </div>
              </div>
            )}

          </section>
    </main>
  )
}

export default upload