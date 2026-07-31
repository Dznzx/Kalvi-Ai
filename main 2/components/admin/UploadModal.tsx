
import React, { useState, useEffect } from 'react';
import { X, UploadCloud, FileText, Globe, Lock, Loader2, Sparkles, Smartphone, Link, Youtube, AlertCircle, Database, CheckCircle2, Image as ImageIcon, Upload, Trash2, RefreshCw, Film } from 'lucide-react';
import { VideoMetadata, VideoVisibility, GradeGroup, ContentCategory } from '../../types';
import { generateTamilTranslations } from '../../services/geminiService';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';
import { getOptimizedUrl } from '../../utils/imageUtils';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (data: Partial<VideoMetadata>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  initialData?: VideoMetadata | null;
  initialStep?: number;
}

export const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload, onDelete, initialData, initialStep = 1 }) => {
  const [step, setStep] = useState(initialStep);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [manualUrl, setManualUrl] = useState('');

  const [formData, setFormData] = useState({
    titleEn: '',
    titleTa: '',
    descEn: '',
    descTa: '',
    visibility: 'public' as VideoVisibility,
    category: 'AI Design' as ContentCategory,
    gradeGroup: '9-12' as GradeGroup,
    isMobileOptimized: true,
    assignmentLink: '',
    transcript: '',
    thumbnailUrl: ''
  });

  // Initialize for Edit Mode
  useEffect(() => {
      if (initialData) {
          setFormData({
              titleEn: initialData.titleEn || '',
              titleTa: initialData.titleTa || '',
              descEn: initialData.descEn || '',
              descTa: initialData.descTa || '',
              visibility: initialData.visibility || 'public',
              category: initialData.category || 'AI Design',
              gradeGroup: initialData.gradeGroup || '9-12',
              isMobileOptimized: initialData.isMobileOptimized ?? true,
              assignmentLink: initialData.assignmentLink || '',
              transcript: initialData.transcript || '',
              thumbnailUrl: initialData.thumbnailUrl || ''
          });
          setManualUrl(initialData.hlsUrl || '');
          // If we weren't explicitly told to start at step 1 (upload), default to step 2 (edit)
          if (initialStep === 1 && initialData.hlsUrl) {
              // Stay on step 1 to allow replacing
          } else if (!initialStep || initialStep === 2) {
              setStep(2);
          }
      }
  }, [initialData, initialStep]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (isSupabaseConfigured) {
            await uploadToSupabase(file);
        } else {
            setError("Supabase not connected.");
        }
    }
  };

  const handleThumbnailFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (isSupabaseConfigured) {
            await uploadThumbnailToSupabase(file);
        } else {
            setError("Supabase not connected.");
        }
    }
  };

  const uploadToSupabase = async (file: File) => {
      setError(null);
      if (!supabase) return;
      setUploadProgress(1); 
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      try {
          const { data, error: uploadError } = await supabase.storage
              .from('videos')
              .upload(filePath, file, { cacheControl: '3600', upsert: false });

          if (uploadError) throw uploadError;
          setUploadProgress(100);

          const { data: publicUrlData } = supabase.storage.from('videos').getPublicUrl(filePath);
          setManualUrl(publicUrlData.publicUrl);
          setTimeout(() => setStep(2), 500);
      } catch (err: any) {
          setUploadProgress(0);
          setError(err.message || "Failed to upload video.");
      }
  };

  const uploadThumbnailToSupabase = async (file: File) => {
      if (!supabase) return;
      setIsThumbnailUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `thumb_${Date.now()}.${fileExt}`;
      try {
          const { error: uploadError } = await supabase.storage.from('videos').upload(fileName, file);
          if (uploadError) throw uploadError;
          const { data: publicUrlData } = supabase.storage.from('videos').getPublicUrl(fileName);
          setFormData(prev => ({ ...prev, thumbnailUrl: publicUrlData.publicUrl }));
      } catch (err: any) {
          setError("Thumbnail upload failed.");
      } finally {
          setIsThumbnailUploading(false);
      }
  };

  const handleManualUrlSubmit = () => {
      if (manualUrl.trim()) {
          setUploadProgress(100);
          setTimeout(() => setStep(2), 300);
      }
  };

  const handleAiTranslate = async () => {
    if (!formData.titleEn) return;
    setIsAiGenerating(true);
    const result = await generateTamilTranslations(formData.titleEn, formData.descEn);
    if (result) {
        setFormData(prev => ({
            ...prev,
            titleTa: result.titleTa || prev.titleTa,
            descTa: result.descTa || prev.descTa
        }));
    }
    setIsAiGenerating(false);
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    setError(null);
    try {
        await onUpload({ 
            ...(initialData ? { id: initialData.id } : {}),
            ...formData, 
            hlsUrl: manualUrl 
        });
    } catch (e: any) {
        setError(e.message || "Failed to save.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
      e.preventDefault();
      if (!initialData || !onDelete) return;
      if (window.confirm("Delete this lesson permanently?")) {
          setIsDeleting(true);
          try {
              await onDelete(initialData.id);
              onClose(); 
          } catch (err: any) {
              setError(err.message || "Delete failed.");
              setIsDeleting(false);
          }
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#1A1F2E] rounded-[24px] w-full max-w-3xl shadow-2xl flex flex-col max-h-[95vh] border border-gray-100 dark:border-white/10 transition-colors">
        <div className="p-6 border-b dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-black/20 rounded-t-[24px]">
            <div className="flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                    {initialData ? (step === 1 ? 'Replace Media Source' : 'Edit Lesson Details') : (step === 1 ? 'New Lesson Upload' : 'Content Details')}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        {isSupabaseConfigured ? 'Database Live' : 'No Sync'}
                    </span>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition"><X size={24} className="text-gray-400" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-400">
                    <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                    <p className="text-xs font-bold">{error}</p>
                </div>
            )}

            {step === 1 && (
                <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center border-4 border-dashed border-gray-100 dark:border-white/10 rounded-3xl py-10 bg-gray-50/30 dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition cursor-pointer relative group">
                        {uploadProgress > 0 && uploadProgress < 100 ? (
                            <div className="w-full max-w-xs text-center">
                                <Loader2 className="animate-spin mx-auto text-bharatStack-terracotta mb-4" size={48} />
                                <p className="font-bold text-gray-800 dark:text-white mb-2">Uploading to Cloud... {uploadProgress}%</p>
                                <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-bharatStack-terracotta transition-all duration-300" style={{width: `${uploadProgress}%`}} />
                                </div>
                            </div>
                        ) : (
                            <>
                                <input type="file" id="vidUpload" className="hidden" accept="video/*" onChange={handleFileSelect} />
                                <label htmlFor="vidUpload" className="absolute inset-0 cursor-pointer"></label>
                                <div className="w-20 h-20 bg-orange-50 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center text-bharatStack-terracotta mb-6 group-hover:scale-110 transition-transform">
                                    <Film size={40} />
                                </div>
                                <p className="text-xl font-black text-gray-800 dark:text-white mb-2">Drop new video to {initialData ? 'replace old one' : 'upload'}</p>
                                <p className="text-gray-400 font-medium mb-8 text-center max-w-xs text-sm">MP4 is best for mobile students.</p>
                                <button className="bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white px-8 py-3 rounded-xl font-bold">Browse Files</button>
                            </>
                        )}
                    </div>

                    <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/10">
                         <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">External Video Link</label>
                         <div className="flex gap-2">
                            <input 
                                value={manualUrl}
                                onChange={(e) => setManualUrl(e.target.value)}
                                placeholder="Paste YouTube or Cloud link..."
                                className="w-full px-4 py-3 border border-gray-200 dark:border-white/10 rounded-xl outline-none font-medium bg-white dark:bg-black/20 text-gray-800 dark:text-white"
                            />
                            <button onClick={handleManualUrlSubmit} className="bg-bharatStack-terracotta text-white px-6 rounded-xl font-bold">Connect</button>
                         </div>
                    </div>
                    
                    {initialData && (
                        <button 
                            onClick={() => setStep(2)}
                            className="w-full py-3 text-sm font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
                        >
                            ← Back to Details
                        </button>
                    )}
                </div>
            )}

            {step === 2 && (
                <div className="space-y-8">
                    {/* VIDEO SOURCE SUMMARY */}
                    <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-500/5 rounded-2xl border border-orange-100 dark:border-orange-500/20">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-white dark:bg-white/10 rounded-lg shadow-sm text-bharatStack-terracotta flex-shrink-0">
                                <Film size={20} />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest leading-none mb-1">Live Video Source</p>
                                <p className="text-xs font-bold text-gray-600 dark:text-gray-300 truncate">{manualUrl || 'No media connected'}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => { setStep(1); setUploadProgress(0); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-bharatStack-terracotta text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-orange-600 transition shadow-sm"
                        >
                            <RefreshCw size={12} /> Replace
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10">
                        <div>
                           <p className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><Sparkles className="text-bharatStack-terracotta" size={16}/> Smart Translate</p>
                           <p className="text-xs text-gray-500 dark:text-gray-400">Sync English and Tamil titles automatically.</p>
                        </div>
                        <button 
                            onClick={handleAiTranslate}
                            disabled={isAiGenerating || !formData.titleEn}
                            className="bg-white dark:bg-white/10 text-bharatStack-terracotta border border-bharatStack-terracotta/20 px-4 py-2 rounded-xl text-sm font-bold shadow-sm"
                        >
                            {isAiGenerating ? '...' : 'Auto-Tamil'}
                        </button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">English Title</label>
                            <input 
                                className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-bharatStack-terracotta/20 outline-none font-bold text-gray-800 dark:text-white" 
                                value={formData.titleEn} 
                                onChange={e => setFormData({...formData, titleEn: e.target.value})}
                                placeholder="Module Title"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-black text-bharatStack-terracotta uppercase tracking-widest">Tamil Title</label>
                            <input 
                                className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-bharatStack-terracotta/20 outline-none font-bold text-gray-800 dark:text-white font-noto" 
                                value={formData.titleTa} 
                                onChange={e => setFormData({...formData, titleTa: e.target.value})}
                                placeholder="தலைப்பு"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Thumbnail URL</label>
                            <div className="relative">
                                <ImageIcon className="absolute left-3 top-3 text-gray-400" size={16} />
                                <input 
                                    className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl pl-10 pr-12 py-3 outline-none font-medium text-gray-600 dark:text-white text-xs" 
                                    value={formData.thumbnailUrl} 
                                    onChange={e => setFormData({...formData, thumbnailUrl: e.target.value})}
                                />
                                <input type="file" id="thumbUpload" className="hidden" accept="image/*" onChange={handleThumbnailFileSelect} />
                                <div className="absolute right-2 top-2">
                                    {isThumbnailUploading ? (
                                        <Loader2 className="animate-spin text-bharatStack-terracotta" size={20} />
                                    ) : (
                                        <button onClick={() => document.getElementById('thumbUpload')?.click()} className="p-1.5 bg-gray-100 dark:bg-white/10 rounded-lg text-gray-500"><Upload size={16} /></button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">Grade Level</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['6-8', '9-12'] as GradeGroup[]).map(g => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => setFormData({...formData, gradeGroup: g})}
                                        className={`py-2 rounded-xl border-2 font-black text-xs transition-all ${formData.gradeGroup === g ? 'bg-bharatStack-terracotta text-white border-bharatStack-terracotta' : 'bg-white dark:bg-white/5 text-gray-400 border-gray-100 dark:border-white/10'}`}
                                    >
                                        Class {g}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className="p-8 border-t dark:border-white/5 bg-gray-50/50 dark:bg-black/20 flex justify-between gap-4 rounded-b-[24px]">
            {step === 2 && initialData ? (
                <button 
                    onClick={handleDelete}
                    disabled={isDeleting || isSaving}
                    className="flex items-center gap-2 px-6 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-bold transition disabled:opacity-50"
                >
                    {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                    <span className="hidden sm:inline">Delete Module</span>
                </button>
            ) : <div />}

            <div className="flex gap-4">
                <button onClick={onClose} className="px-6 py-3 font-bold text-gray-400 hover:text-gray-600 transition">Cancel</button>
                {step === 2 && (
                    <button 
                        onClick={handleSubmit} 
                        disabled={isSaving || !manualUrl}
                        className="bg-bharatStack-terracotta text-white px-10 py-3 rounded-xl font-black text-base hover:bg-bharatStack-terracottaDark shadow-xl shadow-orange-900/20 transition disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : (initialData ? 'Save Changes' : 'Publish Module')}
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
