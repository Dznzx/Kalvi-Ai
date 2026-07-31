
import React, { useState, useEffect } from 'react';
import { VideoMetadata, GradeGroup } from '../../types';
import { adminService } from '../../services/adminMockService';
import { supabase } from '../../services/supabaseClient';
import { Search, Plus, Edit, Trash2, Image, Loader2, Film, RefreshCw, Eye, EyeOff, AlertCircle, PlusCircle, Video, Upload } from 'lucide-react';
import { UploadModal } from './UploadModal';
import { getOptimizedUrl } from '../../utils/imageUtils';
import { Skeleton } from '../common/Skeleton';

export const VideoLibrary: React.FC = () => {
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoMetadata | null>(null);
  const [initialModalStep, setInitialModalStep] = useState(1);
  const [filter, setFilter] = useState<GradeGroup | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchVideos = async () => {
    try {
        const data = await adminService.getVideos();
        setVideos(data);
    } catch (error) {
        console.error("Failed to fetch videos", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();

    if (supabase) {
        const channel = supabase
            .channel('cms-realtime-v5')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'courses' }, 
                (payload) => {
                    if (payload.eventType === 'DELETE') {
                        setVideos(prev => prev.filter(v => v.id !== payload.old.id));
                    } else {
                        fetchVideos();
                    }
                }
            )
            .subscribe();
        
        return () => {
            supabase.removeChannel(channel);
        };
    }
  }, []);

  const handleSave = async (data: Partial<VideoMetadata>) => {
    try {
        if (editingVideo) {
            await adminService.updateVideo({ ...editingVideo, ...data } as VideoMetadata);
        } else {
            await adminService.uploadVideo(data);
        }
        await fetchVideos();
        closeModal();
    } catch (e: any) {
        alert(`Save failed: ${e.message}`);
    }
  };

  const handleEdit = (video: VideoMetadata, step: number = 2) => {
      setEditingVideo(video);
      setInitialModalStep(step);
      setShowUpload(true);
  };

  const handleDelete = async (id: string) => {
      if (!window.confirm("PERMANENT DELETE? This item will vanish immediately.")) {
          return;
      }
      const previousState = [...videos];
      setVideos(prev => prev.filter(v => v.id !== id));
      setDeletingId(id);
      try {
          await adminService.deleteVideo(id);
      } catch (e: any) {
          setVideos(previousState);
          alert(`DATABASE ERROR: ${e.message}`);
      } finally {
          setDeletingId(null);
      }
  };

  const toggleVisibility = async (video: VideoMetadata) => {
      const newVisibility = video.visibility === 'public' ? 'private' : 'public';
      const previousState = [...videos];
      setVideos(prev => prev.map(v => 
          v.id === video.id ? { ...v, visibility: newVisibility as any } : v
      ));
      setUpdatingId(video.id);
      try {
          await adminService.updateVideo({ ...video, visibility: newVisibility as any });
      } catch (e: any) {
          setVideos(previousState);
          alert(`Update failed: ${e.message}`);
      } finally {
          setUpdatingId(null);
      }
  };

  const closeModal = () => {
      setShowUpload(false);
      setEditingVideo(null);
      setInitialModalStep(1);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
        case 'ready': return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400';
        default: return 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400';
    }
  };

  const filteredVideos = videos.filter(v => {
      const matchesFilter = filter === 'all' || v.gradeGroup === filter;
      const matchesSearch = v.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           v.titleTa.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in relative min-h-[600px]">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Content Library</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Add, update, or replace video content in real-time.</p>
        </div>
        <button 
            onClick={() => { setEditingVideo(null); setInitialModalStep(1); setShowUpload(true); }}
            className="bg-bharatStack-terracotta text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-bharatStack-terracottaDark shadow-xl shadow-orange-900/10 transition active:scale-95"
        >
            <Plus size={20} /> New Lesson
        </button>
      </div>

      <div className="bg-white dark:bg-[#111827] p-4 rounded-xl border dark:border-white/5 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center transition-colors">
         <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border dark:border-white/10 rounded-xl focus:ring-2 focus:ring-bharatStack-terracotta/20 outline-none transition bg-white dark:bg-black/20 text-gray-800 dark:text-white placeholder-gray-400" 
                placeholder="Search modules..." 
            />
         </div>
         <div className="flex gap-2 w-full md:w-auto items-center">
            <button onClick={fetchVideos} className="p-2 text-gray-400 hover:text-bharatStack-terracotta rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition">
                <RefreshCw size={20} />
            </button>
            <div className="w-px h-8 bg-gray-200 dark:bg-white/10 mx-1"></div>
            {[
              { id: 'all', label: 'All' },
              { id: '6-8', label: '6-8' },
              { id: '9-12', label: '9-12' },
            ].map(f => (
               <button 
                  key={f.id} 
                  onClick={() => setFilter(f.id as any)}
                  className={`px-4 py-2 border rounded-xl whitespace-nowrap text-xs font-bold transition-all ${
                    filter === f.id 
                    ? 'bg-bharatStack-terracotta text-white border-bharatStack-terracotta' 
                    : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10'
                  }`}
               >
                 {f.label}
               </button>
            ))}
         </div>
      </div>

      {isLoading ? (
          <div className="bg-white dark:bg-[#111827] rounded-xl shadow-sm border dark:border-white/5 overflow-hidden">
              <div className="p-0">
                  {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-6 p-6 border-b border-gray-100 dark:border-white/5 items-center">
                          <Skeleton className="h-14 w-20 rounded-lg" />
                          <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-48" />
                              <Skeleton className="h-3 w-32" />
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      ) : filteredVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-white/5 rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/10">
              <div className="w-20 h-20 bg-orange-50 dark:bg-orange-500/10 rounded-full flex items-center justify-center mb-6">
                  <Video size={40} className="text-bharatStack-terracotta" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No videos found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8">Ready to add your first educational lesson?</p>
              <button 
                  onClick={() => { setEditingVideo(null); setShowUpload(true); }}
                  className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-full font-bold shadow-lg flex items-center gap-2"
              >
                  <Plus size={18} /> Add Module
              </button>
          </div>
      ) : (
          <div className="bg-white dark:bg-[#111827] rounded-xl shadow-sm border dark:border-white/5 overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
                <thead className="bg-gray-50 dark:bg-black/20 text-gray-400 font-bold text-xs uppercase tracking-widest border-b dark:border-white/5">
                    <tr>
                        <th className="px-6 py-4 w-32">Media</th>
                        <th className="px-6 py-4">Lesson Module</th>
                        <th className="px-6 py-4">Grade</th>
                        <th className="px-6 py-4">Visibility</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {filteredVideos.map(video => (
                        <tr key={video.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition group">
                            <td className="px-6 py-4">
                                <div className="w-20 h-12 bg-gray-100 dark:bg-white/10 rounded-lg overflow-hidden border dark:border-white/5 relative shadow-sm">
                                    {video.thumbnailUrl ? (
                                        <img src={getOptimizedUrl(video.thumbnailUrl, 200, 50)} className="w-full h-full object-cover" alt="t" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-white/5 text-gray-400">
                                            <Film size={18} />
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-white text-sm leading-tight">{video.titleEn}</p>
                                    <p className="text-[10px] text-bharatStack-terracotta font-bold font-noto mt-0.5">{video.titleTa}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-black text-gray-500 dark:text-gray-400 uppercase">
                                Class {video.gradeGroup}
                            </td>
                            <td className="px-6 py-4">
                                <button 
                                    onClick={() => toggleVisibility(video)}
                                    disabled={updatingId === video.id}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold text-[10px] uppercase tracking-wider transition-all ${
                                        video.visibility === 'public' 
                                        ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400' 
                                        : 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-white/5 dark:text-gray-400'
                                    }`}
                                >
                                    {updatingId === video.id ? (
                                        <Loader2 size={12} className="animate-spin" />
                                    ) : video.visibility === 'public' ? (
                                        <><Eye size={12} /> Live</>
                                    ) : (
                                        <><EyeOff size={12} /> Draft</>
                                    )}
                                </button>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={() => handleEdit(video, 1)}
                                        className="p-2 text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 rounded-lg transition"
                                        title="Replace Video / Upload Media"
                                    >
                                        <Upload size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleEdit(video, 2)}
                                        className="p-2 text-gray-400 hover:text-bharatStack-terracotta hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition"
                                        title="Edit Metadata"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(video.id)} 
                                        disabled={deletingId === video.id}
                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition"
                                        title="Delete Lesson"
                                    >
                                        {deletingId === video.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
      )}

      {showUpload && (
        <UploadModal 
            onClose={closeModal} 
            onUpload={handleSave} 
            onDelete={handleDelete}
            initialData={editingVideo}
            initialStep={initialModalStep}
        />
      )}
    </div>
  );
};
