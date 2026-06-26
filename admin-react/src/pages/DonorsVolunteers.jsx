import { BASE_API } from '../api/api_list';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Trash2, 
  X, 
  Plus, 
  Edit2, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  ChevronRight, 
  FileCheck, 
  DollarSign, 
  Briefcase, 
  Heart,
  Search,
  List,
  CheckCircle,
  XCircle,
  Eraser,
  Save,
  RefreshCw,
  Users
} from 'lucide-react';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';
import '../index.css';

const getImageUrl = (photoPath) => {
  if (!photoPath) return '';
  return `${BASE_API}/files/${photoPath}`;
};

const FormInput = ({ label, name, value, onChange, icon: Icon, placeholder, required = false, type = "text" }) => (
  <div className="form-group">
    <label className="form-label" style={{ fontWeight: '600', fontSize: '13.5px', color: '#475569', marginBottom: '6px' }}>
      {label} {required && <span className="required-asterisk" style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
    </label>
    <div className="input-wrapper">
      {Icon && <Icon className="input-icon" size={16} color="#6366f1" style={{ left: '14px' }} />}
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="form-control"
          required={required}
          rows={3}
          style={{ 
            paddingLeft: '42px',
            paddingTop: '10px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            width: '100%',
            fontSize: '13.5px'
          }}
        />
      ) : type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="form-control"
          required={required}
          style={{ 
            paddingLeft: '42px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            width: '100%',
            height: '42px',
            fontSize: '13.5px',
            background: 'white'
          }}
        >
          <option value="Donor">நன்கொடையாளர் (Donor)</option>
          <option value="Volunteer">தொண்டர் (Volunteer)</option>
          <option value="Both">இரண்டும் (Both)</option>
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="form-control"
          required={required}
          style={{ 
            paddingLeft: '42px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            width: '100%',
            height: '42px',
            fontSize: '13.5px'
          }}
        />
      )}
    </div>
  </div>
);

const DonorsVolunteers = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    type: 'Donor',
    donationDetails: '',
    assignedService: '',
    status: 'active'
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const templeId = localStorage.getItem('temple_id') || 1;
      const response = await fetch(`${BASE_API}/donors-volunteers/${templeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (response.ok && result.data?.data) {
        setData(result.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showError('தரவை ஏற்றுவதில் பிழை (Error loading data)');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showWarning('புகைப்படம் 5MB க்குள் இருக்க வேண்டும் (File size must be less than 5MB)');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const clearForm = () => {
    setFormData({
      name: '',
      phone: '',
      type: 'Donor',
      donationDetails: '',
      assignedService: '',
      status: 'active'
    });
    setImageFile(null);
    setImagePreview('');
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showWarning('பெயர் அவசியம் (Name is required)');
      return;
    }

    setIsSubmitting(true);
    try {
      const form = new FormData();
      const templeId = localStorage.getItem('temple_id') || 1;
      form.append('temple_id', templeId);
      form.append('name', formData.name);
      form.append('phone', formData.phone);
      form.append('type', formData.type);
      form.append('donation_details', formData.donationDetails);
      form.append('assigned_service', formData.assignedService);
      form.append('status', formData.status);
      
      if (imageFile) {
        form.append('photo', imageFile);
      }
      
      if (editingId) {
        form.append('id', editingId);
      }

      const url = BASE_API + '/donors-volunteers';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: form
      });

      const result = await response.json();

      if (response.ok) {
        showSuccess(editingId ? 'வெற்றிகரமாக புதுப்பிக்கப்பட்டது (Successfully Updated)' : 'வெற்றிகரமாக சேர்க்கப்பட்டது (Successfully Added)');
        clearForm();
        fetchData();
      } else {
        showError(result.data?.message || 'பிழை ஏற்பட்டுள்ளது (An error occurred)');
      }
    } catch (error) {
      showError('சர்வர் பிழை (Server error)');
    } finally {
      setIsSubmitting(false);
    }
  };

  const editItem = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name || '',
      phone: item.phone || '',
      type: item.type || 'Donor',
      donationDetails: item.donation_details || '',
      assignedService: item.assigned_service || '',
      status: item.status || 'active',
    });
    setImagePreview(item.photo_path ? getImageUrl(item.photo_path) : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteItem = async (id) => {
    const result = await showConfirm(
      'நிச்சயமாக நீக்க வேண்டுமா? (Are you sure you want to delete?)',
      'இந்த செயலை மாற்ற முடியாது! (You won\'t be able to revert this!)'
    );
    
    if (result.isConfirmed) {
      try {
        const response = await fetch(`${BASE_API}/donors-volunteers/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          showSuccess('வெற்றிகரமாக நீக்கப்பட்டது! (Deleted successfully!)');
          fetchData();
        } else {
          showError('நீக்குவதில் பிழை (Failed to delete)');
        }
      } catch (error) {
        showError('சர்வர் பிழை (Server error)');
      }
    }
  };

  const filteredData = data.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.name?.toLowerCase().includes(query) ||
      item.phone?.toLowerCase().includes(query) ||
      item.type?.toLowerCase().includes(query)
    );
  });

  return (
    <div style={{ padding: '0px' }}>
      <style>{`
        .stat-card-custom {
          background: white;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
        }
        .avatar-uploader {
          position: relative;
          width: 130px;
          height: 130px;
          border-radius: 50%;
          border: 2px dashed #cbd5e1;
          display: flex;
          flex-direction: column;
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
            <Heart size={20} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>நன்கொடையாளர் & தொண்டர்கள் (Donors & Volunteers)</h2>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b', marginTop: '2px' }}>நன்கொடையாளர்கள் மற்றும் தொண்டர்கள் விவரங்களை நிர்வகிக்கவும்.</p>
          </div>
        </div>
      </div>

      {/* Metrics Counters Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Stat Card 1 */}
        <div className="stat-card-custom">
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ color: '#1e293b', fontWeight: '800', fontSize: '22px' }}>{data.length}</div>
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginTop: '2px' }}>மொத்த நபர்கள் (Total Counts)</div>
          </div>
        </div>
        
        {/* Stat Card 2 */}
        <div className="stat-card-custom">
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ color: '#1e293b', fontWeight: '800', fontSize: '22px' }}>{data.filter(t => t.type === 'Donor' || t.type === 'Both').length}</div>
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginTop: '2px' }}>நன்கொடையாளர்கள் (Donors)</div>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="stat-card-custom">
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d9488' }}>
            <Briefcase size={24} />
          </div>
          <div>
            <div style={{ color: '#1e293b', fontWeight: '800', fontSize: '22px' }}>{data.filter(t => t.type === 'Volunteer' || t.type === 'Both').length}</div>
            <div style={{ color: '#64748b', fontSize: '13px', fontWeight: '600', marginTop: '2px' }}>தொண்டர்கள் (Volunteers)</div>
          </div>
        </div>
      </div>

      {/* Main Two Column Form Section */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px', alignItems: 'stretch' }}>
          
          {/* Left Column Card: Basic Information */}
          <div className="card" style={{ padding: '28px', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <User size={18} color="#6366f1" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>தனிநபர் விவரங்கள் (Personal Details)</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <FormInput 
                  label="பெயர் (Name)" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  icon={User} 
                  placeholder="எ.கா: ராஜேஷ் குமார்"
                  required 
                />

                <FormInput 
                  label="கைபேசி எண் (Phone Number)" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  icon={Phone} 
                  placeholder="எ.கா: 9876543210"
                />

                <FormInput 
                  label="வகை (Type)" 
                  name="type" 
                  type="select"
                  value={formData.type} 
                  onChange={handleInputChange} 
                  icon={FileCheck} 
                />

                {(formData.type === 'Donor' || formData.type === 'Both') && (
                  <FormInput 
                    label="நன்கொடை விவரங்கள் (Donation Details)" 
                    name="donationDetails" 
                    type="textarea"
                    value={formData.donationDetails} 
                    onChange={handleInputChange} 
                    icon={DollarSign} 
                    placeholder="எ.கா: 50,000 ரூபாய், அல்லது 10 மூட்டை அரிசி"
                  />
                )}

                {(formData.type === 'Volunteer' || formData.type === 'Both') && (
                  <FormInput 
                    label="செய்யும் பணி (Assigned Service)" 
                    name="assignedService" 
                    type="textarea"
                    value={formData.assignedService} 
                    onChange={handleInputChange} 
                    icon={Briefcase} 
                    placeholder="எ.கா: அன்னதானம் வழங்குதல், கூட்ட நெரிசலை கட்டுப்படுத்துதல்"
                  />
                )}
              </div>
            </div>

            {/* Save & Clear Actions */}
            <div className="form-actions" style={{ marginTop: '32px', marginBottom: 0, display: 'flex', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <button type="button" onClick={clearForm} className="btn btn-outline" style={{ height: '42px', padding: '0 24px', borderRadius: '8px' }}>
                <Eraser size={16}/> Clear
              </button>
              <button type="submit" className="btn btn-primary" style={{ height: '42px', padding: '0 28px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', border: 'none' }} disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="spinner"></span>
                ) : editingId ? (
                  <>Update <RefreshCw size={16} /></>
                ) : (
                  <>Save & Register <Save size={16} /></>
                )}
              </button>
            </div>
          </div>

          {/* Right Column Grid: Photo & Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Card 1: Avatar Upload Bubble */}
            <div className="card" style={{ padding: '24px', borderRadius: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <label className="form-label" style={{ fontWeight: '600', fontSize: '13.5px', color: '#475569', marginBottom: '16px', alignSelf: 'flex-start' }}>புகைப்படம் (Photo)</label>
              
              <div 
                className="avatar-uploader"
                onClick={() => fileInputRef.current?.click()}
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
              <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
              
              <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '500', marginTop: '12px' }}>
                {imageFile ? imageFile.name : (editingId && imagePreview ? 'ஏற்கனவே புகைப்படம் உள்ளது' : 'புகைப்படத்தை பதிவேற்றவும்')}
              </div>
            </div>

            {/* Card 2: Status Choice */}
            <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
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
                    <div style={{ fontWeight: '700', fontSize: '12.5px', color: '#334155' }}>
                      செயலற்றது
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                      Inactive
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
          
        </div>
      </form>

      {/* Records table container */}
      <div className="card" style={{ padding: 0, borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfd' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <List size={18} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: '700', color: '#1e293b' }}>பதிவு செய்யப்பட்டவர்கள் பட்டியல் (Registered Members)</h3>
          </div>
          
          <div className="input-wrapper" style={{ width: '280px', position: 'relative' }}>
            <Search className="input-icon" size={14} color="#6366f1" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
            <input 
              type="text" className="form-control" placeholder="தேடல் (Search name, phone)..." 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{ height: '38px', fontSize: '13px', paddingLeft: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%' }}
            />
          </div>
        </div>

        <div className="table-container" style={{ border: 'none', margin: 0 }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ width: '60px', padding: '16px 24px' }}>#</th>
                <th style={{ padding: '16px 24px' }}>பெயர் & புகைப்படம்</th>
                <th>கைபேசி எண்</th>
                <th>வகை (Type)</th>
                <th>விவரங்கள் (Details)</th>
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
                            <img src={getImageUrl(item.photo_path)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <User size={20} color="#94a3b8" />
                          )}
                        </div>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{item.name}</div>
                      </div>
                    </td>
                    <td style={{ color: '#475569', fontWeight: '500' }}>{item.phone || '-'}</td>
                    <td>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '11px', 
                        fontWeight: '700',
                        background: item.type === 'Donor' ? '#e2fcf0' : item.type === 'Volunteer' ? '#e0e7ff' : '#fae8ff',
                        color: item.type === 'Donor' ? '#059669' : item.type === 'Volunteer' ? '#4f46e5' : '#c084fc'
                      }}>
                        {item.type === 'Donor' ? 'நன்கொடையாளர் (Donor)' : item.type === 'Volunteer' ? 'தொண்டர் (Volunteer)' : 'இரண்டும் (Both)'}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: '#475569', maxWidth: '300px' }}>
                      {item.type === 'Donor' && (
                        <div><strong>Donation:</strong> {item.donation_details || '-'}</div>
                      )}
                      {item.type === 'Volunteer' && (
                        <div><strong>Service:</strong> {item.assigned_service || '-'}</div>
                      )}
                      {item.type === 'Both' && (
                        <div>
                          <div><strong>Donation:</strong> {item.donation_details || '-'}</div>
                          <div><strong>Service:</strong> {item.assigned_service || '-'}</div>
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`status-badge ${item.status === 'active' ? 'success' : 'neutral'}`}>
                        {item.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 24px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => editItem(item)} 
                          className="btn btn-outline-primary"
                          style={{ padding: '6px 10px', height: '32px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', border: '1px solid #e2e8f0', color: '#475569' }}
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button 
                          onClick={() => deleteItem(item.id)} 
                          className="btn btn-outline-danger"
                          style={{ padding: '6px 10px', height: '32px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', border: '1px solid #fecaca', color: '#dc2626' }}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DonorsVolunteers;
