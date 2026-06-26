import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { 
  Edit2, 
  Trash2, 
  Save, 
  Eraser, 
  Gift, 
  Users, 
  Heart, 
  ClipboardList, 
  Clock, 
  Calendar, 
  IndianRupee, 
  Activity, 
  PlusCircle, 
  RefreshCw, 
  List, 
  Utensils, 
  CheckCircle,
  AlertCircle,
  Search,
  UserCheck,
  Camera
} from 'lucide-react';
import { showSuccess, showError, showConfirm, showWarning } from '../utils/swal';

const API_BASE_URL = BASE_API + '/annatanam';
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

const Annatanam = () => {
  const [formData, setFormData] = useState({
    occasion: '',
    group: '',
    sponsors: '',
    benefits: '',
    count: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    status: 'active'
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

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
      occasion: '',
      group: '',
      sponsors: '',
      benefits: '',
      count: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
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
      form.append('special_event', formData.occasion);
      form.append('annadhanam_group', formData.group);
      form.append('sponsor_name', formData.sponsors);
      form.append('benefits', formData.benefits);
      form.append('count', formData.count);
      form.append('amount', formData.amount);
      form.append('date', formData.date);
      form.append('start_time', formData.startTime);
      form.append('end_time', formData.endTime);
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
      occasion: item.special_event || '',
      group: item.annadhanam_group || '',
      sponsors: item.sponsor_name || '',
      benefits: item.benefits || '',
      count: item.count || '',
      amount: item.amount || '',
      date: item.date ? item.date.split('T')[0] : '',
      startTime: item.start_time || '',
      endTime: item.end_time || '',
      status: item.status || 'active'
    });
    setImagePreview(item.image_path ? getImageUrl(item.image_path) : '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const result = await showConfirm("நிச்சயமாக நீக்க வேண்டுமா?", "Are you sure you want to delete this record?");
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API_BASE_URL}/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
        showSuccess("நீக்கப்பட்டது", "Record deleted successfully");
      }
    } catch (err) {
      showError("நீக்குவதில் பிழை", "Error deleting record");
    }
  };

  const filteredData = data.filter(item => 
    (item.special_event || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.annadhanam_group || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="form-card" style={{ maxWidth: '1400px' }}>
      <div className="form-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Utensils size={24} color="#6366f1" />
          <h2 style={{ margin: 0, fontSize: '20px' }}>அன்ன தானம் (Annadhanam Service)</h2>
        </div>
        <p style={{ fontSize: '13px' }}>கோவிலின் உணவு சேவை மற்றும் கட்டளைதாரர்கள் விவரங்களை நிர்வகிக்கவும்.</p>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <form onSubmit={handleSave}>
          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <FormInput label="விசேஷம் *" name="occasion" value={formData.occasion} onChange={handleInputChange} icon={Gift} required />
            <FormInput label="அன்னதான குழு" name="group" value={formData.group} onChange={handleInputChange} icon={Users} />
            <FormInput label="கட்டளை தாரர்கள்" name="sponsors" value={formData.sponsors} onChange={handleInputChange} icon={Heart} />
            
            <FormInput label="எண்ணிக்கை" name="count" value={formData.count} onChange={handleInputChange} icon={Users} type="number" />
            <FormInput label="தொகை (₹)" name="amount" value={formData.amount} onChange={handleInputChange} icon={IndianRupee} type="number" />
            <FormInput label="தேதி *" name="date" value={formData.date} onChange={handleInputChange} icon={Calendar} type="date" required />
            
            <FormInput label="ஆரம்ப நேரம்" name="startTime" value={formData.startTime} onChange={handleInputChange} icon={Clock} type="time" />
            <FormInput label="இறுதி நேரம்" name="endTime" value={formData.endTime} onChange={handleInputChange} icon={Clock} type="time" />
            
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

            <div style={{ gridColumn: 'span 3' }}>
              <FormInput label="பலன்கள் (Benefits)" name="benefits" value={formData.benefits} onChange={handleInputChange} icon={ClipboardList} placeholder="பலன்கள்..." />
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button type="button" onClick={clearForm} className="btn btn-outline" style={{ height: '38px' }}>
              <Eraser size={16}/> Clear
            </button>
            <button type="submit" className="btn btn-primary" style={{ height: '38px' }}>
              {editingId ? <>Update Service <RefreshCw size={16} /></> : <>Save Service <Save size={16} /></>}
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <List size={18} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>அன்னதான விவரங்கள் (Records)</h3>
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
                <th>விசேஷம் & குழு</th>
                <th>கட்டளை தாரர்கள்</th>
                <th>எண்ணிக்கை</th>
                <th>மதிப்பு (₹)</th>
                <th>தேதி & நேரம்</th>
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
                        <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: '#f5f3ff', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {item.image_path ? (
                            <img src={getImageUrl(item.image_path)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Utensils size={16} color="#6366f1" />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '13.5px' }}>{item.special_event}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{item.annadhanam_group || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px' }}>{item.sponsor_name || '-'}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{item.count || '0'}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#059669' }}>₹{item.amount || '0'}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px' }}>{item.date ? item.date.split('T')[0] : '-'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{item.start_time || '-'}</div>
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

export default Annatanam;
