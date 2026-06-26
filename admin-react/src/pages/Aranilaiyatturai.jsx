import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { 
  Edit2, 
  Trash2, 
  Save, 
  User, 
  FileText, 
  Shield, 
  Building, 
  Activity, 
  Calendar, 
  Clock, 
  Zap, 
  RefreshCw, 
  List, 
  Eraser,
  CheckCircle,
  Camera,
  Search,
  XCircle
} from 'lucide-react';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

const API_BASE_URL = BASE_API + '/aranilaiyatturai';
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
        style={{ paddingLeft: Icon ? '38px' : '12px', height: '42px', fontSize: '14.5px' }}
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
        style={{ paddingLeft: Icon ? '38px' : '12px', height: '42px', fontSize: '14.5px', appearance: 'auto' }}
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

const Aranilaiyatturai = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [formData, setFormData] = useState({
    generalMember: '',
    yagasalaPooja: '',
    poojaName: '',
    weekday: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    status: 'open'
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
      generalMember: '',
      yagasalaPooja: '',
      poojaName: '',
      weekday: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      status: 'open'
    });
    setImageFile(null);
    setImagePreview('');
    setEditingId(null);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      const isEditMode = !!editingId;
      const url = isEditMode ? `${API_BASE_URL}/update/${editingId}` : `${API_BASE_URL}/create`;
      
      const form = new FormData();
      form.append('temple_id', CURRENT_TEMPLE_ID);
      form.append('general_member', formData.generalMember);
      form.append('yagasalai_pooja', formData.yagasalaPooja);
      form.append('pooja_name', formData.poojaName);
      form.append('day', formData.weekday);
      form.append('date', formData.date);
      form.append('time', formData.time);
      form.append('status', formData.status);
      
      if (imageFile) {
        form.append('photo', imageFile);
      }

      const res = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        body: form
      });

      if (res.ok) {
        showSuccess(`வெற்றிகரமாக ${isEditMode ? 'மாற்றப்பட்டது' : 'சேமிக்கப்பட்டது'}!`, `Successfully ${isEditMode ? 'updated' : 'saved'}!`);
        clearForm();
        fetchData();
      } else {
        showError("தோல்வி", "Failed to save record");
      }
    } catch (err) {
      showError("தொடர்பு பிழை", "Connection error");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      generalMember: item.general_member || '',
      yagasalaPooja: item.yagasalai_pooja || '',
      poojaName: item.pooja_name || '',
      weekday: item.day || '',
      date: item.date ? item.date.split('T')[0] : '',
      time: item.time || '',
      status: item.status || 'open'
    });
    setImagePreview(item.executive_member_file ? getImageUrl(item.executive_member_file) : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const result = await showConfirm("நிச்சயமாக நீக்க வேண்டுமா?", "Are you sure?");
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API_BASE_URL}/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
        showSuccess("நீக்கப்பட்டது", "Deleted");
      }
    } catch (err) {
      showError("நீக்குவதில் பிழை", "Error deleting");
    }
  };

  const filteredData = data.filter(item => 
    (item.pooja_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.yagasalai_pooja || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="form-card" style={{ maxWidth: '1400px' }}>
      <div className="form-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Shield size={24} color="#6366f1" />
          <h2 style={{ margin: 0, fontSize: '20px' }}>அறநிலையத்துறை (Religious Endowments)</h2>
        </div>
        <p style={{ fontSize: '13px' }}>வாரிய உறுப்பினர்கள் மற்றும் யாகசாலை பூஜை விவரங்களை நிர்வகிக்கவும்.</p>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <form onSubmit={handleSave}>
          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ gridColumn: 'span 3', marginBottom: '4px' }}>
              <h4 style={{ margin: 0, fontSize: '13px', color: '#6366f1', fontWeight: '700', textTransform: 'uppercase' }}>குழு விவரங்கள்</h4>
            </div>
            
            <FormInput label="உறுப்பினர் பெயர்" name="generalMember" value={formData.generalMember} onChange={handleInputChange} icon={User} />
            
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">ஆவணம் / புகைப்படம்</label>
              <div 
                className="photo-upload-area"
                onClick={() => document.getElementById('photoInput').click()}
                style={{ height: '42px', padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                  <Camera size={16} />
                  <span>{imageFile ? imageFile.name : (editingId && imagePreview ? 'ஆவணம் உள்ளது' : 'பதிவேற்றவும்')}</span>
                </div>
                {imagePreview && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
                      {imagePreview.startsWith('data:application/pdf') || (typeof imagePreview === 'string' && imagePreview.toLowerCase().includes('.pdf')) ? (
                        <FileText size={16} color="#6366f1" />
                      ) : (
                        <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                  </div>
                )}
              </div>
              <input type="file" id="photoInput" hidden onChange={handleFileChange} accept="image/*,application/pdf" />
            </div>

            <div style={{ gridColumn: 'span 3', margin: '12px 0 4px 0' }}>
              <h4 style={{ margin: 0, fontSize: '13px', color: '#6366f1', fontWeight: '700', textTransform: 'uppercase' }}>பூஜை விவரங்கள்</h4>
            </div>

            <FormInput label="யாகசாலை பூஜை" name="yagasalaPooja" value={formData.yagasalaPooja} onChange={handleInputChange} icon={Building} />
            <FormInput label="பூஜை பெயர்" name="poojaName" value={formData.poojaName} onChange={handleInputChange} icon={Zap} />
            
            <FormSelect 
              label="கிழமை" name="weekday" value={formData.weekday} onChange={handleInputChange} icon={Calendar}
              options={['ஞாயிற்றுக்கிழமை', 'திங்கட்கிழமை', 'செவ்வாய்க்கிழமை', 'புதன்கிழமை', 'வியாழக்கிழமை', 'வெள்ளிக்கிழமை', 'சனிக்கிழமை']}
            />
            
            <FormInput label="தேதி" name="date" value={formData.date} onChange={handleInputChange} icon={Calendar} type="date" />
            <FormInput label="நேரம்" name="time" value={formData.time} onChange={handleInputChange} icon={Clock} type="time" />
            
            <FormSelect 
              label="நிலை" name="status" value={formData.status} onChange={handleInputChange} icon={Activity}
              options={[{ value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }]}
            />
          </div>

          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button type="button" onClick={clearForm} className="btn btn-outline" style={{ height: '42px' }}>
              <Eraser size={16}/> Clear
            </button>
            <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
              {editingId ? <>Update <RefreshCw size={16} /></> : <>Save <Save size={16} /></>}
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <List size={18} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>பதிவுகள் (Records)</h3>
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
                <th>குழு உறுப்பினர் & ஆவணம்</th>
                <th>யாகசாலை & பூஜை</th>
                <th>கிழமை & தேதி</th>
                <th>நேரம்</th>
                <th style={{ textAlign: 'center' }}>நிலை</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>பதிவுகள் இல்லை</td></tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: '700', color: '#6366f1', fontSize: '13px' }}>{idx + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={16} color="#6366f1" />
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '13.5px' }}>{item.general_member || '--'}</div>
                          {item.executive_member_file && (
                            <a 
                              href={getImageUrl(item.executive_member_file)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#6366f1', textDecoration: 'underline' }}
                            >
                              <FileText size={12} />
                              ஆவணம் காண்க (View File)
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Zap size={18} color="#d97706" />
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '13.5px' }}>{item.yagasalai_pooja || '--'}</div>
                          <div style={{ fontSize: '11px', color: '#6366f1', fontWeight: '600' }}>{item.pooja_name || '--'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', fontSize: '13px' }}>{item.day || '--'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{item.date ? item.date.split('T')[0] : '--'}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px' }}>{item.time || '--'}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge-status ${item.status === 'open' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '11px' }}>
                        {item.status || 'open'}
                      </span>
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

export default Aranilaiyatturai;
