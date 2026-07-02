import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Users,
  Trash2,
  Save,
  Camera,
  RefreshCw,
  Bookmark,
  ArrowLeft,
  User,
  Layers,
  Calendar,
  Sparkles
} from 'lucide-react';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

const FormInput = ({ label, name, value, onChange, icon: Icon, placeholder, type = "text", required = false, labelStyle }) => (
  <div className="form-group">
    <label className="form-label" style={labelStyle}>{label}</label>
    <div className="input-wrapper">
      {Icon && <Icon className="input-icon" size={18} />}
      <input
        type={type}
        name={name}
        id={name}
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        style={{ paddingLeft: Icon ? '42px' : '16px', background: '#fff' }}
      />
    </div>
  </div>
);

const FormSelect = ({ label, name, value, onChange, icon: Icon, options, placeholder, labelStyle }) => (
  <div className="form-group">
    <label className="form-label" style={labelStyle}>{label}</label>
    <div className="input-wrapper">
      {Icon && <Icon className="input-icon" size={18} />}
      <select
        name={name}
        id={name}
        className="form-control"
        value={value}
        onChange={onChange}
        style={{ paddingLeft: Icon ? '42px' : '16px', appearance: 'auto', background: '#fff' }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  </div>
);

const FormTextArea = ({ label, name, value, onChange, icon: Icon, placeholder, rows = 3, labelStyle }) => (
  <div className="form-group" style={{ gridColumn: 'span 3' }}>
    <label className="form-label" style={labelStyle}>{label}</label>
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
        style={{ paddingLeft: Icon ? '42px' : '16px', background: '#fff' }}
      />
    </div>
  </div>
);

const generationOptions = [
  { value: '1', label: '1-ஆம் தலைமுறை (1st Gen)' },
  { value: '2', label: '2-ஆம் தலைமுறை (2nd Gen)' },
  { value: '3', label: '3-ஆம் தலைமுறை (3rd Gen)' },
  { value: '4', label: '4-ஆம் தலைமுறை (4th Gen)' },
  { value: '5', label: '5-ஆம் தலைமுறை (5th Gen)' },
  { value: '6', label: '6-ஆம் தலைமுறை (6th Gen)' },
  { value: '7', label: '7-ஆம் தலைமுறை (7th Gen)' },
  { value: '8', label: '8-ஆம் தலைமுறை (8th Gen)' },
  { value: '9', label: '9-ஆம் தலைமுறை (9th Gen)' },
  { value: '10', label: '10-ஆம் தலைமுறை + (10th Gen+)' }
];

const resolveImageUrl = (img) => {
  if (!img) return '';
  if (img.startsWith('data:image/') || img.startsWith('http://') || img.startsWith('https://')) {
    return img;
  }
  return `${BASE_API}/files/${img}`;
};

const Ancestors = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromKovil = location.state?.fromKovil;
  const [ancestors, setAncestors] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    photo: '',
    file: null,
    previewUrl: '',
    yearFrom: '',
    yearTo: '',
    generation: '',
    gender: 'male',
    description: ''
  });

  const templeDetailsId = location.state?.temple_details_id;

  const fetchAncestors = async () => {
    try {
      const url = templeDetailsId 
        ? `${BASE_API}/ancestors?temple_details_id=${templeDetailsId}` 
        : `${BASE_API}/ancestors`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.data) {
          setAncestors(json.data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching ancestors:', err);
    }
  };

  useEffect(() => {
    fetchAncestors();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData(prev => ({
          ...prev,
          file: file,
          previewUrl: ev.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearFile = () => {
    setFormData(prev => ({
      ...prev,
      file: null,
      previewUrl: ''
    }));
    const fileInput = document.getElementById('photoInput');
    if (fileInput) fileInput.value = '';
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      photo: '',
      file: null,
      previewUrl: '',
      yearFrom: '',
      yearTo: '',
      generation: '',
      gender: 'male',
      description: ''
    });
    setIsEditing(false);
    const fileInput = document.getElementById('photoInput');
    if (fileInput) fileInput.value = '';
  };

  const handleEdit = (anc) => {
    setFormData({
      id: anc.id,
      name: anc.name || '',
      photo: '',
      file: null,
      previewUrl: anc.photo_path ? resolveImageUrl(anc.photo_path) : '',
      yearFrom: anc.year_from || '',
      yearTo: anc.year_to || '',
      generation: anc.generation || '',
      gender: anc.gender || 'male',
      description: anc.description || ''
    });
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    const confirm = await showConfirm(
      'நிச்சயமாக நீக்க வேண்டுமா?',
      'இந்த முன்னோரின் விபரம் நிரந்தரமாக நீக்கப்படும்! (Delete this ancestor?)'
    );
    
    if (confirm.isConfirmed) {
      try {
        const response = await fetch(`${BASE_API}/ancestor/delete/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          showSuccess('வெற்றி', 'முன்னோரின் விவரம் நீக்கப்பட்டது (Ancestor deleted successfully)');
          fetchAncestors();
          resetForm();
        } else {
          showError('பிழை', 'நீக்க முடியவில்லை');
        }
      } catch (err) {
        console.error(err);
        showError('பிழை', 'சர்வர் தொடர்பு கொள்ள முடியவில்லை');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showWarning('விவரம் தேவை', 'தயவுசெய்து முன்னோரின் பெயரை உள்ளிடவும் (Please enter ancestor name)');
      return;
    }

    const payload = {
      name: formData.name,
      photo_path: formData.previewUrl,
      year_from: formData.yearFrom ? parseInt(formData.yearFrom) : null,
      year_to: formData.yearTo ? parseInt(formData.yearTo) : null,
      generation: formData.generation,
      gender: formData.gender,
      description: formData.description,
      temple_details_id: templeDetailsId ? parseInt(templeDetailsId) : null
    };

    try {
      if (isEditing) {
        const response = await fetch(`${BASE_API}/ancestor/update/${formData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (response.ok) {
          showSuccess('வெற்றி', 'முன்னோர் விவரங்கள் புதுப்பிக்கப்பட்டது (Ancestor details updated)');
          fetchAncestors();
          resetForm();
        } else {
          showError('பிழை', result.message || 'புதுப்பிக்க முடியவில்லை');
        }
      } else {
        const response = await fetch(`${BASE_API}/ancestor/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (response.ok) {
          showSuccess('வெற்றி', 'புதிய முன்னோர் வெற்றிகரமாக சேர்க்கப்பட்டார் (New ancestor added)');
          fetchAncestors();
          resetForm();
        } else {
          showError('பிழை', result.message || 'சேர்க்க முடியவில்லை');
        }
      }
    } catch (err) {
      console.error(err);
      showError('பிழை', 'சர்வர் தொடர்பு கொள்ள முடியவில்லை');
    }
  };

  const colLabelStyle = { minHeight: '38px', display: 'flex', alignItems: 'flex-end', marginBottom: '8px' };

  return (
    <div className="form-card" style={{ maxWidth: '100%', margin: '0 auto', padding: '10px' }}>
      
      {/* Form Header */}
      <div className="form-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <Users size={24} color="#6366f1" />
            <h2 style={{ margin: 0, fontSize: '20px' }}>முன்னோர்கள் மேலாண்மை (Ancestors Management)</h2>
          </div>
          <p style={{ fontSize: '13px' }}>கோவிலின் மூதாதையர்கள் மற்றும் முன்னோர்களின் விபரங்களை இங்கே நிர்வகிக்கவும்.</p>
        </div>
        {fromKovil && (
          <button
            onClick={() => navigate(-1)}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'all 0.2s'
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}
      </div>

      <div className="card" style={{ padding: '24px', borderRadius: '16px', border: '1.5px solid #e2e8f0', background: '#fff' }}>
        
        {/* Selection Dropdown to edit existing items */}
        <div style={{ marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
          <label className="form-label" style={{ fontWeight: '750', fontSize: '13.5px', color: '#4f46e5', marginBottom: '8px', display: 'block' }}>
            ஏற்கனவே உள்ள முன்னோரைத் தேர்ந்தெடுத்து திருத்த அல்லது நீக்க (Select to Edit/Delete Ancestor)
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              className="form-control"
              value={isEditing ? formData.id : ''}
              onChange={(e) => {
                const selectedId = e.target.value;
                if (selectedId) {
                  const found = ancestors.find(a => String(a.id) === String(selectedId));
                  if (found) handleEdit(found);
                } else {
                  resetForm();
                }
              }}
              style={{ height: '42px', borderRadius: '8px', border: '1.5px solid #cbd5e1', appearance: 'auto', paddingLeft: '12px', fontSize: '13.5px', fontWeight: '500', flex: 1, background: '#fff' }}
            >
              <option value="">-- புதிய முன்னோர் சேர்க்கவும் (Add New Ancestor) --</option>
              {ancestors.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.gender === 'male' ? 'ஆண்' : 'பெண்'}{a.generation && ` • Gen ${a.generation}`})</option>
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
            {isEditing ? 'முன்னோர் விவரங்களை மாற்றுதல் (Edit Ancestor)' : 'புதிய முன்னோர் சேர்த்தல் (Add New Ancestor)'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          
          <FormInput
            label="முன்னோர் பெயர் (Ancestor Name) *"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            icon={User}
            placeholder="எ.கா: சிவராமகிருஷ்ண முதலியார்"
            required={true}
            labelStyle={colLabelStyle}
          />

          <FormSelect
            label="தலைமுறை (Select Generation)"
            name="generation"
            value={formData.generation}
            onChange={handleInputChange}
            icon={Layers}
            options={generationOptions}
            placeholder="-- தேர்ந்தெடுக்கவும் --"
            labelStyle={colLabelStyle}
          />

          <FormSelect
            label="பாலினம் (Gender)"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            icon={Users}
            options={[
              { value: 'male', label: 'ஆண் (Male)' },
              { value: 'female', label: 'பெண் (Female)' }
            ]}
            labelStyle={colLabelStyle}
          />

          <FormInput
            label="ஆண்டு தொடக்கம் (Year From)"
            name="yearFrom"
            value={formData.yearFrom}
            onChange={handleInputChange}
            icon={Calendar}
            placeholder="எ.கா: 1890"
            type="number"
            labelStyle={colLabelStyle}
          />

          <FormInput
            label="ஆண்டு முடிவு (Year To)"
            name="yearTo"
            value={formData.yearTo}
            onChange={handleInputChange}
            icon={Calendar}
            placeholder="எ.கா: 1970"
            type="number"
            labelStyle={colLabelStyle}
          />

          {/* Photo upload */}
          <div className="form-group">
            <label className="form-label" style={colLabelStyle}>
              புகைப்படம் (Photo)
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch', height: '46px' }}>
              <div
                onClick={() => document.getElementById('photoInput').click()}
                style={{
                  flex: 1,
                  height: '46px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: '#fff',
                  position: 'relative',
                  overflow: 'hidden',
                  padding: '0 12px'
                }}
              >
                {formData.previewUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <img src={formData.previewUrl} alt="Preview" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
                    <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>புகைப்படம் தயாராக உள்ளது</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                    <Camera size={16} />
                    <span style={{ fontSize: '13px' }}>புகைப்படம் பதிவேற்றவும்</span>
                  </div>
                )}
              </div>
              {formData.previewUrl && (
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="btn btn-outline"
                  style={{ padding: '0 12px', height: '46px', fontSize: '12px', borderColor: '#ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '10px' }}
                >
                  <Trash2 size={14} />
                </button>
              )}
              <input type="file" id="photoInput" hidden accept="image/*" onChange={handleFileChange} />
            </div>
          </div>

          <FormTextArea
            label="விவரம் / வரலாறு (Description)"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            icon={Sparkles}
            placeholder="முன்னோர் பற்றிய விபரங்களை உள்ளிடவும்..."
            rows={3}
            labelStyle={colLabelStyle}
          />

          {/* Action buttons */}
          <div style={{ gridColumn: 'span 3', display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={resetForm}
              className="btn btn-outline"
              style={{ flex: 1, height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '700', borderRadius: '10px' }}
            >
              <RefreshCw size={16} /> ரத்து (Cancel)
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1.5, height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '700', borderRadius: '10px', background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              <Save size={16} /> {isEditing ? 'மாற்றங்களைச் சேமி (Update)' : 'முன்னோரைச் சேர் (Save)'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default Ancestors;
