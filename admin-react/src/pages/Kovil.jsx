import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
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
  Camera,
  Users
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

const FormSelectObj = ({ label, name, value, onChange, icon: Icon, options, placeholder, disabled = false }) => (
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
        disabled={disabled}
        style={{ paddingLeft: '42px', appearance: 'auto', background: disabled ? '#f8fafc' : '#fff' }}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => <option key={opt.id} value={opt.id}>{opt.name_ta} ({opt.name_en})</option>)}
      </select>
    </div>
  </div>
);

const GENERATIONS = [
  { value: '1', label: '1-ஆம் தலைமுறை (1st Generation)' },
  { value: '2', label: '2-ஆம் தலைமுறை (2nd Generation)' },
  { value: '3', label: '3-ஆம் தலைமுறை (3rd Generation)' },
  { value: '4', label: '4-ஆம் தலைமுறை (4th Generation)' },
  { value: '5', label: '5-ஆம் தலைமுறை (5th Generation)' },
  { value: '6', label: '6-ஆம் தலைமுறை (6th Generation)' },
  { value: '7', label: '7-ஆம் தலைமுறை (7th Generation)' },
  { value: '8', label: '8-ஆம் தலைமுறை (8th Generation)' },
  { value: '9', label: '9-ஆம் தலைமுறை (9th Generation)' },
  { value: '10', label: '10-ஆம் தலைமுறை + (10th Generation+)' }
];

const getKulaDeivamImageUrl = (kd) => {
  if (!kd) return BASE_API + '/files/default_god.svg';
  if (kd.image) {
    return `${BASE_API}/files/${kd.image}`;
  }
  const name = (kd.name_en || '').toLowerCase();
  const nameTa = kd.name_ta || '';

  if (name.includes('vinayagar') || nameTa.includes('விநாயகர்')) return BASE_API + '/files/default_vinayagar.svg';
  if (name.includes('murugan') || nameTa.includes('முருகன்')) return BASE_API + '/files/default_murugan.svg';
  if (name.includes('mariamman') || name.includes('amman') || name.includes('parameswari') || name.includes('kali') || name.includes('muthar') || nameTa.includes('அம்மன்') || nameTa.includes('பரமேஸ்வரி') || nameTa.includes('மாரி') || nameTa.includes('காளி') || nameTa.includes('முள்ளார்')) return BASE_API + '/files/default_amman.svg';
  if (name.includes('durga') || nameTa.includes('துர்க்கை')) return BASE_API + '/files/default_durga.svg';
  if (name.includes('karuppasamy') || name.includes('karuppan') || nameTa.includes('கருப்பசாமி') || nameTa.includes('கருப்பண்ணசுவாமி')) return BASE_API + '/files/default_karuppasamy.svg';
  if (name.includes('shivan') || name.includes('siva') || nameTa.includes('சிவன்')) return BASE_API + '/files/default_shivan.svg';
  if (name.includes('perumal') || name.includes('vishnu') || nameTa.includes('பெருமாள்')) return BASE_API + '/files/default_perumal.svg';

  return BASE_API + '/files/default_god.svg';
};

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
  const [activeStep, setActiveStep] = useState(1);

  const [communities, setCommunities] = useState([]);
  const [subCommunities, setSubCommunities] = useState([]);
  const [kulams, setKulams] = useState([]);
  const [kulaDeivams, setKulaDeivams] = useState([]);
  const [vagaiyaras, setVagaiyaras] = useState([]);
  const [wifeKulaDeivam, setWifeKulaDeivam] = useState('');

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
    theivankal: [{ deivam: '', thesai: '', photo: '', file: null, previewUrl: '' }],
    community_id: '',
    sub_community_id: '',
    kula_id: '',
    kula_deivam_id: '',
    vagaiyara_id: '',
    tharpothaiya_vagaiyara: '',
    generation_no: '',
    marital_status: 'unmarried',
    spouse_name: '',
    spouse_kula_deivam_id: ''
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const resC = await fetch(BASE_API + '/communities');
        const dataC = await resC.json();
        if (resC.ok && dataC.data && dataC.data.code === 200) {
          setCommunities(dataC.data.data.map(c => ({
            id: String(c.id),
            name_ta: c.community_name_tamil || '',
            name_en: c.community_name_english || ''
          })));
        }
      } catch (e) { console.error(e); }

      try {
        const resSC = await fetch(BASE_API + '/sub-communities');
        const dataSC = await resSC.json();
        if (resSC.ok && dataSC.data && dataSC.data.code === 200) {
          setSubCommunities(dataSC.data.data.map(s => ({
            id: String(s.id),
            community_id: String(s.community_id),
            name_ta: s.sub_community_name_tamil || '',
            name_en: s.sub_community_name_english || ''
          })));
        }
      } catch (e) { console.error(e); }

      try {
        const resK = await fetch(BASE_API + '/kulas');
        const dataK = await resK.json();
        if (resK.ok && dataK.data && dataK.data.code === 200) {
          setKulams(dataK.data.data.map(k => ({
            id: String(k.id),
            community_id: String(k.community_id),
            name_ta: k.kula_name_tamil || '',
            name_en: k.kula_name_english || ''
          })));
        }
      } catch (e) { console.error(e); }

      try {
        const resKD = await fetch(BASE_API + '/kula-deivams');
        const dataKD = await resKD.json();
        if (resKD.ok && dataKD.data && dataKD.data.code === 200) {
          setKulaDeivams(dataKD.data.data.map(kd => ({
            id: String(kd.id),
            community_id: String(kd.community_id),
            sub_community_id: String(kd.sub_community_id),
            kula_id: String(kd.kula_id),
            name_ta: kd.deity_name_tamil || '',
            name_en: kd.deity_name_english || '',
            image: kd.image_path || ''
          })));
        }
      } catch (e) { console.error(e); }

      try {
        const resV = await fetch(BASE_API + '/vagaiyaras');
        const dataV = await resV.json();
        if (resV.ok && dataV.data && dataV.data.code === 200) {
          setVagaiyaras(dataV.data.data.map(v => ({
            id: String(v.id),
            community_id: String(v.community_id),
            sub_community_id: String(v.sub_community_id),
            kula_id: String(v.kula_id),
            name_ta: v.vagaiyara_name_tamil || '',
            name_en: v.vagaiyara_name_english || '',
            sontha_uru: v.native_place || '',
            epo_uru: v.current_place || ''
          })));
        }
      } catch (e) { console.error(e); }
    };

    fetchOptions();
  }, []);

  useEffect(() => {
    if (formData.spouse_kula_deivam_id && kulaDeivams.length > 0) {
      const found = kulaDeivams.find(kd => String(kd.id) === String(formData.spouse_kula_deivam_id));
      if (found) {
        setWifeKulaDeivam(`${found.name_ta} (${found.name_en})`);
      }
    }
  }, [formData.spouse_kula_deivam_id, kulaDeivams]);

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
                : [{ deivam: '', thesai: '', photo: '', file: null, previewUrl: '' }],
              community_id: detail.community_id !== null ? String(detail.community_id) : '',
              sub_community_id: detail.sub_community_id !== null ? String(detail.sub_community_id) : '',
              kula_id: detail.kula_id !== null ? String(detail.kula_id) : '',
              kula_deivam_id: detail.kula_deivam_id !== null ? String(detail.kula_deivam_id) : '',
              vagaiyara_id: detail.vagaiyara_id !== null ? String(detail.vagaiyara_id) : '',
              tharpothaiya_vagaiyara: detail.tharpothaiya_vagaiyara || '',
              generation_no: detail.generation_no !== null ? String(detail.generation_no) : '',
              marital_status: detail.marital_status || 'unmarried',
              spouse_name: detail.spouse_name || '',
              spouse_kula_deivam_id: detail.spouse_kula_deivam_id !== null ? String(detail.spouse_kula_deivam_id) : ''
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

    formDataObj.append('community_id', formData.community_id || '');
    formDataObj.append('sub_community_id', formData.sub_community_id || '');
    formDataObj.append('kula_id', formData.kula_id || '');
    formDataObj.append('kula_deivam_id', formData.kula_deivam_id || '');
    formDataObj.append('vagaiyara_id', formData.vagaiyara_id || '');
    formDataObj.append('tharpothaiya_vagaiyara', formData.tharpothaiya_vagaiyara || '');
    formDataObj.append('generation_no', formData.generation_no || '');
    formDataObj.append('marital_status', formData.marital_status || 'unmarried');
    formDataObj.append('spouse_name', formData.marital_status === 'married' ? formData.spouse_name : '');
    formDataObj.append('spouse_kula_deivam_id', formData.marital_status === 'married' ? formData.spouse_kula_deivam_id : '');

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

  const availableSubCommunities = subCommunities.filter(
    sub => String(sub.community_id) === String(formData.community_id)
  );

  const availableKulams = kulams.filter(
    k => String(k.community_id) === String(formData.community_id)
  );

  const availableKulaDeivams = kulaDeivams.filter(kd => {
    const matchComm = String(kd.community_id) === String(formData.community_id);
    const matchSub = !formData.sub_community_id || String(kd.sub_community_id) === String(formData.sub_community_id);
    const matchKula = !formData.kula_id || String(kd.kula_id) === String(formData.kula_id);
    return matchComm && matchSub && matchKula;
  });

  const availableVagaiyaras = vagaiyaras.filter(v => {
    const matchComm = String(v.community_id) === String(formData.community_id);
    const matchSub = !formData.sub_community_id || String(v.sub_community_id) === String(formData.sub_community_id);
    const matchKula = !formData.kula_id || String(v.kula_id) === String(formData.kula_id);
    return matchComm && matchSub && matchKula;
  });

  const STEPS = [
    { number: 1, title: 'அடிப்படை விவரங்கள்', subtitle: 'Basic Details' },
    { number: 2, title: 'தெய்வங்கள்', subtitle: 'Deities' },
    { number: 3, title: 'வரலாறு & பாடல்கள்', subtitle: 'History & Songs' },
    { number: 4, title: 'சமூகம் & குலதெய்வம்', subtitle: 'Community & Deity' }
  ];

  return (
    <div className="form-card">
      <div className="form-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Building size={28} color="#6366f1" />
          <h2 style={{ margin: 0 }}>கோவில் கூடுதல் விவரங்கள் (Temple Extra Details)</h2>
        </div>
        <p>கோவிலின் வரலாறு, அமைப்பு மற்றும் சிறப்பம்சங்களை இங்கே பதிவிடவும்.</p>
      </div>

      {/* Step Indicators */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {STEPS.map(step => {
          const isActive = activeStep === step.number;
          const isCompleted = activeStep > step.number;
          return (
            <div
              key={step.number}
              onClick={() => setActiveStep(step.number)}
              style={{
                flex: 1,
                minWidth: '150px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: `1.5px solid ${isActive ? '#6366f1' : '#e2e8f0'}`,
                background: isActive ? '#f5f3ff' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.08)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: isActive ? '#6366f1' : isCompleted ? '#10b981' : '#cbd5e1',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  {isCompleted ? '✓' : step.number}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: isActive ? '#4f46e5' : '#1e293b' }}>{step.title}</span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{step.subtitle}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>

          {activeStep === 1 && (
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
            </div>
          )}

          {activeStep === 2 && (
            <div className="form-grid">
              <DynamicDeityList
                label="தெய்வங்கள் மற்றும் திசைகள் (Deities and Directions)"
                name="theivankal"
                values={formData.theivankal || [{ deivam: '', thesai: '' }]}
                onChange={handleArrayChange}
              />
            </div>
          )}

          {activeStep === 3 && (
            <div className="form-grid">
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
          )}

          {activeStep === 4 && (
            <div className="form-grid">
              {/* Community select section */}
              <div className="form-group" style={{ gridColumn: 'span 3', borderBottom: '2px solid #e2e8f0', marginBottom: '10px', paddingBottom: '10px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={22} color="#6366f1" />
                  சமூகம் மற்றும் குலதெய்வம் (Community & Deity Details)
                </h3>
              </div>

              <FormSelectObj
                label="சமூகம் (Select Community) *"
                name="community_id"
                value={formData.community_id}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    community_id: val,
                    sub_community_id: '',
                    kula_id: '',
                    kula_deivam_id: '',
                    vagaiyara_id: '',
                    tharpothaiya_vagaiyara: ''
                  }));
                }}
                icon={Users}
                options={communities}
                placeholder="-- சமூகம் தேர்ந்தெடுக்கவும் --"
              />

              <FormSelectObj
                label="உட்பிரிவு (Sub-Community)"
                name="sub_community_id"
                value={formData.sub_community_id}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    sub_community_id: val,
                    kula_deivam_id: ''
                  }));
                }}
                icon={Layers}
                options={availableSubCommunities}
                placeholder="-- உட்பிரிவு தேர்ந்தெடுக்கவும் --"
                disabled={!formData.community_id}
              />

              <FormSelectObj
                label="குலம் (Kulam)"
                name="kula_id"
                value={formData.kula_id}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    kula_id: val,
                    kula_deivam_id: ''
                  }));
                }}
                icon={Bookmark}
                options={availableKulams}
                placeholder="-- குலம் தேர்ந்தெடுக்கவும் --"
                disabled={!formData.community_id}
              />

              {/* Deity List selection section */}
              <div className="form-group" style={{ gridColumn: 'span 3', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ fontWeight: '750', fontSize: '13.5px', color: '#1e293b', margin: 0, display: 'block' }}>
                    குல தெய்வம் பட்டியல் (Kula Deivam List) *
                  </label>
                  {formData.kula_id && (
                    <Link
                      to="/kullam_people"
                      className="btn btn-outline"
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        borderColor: '#6366f1',
                        color: '#6366f1',
                        background: 'transparent',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        height: '32px',
                        textDecoration: 'none'
                      }}
                    >
                      <Plus size={14} /> குல மக்கள் சேர்க்க (Add Kula People)
                    </Link>
                  )}
                </div>
                <p style={{ margin: '0 0 14px 0', fontSize: '11px', color: '#64748b' }}>தங்கள் உட்பிரிவிற்குரிய குல தெய்வத்தை தேர்வு செய்யவும்.</p>

                {!formData.kula_id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '24px', background: '#fff', border: '1.5px dashed #cbd5e1', borderRadius: '10px', color: '#64748b', fontSize: '12.5px', justifyContent: 'center' }}>
                    குலம் தேர்ந்தெடுத்தவுடன் குலதெய்வம் பட்டியல் காட்டப்படும். (Please select Kulam first)
                  </div>
                ) : availableKulaDeivams.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '24px', background: '#fff', border: '1.5px dashed #cbd5e1', borderRadius: '10px', color: '#64748b', fontSize: '12.5px', textAlign: 'center' }}>
                    <span>தற்போது குல தெய்வங்கள் எதுவும் இல்லை.</span>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                    {availableKulaDeivams.map(kd => {
                      const isSelected = String(kd.id) === String(formData.kula_deivam_id);
                      return (
                        <div
                          key={kd.id}
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              kula_deivam_id: isSelected ? '' : kd.id
                            }));
                          }}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '12px',
                            border: `2px solid ${isSelected ? '#4f46e5' : '#e2e8f0'}`,
                            background: isSelected ? '#eef2ff' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.2s ease',
                            boxShadow: isSelected ? '0 4px 12px rgba(79, 70, 229, 0.12)' : '0 2px 4px rgba(0,0,0,0.02)'
                          }}
                        >
                          <img
                            src={getKulaDeivamImageUrl(kd)}
                            alt={kd.name_en}
                            onError={(e) => {
                              e.target.src = BASE_API + '/files/default_god.svg';
                              e.target.onerror = null;
                            }}
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                              border: '1.5px solid #e2e8f0',
                              background: '#f8fafc',
                              flexShrink: 0
                            }}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: isSelected ? '#1e1b4b' : '#334155' }}>{kd.name_ta}</span>
                            <span style={{ fontSize: '11px', color: isSelected ? '#4f46e5' : '#64748b', marginTop: '2px' }}>{kd.name_en}</span>
                          </div>
                          {isSelected && (
                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}>
                              ✓
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <FormSelectObj
                label="வகைரா (Select Vagaiyara)"
                name="vagaiyara_id"
                value={formData.vagaiyara_id}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    vagaiyara_id: val
                  }));
                }}
                icon={Building}
                options={availableVagaiyaras}
                placeholder="-- வகைரா தேர்ந்தெடுக்கவும் --"
                disabled={!formData.community_id}
              />

              <FormInput
                label="தற்போதைய வகையரா (Tharpothaiya Vagaiyara)"
                name="tharpothaiya_vagaiyara"
                value={formData.tharpothaiya_vagaiyara}
                onChange={handleChange}
                icon={Building}
                placeholder="தற்போதைய வகையராவை உள்ளிடவும்"
              />

              <div className="form-group">
                <label className="form-label">எந்த தலைமுறை (Select Generation)</label>
                <div className="input-wrapper">
                  <Layers className="input-icon" size={18} />
                  <select
                    name="generation_no"
                    id="generation_no"
                    className="form-control"
                    value={formData.generation_no}
                    onChange={handleChange}
                    style={{ paddingLeft: '42px', appearance: 'auto' }}
                  >
                    <option value="">-- தலைமுறையை தேர்ந்தெடுக்கவும் --</option>
                    {GENERATIONS.map(g => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">திருமணம் நிலை (Select Marital Status)</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="marital_status"
                      value="unmarried"
                      checked={formData.marital_status === 'unmarried'}
                      onChange={handleChange}
                      className="form-check-input"
                    />
                    Unmarried (திருமணமாகாதவர்)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="marital_status"
                      value="married"
                      checked={formData.marital_status === 'married'}
                      onChange={handleChange}
                      className="form-check-input"
                    />
                    Married (திருமணமானவர்)
                  </label>
                </div>
              </div>

              {formData.marital_status === 'married' && (
                <>
                  <FormInput
                    label="மனைவி பெயர் (Wife's Name)"
                    name="spouse_name"
                    value={formData.spouse_name}
                    onChange={handleChange}
                    icon={User}
                    placeholder="மனைவி பெயரை உள்ளிடவும்"
                  />

                  <div className="form-group">
                    <label className="form-label">மனைவியின் குலதெய்வம் (Wife's Kula Deivam)</label>
                    <div className="input-wrapper">
                      <Sparkles className="input-icon" size={18} />
                      <input
                        type="text"
                        className="form-control"
                        placeholder="எ.கா: முனீஸ்வரன் / காளியம்மன்"
                        value={wifeKulaDeivam}
                        onChange={(e) => {
                          const textVal = e.target.value;
                          setWifeKulaDeivam(textVal);

                          // Try to find matching deity and update spouse_kula_deivam_id
                          const cleanWifeDeity = textVal.trim().toLowerCase();
                          const foundDeity = kulaDeivams.find(kd =>
                            cleanWifeDeity.includes(kd.name_ta.toLowerCase()) ||
                            cleanWifeDeity.includes(kd.name_en.toLowerCase())
                          );
                          setFormData(prev => ({
                            ...prev,
                            spouse_kula_deivam_id: foundDeity ? foundDeity.id : ''
                          }));
                        }}
                        list="kulaDeivamsList"
                        style={{ paddingLeft: '42px' }}
                      />
                      <datalist id="kulaDeivamsList">
                        {kulaDeivams.map(kd => (
                          <option key={kd.id} value={`${kd.name_ta} (${kd.name_en})`} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="form-actions">
            {activeStep > 1 ? (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setActiveStep(prev => prev - 1)}
              >
                Previous Step
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate(-1)}
              >
                Back
              </button>
            )}

            {activeStep < 4 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setActiveStep(prev => prev + 1)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                Next Step <ArrowRight size={18} />
              </button>
            ) : (
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
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Kovil;
