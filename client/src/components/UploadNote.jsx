import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { FiUploadCloud } from 'react-icons/fi';
import api from "../config/axios";

export default function UploadNote() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    file: null
  });
  const [fileError, setFileError] = useState('');

  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('subject', formData.subject);
      data.append('description', formData.description);
      data.append('file', formData.file);
      
      const response = await api.post('/notes', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Note uploaded successfully!');
      queryClient.invalidateQueries(['notes']);
      setFormData({
        title: '',
        subject: '',
        description: '',
        file: null
      });
      setFileError('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Upload failed');
    }
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setFileError('Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG');
      return;
    }

    if (file.size > maxSize) {
      setFileError('File size exceeds 5MB limit');
      return;
    }

    setFileError('');
    setFormData(prev => ({ ...prev, file }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.file) {
      setFileError('Please select a file');
      return;
    }
    uploadMutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Upload New Note</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subject *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">File *</label>
            <div className="flex items-center justify-center w-full">
              <label className={`flex flex-col w-full border-2 border-dashed rounded-lg p-8 text-center 
                ${fileError ? 'border-red-500' : 'border-gray-300 hover:border-blue-500'} 
                transition-all cursor-pointer`}>
                <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                {formData.file ? (
                  <>
                    <p className="font-medium">{formData.file.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600">
                      <span className="text-blue-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                    </p>
                  </>
                )}
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                />
              </label>
            </div>
            {fileError && <p className="text-red-500 text-sm mt-2">{fileError}</p>}
          </div>
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          disabled={uploadMutation.isLoading}
        >
          {uploadMutation.isLoading ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Uploading...
            </span>
          ) : (
            'Upload Note'
          )}
        </button>
      </form>
    </div>
  );
}
