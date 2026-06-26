import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit, Camera, XCircle, FileText, Info as InfoIcon, Save, RefreshCw, Bookmark, MapPin } from 'lucide-react';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

const INITIAL_VAGAIYARAS = [
  { id: 'v1', community_id: '1', sub_community_id: '1', kula_id: 'k1', name_ta: 'முத்தையா வகைரா', name_en: 'Muthaiya Vagaiyara', sontha_uru: 'பல்லடம் (Palladam)', epo_uru: 'கோயம்புத்தூர் (Coimbatore)', title: 'முத்தையா வகைரா வம்சம்', info: 'Kongu Vellalar Vagaiyara', description: 'Traditional family line', image: '', logo: '', icon: '', varalaru: 'Historically located in Palladam region.' },
  { id: 'v2', community_id: '1', sub_community_id: '1', kula_id: 'k2', name_ta: 'சின்னசாமி வகைரா', name_en: 'Chinnasamy Vagaiyara', sontha_uru: 'திருச்செங்கோடு (Tiruchengode)', epo_uru: 'ஈரோடு (Erode)', title: 'சின்னசாமி வகைரா வம்சம்', info: 'Kongu Vellalar Vagaiyara', description: 'Traditional family line', image: '', logo: '', icon: '', varalaru: 'Historically located in Tiruchengode region.' },
  { id: 'v3', community_id: '2', sub_community_id: 's4', kula_id: 'k3', name_ta: 'அண்ணாமலை வகைரா', name_en: 'Annamalai Vagaiyara', sontha_uru: 'விருத்தாசலம் (Vriddhachalam)', epo_uru: 'கடலூர் (Cuddalore)', title: 'அண்ணாமலை வகைரா வம்சம்', info: 'Vanniyar Vagaiyara', description: 'Traditional family line', image: '', logo: '', icon: '', varalaru: 'Historically located in Vriddhachalam region.' }
];

const resolveImageUrl = (img) => {
  if (!img) return '';
  if (img.startsWith('data:image/') || img.startsWith('http://') || img.startsWith('https://')) {
    return img;
  }
  return `${BASE_API}/files/${img}`;
};

const VagaiyaraManage = () => {
  const [communities, setCommunities] = useState([]);
  const [subCommunities, setSubCommunities] = useState([]);
  const [kulams, setKulams] = useState([]);
  const [vagaiyaras, setVagaiyaras] = useState(() => {
    const saved = localStorage.getItem('local_vagaiyaras');
    return saved ? JSON.parse(saved) : INITIAL_VAGAIYARAS;
  });

  const [formData, setFormData] = useState({
    id: '',
    community_id: '',
    sub_community_id: '',
    kula_id: '',
    name_ta: '',
    name_en: '',
    sontha_uru: '',
    epo_uru: '',
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
          name_en: c.community_name_english || ''
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
          name_en: s.sub_community_name_english || ''
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
        localStorage.setItem('local_kulams', JSON.stringify(mapped));
      } else {
        const saved = localStorage.getItem('local_kulams');
        if (saved) setKulams(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error fetching kulams:", e);
      const saved = localStorage.getItem('local_kulams');
      if (saved) setKulams(JSON.parse(saved));
    }
  };

  useEffect(() => {
    fetchCommunities();
    fetchSubCommunities();
    fetchKulams();
  }, []);

  useEffect(() => {
    localStorage.setItem('local_vagaiyaras', JSON.stringify(vagaiyaras));
  }, [vagaiyaras]);

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
      sub_community_id: '',
      kula_id: '',
      name_ta: '',
      name_en: '',
      sontha_uru: '',
      epo_uru: '',
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

  const handleEdit = (vagaiyaraItem) => {
    setFormData(vagaiyaraItem);
    setImagePreview(resolveImageUrl(vagaiyaraItem.image));
    setLogoPreview(resolveImageUrl(vagaiyaraItem.logo));
    setIconPreview(resolveImageUrl(vagaiyaraItem.icon));
    setIsEditing(true);
    if (vagaiyaraItem.varalaru) {
      setShowAdditional(true);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await showConfirm(
      'நிச்சயமாக நீக்க வேண்டுமா?',
      'இந்த வகைராவை நீக்க விரும்புகிறீர்களா? (Delete this Vagaiyara?)'
    );
    if (confirm.isConfirmed) {
      setVagaiyaras(prev => prev.filter(v => v.id !== id));
      showSuccess('வெற்றி', 'வகைரா நீக்கப்பட்டது (Vagaiyara deleted successfully)');
      resetForm();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.community_id) {
      showWarning('தேர்வு தேவை', 'தயவுசெய்து சமூகத்தை தேர்ந்தெடுக்கவும் (Please select community)');
      return;
    }

    if (!formData.name_ta.trim() || !formData.name_en.trim()) {
      showWarning('விவரம் தேவை', 'வகைராவின் பெயரை உள்ளிடவும் (Please fill Vagaiyara name)');
      return;
    }

    const payload = {
      id: isEditing ? formData.id : `v_${Date.now()}`,
      community_id: formData.community_id,
      sub_community_id: formData.sub_community_id,
      kula_id: formData.kula_id,
      name_ta: formData.name_ta.trim(),
      name_en: formData.name_en.trim(),
      sontha_uru: formData.sontha_uru.trim(),
      epo_uru: formData.epo_uru.trim(),
      title: formData.title.trim(),
      info: formData.info.trim(),
      description: formData.description.trim(),
      varalaru: formData.varalaru.trim(),
      image: formData.image,
      logo: formData.logo,
      icon: formData.icon
    };

    if (isEditing) {
      setVagaiyaras(prev => prev.map(v => v.id === formData.id ? payload : v));
      showSuccess('வெற்றி', 'வகைரா புதுப்பிக்கப்பட்டது (Vagaiyara updated successfully)');
    } else {
      setVagaiyaras(prev => [...prev, payload]);
      showSuccess('வெற்றி', 'புதிய வகைரா சேர்க்கப்பட்டது (New Vagaiyara added successfully)');
    }

    resetForm();
  };

  return (
    <div className="form-card" style={{ maxWidth: '100%', margin: '0 auto', padding: '10px' }}>
      <div className="form-header" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Users size={24} color="#6366f1" />
          <h2 style={{ margin: 0, fontSize: '20px' }}>வகைரா நிர்வகித்தல் (Vagaiyara Management)</h2>
        </div>
        <p style={{ fontSize: '13px' }}>வகைரா கிளைகள், சொந்த ஊர் மற்றும் தற்போதைய இருப்பிட விவரங்களை நிர்வகிக்கவும்.</p>
      </div>

      <div className="card" style={{ padding: '24px', borderRadius: '16px', border: '1.5px solid #e2e8f0', background: '#fff' }}>
        {/* Selection drop-down to edit existing items */}
        <div style={{ marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <label className="form-label" style={{ fontWeight: '750', fontSize: '13.5px', color: '#4f46e5', marginBottom: '8px', display: 'block' }}>
            ஏற்கனவே உள்ள வகைராவைத் தேர்ந்தெடுத்து திருத்த அல்லது நீக்க (Select to Edit/Delete)
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              className="form-control"
              value={isEditing ? formData.id : ''}
              onChange={(e) => {
                const selectedId = e.target.value;
                if (selectedId) {
                  const found = vagaiyaras.find(v => v.id === selectedId);
                  if (found) handleEdit(found);
                } else {
                  resetForm();
                }
              }}
              style={{ height: '42px', borderRadius: '8px', border: '1.5px solid #cbd5e1', appearance: 'auto', paddingLeft: '12px', fontSize: '13.5px', fontWeight: '500', flex: 1 }}
            >
              <option value="">-- புதிய வகைரா சேர்க்கவும் (Add New Vagaiyara) --</option>
              {vagaiyaras.map(v => {
                const parent = communities.find(c => c.id === v.community_id);
                const parentName = parent ? ` - ${parent.name_ta}` : '';
                return (
                  <option key={v.id} value={v.id}>{v.name_ta} ({v.name_en}){parentName}</option>
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
            {isEditing ? 'வகைரா விவரங்களை மாற்றுதல் (Edit Vagaiyara)' : 'புதிய வகைரா சேர்த்தல் (Add New Vagaiyara)'}
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
                வகைராவின் பெயர் (தமிழ்) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="name_ta"
                className="form-control"
                placeholder="எ.கா. முத்தையா வகைரா"
                value={formData.name_ta}
                onChange={handleInputChange}
                required
                style={{ height: '40px', borderRadius: '8px', border: '1.5px solid #cbd5e1', paddingLeft: '12px', fontSize: '13px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>
                Vagaiyara Name (English) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                name="name_en"
                className="form-control"
                placeholder="e.g. Muthaiya Vagaiyara"
                value={formData.name_en}
                onChange={handleInputChange}
                required
                style={{ height: '40px', borderRadius: '8px', border: '1.5px solid #cbd5e1', paddingLeft: '12px', fontSize: '13px' }}
              />
            </div>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>சொந்த ஊர் (Native Place)</label>
              <input
                type="text"
                name="sontha_uru"
                className="form-control"
                placeholder="எ.கா. பல்லடம் (Palladam)"
                value={formData.sontha_uru}
                onChange={handleInputChange}
                style={{ height: '40px', borderRadius: '8px', border: '1.5px solid #cbd5e1', paddingLeft: '12px', fontSize: '13px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700', fontSize: '13px', color: '#334155' }}>இப்போ இருக்குற ஊர் (Current Place)</label>
              <input
                type="text"
                name="epo_uru"
                className="form-control"
                placeholder="எ.கா. கோயம்புத்தூர் (Coimbatore)"
                value={formData.epo_uru}
                onChange={handleInputChange}
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
                placeholder="எ.கா. முத்தையா வகைரா வம்சம்"
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
                placeholder="எ.கா. குல வரலாறு உடையவர்கள்"
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
              placeholder="வகைராவைப் பற்றிய ஒரு சிறிய குறிப்பு..."
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
                    placeholder="வகைராவின் பூர்வீகம், வரலாறு, மற்றும் கோவில்கள்..."
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
              <Save size={16} /> {isEditing ? 'மாற்றங்களைச் சேமி (Update)' : 'வகைராவைச் சேர் (Save)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VagaiyaraManage;
