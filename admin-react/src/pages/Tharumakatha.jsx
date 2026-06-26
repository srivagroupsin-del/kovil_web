import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { 
  Edit2, 
  Trash2, 
  Save, 
  User, 
  FileText, 
  Shield, 
  Building, 
  Activity, 
  Calendar, 
  Clock, 
  Zap, 
  RefreshCw, 
  List, 
  Eraser,
  CheckCircle,
  Camera,
  Search,
  XCircle,
  Phone,
  Mail,
  KeyRound,
  Check,
  Building2,
  Lock,
  ChevronRight,
  ShieldCheck,
  FileCheck,
  Briefcase,
  Eye,
  X
} from 'lucide-react';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

const API_BASE_URL = BASE_API + '/tharumakatha';
const CURRENT_TEMPLE_ID = 1;

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  let cleanPath = path.replace(/^\/+/, '');
  if (cleanPath.startsWith('uploads/')) {
    cleanPath = cleanPath.replace('uploads/', '');
  }
  
  return `${BASE_API}/files/${cleanPath}`;
};

const FormInput = ({ label, name, value, onChange, icon: Icon, placeholder, type = "text", required = false, disabled = false }) => (
  <div className="form-group">
    <label className="form-label" style={{ fontWeight: '600', fontSize: '13.5px', color: '#475569', marginBottom: '6px' }}>{label}</label>
    <div className="input-wrapper">
      {Icon && <Icon className="input-icon" size={16} color="#6366f1" style={{ left: '14px' }} />}
      <input 
        type={type} 
        name={name}
        className="form-control" 
        placeholder={placeholder}
        value={value} 
        onChange={onChange} 
        required={required} 
        disabled={disabled}
        style={{ 
          paddingLeft: Icon ? '40px' : '14px', 
          height: '44px', 
          fontSize: '14px', 
          borderRadius: '10px', 
          border: '1px solid #e2e8f0', 
          background: disabled ? '#f1f5f9' : '#f8fafc',
          cursor: disabled ? 'not-allowed' : 'text',
          transition: 'all 0.2s ease-in-out'
        }}
      />
    </div>
  </div>
);

const Tharumakatha = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [externalUsers, setExternalUsers] = useState([]);
  const [selectedExternalUserId, setSelectedExternalUserId] = useState('');
  const [viewingProfileItem, setViewingProfileItem] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    canCreateTemple: 0,
    status: 'active',
    role: '',
    assignedWork: '',
    password: ''
  });

  useEffect(() => {
    fetchData();
    fetchExternalUsers();
  }, []);

  const fetchExternalUsers = async () => {
    try {
      const res = await fetch('https://user.jobes24x7.com/api/logins');
      if (res.ok) {
        const json = await res.json();
        setExternalUsers(json.data?.data || []);
      }
    } catch (err) {
      console.error('Error fetching external users:', err);
    }
  };

  const handleExternalUserChange = (e) => {
    const val = e.target.value;
    setSelectedExternalUserId(val);
    if (val) {
      const user = externalUsers.find(u => String(u.id) === String(val));
      if (user) {
        setFormData(prev => ({
          ...prev,
          name: user.user_name || '',
          phone: user.phone_number || '',
          email: user.email || ''
        }));
        
        setViewingProfileItem({
          id: user.id,
          name: user.user_name || '',
          phone: user.phone_number || '',
          email: user.email || '',
          role: 'User',
          assigned_work: '--',
          can_create_temple: 0,
          status: 'active',
          isExternal: true
        });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        name: '',
        phone: '',
        email: ''
      }));
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/temple/${CURRENT_TEMPLE_ID}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data?.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const clearForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      canCreateTemple: 0,
      status: 'active',
      role: '',
      assignedWork: '',
      password: ''
    });
    setImageFile(null);
    setImagePreview('');
    setEditingId(null);
    setSelectedExternalUserId('');
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      const isEditMode = !!editingId;
      const url = isEditMode ? `${API_BASE_URL}/update/${editingId}` : `${API_BASE_URL}/create`;
      
      const form = new FormData();
      form.append('temple_id', CURRENT_TEMPLE_ID);
      form.append('name', formData.name);
      form.append('phone', formData.phone);
      form.append('email', formData.email);
      form.append('can_create_temple', formData.canCreateTemple);
      form.append('status', formData.status);
      form.append('role', formData.role);
      form.append('assigned_work', formData.assignedWork);
      if (formData.password) {
        form.append('password', formData.password);
      }
      
      if (imageFile) {
        form.append('photo', imageFile);
      }

      const res = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        body: form
      });

      if (res.ok) {
        showSuccess(`வெற்றிகரமாக ${isEditMode ? 'மாற்றப்பட்டது' : 'சேமிக்கப்பட்டது'}!`, `Successfully ${isEditMode ? 'updated' : 'saved'}!`);
        clearForm();
        fetchData();
      } else {
        showError("தோல்வி", "Failed to save record");
      }
    } catch (err) {
      showError("தொடர்பு பிழை", "Connection error");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name || '',
      phone: item.phone || '',
      email: item.email || '',
      canCreateTemple: item.can_create_temple || 0,
      status: item.status || 'active',
      role: item.role || '',
      assignedWork: item.assigned_work || '',
      password: ''
    });
    setImagePreview(item.photo_path ? getImageUrl(item.photo_path) : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const result = await showConfirm("நிச்சயமாக நீக்க வேண்டுமா?", "Are you sure?");
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API_BASE_URL}/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
        showSuccess("நீக்கப்பட்டது", "Deleted");
      }
    } catch (err) {
      showError("நீக்குவதில் பிழை", "Error deleting");
    }
  };

  const filteredData = data.filter(item => 
    (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="form-card" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Dynamic CSS styles injected locally */}
      <style>{`
        .stat-card-custom {
          background: #ffffff;
          border: 1px solid #f1f5f9;
          padding: 24px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .stat-card-custom:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 20px -8px rgba(99, 102, 241, 0.15);
          border-color: #e2e8f0;
        }
        .avatar-uploader {
          position: relative;
          width: 110px;
          height: 110px;
          margin: 0 auto 12px auto;
          border-radius: 50%;
          border: 2px dashed #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
          background: #f8fafc;
          transition: all 0.2s ease;
        }
        .avatar-uploader:hover {
          border-color: #6366f1;
          background: #f1f5f9;
        }
        .avatar-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.6);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.2s ease;
          font-size: 11px;
          font-weight: 600;
          gap: 4px;
        }
        .avatar-uploader:hover .avatar-overlay {
          opacity: 1;
        }
        .visual-choice-card {
          padding: 16px;
          border-radius: 12px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s ease-in-out;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        .visual-choice-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
      `}</style>

      {/* Header Info */}
      <div className="form-header" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <KeyRound size={20} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>தர்மகர்த்தாக்கள் விவரம் (Dharumakartha Management)</h2>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b', marginTop: '2px' }}>கோவிலின் தர்மகர்த்தாக்கள் விவரங்களை நிர்வகிக்கவும் மற்றும் புதிய கோவில் உருவாக்கும் அனுமதிகளை வழங்கவும்.</p>
          </div>
        </div>
      </div>

      {/* Metrics Counters Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Stat Card 1 */}
        <div className="stat-card-custom">
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
            <User size={24} />
          </div>
          <div>
            <div style={{ color: '#1e293b', fontWeight: '800', fontSize: '22px' }}>{data.length}</div>
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginTop: '2px' }}>மொத்த தர்மகர்த்தாக்கள் (Total Trustees)</div>
          </div>
        </div>
        
        {/* Stat Card 2 */}
        <div className="stat-card-custom">
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ color: '#1e293b', fontWeight: '800', fontSize: '22px' }}>{data.filter(t => t.can_create_temple === 1).length}</div>
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginTop: '2px' }}>கோவில் உருவாக்க அனுமதி (Allowed Creators)</div>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="stat-card-custom">
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d9488' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ color: '#1e293b', fontWeight: '800', fontSize: '22px' }}>{data.filter(t => t.status === 'active').length}</div>
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginTop: '2px' }}>செயலில் உள்ளவர்கள் (Active Status)</div>
          </div>
        </div>
      </div>

      {/* Main Two Column Form Section */}
      <form onSubmit={handleSave} style={{ marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px', alignItems: 'stretch' }}>
          
          {/* Left Column Card: Basic Information */}
          <div className="card" style={{ padding: '28px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <User size={18} color="#6366f1" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>தனிநபர் விவரங்கள் (Personal Details)</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '600', fontSize: '13.5px', color: '#475569', marginBottom: '6px' }}>
                    பயனரைத் தேர்ந்தெடுக்கவும் (Select Existing User) *
                  </label>
                  <div className="input-wrapper" style={{ position: 'relative' }}>
                    <User className="input-icon" size={16} color="#6366f1" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                    <div 
                      onClick={() => !editingId && setIsDropdownOpen(!isDropdownOpen)}
                      style={{ 
                        paddingLeft: '40px', 
                        height: '44px', 
                        fontSize: '14px', 
                        borderRadius: '10px', 
                        border: '1px solid #e2e8f0', 
                        background: !!editingId ? '#f1f5f9' : '#f8fafc',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: !!editingId ? 'not-allowed' : 'pointer',
                        color: selectedExternalUserId ? '#0f172a' : '#94a3b8'
                      }}
                    >
                      {selectedExternalUserId 
                        ? (() => {
                            const u = externalUsers.find(u => String(u.id) === String(selectedExternalUserId));
                            return u ? `${u.user_name || u.email || u.phone_number} ${u.email ? `(${u.email})` : ''}` : 'Unknown User';
                          })()
                        : '-- பயனரைத் தேர்ந்தெடுக்கவும் (Select User) --'
                      }
                    </div>

                    {!editingId && <ChevronRight size={16} color="#64748b" style={{ position: 'absolute', right: selectedExternalUserId ? '42px' : '14px', top: '50%', transform: `translateY(-50%) rotate(${isDropdownOpen ? 90 : 0}deg)`, transition: 'transform 0.2s', pointerEvents: 'none' }} />}

                    {isDropdownOpen && !editingId && (
                      <div style={{ position: 'absolute', top: '50px', left: 0, width: '100%', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 10, overflow: 'hidden' }}>
                        <div style={{ padding: '10px', borderBottom: '1px solid #f1f5f9' }}>
                          <input 
                            type="text" 
                            placeholder="பயனரை தேடவும் (Search user)..." 
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                          <div 
                            onClick={() => {
                              handleExternalUserChange({ target: { value: '' } });
                              setIsDropdownOpen(false);
                            }}
                            style={{ padding: '10px 14px', fontSize: '13px', cursor: 'pointer', background: !selectedExternalUserId ? '#f1f5f9' : 'transparent', color: '#ef4444', fontWeight: '500' }}
                            onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                            onMouseLeave={(e) => e.target.style.background = !selectedExternalUserId ? '#f1f5f9' : 'transparent'}
                          >
                            -- தேர்வை நீக்கு (Clear Selection) --
                          </div>
                          {externalUsers.filter(u => {
                            const term = userSearchTerm.toLowerCase();
                            return String(u.user_name || '').toLowerCase().includes(term) || 
                                   String(u.email || '').toLowerCase().includes(term) || 
                                   String(u.phone_number || '').toLowerCase().includes(term);
                          }).map(user => (
                            <div 
                              key={user.id} 
                              onClick={() => {
                                handleExternalUserChange({ target: { value: user.id } });
                                setIsDropdownOpen(false);
                                setUserSearchTerm('');
                              }}
                              style={{ padding: '10px 14px', fontSize: '13px', cursor: 'pointer', borderTop: '1px solid #f8fafc', background: String(selectedExternalUserId) === String(user.id) ? '#eff6ff' : 'transparent' }}
                              onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
                              onMouseLeave={(e) => e.target.style.background = String(selectedExternalUserId) === String(user.id) ? '#eff6ff' : 'transparent'}
                            >
                              <div style={{ fontWeight: '600', color: '#1e293b' }}>{user.user_name || user.phone_number || 'Unnamed User'}</div>
                              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{user.email || user.phone_number}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedExternalUserId && (
                      <button 
                        type="button"
                        onClick={() => {
                          const user = externalUsers.find(u => String(u.id) === String(selectedExternalUserId));
                          if (user) {
                            setViewingProfileItem({
                              id: user.id,
                              name: user.user_name || '',
                              phone: user.phone_number || '',
                              email: user.email || '',
                              role: 'User',
                              assigned_work: '--',
                              can_create_temple: 0,
                              status: 'active',
                              isExternal: true
                            });
                          }
                        }}
                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', zIndex: 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        <Eye size={18} color="#6366f1" />
                      </button>
                    )}
                  </div>
                </div>

                <FormInput 
                  label="தர்மகர்த்தா பெயர் (Trustee Name)" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  icon={User} 
                  placeholder="எ.கா: ராமசாமி"
                  required 
                  disabled={!!selectedExternalUserId || !!editingId}
                />

                <FormInput 
                  label="கைபேசி எண் (Phone Number)" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  icon={Phone} 
                  placeholder="எ.கா: 9876543210"
                  disabled={!!selectedExternalUserId || !!editingId}
                />

                <FormInput 
                  label="மின்னஞ்சல் முகவரி (Email Address)" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  icon={Mail} 
                  placeholder="trustee@example.com"
                  type="email"
                  disabled={!!selectedExternalUserId || !!editingId}
                />

                {editingId && (
                  <>
                    <FormInput 
                      label="பதவி / Employee Role" 
                      name="role" 
                      value={formData.role} 
                      onChange={handleInputChange} 
                      icon={User} 
                      placeholder="எ.கா: தலைவர் / Manager"
                    />

                    <FormInput 
                      label="ஒதுக்கப்பட்ட பணி (Assigned Work / Appointment)" 
                      name="assignedWork" 
                      value={formData.assignedWork} 
                      onChange={handleInputChange} 
                      icon={Briefcase} 
                      placeholder="எ.கா: கணக்கு வழக்கு, திருவிழா ஏற்பாடு"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Save & Clear Actions placed neatly below */}
            <div className="form-actions" style={{ marginTop: '32px', marginBottom: 0, paddingGap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <button type="button" onClick={clearForm} className="btn btn-outline" style={{ height: '44px', padding: '0 24px', borderRadius: '10px' }}>
                <Eraser size={16}/> Clear
              </button>
              <button type="submit" className="btn btn-primary" style={{ height: '44px', padding: '0 28px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
                {editingId ? <>Update <RefreshCw size={16} /></> : <>Save & Register <Save size={16} /></>}
              </button>
            </div>
          </div>

          {/* Right Column Grid: Photo & Permissions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Card 1: Avatar Upload Bubble */}
            <div className="card" style={{ padding: '24px', borderRadius: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <label className="form-label" style={{ fontWeight: '600', fontSize: '13.5px', color: '#475569', marginBottom: '16px', alignSelf: 'flex-start' }}>தர்மகர்த்தா புகைப்படம் (Trustee Photo)</label>
              
              <div 
                className="avatar-uploader"
                onClick={() => document.getElementById('photoInput').click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#94a3b8' }}>
                    <Camera size={26} />
                  </div>
                )}
                <div className="avatar-overlay">
                  <Camera size={18} />
                  <span>Change Photo</span>
                </div>
              </div>
              <input type="file" id="photoInput" hidden onChange={handleFileChange} accept="image/*" />
              
              <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '500' }}>
                {imageFile ? imageFile.name : (editingId && imagePreview ? 'ஏற்கனவே புகைப்படம் உள்ளது' : 'புகைப்படத்தை பதிவேற்றவும்')}
              </div>
            </div>

            {/* Card 2: Interactive Access Level Selector */}
            {editingId && (
              <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
                
                {/* Access Choice */}
                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ fontWeight: '600', fontSize: '13.5px', color: '#475569', marginBottom: '8px' }}>
                    கோவில் உருவாக்கும் அனுமதி (Create Temple Access)
                  </label>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div 
                      className="visual-choice-card"
                      onClick={() => setFormData(prev => ({ ...prev, canCreateTemple: 0 }))}
                      style={{
                        border: formData.canCreateTemple === 0 ? '2px solid #ef4444' : '1px solid #e2e8f0',
                        background: formData.canCreateTemple === 0 ? '#fef2f2' : '#f8fafc'
                      }}
                    >
                      <Lock size={18} color={formData.canCreateTemple === 0 ? '#dc2626' : '#64748b'} style={{ margin: '0 auto 8px auto' }} />
                      <div style={{ fontWeight: '700', fontSize: '12.5px', color: formData.canCreateTemple === 0 ? '#991b1b' : '#334155' }}>
                        அனுமதி இல்லை
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                        No Access
                      </div>
                    </div>

                    <div 
                      className="visual-choice-card"
                      onClick={() => setFormData(prev => ({ ...prev, canCreateTemple: 1 }))}
                      style={{
                        border: formData.canCreateTemple === 1 ? '2px solid #10b981' : '1px solid #e2e8f0',
                        background: formData.canCreateTemple === 1 ? '#ecfdf5' : '#f8fafc'
                      }}
                    >
                      <Building2 size={18} color={formData.canCreateTemple === 1 ? '#059669' : '#64748b'} style={{ margin: '0 auto 8px auto' }} />
                      <div style={{ fontWeight: '700', fontSize: '12.5px', color: formData.canCreateTemple === 1 ? '#065f46' : '#334155' }}>
                        அனுமதி உண்டு
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                        Create Access
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Choice */}
                <div>
                  <label className="form-label" style={{ fontWeight: '600', fontSize: '13.5px', color: '#475569', marginBottom: '8px' }}>
                    நிலை (Status)
                  </label>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div 
                      className="visual-choice-card"
                      onClick={() => setFormData(prev => ({ ...prev, status: 'active' }))}
                      style={{
                        border: formData.status === 'active' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                        background: formData.status === 'active' ? '#eff6ff' : '#f8fafc'
                      }}
                    >
                      <CheckCircle size={18} color={formData.status === 'active' ? '#2563eb' : '#64748b'} style={{ margin: '0 auto 8px auto' }} />
                      <div style={{ fontWeight: '700', fontSize: '12.5px', color: formData.status === 'active' ? '#1e40af' : '#334155' }}>
                        செயலில்
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                        Active
                      </div>
                    </div>

                    <div 
                      className="visual-choice-card"
                      onClick={() => setFormData(prev => ({ ...prev, status: 'inactive' }))}
                      style={{
                        border: formData.status === 'inactive' ? '2px solid #64748b' : '1px solid #e2e8f0',
                        background: formData.status === 'inactive' ? '#f1f5f9' : '#f8fafc'
                      }}
                    >
                      <XCircle size={18} color={formData.status === 'inactive' ? '#475569' : '#64748b'} style={{ margin: '0 auto 8px auto' }} />
                      <div style={{ fontWeight: '700', fontSize: '12.5px', color: formData.status === 'inactive' ? '#334155' : '#334155' }}>
                        செயலற்றது
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                        Inactive
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
          
        </div>
      </form>

      {/* Records table container */}
      <div className="card" style={{ padding: 0, borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfd' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <List size={18} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: '700', color: '#1e293b' }}>தர்மகர்த்தாக்கள் பட்டியல் (Registered Trustees)</h3>
          </div>
          
          <div className="input-wrapper" style={{ width: '280px' }}>
            <Search className="input-icon" size={14} color="#6366f1" style={{ left: '12px' }} />
            <input 
              type="text" className="form-control" placeholder="தேடல் (Search name, phone)..." 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{ height: '38px', fontSize: '13px', paddingLeft: '36px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            />
          </div>
        </div>

        <div className="table-container" style={{ border: 'none', margin: 0 }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ width: '60px', padding: '16px 24px' }}>#</th>
                <th style={{ padding: '16px 24px' }}>தர்மகர்த்தா பெயர் & புகைப்படம்</th>
                <th>தொடர்பு & பதவி (Role)</th>
                <th>ஒதுக்கப்பட்ட பணி (Work)</th>
                <th style={{ textAlign: 'center' }}>கோவில் உருவாக்க அனுமதி</th>
                <th style={{ textAlign: 'center' }}>நிலை</th>
                <th style={{ textAlign: 'center', width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading records...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>பதிவுகள் ஏதும் இல்லை (No records found)</td></tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: '700', color: '#6366f1', fontSize: '13px', padding: '16px 24px' }}>{idx + 1}</td>
                    <td style={{ padding: '12px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #e2e8f0' }}>
                          {item.photo_path ? (
                            <img src={getImageUrl(item.photo_path)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <User size={18} color="#94a3b8" />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '14px', color: '#1e293b' }}>{item.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13.5px', color: '#334155', fontWeight: '500' }}>{item.phone || '--'}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{item.email || '--'}</div>
                      {item.role && <div style={{ fontSize: '12px', color: '#6366f1', fontWeight: '600', marginTop: '4px', display: 'inline-block', background: '#e0e7ff', padding: '2px 8px', borderRadius: '4px' }}>{item.role}</div>}
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', color: '#475569', maxWidth: '200px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{item.assigned_work || '--'}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {item.can_create_temple === 1 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '20px', background: '#ecfdf5', color: '#059669', fontSize: '11.5px', fontWeight: '600', border: '1px solid #a7f3d0' }}>
                          <Check size={12} /> அனுமதி உண்டு (Allowed)
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '20px', background: '#fef2f2', color: '#dc2626', fontSize: '11.5px', fontWeight: '600', border: '1px solid #fecaca' }}>
                          <Lock size={11} /> அனுமதி இல்லை (No Access)
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge-status ${item.status === 'active' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '11.5px', padding: '4px 10px' }}>
                        {item.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button className="icon-action" onClick={() => setViewingProfileItem(item)} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb' }} title="View Profile"><Eye size={13}/></button>
                        <button className="icon-action" onClick={() => handleEdit(item)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}><Edit2 size={13}/></button>
                        <button className="icon-action" style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca' }} onClick={() => handleDelete(item.id)}><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Web View Modal (John Doe Style) */}
      {viewingProfileItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ maxWidth: '520px', width: '100%', background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: 'none', position: 'relative' }}>
            
            {/* Modal Header Pastel Banner */}
            <div style={{ height: '110px', background: 'linear-gradient(90deg, #e0e7ff 0%, #fae8ff 50%, #d1fae5 100%)' }}>
            </div>

            {/* Avatar & Call Action Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 24px', marginTop: '-50px' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '12px', border: '4px solid #ffffff', background: '#f1f5f9', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                {viewingProfileItem.photo_path ? (
                  <img src={getImageUrl(viewingProfileItem.photo_path)} alt={viewingProfileItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', color: '#64748b' }}>
                    <User size={40} />
                  </div>
                )}
              </div>

              {/* Call Action Button */}
              {viewingProfileItem.phone && (
                <a 
                  href={`tel:${viewingProfileItem.phone}`}
                  style={{ 
                    padding: '10px 22px', 
                    borderRadius: '8px', 
                    background: '#ef4444', 
                    color: 'white', 
                    fontWeight: '700', 
                    fontSize: '13.5px', 
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  <Phone size={14} /> Call Trustee
                </a>
              )}
            </div>

            {/* Profile Content */}
            <div style={{ padding: '16px 24px 24px 24px' }}>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#1e293b' }}>{viewingProfileItem.name}</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Role: {viewingProfileItem.role || 'Trustee'}</p>

              <h4 style={{ margin: '28px 0 16px 0', fontSize: '15px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overview</h4>

              {/* Tabular Column List (Aligned vertically like John Doe) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* ID */}
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '14px', fontWeight: '500' }}>
                    <User size={16} color="#64748b" />
                    <span>{viewingProfileItem.isExternal ? 'User ID' : 'Trustee ID'}</span>
                  </div>
                  <div style={{ color: '#1e293b', fontSize: '14px', fontWeight: '600' }}>
                    #{viewingProfileItem.id}
                  </div>
                </div>

                {/* Role */}
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '14px', fontWeight: '500' }}>
                    <Briefcase size={16} color="#64748b" />
                    <span>Role / Designation</span>
                  </div>
                  <div style={{ color: '#1e293b', fontSize: '14px', fontWeight: '600' }}>
                    {viewingProfileItem.role || 'Member'}
                  </div>
                </div>

                {/* Email */}
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '14px', fontWeight: '500' }}>
                    <Mail size={16} color="#64748b" />
                    <span>Email</span>
                  </div>
                  <div style={{ color: '#1e293b', fontSize: '14px', fontWeight: '600' }}>
                    {viewingProfileItem.email || '--'}
                  </div>
                </div>

                {/* Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '14px', fontWeight: '500' }}>
                    <Phone size={16} color="#64748b" />
                    <span>Phone Number</span>
                  </div>
                  <div style={{ color: '#1e293b', fontSize: '14px', fontWeight: '600' }}>
                    {viewingProfileItem.phone || '--'}
                  </div>
                </div>

                {/* Assigned Work */}
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '14px', fontWeight: '500', marginTop: '2px' }}>
                    <FileText size={16} color="#64748b" />
                    <span>Assigned Work</span>
                  </div>
                  <div style={{ color: '#1e293b', fontSize: '14px', fontWeight: '600', lineHeight: '1.4', whiteSpace: 'pre-wrap' }}>
                    {viewingProfileItem.assigned_work || '--'}
                  </div>
                </div>

                {/* Access */}
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '14px', fontWeight: '500' }}>
                    <Shield size={16} color="#64748b" />
                    <span>Create Access</span>
                  </div>
                  <div>
                    <span style={{ 
                      padding: '3px 8px', 
                      borderRadius: '6px', 
                      background: viewingProfileItem.can_create_temple === 1 ? '#d1fae5' : '#fee2e2', 
                      border: `1px solid ${viewingProfileItem.can_create_temple === 1 ? '#a7f3d0' : '#fecaca'}`,
                      color: viewingProfileItem.can_create_temple === 1 ? '#065f46' : '#991b1b', 
                      fontSize: '12px', 
                      fontWeight: '500' 
                    }}>
                      {viewingProfileItem.can_create_temple === 1 ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '14px', fontWeight: '500' }}>
                    <Activity size={16} color="#64748b" />
                    <span>Status</span>
                  </div>
                  <div>
                    <span style={{ 
                      padding: '3px 8px', 
                      borderRadius: '6px', 
                      background: '#eff6ff', 
                      border: '1px solid #bfdbfe',
                      color: '#3b82f6', 
                      fontSize: '12px', 
                      fontWeight: '500' 
                    }}>
                      {viewingProfileItem.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Footer Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px', marginTop: '36px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                <button 
                  onClick={() => setViewingProfileItem(null)} 
                  style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: '600', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <X size={16} /> Close
                </button>
                {!viewingProfileItem.isExternal && (
                  <button 
                    onClick={() => {
                      handleEdit(viewingProfileItem);
                      setViewingProfileItem(null);
                    }}
                    style={{ background: '#3b82f6', border: 'none', color: 'white', fontWeight: '600', fontSize: '14px', borderRadius: '8px', padding: '10px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)' }}
                  >
                    <Edit2 size={14} /> Edit Trustee
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Tharumakatha;
