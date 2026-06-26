import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Plus, 
  Save, 
  Trash2, 
  Edit2, 
  RotateCcw, 
  X, 
  Search, 
  Activity, 
  User, 
  Info, 
  Settings, 
  Heart, 
  Calendar, 
  FileText, 
  PlusCircle, 
  List,
  RefreshCw,
  Camera
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

const FormInput = ({ label, name, value, onChange, icon: Icon, placeholder, type = "text", readOnly = false, required = false }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <div className="input-wrapper">
      {Icon && <Icon className="input-icon" size={18} />}
      <input 
        type={type} 
        name={name}
        id={name}
        className={`form-control ${readOnly ? 'readonly' : ''}`}
        placeholder={placeholder}
        value={value} 
        onChange={onChange} 
        readOnly={readOnly}
        required={required} 
        style={Icon ? {} : { paddingLeft: '16px' }}
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
        style={{ paddingLeft: Icon ? '42px' : '16px', appearance: 'auto' }}
      >
        <option value="">Select {label}</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  </div>
);

const DeityModule = ({ title, apiEndpoint, templeId = 1 }) => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    deitySpeciality: '',
    worshipMethod: '',
    prayerRequest: '',
    notes: '',
    specialName: '',
    specialDays: '',
    specialPuja: '',
    fastings: '',
    separateSannidhi: false,
    deivamType: '',
    status: 'Active'
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
    if (location.state?.editItem) {
      handleEdit(location.state.editItem);
    }
  }, [apiEndpoint, location.state]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiEndpoint}/temple/${templeId}`);
      if (res.ok) {
        const json = await res.json();
        const resultData = json.data || json;
        setData(Array.isArray(resultData) ? resultData : (resultData?.data || []));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearForm = () => {
    setFormData({
      name: '', deitySpeciality: '', worshipMethod: '', prayerRequest: '', notes: '',
      specialName: '', specialDays: '', specialPuja: '', fastings: '',
      separateSannidhi: false, deivamType: '', status: 'Active'
    });
    setPhotoFile(null);
    setPreviewUrl('');
    setEditingId(null);
    const fileInput = document.getElementById('deityPhoto');
    if (fileInput) fileInput.value = '';
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name) {
      showWarning('பெயர் தேவை', 'Name is required');
      return;
    }

    try {
      const isEditMode = !!editingId;
      const url = isEditMode ? `${apiEndpoint}/update/${editingId}` : `${apiEndpoint}/save`;
      
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      formDataToSend.append('temple_id', templeId);
      
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }

      const res = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        body: formDataToSend
      });

      if (res.ok) {
        showSuccess(isEditMode ? 'வெற்றிகரமாக மாற்றப்பட்டது' : 'வெற்றிகரமாக சேமிக்கப்பட்டது', isEditMode ? 'Updated Successfully!' : 'Saved Successfully!');
        clearForm();
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        showError('தோல்வி', errData.message || 'Failed to save');
      }
    } catch (err) {
      console.error(err);
      showError('தொடர்பு பிழை', 'Connection error');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name || '',
      deitySpeciality: item.deitySpeciality || '',
      worshipMethod: item.worshipMethod || '',
      prayerRequest: item.prayerRequest || '',
      notes: item.notes || '',
      specialName: item.specialName || '',
      specialDays: item.specialDays || '',
      specialPuja: item.specialPuja || '',
      fastings: item.fastings || '',
      separateSannidhi: item.separateSannidhi === true || item.separateSannidhi === 'true',
      deivamType: item.deivamType || '',
      status: item.status || 'Active'
    });
    if (item.photo) {
      setPreviewUrl(`${BASE_API}/files/${item.photo}`);
    } else {
      setPreviewUrl('');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const result = await showConfirm('நிச்சயமாக நீக்க வேண்டுமா?', "Are you sure you want to delete?");
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${apiEndpoint}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (editingId === id) clearForm();
        fetchData();
        showSuccess("நீக்கப்பட்டது", "Record deleted successfully");
      }
    } catch (err) {
      console.error(err);
      showError('நீக்குவதில் பிழை', 'Error deleting');
    }
  };

  const filteredData = data.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.deitySpeciality?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="form-card" style={{ maxWidth: '1400px' }}>
      <div className="form-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Settings size={28} color="#6366f1" />
          <h2 style={{ margin: 0 }}>{title}</h2>
        </div>
        <p>கோவிலின் {title.toLowerCase()} விவரங்களை இங்கே நிர்வகிக்கலாம்.</p>
      </div>

      <div className="card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <PlusCircle size={20} color="#6366f1" />
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
            {editingId ? 'விவரத்தை மாற்ற (Edit Deity)' : 'புதிய பதிவு (Add New Deity)'}
          </h3>
        </div>
        
        <div className="form-grid">
          <FormInput label="பெயர்" name="name" value={formData.name} onChange={handleInputChange} icon={User} placeholder="தெய்வத்தின் பெயர்..." required />
          
          <div className="form-group">
            <label className="form-label">புகைப்படம்</label>
            <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '12px', textAlign: 'center', background: '#f8fafc', position: 'relative' }}>
              <input type="file" id="deityPhoto" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              <label htmlFor="deityPhoto" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Camera size={20} color="#94a3b8" />
                <span style={{ fontSize: '13px', color: '#64748b' }}>புகைப்படம் தேர்வு செய்</span>
              </label>
              {previewUrl && (
                <div style={{ marginTop: '10px', position: 'relative', display: 'inline-block' }}>
                  <img src={previewUrl} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} alt="Preview" />
                  <button type="button" onClick={() => { setPreviewUrl(''); setPhotoFile(null); }} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={10}/>
                  </button>
                </div>
              )}
            </div>
          </div>

          <FormInput label="இறைவனின் சிறப்பு" name="deitySpeciality" value={formData.deitySpeciality} onChange={handleInputChange} icon={Info} placeholder="சிறப்பு..." />
          <FormInput label="வழிபாட்டு முறை" name="worshipMethod" value={formData.worshipMethod} onChange={handleInputChange} icon={Activity} placeholder="வழிபாட்டு முறை..." />
          <FormInput label="பிரார்த்தனை வேண்டுதல்" name="prayerRequest" value={formData.prayerRequest} onChange={handleInputChange} icon={Heart} placeholder="வேண்டுதல்..." />
          <FormInput label="குறிப்பு" name="notes" value={formData.notes} onChange={handleInputChange} icon={FileText} placeholder="குறிப்புகள்..." />
          <FormInput label="விசேஷ பெயர்" name="specialName" value={formData.specialName} onChange={handleInputChange} icon={User} placeholder="விசேஷ பெயர்..." />
          <FormInput label="விசேஷ நாட்கள்" name="specialDays" value={formData.specialDays} onChange={handleInputChange} icon={Calendar} placeholder="நாட்கள்..." />
          <FormInput label="சிறப்பு பூஜை" name="specialPuja" value={formData.specialPuja} onChange={handleInputChange} icon={Settings} placeholder="பூஜை..." />
          <FormInput label="விரதகள்" name="fastings" value={formData.fastings} onChange={handleInputChange} icon={Activity} placeholder="விரதங்கள்..." />
          
          <FormSelect 
            label="தெய்வம்" 
            name="deivamType" 
            value={formData.deivamType} 
            onChange={handleInputChange} 
            icon={User}
            options={[
              { value: 'male', label: 'ஆண் தெய்வம்' },
              { value: 'female', label: 'பெண் தெய்வம்' },
              { value: 'other', label: 'மற்றவை' }
            ]} 
          />

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#f8fafc', padding: '14px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input type="checkbox" id="separateSannidhi" name="separateSannidhi" checked={formData.separateSannidhi} onChange={handleInputChange} className="form-check-input" />
              <label htmlFor="separateSannidhi" style={{ fontWeight: '600', fontSize: '14px', cursor: 'pointer', color: '#475569' }}>தனி சன்னதி உள்ளது (Separate Sannidhi)</label>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={clearForm} className="btn btn-outline">
            <RotateCcw size={18}/> Clear Form
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            {editingId ? <>Update Record <RefreshCw size={18} /></> : <>Save Record <Save size={18} /></>}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <List size={20} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{title} பட்டியல்</h3>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="input-wrapper" style={{ width: '250px' }}>
              <Search className="input-icon" size={16} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="பெயர் மூலம் தேடு..." 
                style={{ height: '38px', fontSize: '13px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={fetchData} className="btn btn-outline" style={{ padding: '8px 12px' }}>
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>
        
        <div className="table-container" style={{ border: 'none' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>பெயர்</th>
                <th>சிறப்பு</th>
                <th>வழிபாட்டு முறை</th>
                <th>விரதகள்</th>
                <th>வகை</th>
                <th style={{ textAlign: 'center' }}>நிலை</th>
                <th className="sticky-column" style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '60px' }}>Loading...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>பதிவுகள் எதுவும் இல்லை</td></tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: '700', color: '#6366f1' }}>{idx + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item.photo ? (
                          <img src={`${BASE_API}/files/${item.photo}`} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} alt="Deity" />
                        ) : (
                          <div style={{ width: '32px', height: '32px', background: '#f1f5f9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={16} color="#cbd5e1" />
                          </div>
                        )}
                        <span style={{ fontWeight: '600' }}>{item.name}</span>
                      </div>
                    </td>
                    <td>{item.deitySpeciality || '-'}</td>
                    <td>{item.worshipMethod || '-'}</td>
                    <td>{item.fastings || '-'}</td>
                    <td>
                      <span className="badge-status" style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px' }}>
                        {item.deivamType === 'male' ? 'ஆண்' : item.deivamType === 'female' ? 'பெண்' : 'மற்றவை'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge-status ${item.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="sticky-column">
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button className="icon-action" onClick={() => handleEdit(item)} title="Edit"><Edit2 size={16}/></button>
                        <button className="icon-action" style={{ color: '#ef4444', background: '#fef2f2' }} onClick={() => handleDelete(item.id)} title="Delete"><Trash2 size={16}/></button>
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

export default DeityModule;
