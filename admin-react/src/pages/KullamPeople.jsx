import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  User, 
  MapPin, 
  Phone, 
  Home, 
  Edit2, 
  Trash2, 
  Save, 
  Eraser, 
  Users, 
  Activity, 
  PlusCircle, 
  RefreshCw, 
  List, 
  LayoutGrid,
  CheckCircle,
  Building2,
  PhoneCall,
  XCircle,
  Hash,
  Tag
} from 'lucide-react';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

const API_BASE_URL = BASE_API + '/kullam_people';

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

const FormSelect = ({ label, name, value, onChange, icon: Icon, options, required = false, placeholder = "" }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <div className="input-wrapper">
      {Icon && <Icon className="input-icon" size={16} />}
      <select 
        name={name}
        id={name}
        className="form-control" 
        value={value} 
        onChange={onChange}
        required={required}
        style={{ paddingLeft: Icon ? '38px' : '12px', height: '38px', fontSize: '13.5px', appearance: 'auto' }}
      >
        <option value="0">{placeholder || `Select ${label}`}</option>
        {options.map((opt, i) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const labelText = typeof opt === 'object' ? opt.label : opt;
          return <option key={i} value={val}>{labelText}</option>;
        })}
      </select>
    </div>
  </div>
);

const KullamPeople = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    vagaiyara: '0',
    entha_uru: '',
    district: '',
    pincode: '',
    vagaiyara_nickname: ''
  });

  const [data, setData] = useState([]);
  const [vagaiyaras, setVagaiyaras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
    fetchVagaiyaras();
  }, []);

  useEffect(() => {
    const fetchPincodeDetails = async () => {
      if (formData.pincode && formData.pincode.length === 6) {
        try {
          const response = await fetch(`https://localcity.jobes24x7.com/api/pincode/details/${formData.pincode}`);
          const res = await response.json();
          
          if (res.data?.result === 'Success' && res.data?.data?.length > 0) {
            const details = res.data.data[0];
            setFormData(prev => ({
              ...prev,
              entha_uru: details.city_name || details.taluk_name || prev.entha_uru,
              district: details.district_name || prev.district
            }));
          }
        } catch (error) {
          console.error('Error fetching pincode details:', error);
        }
      }
    };

    fetchPincodeDetails();
  }, [formData.pincode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}`);
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

  const fetchVagaiyaras = async () => {
    try {
      const res = await fetch(BASE_API + '/vagaiyaras');
      if (res.ok) {
        const json = await res.json();
        const apiData = json.data?.data || [];
        if (apiData.length > 0) {
          setVagaiyaras(apiData.map(v => ({
            value: v.vagaiyara_name_tamil || v.vagaiyara_name_english,
            label: v.vagaiyara_name_tamil ? `${v.vagaiyara_name_tamil} (${v.vagaiyara_name_english || ''})` : v.vagaiyara_name_english
          })));
          return;
        }
      }
    } catch (err) {
      console.error(err);
    }

    // Fallback to local storage or mock list
    const saved = localStorage.getItem('local_vagaiyaras');
    const localData = saved ? JSON.parse(saved) : [];
    if (localData.length > 0) {
      setVagaiyaras(localData.map(v => ({
        value: v.name_ta || v.name_en,
        label: v.name_ta ? `${v.name_ta} (${v.name_en || ''})` : v.name_en
      })));
    } else {
      setVagaiyaras([
        { value: 'முத்தையா வகைரா', label: 'முத்தையா வகைரா (Muthaiya Vagaiyara)' },
        { value: 'சின்னசாமி வகைரா', label: 'சின்னசாமி வகைரா (Chinnasamy Vagaiyara)' },
        { value: 'அண்ணாமலை வகைரா', label: 'அண்ணாமலை வகைரா (Annamalai Vagaiyara)' }
      ]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const clearForm = () => {
    setFormData({
      vagaiyara: '0',
      entha_uru: '',
      district: '',
      pincode: '',
      vagaiyara_nickname: ''
    });
    setEditingId(null);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (formData.vagaiyara === '0') {
      showWarning("வகைரா தேவை", "Vagaiyara is required");
      return;
    }

    try {
      const isEditMode = !!editingId;
      const url = isEditMode ? `${API_BASE_URL}/update/${editingId}` : `${API_BASE_URL}/create`;
      
      const submitData = {
        vagaiyara: formData.vagaiyara === '0' ? '' : formData.vagaiyara,
        entha_uru: formData.entha_uru,
        district: formData.district,
        pincode: formData.pincode,
        vagaiyara_nickname: formData.vagaiyara_nickname,
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
        showError("தோல்வி", "Failed to save member info");
      }
    } catch (err) {
      showError("தொடர்பு பிழை", "Connection error");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      vagaiyara: item.vagaiyara || '0',
      entha_uru: item.entha_uru || '',
      district: item.district || '',
      pincode: item.pincode || '',
      vagaiyara_nickname: item.vagaiyara_nickname || ''
    });
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
      showError("நீக்குவதில் பிழை", "Error deleting record");
    }
  };

  const filteredData = data.filter(item => 
    (item.vagaiyara || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.entha_uru || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.district || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.vagaiyara_nickname || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="form-card" style={{ maxWidth: '1400px' }}>
      <div className="form-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Users size={24} color="#6366f1" />
          <h2 style={{ margin: 0, fontSize: '20px' }}>பரம்பரையாக ஒரே ஊர் வசிப்பவர்கள்</h2>
        </div>
        <p style={{ fontSize: '13px' }}>கோவிலின் குல மக்கள் மற்றும் உறுப்பினர்களின் விவரங்களை இங்கே நிர்வகிக்கலாம்.</p>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <PlusCircle size={18} color="#6366f1" />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
            {editingId ? 'குடும்ப விவரத்தை மாற்ற (Edit Family)' : 'புதிய குடும்பத்தை சேர்க்க (Add New Family)'}
          </h3>
        </div>

        <div className="form-grid animate-fade-in" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <FormInput label="ஊர் (City)" name="entha_uru" value={formData.entha_uru} onChange={handleInputChange} icon={Home} placeholder="City/Town/Village..." />
          <FormSelect label="வகைரா (Select Vagaira) *" name="vagaiyara" value={formData.vagaiyara} onChange={handleInputChange} icon={Building2} options={vagaiyaras} placeholder="-- வகைரா தேர்ந்தெடுக்கவும் --" required />
          <FormInput label="குடும்பத்தின் பட்டப்பெயர் (Family Nickname)" name="vagaiyara_nickname" value={formData.vagaiyara_nickname} onChange={handleInputChange} icon={Tag} placeholder="Nickname..." />
          
          
          <FormInput label="மாவட்டம் (District)" name="district" value={formData.district} onChange={handleInputChange} icon={MapPin} placeholder="District..." />
          <FormInput label="அஞ்சல் குறியீடு (Pincode)" name="pincode" value={formData.pincode} onChange={handleInputChange} icon={Hash} placeholder="Pincode..." />

          <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={clearForm} className="btn btn-outline" style={{ height: '38px' }}>
              <Eraser size={16}/> Clear
            </button>
            <button type="button" onClick={handleSave} className="btn btn-primary" style={{ height: '38px' }}>
              {editingId ? <>Update <RefreshCw size={16} /></> : <>Save <Save size={16} /></>}
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <List size={18} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>உறுப்பினர்கள் பட்டியல் (Member Directory)</h3>
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
                <th>வகைரா & குடும்பத்தின் பட்டப்பெயர்</th>
                <th>முகவரி விவரங்கள்</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>பதிவுகள் இல்லை</td></tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: '700', color: '#6366f1', fontSize: '13px' }}>{idx + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Building2 size={16} color="#6366f1" />
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '13.5px' }}>{item.vagaiyara}</div>
                          {item.vagaiyara_nickname && (
                            <div style={{ fontSize: '11px', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <Tag size={10} /> {item.vagaiyara_nickname}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {item.entha_uru && <span><strong>ஊர்:</strong> {item.entha_uru}</span>}
                        {(item.district || item.pincode) && (
                          <span><strong>மாவட்டம்:</strong> {item.district}{item.pincode ? ` - ${item.pincode}` : ''}</span>
                        )}
                        {!item.entha_uru && !item.district && !item.pincode && <span>--</span>}
                      </div>
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

export default KullamPeople;
