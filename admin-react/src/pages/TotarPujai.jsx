import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { 
  Edit2, 
  Trash2, 
  Search, 
  RefreshCw, 
  Eraser, 
  Save, 
  PlusCircle, 
  XCircle, 
  Calendar, 
  Clock, 
  Activity, 
  Sparkles, 
  User, 
  Phone, 
  Info, 
  FileText,
  Camera,
  List,
  Zap,
  ChevronRight
} from 'lucide-react';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

const API_BASE_URL = BASE_API + '/thodar_poojai';
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

const FormInput = ({ label, name, value, onChange, icon: Icon, placeholder, type = "text", required = false }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <div className="input-wrapper">
      {Icon && <Icon className="input-icon" size={16} />}
      <input 
        type={type} 
        name={name}
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

const FormSelect = ({ label, name, value, onChange, icon: Icon, options, required = false }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <div className="input-wrapper">
      {Icon && <Icon className="input-icon" size={16} />}
      <select 
        name={name}
        className="form-control" 
        value={value} 
        onChange={onChange}
        required={required}
        style={{ paddingLeft: Icon ? '38px' : '12px', height: '38px', fontSize: '13.5px', appearance: 'auto' }}
      >
        <option value="">தேர்வு செய்க...</option>
        {options.map(opt => (
          <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
            {typeof opt === 'string' ? opt : opt.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);

const TotarPujai = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [formData, setFormData] = useState({
    poojaName: '',
    engDate: new Date().toISOString().split('T')[0],
    tamilDate: '',
    day: '',
    title: '',
    description: '',
    poojaTime: '',
    deparathanaTime: '',
    poojaiItems: '',
    specialPoojai: '',
    status: 'செயல்பாட்டில்',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/temple/${CURRENT_TEMPLE_ID}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const rows = json.data?.data || [];
        setData(rows.map(item => ({
          ...item,
          id: item.id,
          poojaName: item.pooja_name,
          engDate: item.end_date ? item.end_date.split('T')[0] : '',
          tamilDate: item.tamil_date ? item.tamil_date.split('T')[0] : '',
          image: item.image_path
        })));
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
      poojaName: '',
      engDate: new Date().toISOString().split('T')[0],
      tamilDate: '',
      day: '',
      title: '',
      description: '',
      poojaTime: '',
      deparathanaTime: '',
      poojaiItems: '',
      specialPoojai: '',
      status: 'செயல்பாட்டில்',
      notes: ''
    });
    setImageFile(null);
    setImagePreview('');
    setEditingId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const isEditMode = !!editingId;
      const url = isEditMode ? `${API_BASE_URL}/update/${editingId}` : `${API_BASE_URL}/create`;
      
      const form = new FormData();
      form.append('temple_id', CURRENT_TEMPLE_ID);
      form.append('pooja_name', formData.poojaName);
      form.append('end_date', formData.engDate);
      form.append('tamil_date', formData.tamilDate || '');
      form.append('day', formData.day);
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('pooja_time', formData.poojaTime ? `${formData.poojaTime}:00` : '');
      form.append('deeparathanai_time', formData.deparathanaTime ? `${formData.deparathanaTime}:00` : '');
      form.append('items', formData.poojaiItems);
      form.append('special_name', formData.specialPoojai);
      form.append('special_description', formData.notes);
      form.append('status', formData.status);
      
      if (imageFile) {
        form.append('photo', imageFile);
      }

      const res = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        body: form
      });

      if (res.ok) {
        showSuccess(isEditMode ? "மாற்றப்பட்டது" : "சேமிக்கப்பட்டது", "Success");
        clearForm();
        fetchData();
      } else {
        showError("பிழை", "Failed to save");
      }
    } catch (err) {
      showError("பிழை", "Connection error");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      poojaName: item.pooja_name || '',
      engDate: item.end_date ? item.end_date.split('T')[0] : '',
      tamilDate: item.tamil_date ? item.tamil_date.split('T')[0] : '',
      day: item.day || '',
      title: item.title || '',
      description: item.description || '',
      poojaTime: item.pooja_time ? item.pooja_time.substring(0, 5) : '',
      deparathanaTime: item.deeparathanai_time ? item.deeparathanai_time.substring(0, 5) : '',
      poojaiItems: item.items || '',
      specialPoojai: item.special_name || '',
      status: item.status || 'செயல்பாட்டில்',
      notes: item.special_description || ''
    });
    setImagePreview(item.image_path ? getImageUrl(item.image_path) : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const result = await showConfirm("நீக்க வேண்டுமா?", "Are you sure?");
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API_BASE_URL}/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
        showSuccess("நீக்கப்பட்டது", "Deleted");
      }
    } catch (err) {
      showError("பிழை", "Error deleting");
    }
  };

  const filteredData = data.filter(item => 
    item.pooja_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="form-card" style={{ maxWidth: '1400px' }}>
      <div className="form-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Sparkles size={24} color="#6366f1" />
          <h2 style={{ margin: 0, fontSize: '20px' }}>தொடர் பூஜை (திருவிழாக்கள்)</h2>
        </div>
        <p style={{ fontSize: '13px' }}>கோவிலின் விசேஷ திருவிழாக்கள் மற்றும் தொடர் பூஜைகளை நிர்வகிக்கவும்.</p>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <form onSubmit={handleSave}>
          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <FormInput label="பூஜை பெயர் *" name="poojaName" value={formData.poojaName} onChange={handleInputChange} icon={Sparkles} required />
            <FormInput label="ஆங்கில தேதி *" name="engDate" value={formData.engDate} onChange={handleInputChange} icon={Calendar} type="date" required />
            <FormInput label="தமிழ் தேதி" name="tamilDate" value={formData.tamilDate} onChange={handleInputChange} icon={Calendar} type="date" />
            
            <FormSelect 
              label="கிழமை *" name="day" value={formData.day} onChange={handleInputChange} icon={Calendar} required 
              options={['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி']}
            />
            <FormInput label="தலைப்பு" name="title" value={formData.title} onChange={handleInputChange} icon={Activity} />
            <FormInput label="பூஜை நேரம்" name="poojaTime" value={formData.poojaTime} onChange={handleInputChange} icon={Clock} type="time" />
            
            <FormInput label="தீபாராதனை நேரம்" name="deparathanaTime" value={formData.deparathanaTime} onChange={handleInputChange} icon={Clock} type="time" />
            <FormSelect 
              label="பூஜை பொருட்கள்" name="poojaiItems" value={formData.poojaiItems} onChange={handleInputChange} icon={List}
              options={['அக்ரஹாரம்', 'மலர்', 'வில்வம்', 'துளசி', 'விபூதி', 'குங்குமம்', 'சந்தனம்']}
            />
            <FormSelect 
              label="சிறப்பு பூஜை" name="specialPoojai" value={formData.specialPoojai} onChange={handleInputChange} icon={Zap}
              options={['இல்லை', 'சிறப்பு பூஜை', 'அபிஷேகம்', 'ஆரத்தி', 'உற்சவம்']}
            />

            <div style={{ gridColumn: 'span 2' }}>
              <FormInput label="விளக்கம் / குறிப்புகள்" name="description" value={formData.description} onChange={handleInputChange} icon={FileText} placeholder="கூடுதல் தகவல்கள்..." />
            </div>

            <div className="form-group">
              <label className="form-label">புகைப்படம்</label>
              <div 
                className="photo-upload-area"
                onClick={() => document.getElementById('photoInput').click()}
                style={{ height: '38px', padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                  <Camera size={16} />
                  <span>{imageFile ? imageFile.name : (editingId && imagePreview ? 'புகைப்படம் உள்ளது' : 'பதிவேற்றவும்')}</span>
                </div>
                {imagePreview && <div style={{ width: '24px', height: '24px', borderRadius: '4px', overflow: 'hidden' }}><img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
              </div>
              <input type="file" id="photoInput" hidden onChange={handleFileChange} accept="image/*" />
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button type="button" onClick={clearForm} className="btn btn-outline" style={{ height: '38px' }}>
              <Eraser size={16}/> Clear
            </button>
            <button type="submit" className="btn btn-primary" style={{ height: '38px' }}>
              {editingId ? <>Update <RefreshCw size={16} /></> : <>Save <Save size={16} /></>}
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <List size={18} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>திருவிழாக்கள் பட்டியல்</h3>
          </div>
          
          <div className="input-wrapper" style={{ width: '250px' }}>
            <Search className="input-icon" size={14} />
            <input 
              type="text" className="form-control" placeholder="தேடல்..." 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{ height: '34px', fontSize: '13px', paddingLeft: '32px' }}
            />
          </div>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>திருவிழா & தலைப்பு</th>
                <th>தேதி & நேரம்</th>
                <th>கிழமை</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>பதிவுகள் இல்லை</td></tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: '700', color: '#6366f1', fontSize: '13px' }}>{idx + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#f1f5f9', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                          {item.image_path ? (
                            <img src={getImageUrl(item.image_path)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}><Camera size={16} /></div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '13.5px' }}>{item.pooja_name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{item.title || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', fontSize: '13px' }}>{item.end_date?.split('T')[0]}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{item.pooja_time || '-'}</div>
                    </td>
                    <td style={{ fontWeight: '600', fontSize: '13px', color: '#6366f1' }}>{item.day}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button className="icon-action" onClick={() => handleEdit(item)}><Edit2 size={14}/></button>
                        <button className="icon-action" style={{ color: '#ef4444', background: '#fef2f2' }} onClick={() => handleDelete(item.id)}><Trash2 size={14}/></button>
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

export default TotarPujai;
