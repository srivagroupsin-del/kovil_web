import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw, 
  FileText, 
  Phone, 
  User, 
  Edit2, 
  Trash2, 
  Plus, 
  Save, 
  Briefcase, 
  Activity, 
  PlusCircle, 
  Eraser, 
  List, 
  CheckCircle,
  PhoneCall,
  UserCheck,
  XCircle,
  ShieldCheck
} from 'lucide-react';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

const API_BASE_URL = BASE_API + '/kattali';

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

const Kattali = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    phone: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE_URL);
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

  const clearForm = () => {
    setFormData({ name: '', designation: '', phone: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name) {
      showWarning("பெயர் தேவை", "Name is required");
      return;
    }

    try {
      const isEditMode = !!editingId;
      const url = isEditMode ? `${API_BASE_URL}/update/${editingId}` : `${API_BASE_URL}/create`;
      
      const submitData = {
        name: formData.name,
        designation: formData.designation,
        phone_number: formData.phone,
        status: 'active'
      };

      const res = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (res.ok) {
        showSuccess(`வெற்றிகரமாக ${isEditMode ? 'மாற்றப்பட்டது' : 'சேமிக்கப்பட்டது'}!`, `Successfully ${isEditMode ? 'updated' : 'saved'}!`);
        clearForm();
        fetchData();
      } else {
        showError("தோல்வி", "Failed to save official info");
      }
    } catch (err) {
      showError("தொடர்பு பிழை", "Connection error");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name || '',
      designation: item.designation || '',
      phone: item.phone_number || ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const result = await showConfirm("நிச்சயமாக நீக்க வேண்டுமா?", "Are you sure?");
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API_BASE_URL}/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (editingId === id) clearForm();
        fetchData();
        showSuccess("நீக்கப்பட்டது", "Deleted");
      }
    } catch (err) {
      showError("நீக்குவதில் பிழை", "Error deleting");
    }
  };

  const filteredData = data.filter(item => 
    (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.designation || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="form-card" style={{ maxWidth: '1400px' }}>
      <div className="form-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <ShieldCheck size={24} color="#6366f1" />
          <h2 style={{ margin: 0, fontSize: '20px' }}>கட்டளை தரங்கள் (HR & CE Officials)</h2>
        </div>
        <p style={{ fontSize: '13px' }}>இந்து சமய அறநிலையத்துறை அதிகாரிகள் மற்றும் ஊழியர்களின் விவரங்களை நிர்வகிக்கவும்.</p>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showForm ? '20px' : '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={18} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
              {editingId ? 'அதிகாரி விவரத்தை மாற்ற (Edit)' : 'புதிய அதிகாரி (Add New)'}
            </h3>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ height: '36px', padding: '0 16px', fontSize: '13px' }}>
            {showForm ? <><XCircle size={14} /> Cancel</> : <><Plus size={14} /> Add Official</>}
          </button>
        </div>

        {showForm && (
          <div className="form-grid animate-fade-in" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <FormInput label="பெயர் (Name) *" name="name" value={formData.name} onChange={handleInputChange} icon={User} placeholder="Name..." required />
            <FormInput label="பதவி (Designation)" name="designation" value={formData.designation} onChange={handleInputChange} icon={Briefcase} placeholder="Designation..." />
            <FormInput label="தொலைபேசி (Phone)" name="phone" value={formData.phone} onChange={handleInputChange} icon={PhoneCall} placeholder="Phone No..." />
            
            <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button type="button" onClick={clearForm} className="btn btn-outline" style={{ height: '38px' }}>
                <Eraser size={16}/> Clear
              </button>
              <button type="button" onClick={handleSave} className="btn btn-primary" style={{ height: '38px' }}>
                {editingId ? <>Update <RefreshCw size={16} /></> : <>Save <Save size={16} /></>}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <List size={18} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>அதிகாரிகள் பட்டியல் (Records)</h3>
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
                <th>அதிகாரி பெயர்</th>
                <th>பதவி</th>
                <th>தொலைபேசி</th>
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
                          <User size={16} color="#6366f1" />
                        </div>
                        <div style={{ fontWeight: '600', fontSize: '13.5px' }}>{item.name}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>{item.designation || '--'}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#6366f1' }}>{item.phone_number || '--'}</div>
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

export default Kattali;
