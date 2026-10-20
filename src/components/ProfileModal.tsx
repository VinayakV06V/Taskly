import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  LogOut, 
  Check, 
  Mail, 
  Calendar, 
  Flame, 
  Edit2, 
  Camera, 
  Upload, 
  Link as LinkIcon, 
  Sparkles,
  User as UserIcon,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { User as UserType, SystemStatistics } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  stats: SystemStatistics | null;
  onUpdateProfile: (name: string, bio: string, avatarUrl?: string) => Promise<void>;
  onLogout: () => void;
}

export const PRESET_AVATARS = [
  {
    id: 'taskly-logo',
    name: 'Taskly Emblem',
    category: 'Featured',
    url: '/assets/taskly-logo.png',
  },
  {
    id: 'default',
    name: 'Current Default',
    category: 'Featured',
    url: '/src/assets/images/user_avatar_1792407645930.jpg',
  },
  {
    id: 'adv-felix',
    name: 'Felix Explorer',
    category: '3D & Characters',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=ffd5dc',
  },
  {
    id: 'adv-aria',
    name: 'Aria Pilot',
    category: '3D & Characters',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aria&backgroundColor=b6e3f4',
  },
  {
    id: 'adv-leo',
    name: 'Leo Creative',
    category: '3D & Characters',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo&backgroundColor=c0aede',
  },
  {
    id: 'adv-maya',
    name: 'Maya Thinker',
    category: '3D & Characters',
    url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Maya&backgroundColor=ffdfbf',
  },
  {
    id: 'lor-zoe',
    name: 'Zoe Designer',
    category: '3D & Characters',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Zoe&backgroundColor=c0aede',
  },
  {
    id: 'lor-max',
    name: 'Max Architect',
    category: '3D & Characters',
    url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Max&backgroundColor=b6e3f4',
  },
  {
    id: 'bot-pulse',
    name: 'Pulse Bot',
    category: '3D & Characters',
    url: 'https://api.dicebear.com/7.x/bottts/svg?seed=PulseBot&backgroundColor=d1d4f9',
  },
  {
    id: 'photo-1',
    name: 'Elena (Studio)',
    category: 'Portraits',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&h=240&fit=crop&crop=faces',
  },
  {
    id: 'photo-2',
    name: 'Marcus (Dev)',
    category: 'Portraits',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=240&fit=crop&crop=faces',
  },
  {
    id: 'photo-3',
    name: 'Sophia (Lead)',
    category: 'Portraits',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&h=240&fit=crop&crop=faces',
  },
  {
    id: 'photo-4',
    name: 'David (Product)',
    category: 'Portraits',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop&crop=faces',
  },
  {
    id: 'photo-5',
    name: 'Amara (Analyst)',
    category: 'Portraits',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&h=240&fit=crop&crop=faces',
  },
  {
    id: 'thumb-apex',
    name: 'Apex Modern',
    category: 'Minimal & Abstract',
    url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Apex&backgroundColor=ffdfbf',
  },
  {
    id: 'thumb-zenith',
    name: 'Zenith Glow',
    category: 'Minimal & Abstract',
    url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Zenith&backgroundColor=ffd5dc',
  },
  {
    id: 'thumb-pulse',
    name: 'Coral Pulse',
    category: 'Minimal & Abstract',
    url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=TaskPulse&backgroundColor=fed7aa',
  },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  stats,
  onUpdateProfile,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'avatars'>('info');
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatarUrl || '/src/assets/images/user_avatar_1792407645930.jpg'
  );
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when user prop changes
  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '/src/assets/images/user_avatar_1792407645930.jpg');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  // Handle local image file upload (converts to base64 DataURL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Photo size is too large. Please select an image under 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        setSavedSuccess(false);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setAvatarUrl(customUrlInput.trim());
    setCustomUrlInput('');
  };

  const handleSelectPreset = (url: string) => {
    setAvatarUrl(url);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setUploadError(null);
    try {
      await onUpdateProfile(name, bio, avatarUrl);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2600);
    } catch {
      setUploadError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const memberSince = new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const categories = ['All', 'Featured', '3D & Characters', 'Portraits', 'Minimal & Abstract'];
  const filteredAvatars = selectedCategory === 'All'
    ? PRESET_AVATARS
    : PRESET_AVATARS.filter((a) => a.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl overflow-hidden relative border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors btn-press cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Top Hero / Avatar Identity */}
        <div className="p-6 sm:p-7 bg-gradient-to-b from-[#F8FAFD] to-white border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Interactive Avatar with Camera Upload Overlay */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-3 border-[#FF5E5E] shadow-md bg-slate-100 ring-4 ring-[#FF5E5E]/15">
                <img
                  src={avatarUrl}
                  alt={name || user.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to default avatar on broken image
                    (e.target as HTMLImageElement).src = '/src/assets/images/user_avatar_1792407645930.jpg';
                  }}
                />
              </div>

              {/* Online indicator */}
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />

              {/* Quick file upload trigger overlay button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload Photo from Computer"
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer backdrop-blur-xs"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span>Change</span>
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight truncate font-['Outfit',sans-serif]">
                  {name || user.name}
                </h3>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] text-slate-400 mt-1.5 font-mono">
                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Joined {memberSince}</span>
              </div>

              {/* Quick Change Photo Action buttons */}
              <div className="mt-3.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-[#FF5E5E] hover:bg-[#FF4545] shadow-xs btn-press cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Upload Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('avatars')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold btn-press cursor-pointer border ${
                    activeTab === 'avatars'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Choose Avatar</span>
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Tab Switcher: Profile Info vs. Avatar Library */}
        <div className="flex border-b border-slate-100 bg-[#F8FAFD] px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`pb-2.5 px-3 text-xs font-bold font-['Outfit',sans-serif] border-b-2 transition-all cursor-pointer ${
              activeTab === 'info'
                ? 'border-[#FF5E5E] text-[#FF5E5E]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Profile Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('avatars')}
            className={`pb-2.5 px-3 text-xs font-bold font-['Outfit',sans-serif] border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'avatars'
                ? 'border-[#FF5E5E] text-[#FF5E5E]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <span>Avatar Gallery</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-bold">
              {PRESET_AVATARS.length}
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {uploadError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
              <span>{uploadError}</span>
              <button onClick={() => setUploadError(null)} className="text-rose-500 hover:text-rose-800">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {savedSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-check-pop">
              <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              <span className="font-semibold">Profile details and avatar updated successfully!</span>
            </div>
          )}

          {/* TAB 1: Profile Info Form */}
          {activeTab === 'info' && (
            <div className="space-y-5">
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Display Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full bg-[#F8FAFD] border border-slate-200 focus:border-[#FF5E5E] focus:ring-2 focus:ring-[#FF5E5E]/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Bio / Personal Focus
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    placeholder="Describe your current project, focus goal, or workspace motto..."
                    className="w-full bg-[#F8FAFD] border border-slate-200 focus:border-[#FF5E5E] focus:ring-2 focus:ring-[#FF5E5E]/10 rounded-2xl px-4 py-2.5 text-xs text-slate-800 outline-none transition-all resize-none font-medium"
                  />
                </div>

                {/* Quick focus status chips */}
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                    Quick Focus Presets
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      '🚀 Shipping new features',
                      '🎯 Deep focus mode',
                      '⚡ Organizing daily queue',
                      '☕ Coffee & sprint planning',
                    ].map((statusChip) => (
                      <button
                        key={statusChip}
                        type="button"
                        onClick={() => setBio(statusChip)}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-[#F8FAFD] hover:bg-slate-100 border border-slate-200/80 text-slate-600 btn-press cursor-pointer"
                      >
                        {statusChip}
                      </button>
                    ))}
                  </div>
                </div>
              </form>

              {/* Productivity Stats Summary Cards */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 font-mono">
                  Productivity Highlights
                </h4>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-[#F8FAFD] border border-slate-200/70 rounded-2xl p-3 text-center">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Done</div>
                    <div className="text-lg font-extrabold text-emerald-600 font-['Outfit',sans-serif] mt-0.5">
                      {stats?.completedTasks ?? 0}
                    </div>
                  </div>

                  <div className="bg-[#F8FAFD] border border-slate-200/70 rounded-2xl p-3 text-center">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Rate</div>
                    <div className="text-lg font-extrabold text-slate-900 font-['Outfit',sans-serif] mt-0.5">
                      {stats?.completionRate ?? 0}%
                    </div>
                  </div>

                  <div className="bg-[#F8FAFD] border border-slate-200/70 rounded-2xl p-3 text-center">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Streak</div>
                    <div className="text-lg font-extrabold text-amber-500 font-['Outfit',sans-serif] mt-0.5 flex items-center justify-center gap-1">
                      <Flame className="w-4 h-4 fill-amber-500" />
                      {stats?.longestStreak ?? 0}d
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Avatar Gallery & Custom URL */}
          {activeTab === 'avatars' && (
            <div className="space-y-5">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold btn-press transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#FF5E5E] text-white shadow-xs'
                        : 'bg-[#F8FAFD] hover:bg-slate-100 text-slate-600 border border-slate-200/70'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid of Avatars */}
              <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 gap-3">
                {filteredAvatars.map((preset) => {
                  const isSelected = avatarUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`relative p-2 rounded-2xl flex flex-col items-center gap-1.5 transition-all btn-press cursor-pointer border ${
                        isSelected
                          ? 'border-[#FF5E5E] bg-rose-50/40 ring-2 ring-[#FF5E5E] shadow-sm'
                          : 'border-slate-200/70 bg-[#F8FAFD] hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full overflow-hidden border border-slate-200 bg-white relative">
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#FF5E5E]/20 flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full bg-[#FF5E5E] text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-700 truncate w-full text-center">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Paste Image URL section */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAFD] border border-slate-200/70">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Or Paste Any Image URL</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="https://example.com/my-photo.jpg"
                    className="flex-1 bg-white border border-slate-200 focus:border-[#FF5E5E] rounded-xl px-3 py-2 text-xs text-slate-800 outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl btn-press cursor-pointer"
                  >
                    Set URL
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-full transition-colors btn-press cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors btn-press cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-[#FF5E5E] hover:bg-[#FF4545] rounded-full shadow-md shadow-[#FF5E5E]/25 transition-all btn-press cursor-pointer flex items-center gap-1.5"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
