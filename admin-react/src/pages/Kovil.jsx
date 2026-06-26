import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Church,
  User,
  FileText,
  Sparkles,
  History,
  Layers,
  MapPin,
  Music,
  Bookmark,
  Activity,
  Compass,
  Building,
  Save,
  ArrowRight,
  Info,
  X,
  Plus,
  Camera
} from 'lucide-react';
import Swal, { showSuccess, showError } from '../utils/swal';

const FormInput = ({ label, name, value, onChange, icon: Icon, placeholder, readOnly = false, required = false }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <div className="input-wrapper">
      {Icon && <Icon className="input-icon" size={18} />}
      <input
        type="text"
        name={name}
        id={name}
        className={`form-control ${readOnly ? 'readonly' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        required={required}
      />
    </div>
  </div>
);

const FormTextArea = ({ label, name, value, onChange, icon: Icon, placeholder, rows = 3 }) => (
  <div className="form-group" style={{ gridColumn: 'span 3' }}>
    <label className="form-label">{label}</label>
    <div className="input-wrapper" style={{ alignItems: 'flex-start' }}>
      {Icon && <Icon className="input-icon" size={18} style={{ marginTop: '14px' }} />}
      <textarea
        name={name}
        id={name}
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        style={{ paddingLeft: '42px' }}
      />
    </div>
  </div>
);

const FormSelect = ({ label, name, value, onChange, icon: Icon, options }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <div className="input-wrapper">
      {Icon && <Icon className="input-icon" size={18} />}
      <select
        name={name}
        id={name}
        className="form-control"
        value={value}
        onChange={onChange}
        style={{ paddingLeft: '42px', appearance: 'auto' }}
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  </div>
);

const DynamicInputList = ({ label, name, values, onChange, icon: Icon, placeholder }) => {
  const handleAdd = () => {
    onChange(name, [...values, '']);
  };

  const handleRemove = (index) => {
    const updated = values.filter((_, i) => i !== index);
    onChange(name, updated.length > 0 ? updated : ['']);
  };

  const handleChange = (index, val) => {
    const updated = [...values];
    updated[index] = val;
    onChange(name, updated);
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {values.map((val, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="input-wrapper" style={{ flex: 1, margin: 0 }}>
              {Icon && <Icon className="input-icon" size={18} />}
              <input
                type="text"
                className="form-control"
                placeholder={placeholder}
                value={val}
                onChange={(e) => handleChange(idx, e.target.value)}
                style={Icon ? {} : { paddingLeft: '16px' }}
              />
            </div>
            {values.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                style={{
                  padding: '8px',
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  borderRadius: '12px',
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '42px',
                  width: '42px',
                  minWidth: '42px'
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAdd}
          className="btn btn-outline"
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            width: 'fit-content',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '2px',
            borderColor: '#6366f1',
            color: '#6366f1',
            background: 'transparent',
            borderRadius: '12px'
          }}
        >
          <Plus size={14} /> Add More (மேலும் சேர்க்க)
        </button>
      </div>
    </div>
  );
};



const getDeityPhotoUrl = (val, sectors = []) => {
  if (val.previewUrl) return val.previewUrl;
  if (val.photo) {
    if (val.photo.startsWith('http://') || val.photo.startsWith('https://')) return val.photo;
    if (val.photo.startsWith('sectors/')) return `https://srivagroups.in/uploads/${val.photo}`;
    return `${BASE_API}/files/${val.photo}`;
  }
  if (sectors && sectors.length > 0 && val.deivam) {
    const selectedSector = sectors.find(s => s.sector_name === val.deivam);
    if (selectedSector && selectedSector.image) {
      if (selectedSector.image.startsWith('http')) return selectedSector.image;
      return `https://srivagroups.in/uploads/${selectedSector.image}`;
    }
  }
  return BASE_API + '/files/default_god.svg';
};

const DynamicDeityList = ({ label, name, values, onChange }) => {
  const [sectors, setSectors] = useState([]);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const res = await fetch(BASE_API + "/outsideapis/deity-sectors");
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : (json.data?.data || json || []);
        setSectors(list);
      } catch (err) {
        console.error("Error fetching sectors:", err);
      }
    };
    fetchSectors();
  }, []);

  const deivamOptions = sectors.length > 0
    ? sectors.map(s => s.sector_name)
    : [
      'விநாயகர் (Vinayagar)',
      'முருகன் (Murugan)',
      'சிவன் (Shivan)',
      'பெருமாள் / விஷ்ணு (Perumal / Vishnu)',
      'அம்மன் (Amman)',
      'துர்க்கை (Durga)',
      'தட்சிணாமூர்த்தி (Dakshinamurthy)',
      'பைரவர் (Bhairavar)',
      'சண்டிகேஸ்வரர் (Chandikeswarar)',
      'நவகிரகங்கள் (Navagrahangal)',
      'ஆஞ்சநேயர் (Anjaneyar)',
      'கருப்பசாமி (Karuppasamy)',
      'அனுமார் (Anumar)',
      'சரஸ்வதி (Saraswati)',
      'லட்சுமி (Lakshmi)',
      'மற்றவை (Other)'
    ];

  const thesaiOptions = [
    'கிழக்கு (East)',
    'மேற்கு (West)',
    'வடக்கு (North)',
    'தெற்கு (South)',
    'வடகிழக்கு (Northeast)',
    'வடமேற்கு (Northwest)',
    'தென்கிழக்கு (Southeast)',
    'தென்மேற்கு (Southwest)'
  ];

  const handleAdd = () => {
    onChange(name, [...values, { deivam: '', thesai: '', photo: '', file: null, previewUrl: '' }]);
  };

  const handleRemove = (index) => {
    const updated = values.filter((_, i) => i !== index);
    onChange(name, updated.length > 0 ? updated : [{ deivam: '', thesai: '', photo: '', file: null, previewUrl: '' }]);
  };

  const handleChange = (index, field, val) => {
    const updated = [...values];
    if (field === 'deivam') {
      updated[index] = {
        ...updated[index],
        deivam: val,
        photo: '', // Do not store external image in DB unless explicitly uploaded
        file: null,
        previewUrl: ''
      };
    } else {
      updated[index] = { ...updated[index], [field]: val };
    }
    onChange(name, updated);
  };

  return (
    <div className="form-group" style={{ gridColumn: 'span 3' }}>
      <label className="form-label" style={{ fontWeight: 600, color: '#1e293b' }}>{label}</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
        {values.map((val, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px', color: '#64748b' }}>தெய்வம் (Deity)</label>
                <select
                  className="form-control"
                  value={val.deivam}
                  onChange={(e) => handleChange(idx, 'deivam', e.target.value)}
                  style={{ appearance: 'auto', paddingLeft: '12px', height: '42px' }}
                >
                  <option value="">தெய்வத்தை தேர்ந்தெடுக்கவும் (Select Deity)</option>
                  {deivamOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px', color: '#64748b' }}>திசை (Direction)</label>
                <select
                  className="form-control"
                  value={val.thesai}
                  onChange={(e) => handleChange(idx, 'thesai', e.target.value)}
                  style={{ appearance: 'auto', paddingLeft: '12px', height: '42px' }}
                >
                  <option value="">திசையை தேர்ந்தெடுக்கவும் (Select Direction)</option>
                  {thesaiOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px', color: '#64748b' }}>புகைப்படம் (Photo)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {val.deivam && (
                    <div style={{ position: 'relative', width: '42px', height: '42px', flexShrink: 0 }}>
                      <img
                        src={getDeityPhotoUrl(val, sectors)}
                        alt="Deity preview"
                        onError={(e) => {
                          e.target.src = BASE_API + '/files/default_god.svg';
                          e.target.onerror = null;
                        }}
                        onClick={() => {
                          const imageUrl = getDeityPhotoUrl(val, sectors);
                          Swal.fire({
                            title: val.deivam,
                            html: `
                              <div style="display: flex; justify-content: center; align-items: center; padding: 10px; background: #fafafa; border-radius: 12px; border: 1px solid #e2e8f0;">
                                <img 
                                  src="${imageUrl}" 
                                  alt="${val.deivam}" 
                                  style="max-width: 100%; max-height: 380px; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);" 
                                  onerror="this.src='${BASE_API}/files/default_god.svg'; this.onerror=null;"
                                />
                              </div>
                            `,
                            showConfirmButton: false,
                            showCloseButton: true,
                            width: '450px'
                          });
                        }}
                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                        title="Click to view full image"
                      />
                      {(val.previewUrl || (val.photo && !val.photo.startsWith('default_') && !val.photo.startsWith('sectors/'))) && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...values];
                            updated[idx] = { ...updated[idx], file: null, previewUrl: '', photo: '' };
                            onChange(name, updated);
                          }}
                          style={{
                            position: 'absolute',
                            top: '-4px',
                            right: '-4px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '14px',
                            height: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '8px'
                          }}
                          title="Remove custom photo"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )}

                  {/* Choose photo option */}
                  {!(val.previewUrl || (val.photo && !val.photo.startsWith('default_') && !val.photo.startsWith('sectors/'))) && (
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        background: '#f1f5f9',
                        border: '1px dashed #cbd5e1',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        height: '42px',
                        width: '100%',
                        fontSize: '12px',
                        color: '#64748b',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Camera size={16} />
                      <span style={{ whiteSpace: 'nowrap' }}>Choose Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const updated = [...values];
                              updated[idx] = { ...updated[idx], file: file, previewUrl: ev.target.result };
                              onChange(name, updated);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {values.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                style={{
                  padding: '8px',
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  borderRadius: '12px',
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '42px',
                  width: '42px',
                  minWidth: '42px',
                  marginTop: '18px'
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAdd}
          className="btn btn-outline"
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            width: 'fit-content',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '2px',
            borderColor: '#6366f1',
            color: '#6366f1',
            background: 'transparent',
            borderRadius: '12px'
          }}
        >
          <Plus size={14} /> Add Deity (மேலும் தெய்வம் சேர்க்க)
        </button>
      </div>
    </div>
  );
};

const Kovil = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const basicId = searchParams.get('basicId') || '1';
  const [templeInfo, setTempleInfo] = useState({
    templeName: searchParams.get('templeName') || '',
    mulavarName: searchParams.get('mulavarName') || ''
  });
  const [existingDetailId, setExistingDetailId] = useState(null);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    otherNames: [''],
    specialFeatures: '',
    characteristics: '',
    heritage: '',
    miracles: '',
    templeStructure: '',
    sanctumStructure: '',
    history: '',
    status: 'ஒன்று',
    worshipType: '',
    songPlace: false,
    songNote: '',
    padalPadiyavar: '',
    enthaPathi: '',
    mandapams: [''],
    theivankal: [{ deivam: '', thesai: '', photo: '', file: null, previewUrl: '' }]
  });

  useEffect(() => {
    const loadTempleData = async () => {
      try {
        // 1. Fetch basic details to display name/mulavar
        const basicRes = await fetch(`${BASE_API}/temple_basic_detail/${basicId}`);
        if (basicRes.ok) {
          const basicJson = await basicRes.json();
          const basicData = basicJson.data?.data || basicJson.data || basicJson;
          setTempleInfo({
            templeName: basicData.temple_name || '',
            mulavarName: basicData.mulavar_name || ''
          });
        }

        // 2. Fetch existing extra details
        const detailRes = await fetch(`${BASE_API}/temple_detail/basic/${basicId}`);
        if (detailRes.ok) {
          const detailJson = await detailRes.json();
          const detailDataList = detailJson.data?.data || detailJson.data || detailJson || [];
          if (detailDataList.length > 0) {
            const detail = detailDataList[0];
            setExistingDetailId(detail.id);

            // Map rajagopuram direction checkboxes
            if (detail.rajagopuram_direction) {
              const dirs = detail.rajagopuram_direction.split(',').map(s => s.trim());
              setDirections({
                'கிழக்கு': dirs.includes('கிழக்கு'),
                'மேற்கு': dirs.includes('மேற்கு'),
                'வடக்கு': dirs.includes('வடக்கு'),
                'தெற்கு': dirs.includes('தெற்கு')
              });
            }

            setFormData({
              otherNames: detail.other_names ? detail.other_names.split(',').map(s => s.trim()) : [''],
              specialFeatures: detail.special_features || '',
              characteristics: detail.characteristics || '',
              heritage: detail.heritage || '',
              miracles: detail.miracles || '',
              templeStructure: detail.temple_structure || '',
              sanctumStructure: detail.sanctum_structure || '',
              history: detail.history || '',
              status: detail.status || 'ஒன்று',
              worshipType: detail.worship_type || '',
              songPlace: detail.song_place === 1 || detail.song_place === true,
              songNote: detail.song_note || '',
              padalPadiyavar: detail.padal_padiyavar || '',
              enthaPathi: detail.entha_pathi || '',
              mandapams: detail.mandapams ? detail.mandapams.split(',').map(s => s.trim()) : [''],
              theivankal: detail.theivankal && detail.theivankal.length > 0
                ? detail.theivankal.map(t => ({ deivam: t.deivam, thesai: t.thesai, photo: t.photo || '', file: null, previewUrl: '' }))
                : [{ deivam: '', thesai: '', photo: '', file: null, previewUrl: '' }]
            });
          }
        }
      } catch (err) {
        console.error("Error loading temple details:", err);
      }
    };
    loadTempleData();
  }, [basicId]);

  const [showDirections, setShowDirections] = useState(false);
  const [directions, setDirections] = useState({
    'கிழக்கு': false,
    'மேற்கு': false,
    'வடக்கு': false,
    'தெற்கு': false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (name, newValues) => {
    setFormData(prev => ({
      ...prev,
      [name]: newValues
    }));
  };

  const handleDirectionChange = (dir) => {
    setDirections(prev => ({
      ...prev,
      [dir]: !prev[dir]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const selectedDirections = Object.keys(directions).filter(k => directions[k]).join(', ');

    const validDeities = (formData.theivankal || [])
      .filter(t => t.deivam && t.thesai)
      .map(t => ({
        deivam: t.deivam,
        thesai: t.thesai,
        photo: t.photo || ''
      }));

    const formDataObj = new FormData();
    formDataObj.append('temple_basic_id', parseInt(basicId, 10) || 0);
    formDataObj.append('active', true);
    formDataObj.append('other_names', Array.isArray(formData.otherNames) ? formData.otherNames.filter(s => s.trim() !== '').join(', ') : formData.otherNames);
    formDataObj.append('special_features', formData.specialFeatures || '');
    formDataObj.append('characteristics', formData.characteristics || '');
    formDataObj.append('heritage', formData.heritage || '');
    formDataObj.append('miracles', formData.miracles || '');
    formDataObj.append('temple_structure', formData.templeStructure || '');
    formDataObj.append('sanctum_structure', formData.sanctumStructure || '');
    formDataObj.append('history', formData.history || '');
    formDataObj.append('rajagopuram_direction', selectedDirections);
    formDataObj.append('status', formData.status || '');
    formDataObj.append('worship_type', formData.worshipType || '');
    formDataObj.append('song_place', formData.songPlace ? 'true' : 'false');
    formDataObj.append('song_note', formData.songNote || '');
    formDataObj.append('padal_padiyavar', formData.padalPadiyavar || '');
    formDataObj.append('entha_pathi', formData.enthaPathi || '');
    formDataObj.append('mandapams', Array.isArray(formData.mandapams) ? formData.mandapams.filter(s => s.trim() !== '').join(', ') : formData.mandapams);
    formDataObj.append('theivankal', JSON.stringify(validDeities));

    (formData.theivankal || []).forEach((t, idx) => {
      if (t.deivam && t.thesai && t.file) {
        formDataObj.append(`theivankal_photo_${idx}`, t.file);
      }
    });

    if (existingDetailId) {
      formDataObj.append('id', existingDetailId);
    }

    try {
      const url = existingDetailId
        ? `${BASE_API}/temple_detail/update/${existingDetailId}`
        : BASE_API + '/temple_detail/create';
      const method = existingDetailId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        body: formDataObj
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      showSuccess('வெற்றிகரமாக சேமிக்கப்பட்டது', 'Temple details saved successfully');
      navigate('/temple-list');
    } catch (err) {
      showError('சேமிப்பதில் பிழை ஏற்பட்டது', 'Temple save failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <div className="form-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Building size={28} color="#6366f1" />
          <h2 style={{ margin: 0 }}>கோவில் கூடுதல் விவரங்கள் (Temple Extra Details)</h2>
        </div>
        <p>கோவிலின் வரலாறு, அமைப்பு மற்றும் சிறப்பம்சங்களை இங்கே பதிவிடவும்.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <FormInput
              label="மூலவர் பெயர் (Mulavar Name)"
              name="mulavarDisplay"
              value={templeInfo.mulavarName}
              icon={User}
              readOnly
            />

            <FormInput
              label="கோவில் பெயர் (Temple Name)"
              name="templeDisplay"
              value={templeInfo.templeName}
              icon={Church}
              readOnly
            />

            <FormInput
              label="தொன்மை (Heritage/Age)"
              name="heritage"
              value={formData.heritage}
              onChange={handleChange}
              icon={History}
              placeholder="எ.கா: 1000 வருடங்கள்"
            />

            <FormInput
              label="கோயில் அமைப்பு (Temple Structure)"
              name="templeStructure"
              value={formData.templeStructure}
              onChange={handleChange}
              icon={Building}
              placeholder="கோவில் அமைப்பை விளக்கவும்"
            />

            <FormInput
              label="திருக்கோவில் அமைப்பு (Sanctum Structure)"
              name="sanctumStructure"
              value={formData.sanctumStructure}
              onChange={handleChange}
              icon={Layers}
              placeholder="கருவறை அமைப்பு"
            />

            <FormSelect
              label="நிலை (Number of Tiers)"
              name="status"
              value={formData.status}
              onChange={handleChange}
              icon={Activity}
              options={['ஒன்று', 'மூன்று', 'ஐந்து', 'ஏழு', 'ஒன்பது', 'பதினொன்று']}
            />

            <div className="form-group">
              <label className="form-label">வழிபாட்டு வகை (Worship Type)</label>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                {['குலத்தவர் மட்டும்', 'குலத்தவர் + பொது', 'பொது மட்டும்'].map(type => (
                  <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="worshipType"
                      value={type}
                      checked={formData.worshipType === type}
                      onChange={handleChange}
                      className="form-check-input"
                    /> {type}
                  </label>
                ))}
              </div>
            </div>

            <DynamicInputList
              label="மண்டபங்கள் (Mandapams)"
              name="mandapams"
              values={formData.mandapams}
              onChange={handleArrayChange}
              icon={Building}
              placeholder="மண்டபங்களின் பெயர்கள்"
            />

            <DynamicDeityList
              label="தெய்வங்கள் மற்றும் திசைகள் (Deities and Directions)"
              name="theivankal"
              values={formData.theivankal || [{ deivam: '', thesai: '' }]}
              onChange={handleArrayChange}
            />

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <div style={{
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="checkbox"
                    checked={showDirections}
                    onChange={(e) => setShowDirections(e.target.checked)}
                    id="showDir"
                    className="form-check-input"
                  />
                  <label htmlFor="showDir" style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>
                    <Compass size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                    இராஜகோபுரம் திசை (Rajagopuram Direction)
                  </label>
                </div>

                {showDirections && (
                  <div style={{ display: 'flex', gap: '20px', paddingLeft: '26px' }}>
                    {['கிழக்கு', 'மேற்கு', 'வடக்கு', 'தெற்கு'].map(dir => (
                      <label key={dir} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={directions[dir]}
                          onChange={() => handleDirectionChange(dir)}
                        />
                        {dir}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 3' }}>
              <DynamicInputList
                label="தல வேறு பெயர்கள் (Other Names of the Place)"
                name="otherNames"
                values={formData.otherNames}
                onChange={handleArrayChange}
                icon={Bookmark}
                placeholder="தலத்திற்கு வழங்கும் வேறு பெயர்கள்..."
              />
            </div>

            <FormTextArea
              label="தல சிறப்பு (Special Features of the Place)"
              name="specialFeatures"
              value={formData.specialFeatures}
              onChange={handleChange}
              icon={Sparkles}
              placeholder="தலத்தின் முக்கிய சிறப்புகள்..."
              rows={2}
            />

            <FormTextArea
              label="சிறப்பம்சம் (Unique Characteristics)"
              name="characteristics"
              value={formData.characteristics}
              onChange={handleChange}
              icon={Info}
              placeholder="கோவிலின் தனித்துவமான சிறப்பம்சங்கள்..."
              rows={2}
            />

            <FormTextArea
              label="தல நடந்த அற்புதங்கள் (Miracles Happened)"
              name="miracles"
              value={formData.miracles}
              onChange={handleChange}
              icon={Activity}
              placeholder="தலத்தில் நடந்த முக்கிய அற்புதங்கள்..."
              rows={2}
            />

            <FormTextArea
              label="தல வரலாறு (History of the Place)"
              name="history"
              value={formData.history}
              onChange={handleChange}
              icon={History}
              placeholder="தலத்தின் முழுமையான வரலாறு..."
              rows={4}
            />

            <div className="form-group">
              <div style={{
                background: formData.songPlace ? '#ecfdf5' : '#f8fafc',
                padding: '16px',
                borderRadius: '12px',
                border: formData.songPlace ? '1px solid #10b981' : '1px solid #e2e8f0',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}>
                <input
                  type="checkbox"
                  name="songPlace"
                  checked={formData.songPlace}
                  onChange={handleChange}
                  id="songPlace"
                  className="form-check-input"
                />
                <label htmlFor="songPlace" style={{ fontWeight: 600, fontSize: '14px', color: formData.songPlace ? '#047857' : '#1e293b', marginLeft: '10px' }}>
                  <Music size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                  பாடல் பெற்ற ஸ்தலமா (Is song place?)
                </label>
              </div>
            </div>

            <FormInput
              label="பாடல் பாடியவர் (Song Sung By)"
              name="padalPadiyavar"
              value={formData.padalPadiyavar}
              onChange={handleChange}
              icon={User}
              placeholder="பாடல் பாடியவர் பெயர்..."
            />

            <FormInput
              label="எந்தப் பதி (Which Pathi)"
              name="enthaPathi"
              value={formData.enthaPathi}
              onChange={handleChange}
              icon={MapPin}
              placeholder="எந்தப் பதி / பகுதி..."
            />

            <FormTextArea
              label="பாடல் குறிப்பு (Song Note)"
              name="songNote"
              value={formData.songNote}
              onChange={handleChange}
              icon={Music}
              placeholder="தேவார, திருவாசக பாடல்கள் பற்றிய குறிப்புகள்..."
              rows={2}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Processing...' : (
                <>
                  Save Temple Details <Save size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Kovil;
