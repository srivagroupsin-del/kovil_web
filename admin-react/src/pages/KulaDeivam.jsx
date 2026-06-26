import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Trash2, 
  Edit, 
  Camera, 
  XCircle, 
  FileText, 
  Save, 
  RefreshCw, 
  Bookmark,
  Church
} from 'lucide-react';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

const resolveImageUrl = (img) => {
  if (!img) return '';
  if (img.startsWith('data:image/') || img.startsWith('http://') || img.startsWith('https://')) {
    return img;
  }
  return `${BASE_API}/files/${img}`;
};

const FormInput = ({ label, name, value, onChange, placeholder, required = false }) => (
  <div className="form-group">
    <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>{label}</label>
    <div className="input-wrapper" style={{ margin: 0 }}>
      <input 
        type="text" 
        name={name}
        className="form-control"
        placeholder={placeholder}
        value={value} 
        onChange={onChange} 
        required={required} 
        style={{ height: '40px', borderRadius: '8px', border: '1.5px solid #cbd5e1', paddingLeft: '12px', fontSize: '13px' }}
      />
    </div>
  </div>
);

const KulaDeivam = () => {
  const [communities, setCommunities] = useState([]);
  const [subCommunities, setSubCommunities] = useState([]);
  const [kulams, setKulams] = useState([]);
  const [mappings, setMappings] = useState([]);
  
  // Previews
  const [imagePreview, setImagePreview] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [iconPreview, setIconPreview] = useState('');
  const [showAdditional, setShowAdditional] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    community_id: '',
    sub_community_id: '',
    kula_id: '',
    kula_deivam_name: '',
    kula_deivam_name_en: '',
    title: '',
    info: '',
    description: '',
    varalaru: '',
    image_path: '',
    logo_path: '',
    icon_path: ''
  });

  const fetchCommunities = async () => {
    try {
      const response = await fetch(BASE_API + '/communities');
      const result = await response.json();
      if (response.ok && result.data && result.data.code === 200) {
        const mapped = result.data.data.map(c => ({
          id: String(c.id),
          name_ta: c.community_name_tamil || '',
          name_en: c.community_name_english || ''
        }));
        setCommunities(mapped);
      }
    } catch (e) {
      console.error("Error fetching communities:", e);
    }
  };

  const fetchSubCommunities = async () => {
    try {
      const response = await fetch(BASE_API + '/sub-communities');
      const result = await response.json();
      if (response.ok && result.data && result.data.code === 200) {
        const mapped = result.data.data.map(sc => ({
          id: String(sc.id),
          community_id: String(sc.community_id),
          name_ta: sc.sub_community_name_tamil || '',
          name_en: sc.sub_community_name_english || ''
        }));
        setSubCommunities(mapped);
      }
    } catch (e) {
      console.error("Error fetching sub-communities:", e);
    }
  };

  const fetchKulams = async () => {
    try {
      const response = await fetch(BASE_API + '/kulas');
      const result = await response.json();
      if (response.ok && result.data && result.data.code === 200) {
        const mapped = result.data.data.map(k => ({
          id: String(k.id),
          community_id: String(k.community_id),
          sub_community_id: String(k.sub_community_id),
          name_ta: k.kula_name_tamil || '',
          name_en: k.kula_name_english || ''
        }));
        setKulams(mapped);
      }
    } catch (e) {
      console.error("Error fetching kulams:", e);
    }
  };

  const fetchMappings = async () => {
    try {
      const res = await fetch(BASE_API + '/kula-deivams');
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.data) {
          setMappings(json.data.data);
        } else {
          setMappings([]);
        }
      }
    } catch (err) {
      console.error('Error fetching mappings:', err);
    }
  };

  useEffect(() => {
    fetchCommunities();
    fetchSubCommunities();
    fetchKulams();
    fetchMappings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData(prev => ({ ...prev, [field]: ev.target.result }));
        if (field === 'image_path') setImagePreview(ev.target.result);
        if (field === 'logo_path') setLogoPreview(ev.target.result);
        if (field === 'icon_path') setIconPreview(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearFile = (field) => {
    setFormData(prev => ({ ...prev, [field]: '' }));
    if (field === 'image_path') {
      setImagePreview('');
      const fileInput = document.getElementById('imageInput');
      if (fileInput) fileInput.value = '';
    }
    if (field === 'logo_path') {
      setLogoPreview('');
      const fileInput = document.getElementById('logoInput');
      if (fileInput) fileInput.value = '';
    }
    if (field === 'icon_path') {
      setIconPreview('');
      const fileInput = document.getElementById('iconInput');
      if (fileInput) fileInput.value = '';
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      community_id: '',
      sub_community_id: '',
      kula_id: '',
      kula_deivam_name: '',
      kula_deivam_name_en: '',
      title: '',
      info: '',
      description: '',
      varalaru: '',
      image_path: '',
      logo_path: '',
      icon_path: ''
    });
    setImagePreview('');
    setLogoPreview('');
    setIconPreview('');
    setIsEditing(false);
    setShowAdditional(false);
    
    const imageInput = document.getElementById('imageInput');
    if (imageInput) imageInput.value = '';
    const logoInput = document.getElementById('logoInput');
    if (logoInput) logoInput.value = '';
    const iconInput = document.getElementById('iconInput');
    if (iconInput) iconInput.value = '';
  };

  const handleEdit = (deity) => {
    setFormData({
      id: deity.id,
      community_id: deity.community_id ? String(deity.community_id) : '',
      sub_community_id: deity.sub_community_id ? String(deity.sub_community_id) : '',
      kula_id: deity.kula_id ? String(deity.kula_id) : '',
      kula_deivam_name: deity.deity_name_tamil || '',
      kula_deivam_name_en: deity.deity_name_english || '',
      title: deity.title || '',
      info: deity.info || '',
      description: deity.description || '',
      varalaru: deity.history || '',
      image_path: deity.image_path || '',
      logo_path: deity.logo_path || '',
      icon_path: deity.icon_path || ''
    });
    setImagePreview(resolveImageUrl(deity.image_path));
    setLogoPreview(resolveImageUrl(deity.logo_path));
    setIconPreview(resolveImageUrl(deity.icon_path));
    setIsEditing(true);
    if (deity.history) {
      setShowAdditional(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.community_id || !formData.sub_community_id || !formData.kula_id || !formData.kula_deivam_name) {
      showWarning("கட்டாய தகவல்கள்", "Please select Community, Sub-Community, Kulam & Deity Name");
      return;
    }

    try {
      const payload = {
        community_id: parseInt(formData.community_id),
        sub_community_id: parseInt(formData.sub_community_id),
        kula_id: parseInt(formData.kula_id),
        deity_name_tamil: formData.kula_deivam_name,
        deity_name_english: formData.kula_deivam_name_en || null,
        title: formData.title || null,
        info: formData.info || null,
        description: formData.description || null,
        history: formData.varalaru || null,
        image_path: formData.image_path || null,
        logo_path: formData.logo_path || null,
        icon_path: formData.icon_path || null,
        status: 'active'
      };

      if (isEditing) {
        payload.id = parseInt(formData.id);
      }

      const url = isEditing 
        ? `${BASE_API}/kula-deivam/update/${formData.id}` 
        : `${BASE_API}/kula-deivam/create`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showSuccess(
          'வெற்றி', 
          isEditing ? "குலதெய்வம் புதுப்பிக்கப்பட்டது (Updated successfully)" : "புதிய குலதெய்வம் சேர்க்கப்பட்டது (Saved successfully)"
        );
        resetForm();
        fetchMappings();
      } else {
        const errData = await res.json();
        showError("தோல்வி", errData.message || "Failed to save mapping");
      }
    } catch (err) {
      showError("தொடர்பு பிழை", "Connection error");
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm("நிச்சயமாக நீக்க வேண்டுமா?", "Are you sure you want to delete this mapping?");
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${BASE_API}/kula-deivam/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        resetForm();
        fetchMappings();
        showSuccess("நீக்கப்பட்டது", "Deleted successfully");
      }
    } catch (err) {
      showError("நீக்குவதில் பிழை", "Error deleting record");
    }
  };

  return (
    <div className="form-card" style={{ maxWidth: '100%', margin: '0 auto', padding: '10px' }}>
      <div className="form-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Church size={24} color="#6366f1" />
          <h2 style={{ margin: 0, fontSize: '20px' }}>குல தெய்வம் (Kula Deivam Mapping)</h2>
        </div>
        <p style={{ fontSize: '13px' }}>ஒவ்வொரு சமூகத்திற்கும் அவர்களின் குல தெய்வங்களை இங்கே இணைக்கலாம்.</p>
      </div>

      <div className="card" style={{ padding: '24px', borderRadius: '16px', border: '1.5px solid #e2e8f0', background: '#fff' }}>
        
        {/* Selection drop-down to edit existing items */}
        <div style={{ marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <label className="form-label" style={{ fontWeight: '750', fontSize: '13.5px', color: '#4f46e5', marginBottom: '8px', display: 'block' }}>
            ஏற்கனவே உள்ள பதிவைத் தேர்ந்தெடுத்து திருத்த அல்லது நீக்க (Select to Edit/Delete)
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              className="form-control"
              value={isEditing ? formData.id : ''}
              onChange={(e) => {
                const selectedId = e.target.value;
                if (selectedId) {
                  const found = mappings.find(m => String(m.id) === selectedId);
                  if (found) handleEdit(found);
                } else {
                  resetForm();
                }
              }}
              style={{ height: '42px', borderRadius: '8px', border: '1.5px solid #cbd5e1', appearance: 'auto', paddingLeft: '12px', fontSize: '13.5px', fontWeight: '500', flex: 1 }}
            >
              <option value="">-- புதிய குல தெய்வம் சேர்க்கவும் (Add New Deity Mapping) --</option>
              {mappings.map(m => {
                const comm = communities.find(c => String(c.id) === String(m.community_id));
                const commText = comm ? ` - ${comm.name_ta}` : '';
                const enName = m.deity_name_english ? ` (${m.deity_name_english})` : '';
                return (
                  <option key={m.id} value={m.id}>
                    {m.deity_name_tamil}{enName}{commText}
                  </option>
                );
              })}
            </select>
            {isEditing && (
              <button
                type="button"
                onClick={() => handleDelete(formData.id)}
                className="btn btn-outline"
                style={{ borderColor: '#ef4444', color: '#ef4444', height: '42px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={16} /> நீக்கு (Delete)
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Bookmark size={18} color="#6366f1" />
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>
            {isEditing ? 'குலதெய்வ விவரங்களை மாற்றுதல் (Edit Deity Mapping)' : 'புதிய குலதெய்வம் சேர்த்தல் (Add New Deity Mapping)'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>
              சமூகம் (Select Community) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              name="community_id"
              className="form-control"
              value={formData.community_id}
              onChange={(e) => {
                const val = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  community_id: val,
                  sub_community_id: '',
                  kula_id: ''
                }));
              }}
              required
              style={{ height: '40px', borderRadius: '8px', border: '1.5px solid #cbd5e1', appearance: 'auto', paddingLeft: '12px', fontSize: '13px' }}
            >
              <option value="">-- சமூகம் தேர்ந்தெடுக்கவும் (Select Parent Community) --</option>
              {communities.map(c => (
                <option key={c.id} value={c.id}>{c.name_ta} ({c.name_en})</option>
              ))}
            </select>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                உட்பிரிவு (Select Sub-Community) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                name="sub_community_id"
                className="form-control"
                value={formData.sub_community_id}
                disabled={!formData.community_id}
                required
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    sub_community_id: val,
                    kula_id: ''
                  }));
                }}
                style={{ height: '40px', borderRadius: '8px', border: '1.5px solid #cbd5e1', appearance: 'auto', paddingLeft: '12px', fontSize: '13px' }}
              >
                <option value="">-- உட்பிரிவு தேர்ந்தெடுக்கவும் (Select Sub-Community) --</option>
                {subCommunities
                  .filter(sc => String(sc.community_id) === String(formData.community_id))
                  .map(sc => (
                    <option key={sc.id} value={sc.id}>{sc.name_ta} ({sc.name_en})</option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                குலம் (Select Kulam) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                name="kula_id"
                className="form-control"
                value={formData.kula_id}
                disabled={!formData.community_id}
                required
                onChange={(e) => setFormData(prev => ({ ...prev, kula_id: e.target.value }))}
                style={{ height: '40px', borderRadius: '8px', border: '1.5px solid #cbd5e1', appearance: 'auto', paddingLeft: '12px', fontSize: '13px' }}
              >
                <option value="">-- குலம் தேர்ந்தெடுக்கவும் (Select Kulam) --</option>
                {kulams
                  .filter(k => {
                    const matchComm = String(k.community_id) === String(formData.community_id);
                    const matchSub = !formData.sub_community_id || String(k.sub_community_id) === String(formData.sub_community_id);
                    return matchComm && matchSub;
                  })
                  .map(k => (
                    <option key={k.id} value={k.id}>{k.name_ta} ({k.name_en})</option>
                  ))}
              </select>
            </div>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                குல தெய்வம் பெயர் (தமிழ்) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="kula_deivam_name"
                className="form-control"
                placeholder="எ.கா. ஸ்ரீ மாரியம்மன்"
                value={formData.kula_deivam_name}
                onChange={handleInputChange}
                required
                style={{ height: '40px', borderRadius: '8px', border: '1.5px solid #cbd5e1', paddingLeft: '12px', fontSize: '13px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                Kula Deity Name (English)
              </label>
              <input
                type="text"
                name="kula_deivam_name_en"
                className="form-control"
                placeholder="e.g. Sri Mariamman"
                value={formData.kula_deivam_name_en}
                onChange={handleInputChange}
                style={{ height: '40px', borderRadius: '8px', border: '1.5px solid #cbd5e1', paddingLeft: '12px', fontSize: '13px' }}
              />
            </div>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormInput label="தலைப்பு (Title)" name="title" value={formData.title} onChange={handleInputChange} placeholder="தலைப்பு..." />
            <FormInput label="தகவல் (Info)" name="info" value={formData.info} onChange={handleInputChange} placeholder="தகவல்..." />
          </div>

          {/* Three Column Grid for Images */}
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '8px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>புகைப்படம் (Image)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                <div
                  className="photo-upload-area"
                  onClick={() => document.getElementById('imageInput').click()}
                  style={{
                    height: '110px',
                    width: '100%',
                    border: '1.5px dashed #cbd5e1',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: '#f8fafc',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                      <Camera size={20} />
                      <span style={{ fontSize: '11px' }}>பதிவேற்று</span>
                    </div>
                  )}
                </div>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => handleClearFile('image_path')}
                    className="btn btn-outline"
                    style={{ padding: '4px 8px', height: '28px', fontSize: '11px', borderColor: '#ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'center' }}
                  >
                    <XCircle size={12} /> நீக்கு (Clear)
                  </button>
                )}
                <input type="file" id="imageInput" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'image_path')} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>சின்னம் (Logo)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                <div
                  className="photo-upload-area"
                  onClick={() => document.getElementById('logoInput').click()}
                  style={{
                    height: '110px',
                    width: '100%',
                    border: '1.5px dashed #cbd5e1',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: '#f8fafc',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                      <Camera size={20} />
                      <span style={{ fontSize: '11px' }}>பதிவேற்று</span>
                    </div>
                  )}
                </div>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => handleClearFile('logo_path')}
                    className="btn btn-outline"
                    style={{ padding: '4px 8px', height: '28px', fontSize: '11px', borderColor: '#ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'center' }}
                  >
                    <XCircle size={12} /> நீக்கு (Clear)
                  </button>
                )}
                <input type="file" id="logoInput" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'logo_path')} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>ஐகான் (Icon)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                <div
                  className="photo-upload-area"
                  onClick={() => document.getElementById('iconInput').click()}
                  style={{
                    height: '110px',
                    width: '100%',
                    border: '1.5px dashed #cbd5e1',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: '#f8fafc',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {iconPreview ? (
                    <img src={iconPreview} alt="Icon Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                      <Camera size={20} />
                      <span style={{ fontSize: '11px' }}>பதிவேற்று</span>
                    </div>
                  )}
                </div>
                {iconPreview && (
                  <button
                    type="button"
                    onClick={() => handleClearFile('icon_path')}
                    className="btn btn-outline"
                    style={{ padding: '4px 8px', height: '28px', fontSize: '11px', borderColor: '#ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'center' }}
                  >
                    <XCircle size={12} /> நீக்கு (Clear)
                  </button>
                )}
                <input type="file" id="iconInput" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'icon_path')} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>சுருக்கமான விளக்கம் (Description)</label>
            <textarea
              name="description"
              className="form-control"
              placeholder="சுருக்கமான விளக்கம்..."
              value={formData.description}
              onChange={handleInputChange}
              rows={2}
              style={{ borderRadius: '8px', border: '1.5px solid #cbd5e1', padding: '10px', fontSize: '13px', minHeight: '60px' }}
            />
          </div>

          {/* Collapsible Additional Details Section */}
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => setShowAdditional(!showAdditional)}
              style={{
                width: '100%',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontWeight: '750',
                fontSize: '13px',
                color: '#4f46e5'
              }}
            >
              <span>கூடுதல் விவரங்கள் (Additional Details)</span>
              <span style={{ fontSize: '10px' }}>{showAdditional ? '▲' : '▼'}</span>
            </button>
            {showAdditional && (
              <div style={{ padding: '16px', background: '#fff', borderTop: '1.5px solid #e2e8f0' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155', marginBottom: '8px', display: 'block' }}>
                    வரலாறு (History / Varalaru)
                  </label>
                  <textarea
                    name="varalaru"
                    className="form-control"
                    placeholder="வரலாறு..."
                    value={formData.varalaru}
                    onChange={handleInputChange}
                    rows={4}
                    style={{ borderRadius: '8px', border: '1.5px solid #cbd5e1', padding: '10px', fontSize: '13px', minHeight: '100px', width: '100%' }}
                  />
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={resetForm}
              className="btn btn-outline"
              style={{ flex: 1, height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <RefreshCw size={16} /> ரத்து (Cancel)
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1.5, height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Save size={16} /> {isEditing ? 'மாற்றங்களைச் சேமி (Update)' : 'சேமி (Save)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KulaDeivam;
