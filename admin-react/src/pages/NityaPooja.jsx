import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Info, 
  CheckSquare, 
  Plus, 
  Save, 
  Trash2, 
  Edit2, 
  RotateCcw, 
  AlertCircle,
  Activity,
  List,
  RefreshCw,
  PlusCircle,
  FileText,
  Sunrise,
  Sunset,
  Moon,
  Zap
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

const API_BASE_URL = BASE_API + '/nitya_poojas';
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

const NityaPooja = () => {
  const location = useLocation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    day: '',
    poojaTime: '',
    poojaName: '',
    session: '',
    details: '',
    time: '',
    abhishekam: '',
    theertham: '',
    alangaram: '',
    naivedyam: '',
    aradhanai: '',
    parayanam: '',
    mahaDeepAradhanai: '',
    poojaNotes: '',
    extraAlangaram: '',
    extraSandanam: '',
    poojaVagai: ''
  });

  const [poojaVagaiArray, setPoojaVagaiArray] = useState([]);

  useEffect(() => {
    fetchData();
    // Check if we arrived here with an item to edit
    if (location.state?.editItem) {
      // Need to fetch full detail or just use what we have
      const item = location.state.editItem;
      // The master list mapping might be slightly different, so we might need to fetch the real item
      handleRemoteEdit(item.rawId);
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
          day: item.day || '',
          poojaTime: item.pooja_time || '',
          poojaName: item.pooja_name || '',
          session: item.session || '',
          details: item.details || '',
          time: item.time || '',
          abhishekam: item.abhishekam || '',
          theertham: item.theertham || '',
          alangaram: item.alangaram || '',
          naivedyam: item.naivedyam || '',
          aradhanai: item.aradhanai || '',
          parayanam: item.parayanam || '',
          mahaDeepAradhanai: item.maha_deep_aradhanai || '',
          poojaNotes: item.pooja_notes || '',
          extraAlangaram: item.extra_alangaram || '',
          extraSandanam: item.extra_sandanam || '',
          poojaVagai: item.pooja_vagai || '',
          status: item.status || 'active',
          deityType: item.deity_type || '',
          poojaType: item.pooja_type || '',
          templeId: item.temple_id
        }));
        setData(mappedData);
      }
    } catch (err) {
      console.error("Error fetching nitya pooja data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    let newVagai = [...poojaVagaiArray];
    if (checked) {
      newVagai.push(value);
    } else {
      newVagai = newVagai.filter(v => v !== value);
    }
    setPoojaVagaiArray(newVagai);
    setFormData(prev => ({ ...prev, poojaVagai: newVagai.join(',') }));
  };

  const clearForm = () => {
    setFormData({
      day: '', poojaTime: '', poojaName: '', session: '', details: '', time: '',
      abhishekam: '', theertham: '', alangaram: '', naivedyam: '', aradhanai: '',
      parayanam: '', mahaDeepAradhanai: '', poojaNotes: '', extraAlangaram: '',
      extraSandanam: '', poojaVagai: ''
    });
    setPoojaVagaiArray([]);
    setEditingId(null);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!formData.day || !formData.poojaTime || !formData.poojaName || !formData.session) {
      showWarning("தேவையான புலங்களை நிரப்பவும்", "Please fill required fields (Day, Pooja Time, Pooja Name, and Session)");
      return;
    }

    try {
      const isEditMode = !!editingId;
      const url = isEditMode ? `${API_BASE_URL}/update/${editingId}` : `${API_BASE_URL}/create`;
      
      const payload = {
        day: formData.day,
        pooja_time: formData.poojaTime,
        pooja_name: formData.poojaName,
        session: formData.session,
        details: formData.details,
        time: formData.time ? (formData.time.length === 5 ? `${formData.time}:00` : formData.time) : null,
        abhishekam: formData.abhishekam,
        theertham: formData.theertham,
        alangaram: formData.alangaram,
        naivedyam: formData.naivedyam,
        aradhanai: formData.aradhanai,
        parayanam: formData.parayanam,
        maha_deep_aradhanai: formData.mahaDeepAradhanai,
        pooja_notes: formData.poojaNotes,
        extra_alangaram: formData.extraAlangaram,
        extra_sandanam: formData.extraSandanam,
        pooja_vagai: formData.poojaVagai,
        temple_id: CURRENT_TEMPLE_ID,
        deity_type: 'mulavar',
        pooja_type: 'nitya',
        status: 'active'
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
        showError("தோல்வி", "Failed to save ritual info");
      }
    } catch (err) {
      showError("தொடர்பு பிழை", "Error connecting to server");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      day: item.day || '',
      poojaTime: item.poojaTime || item.pooja_time || '',
      poojaName: item.poojaName || item.pooja_name || '',
      session: item.session || '',
      details: item.details || '',
      time: (item.time || '').substring(0, 5),
      abhishekam: item.abhishekam || '',
      theertham: item.theertham || '',
      alangaram: item.alangaram || '',
      naivedyam: item.naivedyam || '',
      aradhanai: item.aradhanai || '',
      parayanam: item.parayanam || '',
      mahaDeepAradhanai: item.mahaDeepAradhanai || item.maha_deep_aradhanai || '',
      poojaNotes: item.poojaNotes || item.pooja_notes || '',
      extraAlangaram: item.extraAlangaram || item.extra_alangaram || '',
      extraSandanam: item.extraSandanam || item.extra_sandanam || '',
      poojaVagai: item.poojaVagai || item.pooja_vagai || ''
    });
    const vagai = item.poojaVagai || item.pooja_vagai || '';
    setPoojaVagaiArray(vagai ? vagai.split(',') : []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const result = await showConfirm("நிச்சயமாக நீக்க வேண்டுமா?", "Are you sure you want to delete this ritual?");
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
          <Calendar size={28} color="#6366f1" />
          <h2 style={{ margin: 0 }}>நித்திய பூஜைகள் (Nitya Poojas)</h2>
        </div>
        <p>கோவிலின் தினசரி பூஜைகள் மற்றும் கால நேரங்களை இங்கே நிர்வகிக்கலாம்.</p>
      </div>

      <div className="card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <PlusCircle size={20} color="#6366f1" />
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
            {editingId ? 'பூஜை விவரத்தை மாற்ற (Edit Ritual)' : 'புதிய பூஜை பதிவு (Add New Ritual)'}
          </h3>
        </div>

        <div className="form-grid">
          <FormSelect 
            label="கிழமை (Day)" 
            name="day" 
            value={formData.day} 
            onChange={handleInputChange} 
            icon={Calendar}
            required
            options={['ஞாயிற்றுக்கிழமை', 'திங்கட்கிழமை', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'].map(d => ({ value: d, label: d }))} 
          />
          
          <FormSelect 
            label="கால பூஜை (Pooja Frequency)" 
            name="poojaTime" 
            value={formData.poojaTime} 
            onChange={handleInputChange} 
            icon={Zap}
            required
            options={['ஒரு காலம்', 'இரண்டு காலம்', 'மூன்று காலம்', 'நான்கு காலம்', 'ஐந்து காலம்', 'ஆறு காலம்'].map(t => ({ value: t + " பூஜை", label: t + " பூஜை" }))} 
          />

          <FormSelect 
            label="பூஜா பெயர் (Pooja Name)" 
            name="poojaName" 
            value={formData.poojaName} 
            onChange={handleInputChange} 
            icon={Activity}
            required
            options={['உஷா கலாம்', 'கால சண்டி', 'உச்சி கலாம்', 'சாயரட்சை', 'அர்த ஜமம்'].map(p => ({ value: p, label: p }))} 
          />

          <FormSelect 
            label="நாள் நேரம் (Session)" 
            name="session" 
            value={formData.session} 
            onChange={handleInputChange} 
            icon={Sunrise}
            required
            options={[
              { value: 'காலை', label: 'காலை (Morning)' },
              { value: 'பிற்பகல்', label: 'பிற்பகல் (Afternoon)' },
              { value: 'சாயங்காலம்', label: 'சாயங்காலம் (Evening)' },
              { value: 'இரவு', label: 'இரவு (Night)' }
            ]} 
          />

          <FormInput label="நேரம் (Exact Time)" name="time" value={formData.time} onChange={handleInputChange} icon={Clock} type="time" />
          <FormInput label="அபிஷேகம் (Abhishekam)" name="abhishekam" value={formData.abhishekam} onChange={handleInputChange} icon={Info} placeholder="ex: பஞ்சாமிர்தம்..." />
          <FormInput label="தீர்த்தம் (Theertham)" name="theertham" value={formData.theertham} onChange={handleInputChange} icon={Info} placeholder="ex: சுனை தீர்த்தம்..." />
          <FormInput label="அலங்காரம் (Alangaram)" name="alangaram" value={formData.alangaram} onChange={handleInputChange} icon={Info} placeholder="அலங்கார விவரங்கள்..." />
          <FormInput label="நெய்வேத்தியம் (Naivedyam)" name="naivedyam" value={formData.naivedyam} onChange={handleInputChange} icon={Info} placeholder="நெய்வேத்திய விவரங்கள்..." />
          <FormInput label="ஆராதனை (Aradhanai)" name="aradhanai" value={formData.aradhanai} onChange={handleInputChange} icon={Zap} placeholder="ஆராதனை..." />
          <FormInput label="பாராயணம் (Parayanam)" name="parayanam" value={formData.parayanam} onChange={handleInputChange} icon={FileText} placeholder="பாராயணம்..." />
          <FormInput label="Extra Alangaram" name="extraAlangaram" value={formData.extraAlangaram} onChange={handleInputChange} icon={Plus} placeholder="கூடுதல் அலங்காரம்..." />
          <FormInput label="Extra Sandanam" name="extraSandanam" value={formData.extraSandanam} onChange={handleInputChange} icon={Plus} placeholder="கூடுதல் சந்தனம்..." />
          <FormInput label="பூஜை குறிப்பு" name="poojaNotes" value={formData.poojaNotes} onChange={handleInputChange} icon={FileText} placeholder="பூஜை பற்றிய குறிப்புகள்..." />

          <div className="form-group" style={{ gridColumn: 'span 3' }}>
            <label className="form-label">பூஜை வகைகள் (Pooja Types)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              {['தீப ஆராதனை', 'அர்ச்சனை', 'பிரசாதம்', 'அன்னதானம்'].map(type => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', color: '#475569' }}>
                  <input type="checkbox" value={type} checked={poojaVagaiArray.includes(type)} onChange={handleCheckboxChange} className="form-check-input" />
                  {type}
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
            {editingId ? <>Update Ritual <RefreshCw size={18} /></> : <>Save Ritual <Save size={18} /></>}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <List size={20} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>நித்திய பூஜைகள் பட்டியல் (Ritual List)</h3>
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
                <th>கிழமை</th>
                <th>காலம் & பெயர்</th>
                <th>நாள் நேரம்</th>
                <th>நேரம்</th>
                <th>அபிஷேகம்</th>
                <th style={{ textAlign: 'center' }}>நிலை</th>
                <th className="sticky-column" style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '60px' }}>Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>பதிவுகள் எதுவும் இல்லை</td></tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: '700', color: '#6366f1' }}>{idx + 1}</td>
                    <td><span style={{ fontWeight: '600' }}>{item.day}</span></td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{item.poojaTime}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{item.poojaName}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                        {item.session === 'இரவு' ? <Moon size={14} color="#94a3b8" /> : <Sunrise size={14} color="#94a3b8" />}
                        {item.session}
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: '#64748b' }}>{item.time || '-'}</td>
                    <td>{item.abhishekam || '-'}</td>
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

export default NityaPooja;
