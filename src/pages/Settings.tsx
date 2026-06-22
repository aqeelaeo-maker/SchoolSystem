import { useState, useEffect, useRef } from 'react';
import { Building2, Shield, Save, Loader2, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useToast } from '../contexts/ToastContext';
import Users from './Users';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'general' | 'users'>('general');
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  
  const [schoolData, setSchoolData] = useState({
    name: 'SmartSchool ERP',
    phone: '',
    address: '',
    logoUrl: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSchoolData(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (e) {
        console.error("Error fetching settings: ", e);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'general'), schoolData, { merge: true });
      showToast('Settings saved successfully', 'success');
    } catch (e) {
      showToast('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size should be less than 2MB', 'error');
      return;
    }

    setUploadingLogo(true);
    try {
      const storageRef = ref(storage, `settings/logo_${Date.now()}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setSchoolData(prev => ({ ...prev, logoUrl: downloadURL }));
      showToast('Logo uploaded successfully. Do not forget to save.', 'success');
    } catch (error) {
      console.error('Error uploading logo to storage:', error);
      // Fallback to base64 if Firebase Storage is not configured properly or rules deny upload
      const reader = new FileReader();
      reader.onloadend = () => {
         setSchoolData(prev => ({ ...prev, logoUrl: reader.result as string }));
         showToast('Using local image format. Save to apply.', 'info');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingLogo(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold font-heading text-white">System Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage school configurations and system users.</p>
      </div>

      <div className="flex border-b border-slate-700/50">
        <button 
          onClick={() => setActiveTab('general')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'general' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Building2 className="w-4 h-4 mr-2" />
          School Profile
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'users' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Shield className="w-4 h-4 mr-2" />
          User Management
        </button>
      </div>

      {activeTab === 'general' && (
        <div className="glass-panel p-6 rounded-2xl max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h2 className="text-lg font-bold text-white mb-4">Organization Profile</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">School / Organization Name</label>
              <input 
                value={schoolData.name} 
                onChange={(e) => setSchoolData({...schoolData, name: e.target.value})} 
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-all" 
                placeholder="SmartSchool ERP" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Contact Number</label>
              <input 
                value={schoolData.phone} 
                onChange={(e) => setSchoolData({...schoolData, phone: e.target.value})} 
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-all" 
                placeholder="+1 234 567 8900" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Physical Address</label>
              <textarea 
                value={schoolData.address} 
                onChange={(e) => setSchoolData({...schoolData, address: e.target.value})} 
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-all resize-none" 
                rows={3}
                placeholder="123 Education Street..." 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">School Logo</label>
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 shrink-0 rounded-xl bg-slate-800/50 flex items-center justify-center overflow-hidden border border-slate-700 p-2">
                  {schoolData.logoUrl ? (
                    <img src={schoolData.logoUrl} alt="Logo" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-slate-500" />
                  )}
                </div>
                
                <div className="flex-1">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden" 
                    id="logo-upload"
                  />
                  <label 
                    htmlFor="logo-upload"
                    className={`inline-flex items-center justify-center px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-sm font-medium transition-colors cursor-pointer ${uploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    {uploadingLogo ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                    ) : (
                      <><UploadCloud className="w-4 h-4 mr-2 text-blue-400" /> Browse Image</>
                    )}
                  </label>
                  <p className="text-xs text-slate-500 mt-2">Recommended size: 256x256px. Max size: 2MB.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/50 mt-6">
              <button 
                onClick={handleSave} 
                disabled={loading || uploadingLogo}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium flex items-center transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Users hideHeader />
        </div>
      )}
    </div>
  );
}
