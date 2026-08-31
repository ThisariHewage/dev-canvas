import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, updateProject, deleteProject } from '../api/project.api';
import { toast } from 'react-toastify';
import useAuthStore from '../store/authStore';

const EditProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    githubUrl: '',
    demoUrl: '',
    tags: '',
  });

  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [existingExtraImages, setExistingExtraImages] = useState([]);
  const [newExtraImages, setNewExtraImages] = useState([]);
  const [newExtraPreviews, setNewExtraPreviews] = useState([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await getProject(id);
        const project = response.data;

        // Ensure only the author can edit
        const authorId = project.studentId?._id || project.studentId;
        const currentUserId = user?._id || user?.id;
        if (authorId !== currentUserId) {
          toast.error("You are not authorized to edit this project.");
          navigate('/my-portfolio');
          return;
        }

        setForm({
          title: project.title || '',
          description: project.description || '',
          githubUrl: project.githubUrl || '',
          demoUrl: project.demoUrl || '',
          tags: Array.isArray(project.tags) ? project.tags.join(', ') : (project.tags || ''),
        });

        if (project.coverImage) {
          setCoverPreview(project.coverImage);
        }
        if (project.images && project.images.length > 0) {
          setExistingExtraImages(project.images);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("Failed to load project details.");
        navigate('/my-portfolio');
      } finally {
        setLoading(false);
      }
    };

    if (id && user) {
      fetchProject();
    }
  }, [id, user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCoverImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleExtraImages = (e) => {
    const files = Array.from(e.target.files);
    const updatedImages = [...newExtraImages, ...files];
    setNewExtraImages(updatedImages);
    setNewExtraPreviews(updatedImages.map((f) => URL.createObjectURL(f)));
  };

  const removeNewExtraImage = (index) => {
    const updatedImages = newExtraImages.filter((_, i) => i !== index);
    setNewExtraImages(updatedImages);
    setNewExtraPreviews(updatedImages.map((f) => URL.createObjectURL(f)));
  };

  const removeExistingExtraImage = (index) => {
    const updatedImages = existingExtraImages.filter((_, i) => i !== index);
    setExistingExtraImages(updatedImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required.");
      return;
    }

    setIsSaving(true);
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('githubUrl', form.githubUrl);
    formData.append('demoUrl', form.demoUrl);
    formData.append('tags', form.tags);
    if (coverImage) {
      formData.append('coverImage', coverImage);
    }

    // Append existing images we want to keep
    formData.append('existingImages', JSON.stringify(existingExtraImages));

    // Append newly added images
    newExtraImages.forEach((file) => formData.append('extraImages', file));

    try {
      await updateProject(id, formData);
      toast.success("Project updated successfully!");
      navigate('/my-portfolio');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update project.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSaving(true);
      await deleteProject(id);
      toast.success("Project deleted successfully!");
      navigate('/my-portfolio');
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error(error.response?.data?.message || "Failed to delete project.");
      setIsSaving(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center font-sans">
        <p className="text-slate-500 text-sm">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-white text-slate-900 py-12 px-4 sm:px-8 lg:px-40 font-sans overflow-y-auto">
      <div className="max-w-3xl mx-auto">

        <div className="mb-10 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => navigate('/my-portfolio')}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
              title="Go Back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit Project</h1>
          </div>
          <p className="text-slate-500 text-sm ml-11">Update your project details and configuration.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-16">

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter project title..."
              className="w-full text-3xl font-bold bg-transparent border-b border-slate-200 py-2 focus:outline-none focus:border-slate-900 transition-colors placeholder-slate-300"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="8"
              placeholder="Describe your project, architecture, and features..."
              className="w-full bg-transparent border border-slate-200 rounded-md p-4 text-slate-700 focus:outline-none focus:border-slate-900 transition-colors resize-y leading-relaxed text-sm"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Cover Image</label>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {coverPreview && (
                <div className="w-full sm:w-64 h-40 rounded-md overflow-hidden border border-slate-200 flex-shrink-0">
                  <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 w-full">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-md cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors">
                  <span className="text-sm font-semibold text-slate-600">Click to upload new cover</span>
                  <span className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP</span>
                  <input type="file" accept="image/*" onChange={handleCoverImage} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Extra Images */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Project Gallery (Optional)</label>

            {/* Grid for Previews */}
            {(existingExtraImages.length > 0 || newExtraPreviews.length > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">

                {/* Existing Images */}
                {existingExtraImages.map((imgUrl, index) => (
                  <div key={`existing-${index}`} className="relative h-24 rounded-md overflow-hidden border border-slate-200 group">
                    <img src={imgUrl} alt={`Existing ${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingExtraImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>
                ))}

                {/* New Images */}
                {newExtraPreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative h-24 rounded-md overflow-hidden border border-green-400 border-2 group">
                    <img src={preview} alt={`New ${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeNewExtraImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    <span className="absolute bottom-0 left-0 bg-green-500 text-white text-[10px] font-bold px-1 py-0.5 rounded-tr-md">NEW</span>
                  </div>
                ))}
              </div>
            )}

            <div className="w-full">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-md cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors">
                <span className="text-sm font-semibold text-slate-600">Add more images</span>
                <input type="file" multiple accept="image/*" onChange={handleExtraImages} className="hidden" />
              </label>
            </div>
          </div>

          {/* Meta Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="React, Node, UI/UX"
                className="w-full bg-transparent border-b border-slate-200 py-2 text-sm focus:outline-none focus:border-slate-900 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">GitHub URL</label>
              <input
                type="text"
                name="githubUrl"
                value={form.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/..."
                className="w-full bg-transparent border-b border-slate-200 py-2 text-sm focus:outline-none focus:border-slate-900 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Live Demo URL</label>
              <input
                type="text"
                name="demoUrl"
                value={form.demoUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full bg-transparent border-b border-slate-200 py-2 text-sm focus:outline-none focus:border-slate-900 transition-colors"
              />
            </div>
          </div>



          <div className="pt-8 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-2.5 bg-slate-900 text-white text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50 border-2 border-slate-900 hover:text-black rounded-md"
              >
                {isSaving ? "Publishing Updates..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => navigate('/my-portfolio')}
                className="px-8 py-2.5 bg-white text-slate-900 text-sm font-semibold border-2 border-slate-200 hover:border-slate-400 transition-colors rounded-md"
              >
                Cancel
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              disabled={isSaving}
              className="px-6 py-2.5 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 rounded-md border border-red-100 hover:border-red-600"
            >
              Delete Project
            </button>
          </div>

        </form>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Project?</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to delete this project? This action cannot be undone and all associated images and data will be permanently lost.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isSaving}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSaving}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-50"
              >
                {isSaving ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProjectPage;
