import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { 
  Info, 
  CheckSquare, 
  Image as ImageIcon, 
  FileText, 
  Phone, 
  Save, 
  XCircle, 
  Activity, 
  Shield, 
  Zap, 
  Droplets, 
  Waves, 
  Wind, 
  Home, 
  Power, 
  Thermometer, 
  Monitor, 
  Camera, 
  RefreshCw,
  LayoutGrid,
  Eraser,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';
import { showSuccess, showError, showWarning } from '../utils/swal';

const API_BASE_URL = BASE_API + '/takaval';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  let cleanPath = path.replace(/^\/+/, '');
  if (cleanPath.startsWith('uploads/')) {
    cleanPath = cleanPath.replace('uploads/', '');
  }
  
  return `${BASE_API}/files/${cleanPath}`;
};

const FormInput = ({ label, name, value, onChange, icon: Icon, placeholder, type = "text", required = false }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <div className="input-wrapper">
      {Icon && <Icon className="input-icon" size={16} />}
      <input 
        type={type} 
        name={name}
        id={name}
        className="form-control"
        placeholder={placeholder}
        value={value} 
        onChange={onChange} 
        required={required} 
        style={{ paddingLeft: Icon ? '38px' : '12px', height: '38px', fontSize: '13.5px' }}
      />
    </div>
  </div>
);

const FormTextArea = ({ label, name, value, onChange, icon: Icon, placeholder, required = false }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <div className="input-wrapper">
      {Icon && <Icon className="input-icon" size={16} style={{ top: '12px' }} />}
      <textarea 
        name={name}
        id={name}
        className="form-control"
        placeholder={placeholder}
        value={value} 
        onChange={onChange} 
        required={required} 
        rows={3}
        style={{ paddingLeft: Icon ? '38px' : '12px', paddingTop: '10px', minHeight: '80px', fontSize: '13.5px' }}
      />
    </div>
  </div>
);

const Takaval = () => {
  const [facilities, setFacilities] = useState({
    water_facility: false,
    drinking_water: false,
    bathroom: false,
    toilet: false,
    accommodation: false,
    power_backup: false,
    hot_water: false,
    ac_facility: false,
    marriage_hall: false
  });

  const [formData, setFormData] = useState({
    mandapamDescription: '',
    poojariContact: '',
    image: null
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}`);
      if (res.ok) {
        const json = await res.json();
        const records = json.data?.data || [];
        if (records.length > 0) {
          const item = records[0];
          setEditingId(item.id);
          setFacilities({
            water_facility: item.water_facility === 'true',
            drinking_water: item.drinking_water === 'true',
            bathroom: item.bathroom === 'true',
            toilet: item.toilet === 'true',
            accommodation: item.accommodation === 'true',
            power_backup: item.power_backup === 'true',
            hot_water: item.hot_water === 'true',
            ac_facility: item.ac_facility === 'true',
            marriage_hall: item.marriage_hall === 'true'
          });
          setFormData({
            mandapamDescription: item.mandapam_description || '',
            poojariContact: item.poojari_contact || '',
            image: null
          });
          if (item.mandapam_image) {
            setImagePreview(getImageUrl(item.mandapam_image));
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const isEditMode = !!editingId;
      const url = isEditMode ? `${API_BASE_URL}/update/${editingId}` : `${API_BASE_URL}/create`;
      const method = isEditMode ? 'PUT' : 'POST';

      const formDataObj = new FormData();
      formDataObj.append('water_facility', facilities.water_facility.toString());
      formDataObj.append('drinking_water', facilities.drinking_water.toString());
      formDataObj.append('bathroom', facilities.bathroom.toString());
      formDataObj.append('toilet', facilities.toilet.toString());
      formDataObj.append('accommodation', facilities.accommodation.toString());
      formDataObj.append('power_backup', facilities.power_backup.toString());
      formDataObj.append('hot_water', facilities.hot_water.toString());
      formDataObj.append('ac_facility', facilities.ac_facility.toString());
      formDataObj.append('marriage_hall', facilities.marriage_hall.toString());
      formDataObj.append('mandapam_description', formData.mandapamDescription);
      formDataObj.append('poojari_contact', formData.poojariContact);
      
      if (formData.image) {
        formDataObj.append('image', formData.image);
      } else if (isEditMode && imagePreview && imagePreview.includes('/files/')) {
        formDataObj.append('mandapam_image', imagePreview.split('/files/')[1]);
      }

      const res = await fetch(url, {
        method: method,
        body: formDataObj
      });

      if (res.ok) {
        showSuccess("வெற்றிகரமாக சேமிக்கப்பட்டது!", "Saved Successfully!");
        fetchData();
      } else {
        showError("தோல்வி", "Failed to save info");
      }
    } catch (err) {
      showError("தொடர்பு பிழை", "Connection error");
    }
  };

  const handleCheckboxChange = (id) => {
    setFacilities(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const amenities = [
    { id: 'water_facility', label: 'தண்ணீர் வசதி (Water)', icon: Droplets, color: '#3b82f6' },
    { id: 'drinking_water', label: 'குடிநீர் வசதி (Drinking)', icon: Waves, color: '#06b6d4' },
    { id: 'bathroom', label: 'குளியலறை (Bathroom)', icon: Activity, color: '#ec4899' },
    { id: 'toilet', label: 'கழிப்பறை (Toilet)', icon: Shield, color: '#ef4444' },
    { id: 'accommodation', label: 'தங்கும் விடுதி (Stay)', icon: Home, color: '#f59e0b' },
    { id: 'power_backup', label: 'மின்வசதி (Power)', icon: Power, color: '#facc15' },
    { id: 'hot_water', label: 'வெந்நீர் (Hot Water)', icon: Thermometer, color: '#f97316' },
    { id: 'ac_facility', label: 'குளிர்சாதன (AC)', icon: Wind, color: '#0ea5e9' },
    { id: 'marriage_hall', label: 'திருமண மண்டபம் (Hall)', icon: LayoutGrid, color: '#8b5cf6' },
  ];

  return (
    <div className="form-card" style={{ maxWidth: '1400px' }}>
      <div className="form-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Info size={24} color="#6366f1" />
          <h2 style={{ margin: 0, fontSize: '20px' }}>தகவல் மற்றும் வசதிகள் (Temple Facilities)</h2>
        </div>
        <p style={{ fontSize: '13px' }}>பக்தர்களுக்கான வசதிகள் மற்றும் மண்டப விவரங்களை நிர்வகிக்கவும்.</p>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <CheckSquare size={18} color="#6366f1" />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>கிடைக்கக்கூடிய வசதிகள் (Amenities)</h3>
        </div>

        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {amenities.map(item => (
            <div 
              key={item.id}
              onClick={() => handleCheckboxChange(item.id)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '10px 16px', 
                background: facilities[item.id] ? '#f5f3ff' : '#fff',
                border: `1px solid ${facilities[item.id] ? '#6366f1' : '#e2e8f0'}`,
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: facilities[item.id] ? '0 2px 4px rgba(99, 102, 241, 0.1)' : 'none'
              }}
            >
              <div style={{ 
                width: '18px', 
                height: '18px', 
                borderRadius: '4px', 
                border: `2px solid ${facilities[item.id] ? '#6366f1' : '#cbd5e1'}`,
                background: facilities[item.id] ? '#6366f1' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {facilities[item.id] && <CheckCircle2 size={12} color="#fff" />}
              </div>
              <item.icon size={16} color={facilities[item.id] ? '#6366f1' : '#94a3b8'} />
              <span style={{ fontSize: '13px', fontWeight: '600', color: facilities[item.id] ? '#1e293b' : '#64748b' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <ImageIcon size={18} color="#6366f1" />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>மண்டபம் மற்றும் பூசாரி (Hall & Poojari)</h3>
        </div>

        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <FormTextArea 
              label="மண்டபம் விளக்கம்" 
              name="mandapamDescription" 
              value={formData.mandapamDescription} 
              onChange={handleInputChange} 
              icon={FileText} 
              placeholder="விளக்கம்..." 
            />
          </div>

          <div className="form-group">
            <label className="form-label">மண்டபம் புகைப்படம்</label>
            <div 
              className="photo-upload-area"
              onClick={() => document.getElementById('imageInput').click()}
              style={{ height: '118px' }}
            >
              {imagePreview ? (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }} />
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({ ...prev, image: null }));
                      setImagePreview('');
                      document.getElementById('imageInput').value = '';
                    }} 
                    style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                  >
                    <XCircle size={14}/>
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                  <Camera size={20} />
                  <span style={{ fontSize: '12px' }}>பதிவேற்றவும்</span>
                </div>
              )}
            </div>
            <input type="file" id="imageInput" hidden accept="image/*" onChange={handleFileChange} />
          </div>

          <FormInput 
            label="பூசாரி தொடர்பு எண்" 
            name="poojariContact" 
            value={formData.poojariContact} 
            onChange={handleInputChange} 
            icon={PhoneCall} 
            placeholder="Phone No..." 
          />
        </div>
      </div>

      <div className="form-actions" style={{ position: 'sticky', bottom: '20px', zIndex: 10, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', padding: '12px', borderRadius: '12px', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)' }}>
        <button onClick={fetchData} className="btn btn-outline" style={{ height: '40px' }}>
          <Eraser size={16}/> Reset All
        </button>
        <button type="button" onClick={handleSubmit} className="btn btn-primary" style={{ height: '40px', minWidth: '180px' }}>
          <Save size={18} /> Update Information
        </button>
      </div>
    </div>
  );
};

export default Takaval;
