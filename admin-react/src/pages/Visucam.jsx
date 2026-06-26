import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Save, 
  Edit2,
  Trash2,
  FileText,
  XCircle,
  PlusCircle,
  RefreshCw,
  List,
  Activity,
  UserCheck,
  Camera,
  Search,
  Eraser,
  ShieldCheck
} from 'lucide-react';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

const API_BASE_URL = BASE_API + '/visucam';
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

const Visucam = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [formData, setFormData] = useState({
    generalMember: '',
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
      generalMember: '',
      status: 'active'
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
      status: item.status || 'active'
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
    (item.general_member || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="form-card" style={{ maxWidth: '1400px' }}>
      <div className="form-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <ShieldCheck size={24} color="#6366f1" />
          <h2 style={{ margin: 0, fontSize: '20px' }}>பக்தர்கள் குழு (Committee)</h2>
        </div>
        <p style={{ fontSize: '13px' }}>கோவிலின் உறுப்பினர்களின் விவரங்களை இங்கே நிர்வகிக்கலாம்.</p>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <form onSubmit={handleSave}>
          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <FormInput label="உறுப்பினர் பெயர் *" name="generalMember" value={formData.generalMember} onChange={handleInputChange} icon={UserCheck} required />
            
            <div className="form-group">
              <label className="form-label">ஆவணம் / புகைப்படம்</label>
              <div 
                className="photo-upload-area"
                onClick={() => document.getElementById('photoInput').click()}
                style={{ height: '38px', padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                  <Camera size={16} />
                  <span>{imageFile ? imageFile.name : (editingId && imagePreview ? 'ஆவணம் உள்ளது' : 'பதிவேற்றவும்')}</span>
                </div>
                {imagePreview && <div style={{ width: '24px', height: '24px', borderRadius: '4px', overflow: 'hidden' }}><img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
              </div>
              <input type="file" id="photoInput" hidden onChange={handleFileChange} accept="image/*,application/pdf" />
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button type="button" onClick={clearForm} className="btn btn-outline" style={{ height: '38px' }}>
              <Eraser size={16}/> Clear
            </button>
            <button type="submit" className="btn btn-primary" style={{ height: '38px' }}>
              {editingId ? <>Update Member <RefreshCw size={16} /></> : <>Save Member <Save size={16} /></>}
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <List size={18} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>உறுப்பினர் பட்டியல் (Directory)</h3>
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
                <th>உறுப்பினர் பெயர்</th>
                <th>ஆவணம்</th>
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
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <UserCheck size={16} color="#6366f1" />
                        </div>
                        <div style={{ fontWeight: '600', fontSize: '13.5px' }}>{item.general_member}</div>
                      </div>
                    </td>
                    <td>
                      {item.executive_member_file ? (
                        <a href={getImageUrl(item.executive_member_file)} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6366f1', textDecoration: 'none', fontWeight: '600', fontSize: '12px' }}>
                          <FileText size={14} /> View
                        </a>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>--</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge-status badge-success" style={{ fontSize: '11px' }}>
                        Active
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

export default Visucam;
