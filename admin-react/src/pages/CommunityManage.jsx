import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit, Camera, XCircle, FileText, Info as InfoIcon, Save, RefreshCw, Bookmark } from 'lucide-react';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

const INITIAL_COMMUNITIES = [
  { id: '1', name_ta: 'கொங்கு வேளாளர் கவுண்டர்', name_en: 'Kongu Vellalar Gounder', title: 'கொங்கு வேளாளர்', info: 'Western Tamil Nadu Community', description: 'Kongu region lineage', image: '', logo: '', icon: '', varalaru: 'Historically rulers and farmers of Kongu Nadu.' },
  { id: '2', name_ta: 'வன்னியர்', name_en: 'Vanniyar', title: 'வன்னிய குல க்ஷத்திரியர்', info: 'Northern Tamil Nadu Community', description: 'Vanniyar lineage', image: '', logo: '', icon: '', varalaru: 'Historically warriors and rulers.' },
  { id: '3', name_ta: 'நாடார்', name_en: 'Nadar', title: 'நாடார் சமுதாயம்', info: 'Southern Tamil Nadu Community', description: 'Nadar lineage', image: '', logo: '', icon: '', varalaru: 'Historically merchants and landowners.' },
  { id: '4', name_ta: 'கள்ளர்', name_en: 'Kallar', title: 'முக்குலத்தோர் கள்ளர்', info: 'Central/Southern Tamil Nadu', description: 'Kallar lineage', image: '', logo: '', icon: '', varalaru: 'Part of the ancient Mukkulathor dynasty.' },
  { id: '5', name_ta: 'செட்டியார்', name_en: 'Chettiar', title: 'நகரத்தார் செட்டியார்', info: 'Merchant community', description: 'Chettiar lineage', image: '', logo: '', icon: '', varalaru: 'Renowned traders and bankers.' },
  { id: '6', name_ta: 'பிள்ளை', name_en: 'Pillai', title: 'சைவ பிள்ளை சமுதாயம்', info: 'Scholars and agriculturists', description: 'Pillai lineage', image: '', logo: '', icon: '', varalaru: 'Admin and farming leaders.' },
  { id: '7', name_ta: 'யாதவர்', name_en: 'Yadavar', title: 'கோனார் யாதவ குலம்', info: 'Herdsmen and warriors', description: 'Yadavar lineage', image: '', logo: '', icon: '', varalaru: 'Historically associated with cattle breeding.' },
  { id: '8', name_ta: 'ஆதி திராவிடர்', name_en: 'Adi Dravidar', title: 'பண்டைய குடிகள்', info: 'Indigenous community', description: 'Adi Dravidar lineage', image: '', logo: '', icon: '', varalaru: 'Original inhabitants and agriculturists.' }
];

const resolveImageUrl = (img) => {
  if (!img) return '';
  if (img.startsWith('data:image/') || img.startsWith('http://') || img.startsWith('https://')) {
    return img;
  }
  return `${BASE_API}/files/${img}`;
};

const CommunityManage = () => {
  const [communities, setCommunities] = useState(() => {
    const saved = localStorage.getItem('local_communities');
    return saved ? JSON.parse(saved) : INITIAL_COMMUNITIES;
  });

  const [formData, setFormData] = useState({
    id: '',
    name_ta: '',
    name_en: '',
    title: '',
    info: '',
    description: '',
    image: '',
    logo: '',
    icon: '',
    varalaru: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [iconPreview, setIconPreview] = useState('');
  const [showAdditional, setShowAdditional] = useState(false);

  const fetchCommunities = async () => {
    try {
      const response = await fetch(BASE_API + '/communities');
      const result = await response.json();
      if (response.ok && result.data && result.data.code === 200) {
        const mapped = result.data.data.map(c => ({
          id: String(c.id),
          name_ta: c.community_name_tamil || '',
          name_en: c.community_name_english || '',
          title: c.title || '',
          info: c.info || '',
          description: c.description || '',
          image: c.image_path || '',
          logo: c.logo_path || '',
          icon: c.icon_path || '',
          varalaru: c.history || ''
        }));
        setCommunities(mapped);
        localStorage.setItem('local_communities', JSON.stringify(mapped));
      } else {
        const saved = localStorage.getItem('local_communities');
        if (saved) setCommunities(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error fetching communities from backend:", e);
      const saved = localStorage.getItem('local_communities');
      if (saved) setCommunities(JSON.parse(saved));
    }
  };

  useEffect(() => {
    fetchCommunities();
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
        if (field === 'image') setImagePreview(ev.target.result);
        if (field === 'logo') setLogoPreview(ev.target.result);
        if (field === 'icon') setIconPreview(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearFile = (field) => {
    setFormData(prev => ({ ...prev, [field]: '' }));
    if (field === 'image') {
      setImagePreview('');
      const fileInput = document.getElementById('imageInput');
      if (fileInput) fileInput.value = '';
    }
    if (field === 'logo') {
      setLogoPreview('');
      const fileInput = document.getElementById('logoInput');
      if (fileInput) fileInput.value = '';
    }
    if (field === 'icon') {
      setIconPreview('');
      const fileInput = document.getElementById('iconInput');
      if (fileInput) fileInput.value = '';
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name_ta: '',
      name_en: '',
      title: '',
      info: '',
      description: '',
      image: '',
      logo: '',
      icon: '',
      varalaru: ''
    });
    setImagePreview('');
    setLogoPreview('');
    setIconPreview('');
    setIsEditing(false);
    setShowAdditional(false);
    
    const fileInput = document.getElementById('imageInput');
    if (fileInput) fileInput.value = '';
    const logoInput = document.getElementById('logoInput');
    if (logoInput) logoInput.value = '';
    const iconInput = document.getElementById('iconInput');
    if (iconInput) iconInput.value = '';
  };

  const handleEdit = (community) => {
    setFormData(community);
    setImagePreview(resolveImageUrl(community.image));
    setLogoPreview(resolveImageUrl(community.logo));
    setIconPreview(resolveImageUrl(community.icon));
    setIsEditing(true);
    if (community.varalaru) {
      setShowAdditional(true);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await showConfirm(
      'நிச்சயமாக நீக்க வேண்டுமா?',
      'இந்த சமூகத்தை நீக்க விரும்புகிறீர்களா? (Delete this community?)'
    );
    if (confirm.isConfirmed) {
      try {
        const response = await fetch(`${BASE_API}/community/delete/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          showSuccess('வெற்றி', 'சமூகம் நீக்கப்பட்டது (Community deleted successfully)');
          fetchCommunities();
          resetForm();
        } else {
          showError('பிழை', 'சமூகத்தை நீக்க முடியவில்லை');
        }
      } catch (err) {
        console.error(err);
        showError('பிழை', 'சர்வர் தொடர்பு கொள்ள முடியவில்லை');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name_ta.trim() || !formData.name_en.trim()) {
      showWarning('விவரம் தேவை', 'சமூகத்தின் பெயரை உள்ளிடவும் (Please fill community name)');
      return;
    }

    const payload = {
      community_name_tamil: formData.name_ta,
      community_name_english: formData.name_en,
      title: formData.title,
      info: formData.info,
      description: formData.description,
      history: formData.varalaru,
      image_path: formData.image,
      logo_path: formData.logo,
      icon_path: formData.icon
    };

    try {
      if (isEditing) {
        const response = await fetch(`${BASE_API}/community/update/${formData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ...payload, id: Number(formData.id) })
        });
        const result = await response.json();
        if (response.ok) {
          showSuccess('வெற்றி', 'சமூகம் புதுப்பிக்கப்பட்டது (Community updated successfully)');
          fetchCommunities();
        } else {
          showError('பிழை', result.message || 'சமூகத்தை புதுப்பிக்க முடியவில்லை');
        }
      } else {
        const response = await fetch(BASE_API + '/community/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (response.ok) {
          showSuccess('வெற்றி', 'புதிய சமூகம் சேர்க்கப்பட்டது (New community added successfully)');
          fetchCommunities();
        } else {
          showError('பிழை', result.message || 'சமூகத்தைச் சேர்க்க முடியவில்லை');
        }
      }
    } catch (err) {
      console.error(err);
      showError('பிழை', 'சர்வர் தொடர்பு கொள்ள முடியவில்லை');
    }

    resetForm();
  };

  return (
    <div className="form-card" style={{ maxWidth: '100%', margin: '0 auto', padding: '10px' }}>
      <div className="form-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Users size={24} color="#6366f1" />
          <h2 style={{ margin: 0, fontSize: '20px' }}>சமூகம் நிர்வகித்தல் (Community Management)</h2>
        </div>
        <p style={{ fontSize: '13px' }}>சமூகத்தின் பெயர்கள், தகவல்கள், மற்றும் வரலாற்றை நிர்வகிக்கவும்.</p>
      </div>

      <div className="card" style={{ padding: '24px', borderRadius: '16px', border: '1.5px solid #e2e8f0', background: '#fff' }}>
        {/* Selection drop-down to edit existing items */}
        <div style={{ marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <label className="form-label" style={{ fontWeight: '750', fontSize: '13.5px', color: '#4f46e5', marginBottom: '8px', display: 'block' }}>
            ஏற்கனவே உள்ள சமுதாயத்தைத் தேர்ந்தெடுத்து திருத்த அல்லது நீக்க (Select to Edit/Delete)
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              className="form-control"
              value={isEditing ? formData.id : ''}
              onChange={(e) => {
                const selectedId = e.target.value;
                if (selectedId) {
                  const found = communities.find(c => c.id === selectedId);
                  if (found) handleEdit(found);
                } else {
                  resetForm();
                }
              }}
              style={{ height: '42px', borderRadius: '8px', border: '1.5px solid #cbd5e1', appearance: 'auto', paddingLeft: '12px', fontSize: '13.5px', fontWeight: '500', flex: 1 }}
            >
              <option value="">-- புதிய சமூகம் சேர்க்கவும் (Add New Community) --</option>
              {communities.map(c => (
                <option key={c.id} value={c.id}>{c.name_ta} ({c.name_en})</option>
              ))}
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
            {isEditing ? 'சமூக விவரங்களை மாற்றுதல் (Edit Community)' : 'புதிய சமூகம் சேர்த்தல் (Add New Community)'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                சமூகத்தின் பெயர் (தமிழ்) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="name_ta"
                className="form-control"
                placeholder="எ.கா. கொங்கு வேளாளர் கவுண்டர்"
                value={formData.name_ta}
                onChange={handleInputChange}
                required
                style={{ height: '40px', borderRadius: '8px', border: '1.5px solid #cbd5e1', paddingLeft: '12px', fontSize: '13px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                Community Name (English) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="name_en"
                className="form-control"
                placeholder="e.g. Kongu Vellalar Gounder"
                value={formData.name_en}
                onChange={handleInputChange}
                required
                style={{ height: '40px', borderRadius: '8px', border: '1.5px solid #cbd5e1', paddingLeft: '12px', fontSize: '13px' }}
              />
            </div>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>தலைப்பு (Title)</label>
              <input
                type="text"
                name="title"
                className="form-control"
                placeholder="எ.கா. கொங்கு வேளாளர் சமுதாயம்"
                value={formData.title}
                onChange={handleInputChange}
                style={{ height: '40px', borderRadius: '8px', border: '1.5px solid #cbd5e1', paddingLeft: '12px', fontSize: '13px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>தகவல் (Info)</label>
              <input
                type="text"
                name="info"
                className="form-control"
                placeholder="எ.கா. கொங்கு பகுதியின் பாரம்பரிய குடிமக்கள்"
                value={formData.info}
                onChange={handleInputChange}
                style={{ height: '40px', borderRadius: '8px', border: '1.5px solid #cbd5e1', paddingLeft: '12px', fontSize: '13px' }}
              />
            </div>
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
                    onClick={() => handleClearFile('image')}
                    className="btn btn-outline"
                    style={{ padding: '4px 8px', height: '28px', fontSize: '11px', borderColor: '#ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'center' }}
                  >
                    <XCircle size={12} /> நீக்கு (Clear)
                  </button>
                )}
                <input type="file" id="imageInput" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
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
                    onClick={() => handleClearFile('logo')}
                    className="btn btn-outline"
                    style={{ padding: '4px 8px', height: '28px', fontSize: '11px', borderColor: '#ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'center' }}
                  >
                    <XCircle size={12} /> நீக்கு (Clear)
                  </button>
                )}
                <input type="file" id="logoInput" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
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
                    onClick={() => handleClearFile('icon')}
                    className="btn btn-outline"
                    style={{ padding: '4px 8px', height: '28px', fontSize: '11px', borderColor: '#ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'center' }}
                  >
                    <XCircle size={12} /> நீக்கு (Clear)
                  </button>
                )}
                <input type="file" id="iconInput" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'icon')} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>சுருக்கமான விளக்கம் (Description)</label>
            <textarea
              name="description"
              className="form-control"
              placeholder="சமூகத்தைப் பற்றிய ஒரு சிறிய குறிப்பு..."
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
                    placeholder="சமூகத்தின் பூர்வீகம், வரலாறு, மற்றும் ஆவணங்கள்..."
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
              <Save size={16} /> {isEditing ? 'மாற்றங்களைச் சேமி (Update)' : 'சமூகத்தைச் சேர் (Save)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunityManage;
