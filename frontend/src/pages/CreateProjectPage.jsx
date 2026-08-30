
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createProject } from '../api/project.api';

const animatedBgStyles = `
  @import url('https://fonts.googleapis.com/css?family=Exo:400,700');

.area {
  background: #E7C6FF; 
  background: -webkit-linear-gradient(to bottom, #E7C6FF, #1a237e);
  background: linear-gradient(to bottom, #E7C6FF, #1a237e);
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 0;
}

  .circles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    margin: 0;
    padding: 0;
  }

  .circles li {
    position: absolute;
    display: block;
    list-style: none;
    width: 20px;
    height: 20px;
    background: rgba(255, 255, 255, 0.2);
    animation: animate 25s linear infinite;
    bottom: -150px;
  }

  .circles li:nth-child(1)  { left: 25%; width: 80px;  height: 80px;  animation-delay: 0s; }
  .circles li:nth-child(2)  { left: 10%; width: 20px;  height: 20px;  animation-delay: 2s;  animation-duration: 12s; }
  .circles li:nth-child(3)  { left: 70%; width: 20px;  height: 20px;  animation-delay: 4s; }
  .circles li:nth-child(4)  { left: 40%; width: 60px;  height: 60px;  animation-delay: 0s;  animation-duration: 18s; }
  .circles li:nth-child(5)  { left: 65%; width: 20px;  height: 20px;  animation-delay: 0s; }
  .circles li:nth-child(6)  { left: 75%; width: 110px; height: 110px; animation-delay: 3s; }
  .circles li:nth-child(7)  { left: 35%; width: 150px; height: 150px; animation-delay: 7s; }
  .circles li:nth-child(8)  { left: 50%; width: 25px;  height: 25px;  animation-delay: 15s; animation-duration: 45s; }
  .circles li:nth-child(9)  { left: 20%; width: 15px;  height: 15px;  animation-delay: 2s;  animation-duration: 35s; }
  .circles li:nth-child(10) { left: 85%; width: 150px; height: 150px; animation-delay: 0s;  animation-duration: 11s; }

  @keyframes animate {
    0%   { transform: translateY(0) rotate(0deg);        opacity: 1; border-radius: 0; }
    100% { transform: translateY(-1000px) rotate(720deg); opacity: 0; border-radius: 50%; }
  }
`;

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    githubUrl: '',
    demoUrl: '',
    tags: '',
    exhibitionName: '',
    reservationDate: '',
    stallType: '',
    preferredStallSize: '',
    numberOfStalls: '',
    businessCategory: '',
  });
  const [coverImage, setCoverImage] = useState(null);
  const [extraImages, setExtraImages] = useState([]);
  const [coverPreview, setCoverPreview] = useState(null);
  const [extraPreviews, setExtraPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (form.title.length > 50) e.title = 'Title must be under 50 characters';
    if (!form.description.trim()) e.description = 'Description is required';
    if (form.description.length > 300) e.description = 'Description must be under 300 characters';
    if (!coverImage) e.coverImage = 'Cover image is required';
    return e;
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCoverImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleExtraImages = (e) => {
    const files = Array.from(e.target.files);
    const updatedImages = [...extraImages, ...files];
    setExtraImages(updatedImages);
    setExtraPreviews(updatedImages.map((f) => URL.createObjectURL(f)));
  };

  const removeExtraImage = (index) => {
    const updatedImages = extraImages.filter((_, i) => i !== index);
    setExtraImages(updatedImages);
    setExtraPreviews(updatedImages.map((f) => URL.createObjectURL(f)));
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) {
      setErrors(e2);
      Object.values(e2).forEach((msg) => toast.error(msg));
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('githubUrl', form.githubUrl);
    formData.append('demoUrl', form.demoUrl);
    formData.append('tags', form.tags);
    formData.append('exhibitionName', form.exhibitionName);
    formData.append('reservationDate', form.reservationDate);
    formData.append('stallType', form.stallType);
    formData.append('preferredStallSize', form.preferredStallSize);
    formData.append('numberOfStalls', form.numberOfStalls);
    formData.append('businessCategory', form.businessCategory);
    formData.append('coverImage', coverImage);
    extraImages.forEach((file) => formData.append('extraImages', file));

    try {
      await createProject(formData);
      toast.success('Project published successfully!');
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Failed to publish project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{animatedBgStyles}</style>

      {/* Floating Animated Circles Background */}
      <div className="area">
        <ul className="circles">
          {[...Array(10)].map((_, i) => <li key={i} />)}
        </ul>
      </div>

      <div className="relative z-10 h-[calc(100vh-80px)] flex items-center justify-center px-6 py-6 overflow-hidden">
        <div className="w-full max-w-[96%] xl:max-w-7xl h-[98%] max-h-[850px] bg-white border border-slate-200/80 rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col text-slate-800 overflow-hidden">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full overflow-hidden">

            {/* Left Column: Cover Image Upload Dropzone */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full overflow-hidden">
              <div className="h-full flex flex-col justify-between">
                <label className="block text-slate-700 text-sm font-bold uppercase tracking-wider mb-2">Project Cover Frame</label>
                {!coverPreview ? (
                  <label className="flex-1 flex flex-col items-center justify-center w-full border-3 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-indigo-500 hover:bg-slate-50 transition-all duration-300 min-h-[250px] max-h-[460px]">
                    {/* SVG Icon */}
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                      <svg className="w-7 h-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                      </svg>
                    </div>
                    <span className="text-lg font-bold text-slate-800">Select Cover to Upload</span>
                    <span className="text-slate-400 text-xs mt-1 text-center max-w-[200px] leading-relaxed">
                      Supported Format: JPG, PNG, WEBP (Max 10MB)
                    </span>
                    <div className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow transition">
                      Select File
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImage}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative group rounded-2xl overflow-hidden border border-slate-200 flex-1 min-h-[250px] max-h-[460px]">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={removeCoverImage}
                        className="p-2.5 bg-red-600 hover:bg-red-700 rounded-full text-white shadow-lg transition-transform transform hover:scale-110"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Right Column: Form Fields & Gallery */}
            <div className="lg:col-span-7 h-full flex flex-col justify-between overflow-hidden">

              {/* Header */}
              <div className="border-b border-slate-100 pb-2.5">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Upload Showcase</h1>
                <p className="text-slate-500 text-xs mt-0.5">Publish your computing project with thumbnails and description.</p>
              </div>

              <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 py-2">
                {/* Row 1: Title (Caption) & Tech Stack Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Title */}
                  <div className="md:col-span-7 flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                      <label htmlFor="title">Project Caption</label>
                      <span>{form.title.length} / 50</span>
                    </div>
                    <input
                      id="title"
                      name="title"
                      placeholder="Enter project title..."
                      value={form.title}
                      onChange={handleChange}
                      maxLength={50}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition"
                    />

                  </div>

                  {/* Tech Stack Tags */}
                  <div className="md:col-span-5 flex flex-col gap-1">
                    <label htmlFor="tags" className="text-xs font-semibold text-slate-600">Tech Stack (comma separated)</label>
                    <input
                      id="tags"
                      name="tags"
                      placeholder="e.g. React, Node.js, MongoDB"
                      value={form.tags}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition"
                    />
                  </div>
                </div>

                {/* Row 2: GitHub and Live Demo Links Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="githubUrl" className="text-xs font-semibold text-slate-600">GitHub Repository Link</label>
                    <input
                      id="githubUrl"
                      name="githubUrl"
                      placeholder="https://github.com/..."
                      value={form.githubUrl}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="demoUrl" className="text-xs font-semibold text-slate-600">Live Demo Link</label>
                    <input
                      id="demoUrl"
                      name="demoUrl"
                      placeholder="https://my-live-demo.com"
                      value={form.demoUrl}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition"
                    />
                  </div>
                </div>

                {/* Row 3: Reservation Fields */}
                <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/50">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Stall Reservation Details</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Exhibition Name */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor="exhibitionName" className="text-xs font-semibold text-slate-600">Exhibition / Event</label>
                      <select
                        id="exhibitionName"
                        name="exhibitionName"
                        value={form.exhibitionName}
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition"
                      >
                        <option value="">Select event...</option>
                        <option value="TechExpo 2026">TechExpo 2026</option>
                        <option value="CraftFair 2026">CraftFair 2026</option>
                        <option value="Bookfair 2026">Bookfair 2026</option>
                      </select>
                    </div>

                    {/* Reservation Date */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor="reservationDate" className="text-xs font-semibold text-slate-600">Reservation Date</label>
                      <input
                        id="reservationDate"
                        type="date"
                        name="reservationDate"
                        value={form.reservationDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition"
                      />
                    </div>

                    {/* Stall Type */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor="stallType" className="text-xs font-semibold text-slate-600">Stall Type</label>
                      <select
                        id="stallType"
                        name="stallType"
                        value={form.stallType}
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition"
                      >
                        <option value="">Select type...</option>
                        <option value="Standard">Standard</option>
                        <option value="Premium">Premium</option>
                        <option value="Corner Stall">Corner Stall</option>
                      </select>
                    </div>

                    {/* Preferred Stall Size */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor="preferredStallSize" className="text-xs font-semibold text-slate-600">Preferred Stall Size</label>
                      <select
                        id="preferredStallSize"
                        name="preferredStallSize"
                        value={form.preferredStallSize}
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition"
                      >
                        <option value="">Select size...</option>
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                      </select>
                    </div>

                    {/* Number of Stalls */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor="numberOfStalls" className="text-xs font-semibold text-slate-600">Number of Stalls</label>
                      <input
                        id="numberOfStalls"
                        type="number"
                        name="numberOfStalls"
                        value={form.numberOfStalls}
                        onChange={handleChange}
                        min="1"
                        placeholder="1"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition"
                      />
                    </div>

                    {/* Business Category */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor="businessCategory" className="text-xs font-semibold text-slate-600">Business Category</label>
                      <select
                        id="businessCategory"
                        name="businessCategory"
                        value={form.businessCategory}
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition"
                      >
                        <option value="">Select category...</option>
                        <option value="Food & Beverage">Food & Beverage</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Handicrafts">Handicrafts</option>
                        <option value="Services">Services</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Row 4: Description */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                    <label htmlFor="description">Label / Description</label>
                    <span>{form.description.length} / 300</span>
                  </div>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Enter project description and specifications..."
                    value={form.description}
                    onChange={handleChange}
                    maxLength={300}
                    rows={6}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition resize-none"
                  />

                </div>

                {/* Row 4: Extra Images Gallery */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-600">Project Thumbnails Gallery</label>
                  <div className="grid grid-cols-6 gap-2 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                    {extraPreviews.map((src, i) => (
                      <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200">
                        <img src={src} alt={`Extra ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExtraImage(i)}
                          className="absolute top-0.5 right-0.5 p-0.5 bg-red-600 hover:bg-red-700 rounded-full text-white shadow transition-transform transform hover:scale-105"
                        >
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}

                    {/* Add button */}
                    {extraImages.length < 8 && (
                      <label className="aspect-square flex items-center justify-center border border-dashed border-slate-300 hover:border-indigo-500 hover:bg-white rounded-lg cursor-pointer transition">
                        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleExtraImages}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4 border-t border-slate-100 pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-2.5 font-bold rounded-xl shadow-md transition-all duration-200 text-sm flex items-center gap-2 ${isSubmitting
                      ? 'bg-slate-400 text-slate-200 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg cursor-pointer'
                    }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Publishing...
                    </>
                  ) : (
                    'Publish Project'
                  )}
                </button>
              </div>

            </div>

          </form>
        </div>
      </div>
    </>
  );
}

