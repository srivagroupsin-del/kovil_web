import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit, Camera, XCircle, FileText, Info as InfoIcon, Save, RefreshCw, Bookmark } from 'lucide-react';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

const INITIAL_SUB_COMMUNITIES = [
  { id: 's1', community_id: '1', name_ta: 'கொங்கு வேளாளர்', name_en: 'Kongu Vellalar', title: 'கொங்கு வேளாளர்', info: 'Kongu Gounder sub-sect', description: 'Traditional farming class', image: '', logo: '', icon: '', varalaru: 'Settlers of Kongu region.' },
  { id: 's2', community_id: '1', name_ta: 'வெட்டுவ கவுண்டர்', name_en: 'Vettuva Gounder', title: 'வெட்டுவர்', info: 'Vettuva sub-sect', description: 'Hunters and landowners', image: '', logo: '', icon: '', varalaru: 'Ancient rulers of the hills.' },
  { id: 's4', community_id: '2', name_ta: 'படையாச்சி', name_en: 'Padayachi', title: 'வன்னியர் படையாச்சி', info: 'Padayachi sub-sect', description: 'Warrior clan', image: '', logo: '', icon: '', varalaru: 'Serving royal armies historically.' }
];

const resolveImageUrl = (img) => {
  if (!img) return '';
  if (img.startsWith('data:image/') || img.startsWith('http://') || img.startsWith('https://')) {
    return img;
  }
  return `${BASE_API}/files/${img}`;
};

const SubCommunityManage = () => {
  const [communities, setCommunities] = useState([]);
  const [subCommunities, setSubCommunities] = useState(() => {
    const saved = localStorage.getItem('local_sub_communities');
    return saved ? JSON.parse(saved) : INITIAL_SUB_COMMUNITIES;
  });

  const [formData, setFormData] = useState({
    id: '',
    community_id: '',
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
      console.error("Error fetching communities:", e);
      const saved = localStorage.getItem('local_communities');
      if (saved) setCommunities(JSON.parse(saved));
    }
  };

  const fetchSubCommunities = async () => {
    try {
      const response = await fetch(BASE_API + '/sub-communities');
      const result = await response.json();
      if (response.ok && result.data && result.data.code === 200) {
        const mapped = result.data.data.map(s => ({
          id: String(s.id),
          community_id: String(s.community_id),
          name_ta: s.sub_community_name_tamil || '',
          name_en: s.sub_community_name_english || '',
          title: s.title || '',
          info: s.info || '',
          description: s.description || '',
          image: s.image_path || '',
          logo: s.logo_path || '',
          icon: s.icon_path || '',
          varalaru: s.history || ''
        }));
        setSubCommunities(mapped);
        localStorage.setItem('local_sub_communities', JSON.stringify(mapped));
      } else {
        const saved = localStorage.getItem('local_sub_communities');
        if (saved) setSubCommunities(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error fetching sub-communities:", e);
      const saved = localStorage.getItem('local_sub_communities');
      if (saved) setSubCommunities(JSON.parse(saved));
    }
  };

  useEffect(() => {
    fetchCommunities();
    fetchSubCommunities();
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
      community_id: '',
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

    const fileInput = document.getElementById('imageInput');
    if (fileInput) fileInput.value = '';
    const logoInput = document.getElementById('logoInput');
    if (logoInput) logoInput.value = '';
    const iconInput = document.getElementById('iconInput');
    if (iconInput) iconInput.value = '';
  };

  const handleEdit = (sub) => {
    setFormData(sub);
    setImagePreview(resolveImageUrl(sub.image));
    setLogoPreview(resolveImageUrl(sub.logo));
    setIconPreview(resolveImageUrl(sub.icon));
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    const confirm = await showConfirm(
      'நிச்சயமாக நீக்க வேண்டுமா?',
      'இந்த உட்பிரிவை நீக்க விரும்புகிறீர்களா? (Delete this sub-community?)'
    );
    if (confirm.isConfirmed) {
      try {
        const response = await fetch(`${BASE_API}/sub-community/delete/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          showSuccess('வெற்றி', 'உட்பிரிவு நீக்கப்பட்டது (Sub-community deleted successfully)');
          fetchSubCommunities();
          resetForm();
        } else {
          showError('பிழை', 'உட்பிரிவை நீக்க முடியவில்லை');
        }
      } catch (err) {
        console.error(err);
        showError('பிழை', 'சர்வர் தொடர்பு கொள்ள முடியவில்லை');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.community_id) {
      showWarning('தேர்வு தேவை', 'தயவுசெய்து சமூகத்தை தேர்ந்தெடுக்கவும் (Please select community)');
      return;
    }

    if (!formData.name_ta.trim() || !formData.name_en.trim()) {
      showWarning('விவரம் தேவை', 'உட்பிரிவின் பெயரை உள்ளிடவும் (Please fill sub-community name)');
      return;
    }

    const payload = {
      community_id: Number(formData.community_id),
      sub_community_name_tamil: formData.name_ta,
      sub_community_name_english: formData.name_en,
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
        const response = await fetch(`${BASE_API}/sub-community/update/${formData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ...payload, id: Number(formData.id) })
        });
        const result = await response.json();
        if (response.ok) {
          showSuccess('வெற்றி', 'உட்பிரிவு புதுப்பிக்கப்பட்டது (Sub-community updated successfully)');
          fetchSubCommunities();
        } else {
          showError('பிழை', result.message || 'உட்பிரிவை புதுப்பிக்க முடியவில்லை');
        }
      } else {
        const response = await fetch(BASE_API + '/sub-community/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (response.ok) {
          showSuccess('வெற்றி', 'புதிய உட்பிரிவு சேர்க்கப்பட்டது (New sub-community added successfully)');
          fetchSubCommunities();
        } else {
          showError('பிழை', result.message || 'உட்பிரிவைச் சேர்க்க முடியவில்லை');
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
          <h2 style={{ margin: 0, fontSize: '20px' }}>உட்பிரிவு நிர்வகித்தல் (Sub-Community Management)</h2>
        </div>
        <p style={{ fontSize: '13px' }}>சமூகத்தின் உட்பிரிவுகளின் பெயர்கள், தகவல்கள், மற்றும் வரலாற்றை நிர்வகிக்கவும்.</p>
      </div>

      <div className="card" style={{ padding: '24px', borderRadius: '16px', border: '1.5px solid #e2e8f0', background: '#fff' }}>
        {/* Selection drop-down to edit existing items */}
        <div style={{ marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <label className="form-label" style={{ fontWeight: '750', fontSize: '13.5px', color: '#4f46e5', marginBottom: '8px', display: 'block' }}>
            ஏற்கனவே உள்ள உட்பிரிவைத் தேர்ந்தெடுத்து திருத்த அல்லது நீக்க (Select to Edit/Delete)
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              className="form-control"
              value={isEditing ? formData.id : ''}
              onChange={(e) => {
                const selectedId = e.target.value;
                if (selectedId) {
                  const found = subCommunities.find(s => s.id === selectedId);
                  if (found) handleEdit(found);
                } else {
                  resetForm();
                }
              }}
              style={{ height: '42px', borderRadius: '8px', border: '1.5px solid #cbd5e1', appearance: 'auto', paddingLeft: '12px', fontSize: '13.5px', fontWeight: '500', flex: 1 }}
            >
              <option value="">-- புதிய உட்பிரிவு சேர்க்கவும் (Add New Sub-Community) --</option>
              {subCommunities.map(s => {
                const parent = communities.find(c => c.id === s.community_id);
                const parentName = parent ? ` - ${parent.name_ta}` : '';
                return (
                  <option key={s.id} value={s.id}>{s.name_ta} ({s.name_en}){parentName}</option>
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
            {isEditing ? 'உட்பிரிவு விவரங்களை மாற்றுதல் (Edit Sub-Community)' : 'புதிய உட்பிரிவு சேர்த்தல் (Add New Sub-Community)'}
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
              onChange={handleInputChange}
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
                உட்பிரிவின் பெயர் (தமிழ்) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="name_ta"
                className="form-control"
                placeholder="எ.கா. கொங்கு வேளாளர்"
                value={formData.name_ta}
                onChange={handleInputChange}
                required
                style={{ height: '40px', borderRadius: '8px', border: '1.5px solid #cbd5e1', paddingLeft: '12px', fontSize: '13px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                Sub-Community Name (English) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="name_en"
                className="form-control"
                placeholder="e.g. Kongu Vellalar"
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
                placeholder="எ.கா. கொங்கு வேளாளர் உட்பிரிவு"
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
                placeholder="எ.கா. உழுவதையே தொழிலாகக் கொண்டவர்கள்"
                value={formData.info}
                onChange={handleInputChange}
                style={{ height: '40px', borderRadius: '8px', border: '1.5px solid #cbd5e1', paddingLeft: '12px', fontSize: '13px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>சுருக்கமான விளக்கம் (Description)</label>
            <textarea
              name="description"
              className="form-control"
              placeholder="உட்பிரிவைப் பற்றிய ஒரு சிறிய குறிப்பு..."
              value={formData.description}
              onChange={handleInputChange}
              rows={2}
              style={{ borderRadius: '8px', border: '1.5px solid #cbd5e1', padding: '10px', fontSize: '13px', minHeight: '60px' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>வரலாறு (History / Varalaru)</label>
            <textarea
              name="varalaru"
              className="form-control"
              placeholder="உட்பிரிவின் பூர்வீகம், வரலாறு..."
              value={formData.varalaru}
              onChange={handleInputChange}
              rows={4}
              style={{ borderRadius: '8px', border: '1.5px solid #cbd5e1', padding: '10px', fontSize: '13px', minHeight: '100px' }}
            />
          </div>

          {/* Three Column Grid for Images */}
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '8px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>புகைப்படம் (Image - Optional)</label>
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
              <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>சின்னம் (Logo - Optional)</label>
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
              <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>ஐகான் (Icon - Optional)</label>
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
              <Save size={16} /> {isEditing ? 'மாற்றங்களைச் சேமி (Update)' : 'உட்பிரிவைச் சேர் (Save)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubCommunityManage;
