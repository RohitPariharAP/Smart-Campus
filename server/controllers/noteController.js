const Note = require("../models/Note.model");
const User = require("../models/User.model");
const fs = require("fs").promises;



const uploadNote = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
  
      const { title, subject, description } = req.body;
      
      const filePath = req.file.path;
      const fullUrl = `${req.protocol}://${req.get('host')}/${filePath}`;
 
      const note = await Note.create({
        title,
        subject,
        description,
        fileUrl: fullUrl,
        uploadedBy: req.user._id
      });
  
      const populatedNote = await Note.findById(note._id)
        .populate('uploadedBy', 'name email');
  
      res.status(201).json(populatedNote);
      
    } catch (error) {
      // Cleanup uploaded file on error
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      res.status(500).json({ error: error.message });
    }
  };
  

const getNotes = async (req, res) => {
    try {

        const {search, subject} = req.query;
        const query = {};

        if(search) {
         query.$or = [
            {title: {$regex: search, $options: "i"}},
            {description: {$regex: search, $options: "i"}},
         ];
        };

        if(subject){
            query.subject = subject
        }

        const notes = await Note.find(query).populate("uploadedBy", 'name email contact').sort('-createdAt');

        res.json(notes);

    } catch (error) {
        res.status(500).json({error: error.message });
        
    }
};

const deleteNote = async (req, res) => {
    try {
      const note = await Note.findById(req.params.id);
      if (!note) return res.status(404).json({ error: 'Note not found' });
  
      // Verify ownership (teacher or uploader)
      if (note.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'teacher') {
        return res.status(403).json({ error: 'Unauthorized deletion' });
      }
     // Extract the relative file path from the fileUrl
     let filePath = note.fileUrl;
     const baseUrl = `${req.protocol}://${req.get('host')}/`;
     if (filePath.startsWith(baseUrl)) {
       filePath = filePath.replace(baseUrl, '');
     }
     // Now filePath should be something like "uploads/filename.pdf"
      // Delete file
      await fs.unlink(filePath); // Fixed typo
      
      await note.deleteOne();
      res.json({ message: 'Note deleted successfully' });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

const updateDownloadCount = async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {uploadNote, getNotes, deleteNote, updateDownloadCount};