import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { 
  Save, 
  RotateCcw, 
  Trash2, 
  Edit2, 
  Plus, 
  Calendar, 
  Clock, 
  Info, 
  Zap, 
  Truck, 
  User, 
  Heart, 
  Activity, 
  List, 
  RefreshCw, 
  PlusCircle, 
  FileText,
  Repeat,
  LayoutGrid
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

const API_BASE_URL = BASE_API + '/special_poojas';
const CURRENT_TEMPLE_ID = 1;

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

const FormSelect = ({ label, name, value, onChange, icon: Icon, options, required = false }) => (
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
        required={required}
        style={{ paddingLeft: Icon ? '42px' : '16px', appearance: 'auto' }}
      >
        <option value="">Select {label}</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  </div>
);

const SpecialPooja = () => {
  const location = useLocation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    repeatType: 'every_time', 
    ritualChange: 'no_change', 
    deitySelection: 'all', 
    transport: [], 
    deityId: '0',
    title: '',
    notes: '',
    date: '',
    time: '',
    day: '0',
    ritualTypes: [], 
    worshipMethod: '',
    benefits: '',
    prayers: '',
    overallNote: '',
    specialDayName: '',
    departureTime: ''
  });

  useEffect(() => {
    fetchData();
    if (location.state?.editItem) {
      handleRemoteEdit(location.state.editItem.rawId);
    }
  }, [location.state]);

  const handleRemoteEdit = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`);
      if (res.ok) {
        const json = await res.json();
        const data = json.data?.data || json.data || json;
        handleEdit(data[0] || data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/temple/${CURRENT_TEMPLE_ID}`);
      if (res.ok) {
        const json = await res.json();
        const rows = json.data?.data || [];
        const mappedData = rows.map(item => ({
          id: item.id,
          repeatType: item.repeat_type || 'every_time',
          ritualChange: item.ritual_change || 'no_change',
          deitySelection: item.deity_selection || 'all',
          transport: item.transport || '',
          deityId: item.deity_id || '0',
          title: item.title || '',
          notes: item.notes || '',
          date: item.date ? item.date.split('T')[0] : '',
          time: item.time || '',
          day: item.day || '0',
          ritualTypes: item.ritual_types || '',
          worshipMethod: item.worship_method || '',
          benefits: item.benefits || '',
          prayers: item.prayers || '',
          overallNote: item.overall_note || '',
          specialDayName: item.special_day_name || '',
          departureTime: item.departure_time || '',
          status: item.status || 'active',
          templeId: item.temple_id
        }));
        setData(mappedData);
      }
    } catch (err) {
      console.error("Error fetching special pooja data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const arrName = name === 'transport' ? 'transport' : 'ritualTypes';
      setFormData(prev => {
        const currentArr = Array.isArray(prev[arrName]) ? prev[arrName] : [];
        const newArr = checked ? [...currentArr, value] : currentArr.filter(v => v !== value);
        return { ...prev, [arrName]: newArr };
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const clearForm = () => {
    setFormData({
      repeatType: 'every_time',
      ritualChange: 'no_change',
      deitySelection: 'all',
      transport: [],
      deityId: '0',
      title: '',
      notes: '',
      date: '',
      time: '',
      day: '0',
      ritualTypes: [],
      worshipMethod: '',
      benefits: '',
      prayers: '',
      overallNote: '',
      specialDayName: '',
      departureTime: ''
    });
    setEditingId(null);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      const isEditMode = !!editingId;
      const url = isEditMode ? `${API_BASE_URL}/update/${editingId}` : `${API_BASE_URL}/create`;
      
      const payload = {
        repeat_type: formData.repeatType,
        ritual_change: formData.ritualChange,
        deity_selection: formData.deitySelection,
        transport: formData.transport.join(','),
        deity_id: formData.deityId,
        title: formData.title,
        notes: formData.notes,
        date: formData.date,
        time: formData.time ? (formData.time.length === 5 ? `${formData.time}:00` : formData.time) : null,
        day: formData.day,
        ritual_types: formData.ritualTypes.join(','),
        worship_method: formData.worshipMethod,
        benefits: formData.benefits,
        prayers: formData.prayers,
        overall_note: formData.overallNote,
        special_day_name: formData.specialDayName,
        departure_time: formData.departureTime ? (formData.departureTime.length === 5 ? `${formData.departureTime}:00` : formData.departureTime) : null,
        status: 'active',
        temple_id: CURRENT_TEMPLE_ID
      };

      const res = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showSuccess(`வெற்றிகரமாக ${isEditMode ? 'மாற்றப்பட்டது' : 'சேமிக்கப்பட்டது'}!`, `Successfully ${isEditMode ? 'updated' : 'saved'}!`);
        clearForm();
        fetchData();
      } else {
        showError("தோல்வி", "Failed to save special pooja");
      }
    } catch (err) {
      showError("தோல்வி", "Error saving record");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      repeatType: item.repeat_type || item.repeatType || 'every_time',
      ritualChange: item.ritual_change || item.ritualChange || 'no_change',
      deitySelection: item.deity_selection || item.deitySelection || 'all',
      transport: item.transport ? (typeof item.transport === 'string' ? item.transport.split(',') : item.transport) : [],
      deityId: item.deity_id || item.deityId || '0',
      title: item.title || '',
      notes: item.notes || '',
      date: item.date ? (typeof item.date === 'string' ? item.date.split('T')[0] : item.date) : '',
      time: item.time ? item.time.substring(0, 5) : '',
      day: item.day || '0',
      ritualTypes: item.ritual_types || item.ritualTypes ? (typeof (item.ritual_types || item.ritualTypes) === 'string' ? (item.ritual_types || item.ritualTypes).split(',') : (item.ritual_types || item.ritualTypes)) : [],
      worshipMethod: item.worship_method || item.worshipMethod || '',
      benefits: item.benefits || '',
      prayers: item.prayers || '',
      overallNote: item.overall_note || item.overallNote || '',
      specialDayName: item.special_day_name || item.specialDayName || '',
      departureTime: item.departure_time || item.departureTime ? (item.departure_time || item.departureTime).substring(0, 5) : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const result = await showConfirm("நிச்சயமாக நீக்க வேண்டுமா?", "Are you sure you want to delete this record?");
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API_BASE_URL}/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (editingId === id) clearForm();
        fetchData();
        showSuccess("நீக்கப்பட்டது", "Record deleted successfully");
      }
    } catch (err) {
      showError("நீக்குவதில் பிழை", "Error deleting record");
    }
  };

  return (
    <div className="form-card" style={{ maxWidth: '1400px' }}>
      <div className="form-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Zap size={28} color="#6366f1" />
          <h2 style={{ margin: 0 }}>சிறப்பு பூஜைகள் (Special Poojas)</h2>
        </div>
        <p>விசேஷ தினங்கள் மற்றும் விசேஷ காலங்களுக்கான சிறப்பு பூஜைகளை இங்கே நிர்வகிக்கலாம்.</p>
      </div>

      <div className="card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <PlusCircle size={20} color="#6366f1" />
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
            {editingId ? 'சிறப்பு பூஜை விவரத்தை மாற்ற (Edit Special Pooja)' : 'புதிய சிறப்பு பூஜை பதிவு (Add New Special Pooja)'}
          </h3>
        </div>

        <div className="form-grid">
          {/* Radio Group: Repeat Type */}
          <div className="form-group" style={{ gridColumn: 'span 1' }}>
            <label className="form-label">நிகழ்வு முறை (Repeat Type)</label>
            <div style={{ display: 'flex', gap: '16px', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                <input type="radio" name="repeatType" value="every_time" checked={formData.repeatType === 'every_time'} onChange={handleInputChange} /> ஒவ்வொரு முறையும்
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                <input type="radio" name="repeatType" value="one_time" checked={formData.repeatType === 'one_time'} onChange={handleInputChange} /> ஒருமுறை மட்டும்
              </label>
            </div>
          </div>

          {/* Radio Group: Ritual Change */}
          <div className="form-group" style={{ gridColumn: 'span 1' }}>
            <label className="form-label">நித்திய பூஜை மாற்றம்</label>
            <div style={{ display: 'flex', gap: '16px', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                <input type="radio" name="ritualChange" value="change" checked={formData.ritualChange === 'change'} onChange={handleInputChange} /> மாற்றம் உண்டு
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                <input type="radio" name="ritualChange" value="no_change" checked={formData.ritualChange === 'no_change'} onChange={handleInputChange} /> மாற்றம் இல்லை
              </label>
            </div>
          </div>

          <FormSelect 
            label="தெய்வங்கள் (Deity Selection)" 
            name="deityId" 
            value={formData.deityId} 
            onChange={handleInputChange} 
            icon={User}
            options={[
              { value: 'all', label: 'அனைத்து தெய்வங்கள்' },
              { value: 'moolavar', label: 'மூலவர் மட்டும்' },
              { value: 'udanurai', label: 'உடனூறை/ அம்பாள்' },
              { value: 'dakshinamurthy', label: 'தக்ஷிணாமூர்த்தி' },
              { value: 'chandikeswarar', label: 'சண்டிகேஸ்வரர்' },
              { value: 'bhairavar', label: 'கால பைரவர்' },
              { value: 'navagraha', label: 'நவ நாயகர்கள்' }
            ]} 
          />

          <div className="form-group" style={{ gridColumn: 'span 3' }}>
            <label className="form-label">தேர்வு செய்த தெய்வங்கள் எல்லை (Scope)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
               {[
                 { id: 'all', label: 'அனைத்து தெய்வங்கள்' },
                 { id: 'moolavar', label: 'மூலவர் மட்டும்' },
                 { id: 'moolavar_special', label: 'மூலவர், சிறப்பு உரிய தெய்வங்கள்' },
                 { id: 'special_only', label: 'சிறப்பு பூஜை தெய்வங்கள் மட்டும்' }
               ].map(opt => (
                 <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                   <input type="radio" name="deitySelection" value={opt.id} checked={formData.deitySelection === opt.id} onChange={handleInputChange} /> {opt.label}
                 </label>
               ))}
            </div>
          </div>

          <FormInput label="பூஜையின் தலைப்பு (Title)" name="title" value={formData.title} onChange={handleInputChange} icon={Zap} placeholder="பூஜையின் பெயர்..." required />
          <FormInput label="விசேஷ தினத்தின் பெயர்" name="specialDayName" value={formData.specialDayName} onChange={handleInputChange} icon={Calendar} placeholder="தினத்தின் பெயர்..." />
          <FormInput label="பூஜை தேதி (Date)" name="date" value={formData.date} onChange={handleInputChange} icon={Calendar} type="date" />
          <FormInput label="பூஜை நேரம் (Time)" name="time" value={formData.time} onChange={handleInputChange} icon={Clock} type="time" />
          
          <FormSelect 
            label="கிழமை (Day)" 
            name="day" 
            value={formData.day} 
            onChange={handleInputChange} 
            icon={Calendar}
            options={['ஞாயிற்றுக்கிழமை', 'திங்கட்கிழமை', 'செவ்வாய்', 'புதன்கிழமை', 'வியாழக்கிழமை', 'வெள்ளி', 'சனிக்கிழமை'].map(d => ({ value: d, label: d }))} 
          />

          <FormInput label="புறப்பாடு நேரம்" name="departureTime" value={formData.departureTime} onChange={handleInputChange} icon={Clock} type="time" />

          <div className="form-group" style={{ gridColumn: 'span 3' }}>
            <label className="form-label">போக்குவரத்து / ஊர்வலம் (Transport)</label>
            <div style={{ display: 'flex', gap: '24px', background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
               {['வாகனம்', 'தோளில் சுமந்து செல்வது', 'தேர்'].map(v => (
                 <label key={v} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', color: '#475569' }}>
                   <input type="checkbox" name="transport" value={v} checked={formData.transport.includes(v)} onChange={handleInputChange} className="form-check-input" /> {v}
                 </label>
               ))}
            </div>
          </div>

          <FormInput label="வழிபாட்டு முறை" name="worshipMethod" value={formData.worshipMethod} onChange={handleInputChange} icon={Activity} placeholder="வழிபாட்டு முறை..." />
          <FormInput label="பூஜையின் பலன்கள்" name="benefits" value={formData.benefits} onChange={handleInputChange} icon={Heart} placeholder="பலன்கள்..." />
          <FormInput label="வேண்டுதல்கள்" name="prayers" value={formData.prayers} onChange={handleInputChange} icon={FileText} placeholder="வேண்டுதல்கள்..." />
          <FormInput label="பூஜை குறிப்பு" name="notes" value={formData.notes} onChange={handleInputChange} icon={FileText} placeholder="குறிப்புகள்..." />
          <FormInput label="ஒட்டுமொத்த குறிப்பு" name="overallNote" value={formData.overallNote} onChange={handleInputChange} icon={FileText} placeholder="கூடுதல் தகவல்கள்..." />

          <div className="form-group" style={{ gridColumn: 'span 3' }}>
            <label className="form-label">வழிபாட்டு சடங்குகள் (Rituals)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
               {['அபிஷேகம்', 'தீர்த்தம்', 'அலங்காரம்', 'நெய்வேத்தியம்', 'ஆராதனை', 'பாராயணம்', 'விண்ணப்பம்'].map(r => (
                 <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', color: '#475569' }}>
                   <input type="checkbox" name="ritualTypes" value={r} checked={formData.ritualTypes.includes(r)} onChange={handleInputChange} className="form-check-input" /> {r}
                 </label>
               ))}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button onClick={clearForm} className="btn btn-outline">
            <RotateCcw size={18}/> Clear Form
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            {editingId ? <>Update Ritual <RefreshCw size={18} /></> : <>Save Special Pooja <Save size={18} /></>}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <List size={20} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>சிறப்பு பூஜைகள் பட்டியல் (Special Pooja List)</h3>
          </div>
          <button onClick={fetchData} className="btn btn-outline" style={{ padding: '8px 12px' }}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>தலைப்பு & விசேஷ தினம்</th>
                <th>தேதி & நேரம்</th>
                <th>தெய்வம்</th>
                <th>முறை</th>
                <th style={{ textAlign: 'center' }}>நிலை</th>
                <th className="sticky-column" style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '60px' }}>Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>பதிவுகள் எதுவும் இல்லை</td></tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: '700', color: '#6366f1' }}>{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{item.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{item.specialDayName || '-'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{item.date || '-'}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{item.time || '-'}</div>
                    </td>
                    <td>
                      <span className="badge-status" style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px' }}>
                        {item.deityId || '-'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                        <Repeat size={14} color="#94a3b8" />
                        {item.repeatType === 'every_time' ? 'ஒவ்வொரு முறையும்' : 'ஒருமுறை மட்டும்'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge-status badge-success">
                        {item.status || 'active'}
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

export default SpecialPooja;
