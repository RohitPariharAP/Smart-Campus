import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { FiUploadCloud, FiX, FiCheck, FiPaperclip, FiInfo } from 'react-icons/fi';
import api from "../config/axios";
import { useNavigate } from 'react-router-dom';

// Common subjects for autocomplete
const COMMON_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'History', 'Geography', 'Literature', 'Economics',
  'Computer Science', 'Psychology', 'Sociology', 'Philosophy'
];

export default function UploadNote() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    file: null,
    tags: []
  });
  
  const [fileError, setFileError] = useState('');
  const [currentTag, setCurrentTag] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [subjectSuggestions, setSubjectSuggestions] = useState([]);

  // Handle file preview for images
  useEffect(() => {
    if (formData.file && formData.file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(formData.file);
    } else {
      setFilePreview(null);
    }
  }, [formData.file]);

  // Filter subject suggestions based on input
  useEffect(() => {
    if (formData.subject.trim()) {
      const filtered = COMMON_SUBJECTS.filter(subject => 
        subject.toLowerCase().includes(formData.subject.toLowerCase())
      );
      setSubjectSuggestions(filtered.slice(0, 5));
    } else {
      setSubjectSuggestions([]);
    }
  }, [formData.subject]);

  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('subject', formData.subject);
      data.append('description', formData.description);
      data.append('file', formData.file);
      
      // Add tags if available
      if (formData.tags.length > 0) {
        data.append('tags', JSON.stringify(formData.tags));
      }
      
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
      
      // Navigate back to notes page after successful upload
      navigate('/notes');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Upload failed');
      
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      }
    }
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (!file) return;

    const validTypes = [
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      setFileError('Invalid file type. Please upload PDF, Office documents, or images.');
      return;
    }

    if (file.size > maxSize) {
      setFileError('File size exceeds 10MB limit');
      return;
    }

    setFileError('');
    setFormErrors(prev => ({ ...prev, file: null }));
    setFormData(prev => ({ ...prev, file }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = currentTag.trim();
    if (
      trimmedTag && 
      !formData.tags.includes(trimmedTag) && 
      formData.tags.length < 5
    ) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubjectSelect = (subject) => {
    setFormData(prev => ({ ...prev, subject }));
    setSubjectSuggestions([]);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    
    if (!formData.file) {
      errors.file = 'Please select a file';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    uploadMutation.mutate(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user types
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const getFileIcon = () => {
    if (!formData.file) return null;
    
    const fileType = formData.file.type;
    
    if (fileType.includes('pdf')) {
      return '📄';
    } else if (fileType.includes('word')) {
      return '📝';
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
      return '📊';
    } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
      return '📑';
    } else if (fileType.includes('image')) {
      return '🖼️';
    } else {
      return '📁';
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-blue-100 p-3 rounded-full">
          <FiUploadCloud className="h-8 w-8 text-blue-600" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mb-6 text-center">Upload Study Material</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                formErrors.title ? 'border-red-500' : ''
              }`}
              placeholder="Enter a descriptive title"
            />
            {formErrors.title && (
              <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
            )}
          </div>

          {/* Subject Field with Autocomplete */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2">Subject <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                formErrors.subject ? 'border-red-500' : ''
              }`}
              placeholder="e.g. Mathematics, Physics, etc."
            />
            {formErrors.subject && (
              <p className="text-red-500 text-sm mt-1">{formErrors.subject}</p>
            )}
            
            {/* Subject suggestions dropdown */}
            {subjectSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border">
                <ul className="py-1">
                  {subjectSuggestions.map((subject) => (
                    <li
                      key={subject}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSubjectSelect(subject)}
                    >
                      {subject}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Provide a brief description of the content"
            />
          </div>

          {/* Tags Field */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags (up to 5)</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <FiX size={16} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 p-3 border rounded-l-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Add tags (press Enter)"
                disabled={formData.tags.length >= 5}
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={formData.tags.length >= 5}
                className="px-4 bg-blue-50 border border-l-0 rounded-r-lg text-blue-600 hover:bg-blue-100"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tags help other students find your notes more easily
            </p>
          </div>

          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium mb-2">File <span className="text-red-500">*</span></label>
            <div 
              className={`border-2 border-dashed rounded-lg ${
                dragActive ? 'border-blue-500 bg-blue-50' : fileError ? 'border-red-500 bg-red-50' : 'border-gray-300'
              } transition-all`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {formData.file ? (
                <div className="p-6 flex items-center">
                  <div className="mr-4 text-4xl">
                    {filePreview ? (
                      <img 
                        src={filePreview} 
                        alt="Preview" 
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <span>{getFileIcon()}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {formData.file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(formData.file.size / 1024 / 1024).toFixed(2)} MB • {formData.file.type.split('/')[1].toUpperCase()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                    className="p-2 text-gray-500 hover:text-red-500"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUploadCloud className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG (Max 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.txt"
                  />
                </label>
              )}
            </div>
            {fileError && (
              <p className="text-red-500 text-sm mt-2">{fileError}</p>
            )}
            {formErrors.file && !fileError && (
              <p className="text-red-500 text-sm mt-2">{formErrors.file}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm py-2 px-3 bg-blue-50 text-blue-700 rounded-lg">
          <FiInfo size={16} className="flex-shrink-0" />
          <p>Uploaded materials are shared with the community. Make sure you have the right to share this content.</p>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/notes')}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex-1"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex-1 flex items-center justify-center"
            disabled={uploadMutation.isLoading}
          >
            {uploadMutation.isLoading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Uploading...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FiCheck size={18} />
                Upload Note
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}