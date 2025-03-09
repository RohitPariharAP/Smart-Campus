import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import api from "../config/axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import SearchBar from "../components/SearchBar";
export default function NotesGallery() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const {
    data: notes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notes", searchTerm, selectedSubject],
    queryFn: async () => {
      const res = await api.get("/notes", {
        params: { search: searchTerm, subject: selectedSubject },
      });
      console.log("API Response:", res.data);
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  // Delete mutation: allows uploader or teacher to delete a note
  const deleteMutation = useMutation({
    mutationFn: async (noteId) => {
      const res = await api.delete(`/notes/${noteId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Note deleted successfully");
      queryClient.invalidateQueries(["notes"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Delete failed");
    },
  });

  // Get unique subjects for filtering
  const subjects = [...new Set(notes?.map((note) => note.subject))].sort();

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-red-500">
        Error loading notes: {error.message}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Subjects</option>
            {subjects?.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-100 rounded-lg p-4 h-48"
            />
          ))}
        </div>
      ) : notes?.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No notes found matching your criteria
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes?.map((note) => {
            // Determine if the user can delete this note (uploader or teacher)
            const canDelete =
              user?.id === note.uploadedBy?._id || user?.role === "teacher";

            return (
              <div
                key={note._id}
                className="border rounded-xl p-6 hover:shadow-lg transition-shadow flex flex-col"
              >
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{note.title}</h3>
                    <span className="text-sm text-gray-500">
                      {format(new Date(note.createdAt), "MMM dd")}
                    </span>
                  </div>
                  <span className="inline-block mb-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {note.subject}
                  </span>
                  {note.description && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {note.description}
                    </p>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <a target="_blank"
                      href={note.fileUrl}
                      download
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download ({note.downloads})
                    </a>
                    <span className="text-sm text-gray-500">
                      {note.uploadedBy?.name +
                        " (" +
                        note.uploadedBy?.email +
                        ")"}
                    </span>
                  </div>
                  {canDelete && (
                    <div className="mt-2">
                      <button
                        onClick={() => deleteMutation.mutate(note._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
