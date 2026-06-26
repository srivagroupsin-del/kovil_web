import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { 
  Edit2, 
  Trash2, 
  Save, 
  Eraser, 
  XCircle, 
  Zap, 
  Activity, 
  Heart, 
  Info, 
  FileText, 
  Camera, 
  List, 
  PlusCircle, 
  RefreshCw, 
  CheckCircle,
  User,
  Shield,
  Search
} from 'lucide-react';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

const API_BASE_URL = BASE_API + '/kurai_nivarthi';
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

const KuraiNivarthi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [activeTab, setActiveTab] = useState('worship');

  const [formData, setFormData] = useState({
    poojaType: '',
    deityName: '',
    ritualChange: 'no-change',
    deityScope: 'all',
    title: '',
    worshipMethod: '',
    vratham: '',
    prayer: '',
    benefits: '',
    nivarthi: '',
    notes: '',
    description: '',
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/temple/${CURRENT_TEMPLE_ID}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data?.data || []);
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
      poojaType: '',
      deityName: '',
      ritualChange: 'no-change',
      deityScope: 'all',
      title: '',
      worshipMethod: '',
      vratham: '',
      prayer: '',
      benefits: '',
      nivarthi: '',
      notes: '',
      description: '',
      status: 'active'
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
      form.append('pooja_type', formData.poojaType);
      form.append('ritual_change', formData.ritualChange);
      form.append('deity_selection', formData.deityScope);
      form.append('deity_name', formData.deityName);
      form.append('title', formData.title);
      form.append('worship_method', formData.worshipMethod);
      form.append('vratham', formData.vratham);
      form.append('prayer', formData.prayer);
      form.append('benefits', formData.benefits);
      form.append('nivarthi', formData.nivarthi);
      form.append('notes', formData.notes);
      form.append('description', formData.description);
      form.append('sub_category', activeTab);
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
    setActiveTab(item.sub_category || 'worship');
    setFormData({
      poojaType: item.pooja_type || '',
      deityName: item.deity_name || '',
      ritualChange: item.ritual_change || 'no-change',
      deityScope: item.deity_selection || 'all',
      title: item.title || '',
      worshipMethod: item.worship_method || '',
      vratham: item.vratham || '',
      prayer: item.prayer || '',
      benefits: item.benefits || '',
      nivarthi: item.nivarthi || '',
      notes: item.notes || '',
      description: item.description || '',
      status: item.status || 'active'
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
    item.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="form-card" style={{ maxWidth: '1400px' }}>
      <div className="form-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Shield size={24} color="#6366f1" />
          <h2 style={{ margin: 0, fontSize: '20px' }}>குறை நிவர்த்தி (Remedies)</h2>
        </div>
        <p style={{ fontSize: '13px' }}>பக்தர்களின் குறைகளை போக்கும் வழிபாட்டு முறைகள் மற்றும் நிவர்த்திகளை நிர்வகிக்கவும்.</p>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', width: 'fit-content', marginBottom: '20px' }}>
          {[
            { id: 'worship', label: 'வழிபாட்டு முறைகள்', icon: Activity },
            { id: 'fasting', label: 'விரதங்கள்', icon: Heart },
            { id: 'fulfillment', label: 'நிவர்த்திகள்', icon: CheckCircle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px',
                border: 'none', background: activeTab === tab.id ? '#fff' : 'transparent',
                color: activeTab === tab.id ? '#6366f1' : '#64748b', fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                boxShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave}>
          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <FormSelect 
              label="பூஜை வகை" name="poojaType" value={formData.poojaType} onChange={handleInputChange} icon={Zap}
              options={['வார சிறப்பு நாட்கள்', 'வார சிறப்பு கிழமைகள்', 'மாதம் மாதம்']}
            />
            <FormSelect 
              label="தெய்வங்கள்" name="deityName" value={formData.deityName} onChange={handleInputChange} icon={User}
              options={['உடனூறை/ அம்பாள்', 'தக்ஷிணாமூர்த்தி', 'சண்டிகேஸ்வரர்', 'கால பைரவர்', 'நவ நாயகர்கள்', 'மூலவர்கு மட்டும்']}
            />
            <div className="form-group">
              <label className="form-label">நித்திய பூஜை மாற்றம்</label>
              <div style={{ display: 'flex', gap: '16px', height: '38px', alignItems: 'center', padding: '0 12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="radio" name="ritualChange" value="change" checked={formData.ritualChange === 'change'} onChange={handleInputChange} /> உண்டு
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="radio" name="ritualChange" value="no-change" checked={formData.ritualChange === 'no-change'} onChange={handleInputChange} /> இல்லை
                </label>
              </div>
            </div>

            <div style={{ gridColumn: 'span 3' }}>
              <FormInput label="நிவர்த்தி தலைப்பு *" name="title" value={formData.title} onChange={handleInputChange} icon={Shield} required />
            </div>

            <FormInput label="வழிபாட்டு முறை" name="worshipMethod" value={formData.worshipMethod} onChange={handleInputChange} icon={Activity} />
            <FormInput label="விரதம்" name="vratham" value={formData.vratham} onChange={handleInputChange} icon={Heart} />
            <FormInput label="நிவர்த்தி முறை" name="nivarthi" value={formData.nivarthi} onChange={handleInputChange} icon={CheckCircle} />
            
            <div style={{ gridColumn: 'span 2' }}>
              <FormInput label="விளக்கம் / குறிப்புகள்" name="description" value={formData.description} onChange={handleInputChange} icon={FileText} />
            </div>

            <div className="form-group">
              <label className="form-label">நிவர்த்தி புகைப்படம்</label>
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
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>நிவர்த்தி முறைகள் பட்டியல்</h3>
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
                <th>வகையீடு & தலைப்பு</th>
                <th>வழிபாட்டு முறை</th>
                <th style={{ textAlign: 'center' }}>நிலை</th>
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
                          <div style={{ fontWeight: '600', fontSize: '13.5px' }}>{item.title}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{item.pooja_type || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: '#475569' }}>{item.worship_method || item.nivarthi || '-'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge-status badge-success" style={{ fontSize: '11px' }}>{item.status || 'active'}</span>
                    </td>
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

export default KuraiNivarthi;
