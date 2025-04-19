import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, formatDistance } from "date-fns";
import { debounce } from "lodash";
import api from "../config/axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { 
  FiDownload, 
  FiTrash2, 
  FiSearch, 
  FiFilter, 
  FiUser, 
  FiCalendar, 
  FiTag, 
  FiX, 
  FiAlertCircle,
  FiBookmark,
  FiEye,
  FiFileText,
  FiImage,
  FiFilm,
  FiColumns,
  FiGrid
} from "react-icons/fi";

export default function NotesGallery({ filterType = "all", userId = null }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [fileTypes, setFileTypes] = useState([]);

  // Debounce search term
  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    handler();
    return () => handler.cancel();
  }, [searchTerm]);

  // Apply filter based on filterType prop
  useEffect(() => {
    // Reset sorting when changing filter type
    if (filterType === "popular") {
      setSortOrder("downloads");
    } else if (filterType === "recent") {
      setSortOrder("newest");
    } else {
      setSortOrder("newest");
    }
  }, [filterType]);

  // Query parameters based on all filters
  const queryParams = useMemo(() => {
    const params = {
      search: debouncedSearchTerm,
      subject: selectedSubject,
      sort: sortOrder,
    };

    if (filterType === "myUploads" && userId) {
      params.userId = userId;
    }

    if (fileTypes.length > 0) {
      params.fileTypes = fileTypes.join(",");
    }

    return params;
  }, [debouncedSearchTerm, selectedSubject, sortOrder, filterType, userId, fileTypes]);

  // Fetch notes with all filters
  const {
    data: notes = [],
    isLoading,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["notes", queryParams],
    queryFn: async () => {
      const res = await api.get("/notes", { params: queryParams });
      return Array.isArray(res.data) ? res.data : [];
    },
    staleTime: 60000, // 1 minute
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (noteId) => {
      const res = await api.delete(`/notes/${noteId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Note deleted successfully");
      queryClient.invalidateQueries(["notes"]);
      setConfirmDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Delete failed");
      setConfirmDelete(null);
    },
  });

  // Download tracking mutation
  const downloadMutation = useMutation({
    mutationFn: async (noteId) => {
      const res = await api.post(`/notes/${noteId}/download`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notes"]);
    },
  });

  // Toggle bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async ({ noteId, bookmarked }) => {
      const res = await api.post(`/notes/${noteId}/bookmark`, { bookmarked });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notes"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Could not update bookmark");
    },
  });

  // Get unique subjects for filtering
  const subjects = useMemo(() => {
    return [...new Set(notes?.map((note) => note.subject) || [])].sort();
  }, [notes]);

  // Handle download tracking
  const handleDownload = async (noteId, fileUrl) => {
    try {
      // Open file in new tab
      window.open(fileUrl, "_blank");
      
      // Track download
      downloadMutation.mutate(noteId);
    } catch (error) {
      console.error("Failed to track download:", error);
    }
  };

  // Toggle bookmark
  const toggleBookmark = (noteId, currentStatus) => {
    if (!user) {
      toast.error("Please log in to bookmark notes");
      return;
    }
    
    bookmarkMutation.mutate({ 
      noteId, 
      bookmarked: !currentStatus 
    });
  };

  // Handle file type filtering
  const toggleFileType = (type) => {
    setFileTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  // Apply filter tag
  const addFilter = (type, value, label) => {
    // Avoid duplicates
    if (!activeFilters.some(f => f.type === type && f.value === value)) {
      setActiveFilters([...activeFilters, { type, value, label }]);
    }
    
    // Close filter dropdown
    setShowFilters(false);
  };

  // Remove filter tag
  const removeFilter = (type, value) => {
    setActiveFilters(activeFilters.filter(f => !(f.type === type && f.value === value)));
    
    // Also reset the actual filter
    if (type === 'subject') {
      setSelectedSubject('');
    } else if (type === 'fileType') {
      setFileTypes(fileTypes.filter(t => t !== value));
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters([]);
    setSelectedSubject('');
    setFileTypes([]);
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  // Helper to get file type icon
  const getFileIcon = (fileUrl) => {
    if (!fileUrl) return <FiFileText className="h-5 w-5" />;
    
    const ext = fileUrl.split('.').pop()?.toLowerCase();
    
    if (['pdf'].includes(ext)) {
      return <FiFileText className="h-5 w-5" />;
    } else if (['doc', 'docx', 'txt'].includes(ext)) {
      return <FiFileText className="h-5 w-5" />;
    } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
      return <FiColumns className="h-5 w-5" />;
    } else if (['ppt', 'pptx'].includes(ext)) {
      return <FiFilm className="h-5 w-5" />;
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      return <FiImage className="h-5 w-5" />;
    } else {
      return <FiFileText className="h-5 w-5" />;
    }
  };

  // Helper to simplify file name display
  const getSimpleFileName = (fileUrl) => {
    if (!fileUrl) return "";
    
    // Extract filename from URL
    const filename = fileUrl.split('/').pop();
    
    // Remove query parameters if any
    return filename.split('?')[0];
  };

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-50 text-red-700 rounded-lg" role="alert">
        <div className="flex items-center gap-3 mb-3">
          <FiAlertCircle className="h-6 w-6" />
          <h2 className="font-semibold text-lg">Error loading notes</h2>
        </div>
        <p className="mb-4">{error.message || "Please try again later"}</p>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg flex items-center gap-2"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-t-xl shadow-sm p-5 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search box */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by title, description or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500"
              aria-label="Search notes"
            />
            <FiSearch className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Filter controls */}
          <div className="flex gap-3">
            {/* Subject dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
              >
                <FiFilter className="h-5 w-5" />
                <span>Filters</span>
              </button>

              {/* Filter dropdown */}
              {showFilters && (
                <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg z-10 w-64">
                  <div className="p-3 border-b">
                    <h3 className="font-medium text-gray-700">Filter Options</h3>
                  </div>
                  
                  {/* Subject filter */}
                  <div className="p-3 border-b">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Subject</h4>
                    <select
                      value={selectedSubject}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedSubject(value);
                        if (value) {
                          addFilter('subject', value, `Subject: ${value}`);
                        }
                      }}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Subjects</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* File type filter */}
                  <div className="p-3 border-b">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">File Type</h4>
                    <div className="space-y-2">
                      {['pdf', 'doc', 'image', 'presentation', 'spreadsheet'].map(type => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={fileTypes.includes(type)}
                            onChange={() => {
                              toggleFileType(type);
                              if (!fileTypes.includes(type)) {
                                addFilter('fileType', type, `Type: ${type.toUpperCase()}`);
                              }
                            }}
                            className="mr-2"
                          />
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="p-3 flex justify-end">
                    <button
                      onClick={() => setShowFilters(false)}
                      className="px-3 py-1.5 text-sm bg-gray-100 rounded hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sort options */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=%22black%22 height=%2224%22 viewBox=%220 0 24 24%22 width=%2224%22 xmlns=%22http://www.w3.org/2000/svg%22><path d=%22M7 10l5 5 5-5z%22/><path d=%22M0 0h24v24H0z%22 fill=%22none%22/></svg>')", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="downloads">Most Downloads</option>
              <option value="title">Title A-Z</option>
            </select>
            
            {/* View mode toggle */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${viewMode === "grid" ? "bg-white shadow-sm" : ""}`}
                aria-label="Grid view"
              >
                <FiGrid className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
                aria-label="List view"
              >
                <FiColumns className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-500">Active filters:</span>
            {activeFilters.map((filter, idx) => (
              <span 
                key={`${filter.type}-${filter.value}-${idx}`}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-1"
              >
                {filter.label}
                <button 
                  onClick={() => removeFilter(filter.type, filter.value)}
                  className="ml-1 text-blue-500 hover:text-blue-700"
                >
                  <FiX size={16} />
                </button>
              </span>
            ))}
            <button 
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-800 ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Loading state */}
      {(isLoading || isFetching) ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`animate-pulse bg-white rounded-lg p-6 ${viewMode === "grid" ? "h-64" : "h-24 flex items-center"}`}
            >
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              {viewMode === "grid" && (
                <>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </>
              )}
              <div className="mt-auto pt-4 border-t mt-6">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        // Empty state
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full mb-4">
            <FiFileText className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">No study materials found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {searchTerm || selectedSubject || fileTypes.length > 0 
              ? "Try adjusting your search criteria or removing some filters"
              : "Be the first to share study materials in this category"
            }
          </p>
          {(searchTerm || selectedSubject || fileTypes.length > 0) && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="mb-6 text-gray-600">{notes.length} {notes.length === 1 ? 'note' : 'notes'} found</p>
          
          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note) => {
                // Determine if the user can delete this note
                const canDelete =
                  user?.id === note.uploadedBy?._id || user?.role === "teacher";
                
                // Check if bookmarked
                const isBookmarked = note.bookmarkedBy?.includes(user?.id);
                
                return (
                  <div
                    key={note._id}
                    className="border rounded-xl p-6 hover:shadow-lg transition-shadow flex flex-col bg-white"
                  >
                    <div className="flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold line-clamp-2">{note.title}</h3>
                        <div className="flex items-center gap-2">
                          {user && (
                            <button 
                              onClick={() => toggleBookmark(note._id, isBookmarked)}
                              className={`p-1.5 rounded-full ${isBookmarked ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}
                              aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                            >
                              <FiBookmark className="h-4 w-4" />
                            </button>
                          )}
                          <span className="text-sm text-gray-500 whitespace-nowrap">
                            {format(new Date(note.createdAt), "MMM dd, yyyy")}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {note.subject}
                        </span>
                        
                        {note.fileUrl && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                            {getFileIcon(note.fileUrl)}
                            <span className="uppercase">{note.fileUrl.split('.').pop()}</span>
                          </span>
                        )}
                        
                        {note.tags?.length > 0 && note.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                            <FiTag className="h-3 w-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      {note.description && (
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {note.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-auto pt-4 border-t">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <button
                          onClick={() => handleDownload(note._id, note.fileUrl)}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                          aria-label={`Download ${note.title}`}
                        >
                          <FiDownload className="h-5 w-5" />
                          <span>Download</span>
                          <span className="text-gray-500">({note.downloads || 0})</span>
                        </button>
                        
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <FiUser className="h-4 w-4" />
                          <span title={`${note.uploadedBy?.name} (${note.uploadedBy?.email})`} className="truncate max-w-xs">
                            {note.uploadedBy?.name || "Anonymous"}
                          </span>
                        </div>
                      </div>
                      
                      {canDelete && (
                        <div className="mt-3">
                          {confirmDelete === note._id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => deleteMutation.mutate(note._id)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                disabled={deleteMutation.isLoading}
                              >
                                {deleteMutation.isLoading ? "Deleting..." : "Confirm"}
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(note._id)}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm flex items-center gap-1"
                            >
                              <FiTrash2 className="h-4 w-4" />
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* List View */}
          {viewMode === "list" && (
            <div className="space-y-4">
              {notes.map((note) => {
                // Determine if the user can delete this note
                const canDelete =
                  user?.id === note.uploadedBy?._id || user?.role === "teacher";
                
                // Check if bookmarked
                const isBookmarked = note.bookmarkedBy?.includes(user?.id);
                
                return (
                  <div
                    key={note._id}
                    className="border rounded-xl p-4 hover:shadow-sm transition-shadow bg-white flex items-center"
                  >
                    <div className="mr-4 flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        {getFileIcon(note.fileUrl)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-medium text-gray-900 truncate">{note.title}</h3>
                        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                          {user && (
                            <button 
                              onClick={() => toggleBookmark(note._id, isBookmarked)}
                              className={`p-1.5 rounded-full ${isBookmarked ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'}`}
                              aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                            >
                              <FiBookmark className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {note.subject}
                        </span>
                        
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <FiCalendar className="h-3 w-3" />
                          {formatDistance(new Date(note.createdAt), new Date(), { addSuffix: true })}
                        </span>
                        
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <FiUser className="h-3 w-3" />
                          {note.uploadedBy?.name || "Anonymous"}
                        </span>
                        
                        {note.fileUrl && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <FiEye className="h-3 w-3" />
                            {getSimpleFileName(note.fileUrl)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-shrink-0 flex gap-2">
                      <button
                        onClick={() => handleDownload(note._id, note.fileUrl)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm flex items-center gap-1.5"
                      >
                        <FiDownload className="h-4 w-4" />
                        <span>{note.downloads || 0}</span>
                      </button>
                      
                      {canDelete && (
                        confirmDelete === note._id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => deleteMutation.mutate(note._id)}
                              className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                              disabled={deleteMutation.isLoading}
                            >
                              {deleteMutation.isLoading ? "..." : "Confirm"}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(note._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-gray-100"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}