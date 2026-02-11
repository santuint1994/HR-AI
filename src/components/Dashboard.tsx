import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../App';
import Sidebar from './Sidebar';

const Dashboard: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file || !token) return
    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')

      const data = await res.json()

      // Save questions
      localStorage.setItem('questionnaires', JSON.stringify(data))

      // Save candidate info
      const candidateEntry = {
        id: Date.now().toString(),
        filename: file.name,
        uploadedAt: new Date().toISOString(),
        questionsCount: Array.isArray(data) ? data.length : 0,
      }

      const existing = localStorage.getItem('processed_candidates')
      const list = existing ? JSON.parse(existing) : []
      list.unshift(candidateEntry) // newest first
      localStorage.setItem('processed_candidates', JSON.stringify(list))

      navigate('/questionnaires')
    } catch (err) {
      console.error("Upload error:", err)
      setError('Failed to process file')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 p-8 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome</h1>
          <p className="text-gray-600 mb-8">Upload candidate resume / profile to generate interview questions</p>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer"
                >
                  <div className="text-blue-600 mb-2">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-700">
                    {file ? file.name : 'Click to upload or drag & drop'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    PDF, DOC, DOCX up to 10MB
                  </p>
                </label>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium
                  hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  transition-all duration-200 flex items-center justify-center shadow-md
                  ${(!file || uploading) ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    </svg>
                    Processing...
                  </>
                ) : 'Generate Interview Questions'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;