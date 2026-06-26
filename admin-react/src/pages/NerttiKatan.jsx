import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { 
  Edit2, 
  Trash2, 
  Save, 
  Eraser, 
  RefreshCw, 
  User, 
  Heart, 
  Gift, 
  Calendar, 
  Activity, 
  FileText, 
  Camera, 
  List, 
  Search,
  Shield,
  Coins,
  Zap,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { showSuccess, showError, showConfirm } from '../utils/swal';

const API_BASE_URL = BASE_API + '/nertti_katan';
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

const NerttiKatan = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [formData, setFormData] = useState({
    devoteeName: '',
    nerthi: '',
    offering: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    thiruvilakkuPooja: 'no',
    newAccountPooja: 'no',
    vehiclePooja: 'no',
    chakraVehiclePooja: 'no',
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
      devoteeName: '',
      nerthi: '',
      offering: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      thiruvilakkuPooja: 'no',
      newAccountPooja: 'no',
      vehiclePooja: 'no',
      chakraVehiclePooja: 'no',
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
      form.append('devotee_name', formData.devoteeName);
      form.append('nerthi', formData.nerthi);
      form.append('offering', formData.offering);
      form.append('amount', formData.amount);
      form.append('date', formData.date);
      form.append('thiruvilakku_pooja', formData.thiruvilakkuPooja);
      form.append('new_account_pooja', formData.newAccountPooja);
      form.append('vehicle_pooja', formData.vehiclePooja);
      form.append('chakra_vehicle_pooja', formData.chakraVehiclePooja);
      form.append('status', formData.status);
      
      if (imageFile) {
        form.append('photo', imageFile);
      } else if (isEditMode) {
        // Keep existing image logic handled by COALESCE in backend
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
      devoteeName: item.devotee_name || '',
      nerthi: item.nerthi || '',
      offering: item.offering || '',
      amount: item.amount || '',
      date: item.date ? item.date.split('T')[0] : '',
      thiruvilakkuPooja: item.thiruvilakku_pooja || 'no',
      newAccountPooja: item.new_account_pooja || 'no',
      vehiclePooja: item.vehicle_pooja || 'no',
      chakraVehiclePooja: item.chakra_vehicle_pooja || 'no',
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
    item.devotee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.nerthi?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="form-card" style={{ maxWidth: '1400px' }}>
      <div className="form-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Heart size={24} color="#6366f1" />
          <h2 style={{ margin: 0, fontSize: '20px' }}>நேர்த்தி கடன் (Vows & Offerings)</h2>
        </div>
        <p style={{ fontSize: '13px' }}>பக்தர்களின் நேர்த்தி கடன் மற்றும் காணிக்கை விவரங்களை நிர்வகிக்கவும்.</p>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <form onSubmit={handleSave}>
          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <FormInput label="பக்தர் பெயர் *" name="devoteeName" value={formData.devoteeName} onChange={handleInputChange} icon={User} required />
            <FormInput label="நேர்த்தி கடன்" name="nerthi" value={formData.nerthi} onChange={handleInputChange} icon={Heart} />
            <FormInput label="காணிக்கை" name="offering" value={formData.offering} onChange={handleInputChange} icon={Gift} />
            
            <FormInput label="மதிப்பு (₹)" name="amount" value={formData.amount} onChange={handleInputChange} icon={Coins} type="number" />
            <FormInput label="தேதி" name="date" value={formData.date} onChange={handleInputChange} icon={Calendar} type="date" />
            
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

            <FormSelect 
              label="திருவிளக்கு பூஜை" name="thiruvilakkuPooja" value={formData.thiruvilakkuPooja} onChange={handleInputChange} icon={Activity}
              options={[{ value: 'yes', label: 'ஆம்' }, { value: 'no', label: 'இல்லை' }]}
            />
            <FormSelect 
              label="புதிய கணக்கு பூஜை" name="newAccountPooja" value={formData.newAccountPooja} onChange={handleInputChange} icon={FileText}
              options={[{ value: 'yes', label: 'ஆம்' }, { value: 'no', label: 'இல்லை' }]}
            />
            <FormSelect 
              label="வாகன பூஜை" name="vehiclePooja" value={formData.vehiclePooja} onChange={handleInputChange} icon={Zap}
              options={[{ value: 'yes', label: 'ஆம்' }, { value: 'no', label: 'இல்லை' }]}
            />
            <FormSelect 
              label="சக்கர வாகனம் பூஜை" name="chakraVehiclePooja" value={formData.chakraVehiclePooja} onChange={handleInputChange} icon={Activity}
              options={[{ value: 'yes', label: 'ஆம்' }, { value: 'no', label: 'இல்லை' }]}
            />
            <FormSelect 
              label="நிலை" name="status" value={formData.status} onChange={handleInputChange} icon={CheckCircle}
              options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]}
            />
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
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>நேர்த்தி கடன் பதிவுகள் (Records)</h3>
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
                <th>பக்தர் & நேர்த்தி</th>
                <th>காணிக்கை</th>
                <th>மதிப்பு (₹)</th>
                <th>தேதி</th>
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
                        <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#f1f5f9', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                          {item.image_path ? (
                            <img src={getImageUrl(item.image_path)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}><Camera size={16} /></div>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '13.5px' }}>{item.devotee_name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{item.nerthi || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: '#475569' }}>{item.offering || '-'}</td>
                    <td style={{ fontSize: '13px', fontWeight: '700', color: '#059669' }}>₹{item.amount || '0'}</td>
                    <td style={{ fontSize: '13px' }}>{item.date ? item.date.split('T')[0] : '-'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge-status ${item.status === 'active' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '11px' }}>
                        {item.status || 'active'}
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

export default NerttiKatan;
