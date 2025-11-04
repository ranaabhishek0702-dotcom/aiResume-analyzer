import {useState, type FormEvent} from 'react'
import Navbar from '~/components/Navbar'
import FileUploader from '~/components/FileUploader'

const upload = () => {
  const handleFileSelect = (file : File | null) => {
    setFile(file)
  
  }
  const handleSubmit = (e:FormEvent<HTMLFormElement>)=>{

  }
  const[file , setFile] = useState<File|null>(null)
  const[isProcessing , setIsProcessing] = useState(false);
  const[statusText , setStatusText] = useState('');
  return (
    <main className="bg-[url('public/public/images/bg-main.svg')] bg-cover">
          <Navbar/>
          <section className="main-section">
            <div className='page-heading py-16'>
              <h1>Smart feedback for your dream job</h1>
              {isProcessing ? (
                <>
                  <h2>{statusText}</h2>
                  <img src = 'public/public/images/resume-scan.gif' className = 'w-full'/>
                </>

              ):(<h2>Drop your Resume for score and Improvement tips</h2>)}
              {!isProcessing && (
                <form id = "upload-form" onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8'>
                  <div className='from-div'>
                    <label htmlFor='compant-name'>Company Name
                    </label>
                    <input type = 'text' name = 'company-name' placeholder = "Company Name" id = "company-name" >
                    </input>
                  </div>
                  <div className='from-div'>
                    <label htmlFor='job-title'>Job Title
                    </label>
                    <input type = 'text' name = 'job-title' placeholder = "Job Title" id = "job-title" />
                  </div>
                  <div className='from-div'>
                    <label htmlFor='job-title'>Job Description
                    </label>
                    <textarea rows = {5} name = 'job-description' placeholder = "Job Description" id = "job-description" />
                  </div>
                  <div className='from-div'>
                    <label htmlFor='uploader'>Upload Resume
                    </label>
                    <div>
                      <FileUploader onFileSelect = {handleFileSelect}/>
                    </div>
                  
                  </div>

                  <button className='primary-button' type = 'submit'>
                    Analyze Resume
                  </button>
                  

                </form>
              )}
            </div>

          
          </section>
    </main>
  )
}

export default upload