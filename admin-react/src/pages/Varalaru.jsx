import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { 
  Edit2, 
  Trash2, 
  Mail, 
  Image as ImageIcon, 
  X, 
  History as HistoryIcon, 
  Calendar, 
  Info, 
  FileText, 
  Camera, 
  PlusCircle, 
  Save, 
  Clock, 
  CheckCircle,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  User,
  Church,
  Zap,
  Layers,
  List,
  Building,
  Activity
} from 'lucide-react';
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
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  </div>
);

const Varalaru = () => {
  const [activeTab, setActiveTab] = useState('history');
  
  return (
    <div className="form-card" style={{ maxWidth: '1400px' }}>
      <div className="form-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <HistoryIcon size={28} color="#6366f1" />
          <h2 style={{ margin: 0 }}>வரலாறு & குடமுழுக்கு (History & Kudamuzhukku)</h2>
        </div>
        <p>கோவிலின் வரலாற்றுத் தகவல்கள் மற்றும் குடமுழுக்கு நிகழ்வுகளை இங்கே நிர்வகிக்கவும்.</p>
      </div>

      <div style={{ display: 'flex', background: '#f8fafc', padding: '6px', borderRadius: '12px', marginBottom: '24px', width: 'fit-content', gap: '4px' }}>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '10px 24px',
            background: activeTab === 'history' ? 'white' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            color: activeTab === 'history' ? '#6366f1' : '#64748b',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'history' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          <HistoryIcon size={16} /> வரலாறு
        </button>
        <button
          onClick={() => setActiveTab('kudamuzhukku')}
          style={{
            padding: '10px 24px',
            background: activeTab === 'kudamuzhukku' ? 'white' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            color: activeTab === 'kudamuzhukku' ? '#6366f1' : '#64748b',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: activeTab === 'kudamuzhukku' ? '0 4px 6px -1px rgba(0,0,0,0.05)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          <Zap size={16} /> குடமுழுக்கு
        </button>
      </div>

      {activeTab === 'history' && <HistoryTab />}
      {activeTab === 'kudamuzhukku' && <KudamuzhukkuTab />}
    </div>
  );
};

const HistoryTab = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastTemple, setLastTemple] = useState({ templeName: '', mulavarName: '' });
  
  const [formData, setFormData] = useState({
    description: '',
    information: '',
    textPart: '',
    historyDate: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState('');
  const [removePhoto, setRemovePhoto] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [imageModalUrl, setImageModalUrl] = useState(null);

  useEffect(() => {
    fetchHistory();
    fetchLastTempleDetails();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch(BASE_API + "/temple_histories");
      if (res.ok) {
        const json = await res.json();
        const rows = json.data?.data || [];
        const mappedData = rows.map(r => ({
          id: r.id,
          templeName: r.temple_name,
          title: r.title,
          description: r.description,
          information: r.information,
          textPart: r.text_part,
          historyDate: r.history_date,
          photoPath: r.photo_path,
          createdDate: r.created_date
        }));
        setData(mappedData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLastTempleDetails = async () => {
    try {
      const res = await fetch(`${BASE_API}/temple_basic_details`);
      if (res.ok) {
        const json = await res.json();
        const last = json.data?.data?.[0];
        if (last) {
          setLastTemple({ templeName: last.temple_name || '', mulavarName: last.mulavar_name || '' });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setPhotoFile(e.target.files[0]);
  };

  const clearForm = () => {
    setFormData({ description: '', information: '', textPart: '', historyDate: '' });
    setPhotoFile(null);
    setCurrentPhotoUrl('');
    setRemovePhoto(false);
    setEditingId(null);
  };

  const handleRemovePhoto = () => {
    setCurrentPhotoUrl('');
    setPhotoFile(null);
    setRemovePhoto(true);
  };

  const saveHistory = async () => {
    if (!formData.historyDate) {
      showWarning("தேதி தேவை", "Please select a history date");
      return;
    }

    try {
      const isEditMode = !!editingId;
      const url = isEditMode 
        ? `${BASE_API}/temple_history/update/${editingId}` 
        : `${BASE_API}/temple_history/create`;
      const method = isEditMode ? 'PUT' : 'POST';

      const formDataObj = new FormData();
      formDataObj.append('temple_name', lastTemple.templeName);
      formDataObj.append('title', lastTemple.mulavarName);
      formDataObj.append('description', formData.description);
      formDataObj.append('information', formData.information);
      formDataObj.append('text_part', formData.textPart);
      formDataObj.append('history_date', formData.historyDate);
      formDataObj.append('active', 'true');

      if (photoFile) {
        formDataObj.append('photo_path', photoFile);
      } else if (isEditMode && currentPhotoUrl && !removePhoto) {
        formDataObj.append('photo_path', currentPhotoUrl.split('/').pop());
      }

      console.log("Saving Varalaru to:", url, "Method:", method);
      console.log("FormData content:");
      for (let [key, value] of formDataObj.entries()) {
        if (value instanceof File) {
          console.log(key, ": File -", value.name, "(", value.size, "bytes)");
        } else {
          console.log(key, ":", value);
        }
      }

      const response = await fetch(url, {
        method: method,
        body: formDataObj
      });

      if (!response.ok) throw new Error(`Failed to save: ${response.status}`);

      showSuccess(`வெற்றிகரமாக ${editingId ? 'மாற்றப்பட்டது' : 'சேமிக்கப்பட்டது'}!`, `Successfully ${editingId ? 'updated' : 'created'}!`);
      clearForm();
      fetchHistory();
    } catch (err) {
      showError("தோல்வி", `Failed to save: ${err.message}`);
    }
  };

  const editRecord = async (id) => {
    try {
      const res = await fetch(`${BASE_API}/temple_history/${id}`);
      if (res.ok) {
        const resJson = await res.json();
        const json = resJson.data?.data || resJson;
        setEditingId(json.id);
        setFormData({
          description: json.description || '',
          information: json.information || '',
          textPart: json.text_part || '',
          historyDate: json.history_date ? new Date(json.history_date).toISOString().split('T')[0] : '',
        });
        if (json.photo_path) setCurrentPhotoUrl(`${BASE_API}/files/${json.photo_path}`);
        else setCurrentPhotoUrl('');
        setRemovePhoto(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      showError("தோல்வி", "Failed to load data for editing.");
    }
  };

  const deleteRecord = async (id) => {
    const result = await showConfirm("நிச்சயமாக நீக்க வேண்டுமா?", "Are you sure you want to delete this history record?");
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${BASE_API}/temple_history/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchHistory();
        if (editingId === id) clearForm();
        showSuccess("நீக்கப்பட்டது", "Record deleted successfully");
      }
    } catch (err) {
      showError("தோல்வி", "Failed to delete record.");
    }
  };

  return (
    <div className="tab-content animate-fadeIn">
      <div className="card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <PlusCircle size={20} color="#6366f1" />
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>வரலாறு விவரம் சேர்க்க (Add History Detail)</h3>
        </div>

        <div className="form-grid">
          <FormInput label="முலவர் பெயர்" value={lastTemple.mulavarName} icon={User} readOnly />
          <FormInput label="தல பெயர்" value={lastTemple.templeName} icon={Church} readOnly />
          <FormInput label="விளக்கம் / தொகுப்பு" name="description" value={formData.description} onChange={handleInputChange} icon={FileText} placeholder="விளக்கத்தை உள்ளிடவும்" />
          <FormInput label="தகவல்" name="information" value={formData.information} onChange={handleInputChange} icon={Info} placeholder="தகவல்களை உள்ளிடவும்" />
          <FormInput label="உரை பகுதி" name="textPart" value={formData.textPart} onChange={handleInputChange} icon={FileText} placeholder="உரைப் பகுதியை உள்ளிடவும்" />
          <FormInput label="வரலாறு தேதி" name="historyDate" type="date" value={formData.historyDate} onChange={handleInputChange} icon={Calendar} required />

          <div className="form-group" style={{ gridColumn: 'span 3' }}>
            <label className="form-label">புகைப்படம் (Photo)</label>
            <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '24px', textAlign: 'center', background: '#f8fafc', transition: 'all 0.2s' }}>
              <input type="file" id="historyPhoto" className="form-control" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              <label htmlFor="historyPhoto" style={{ cursor: 'pointer' }}>
                <Camera size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>{photoFile ? photoFile.name : 'புகைப்படத்தை தேர்ந்தெடுக்கவும் அல்லது இங்கே இழுக்கவும்'}</p>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>Max size 5MB (JPG, PNG)</p>
              </label>
            </div>
            {currentPhotoUrl && (
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px', background: 'white', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <img src={currentPhotoUrl} alt="Current" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', margin: 0 }}>தற்போதைய புகைப்படம்</p>
                  <button onClick={handleRemovePhoto} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', padding: 0 }}>Remove Photo</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={clearForm} className="btn btn-outline">Clear Form</button>
          <button type="button" onClick={saveHistory} className="btn btn-primary">
            {editingId ? <>Update History <RefreshCw size={18} /></> : <>Save History <Save size={18} /></>}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <List size={20} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>வரலாறு பட்டியல் (History Records)</h3>
          </div>
          <button onClick={fetchHistory} className="btn btn-outline" style={{ padding: '8px 12px' }}><RefreshCw size={16} /> Refresh</button>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>முலவர் & தல பெயர்</th>
                <th>புகைப்படம்</th>
                <th>விவரம் / தகவல்</th>
                <th>தேதி</th>
                <th className="sticky-column" style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (<tr><td colSpan="6" style={{ textAlign: 'center', padding: '60px' }}>Loading...</td></tr>) : data.length === 0 ? (<tr><td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>No records found.</td></tr>) : data.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: '700', color: '#6366f1' }}>#{row.id}</td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{row.title || '-'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{row.templeName || '-'}</div>
                  </td>
                  <td>
                    {row.photoPath ? (
                      <img src={`${BASE_API}/files/${row.photoPath}`} alt="Photo" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer' }} onClick={() => setImageModalUrl(`${BASE_API}/files/${row.photoPath}`)} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={16} color="#cbd5e1" /></div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '13px' }}>{row.description || '-'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{row.information || '-'}</div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                    <Calendar size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    {row.historyDate ? new Date(row.historyDate).toLocaleDateString('en-GB') : '-'}
                  </td>
                  <td className="sticky-column">
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button className="icon-action" onClick={() => editRecord(row.id)} title="Edit"><Edit2 size={16}/></button>
                      <button className="icon-action" style={{ color: '#ef4444', background: '#fef2f2' }} onClick={() => deleteRecord(row.id)} title="Delete"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {imageModalUrl && (
        <div className="modal-overlay" onClick={() => setImageModalUrl(null)}>
          <div className="modal-content" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '16px 24px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>புகைப்படம் (Image View)</h3>
              <button onClick={() => setImageModalUrl(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ padding: '0', textAlign: 'center', background: '#0f172a' }}>
              <img src={imageModalUrl} style={{ maxWidth: '100%', maxHeight: '70vh', display: 'block', margin: '0 auto' }} alt="Full Size" />
            </div>
            <div className="modal-footer" style={{ padding: '12px 24px' }}>
              <a href={imageModalUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ textDecoration: 'none' }}>Open Original</a>
              <button onClick={() => setImageModalUrl(null)} className="btn btn-primary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const KudamuzhukkuTab = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastTemple, setLastTemple] = useState({ templeName: '', mulavarName: '' });
  const [formData, setFormData] = useState({
    period: '',
    yagaPeriod: '',
    type: '',
    kundamCount: '',
    startDate: '',
    endDate: '',
    time: '',
    daysCount: '',
    deeparadhanaTime: '',
    annadhanamTime: '',
    mandalaPooja: '',
    yagasalaiPooja: false,
    yagasalaiName: '',
    yagasalaiTime: '',
    extraField1: '',
    extraField2: '',
    extraDate: '',
    extraDay: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchKudamuzhukku();
    fetchLastTempleDetails();
  }, []);

  const fetchKudamuzhukku = async () => {
    try {
      setLoading(true);
      const res = await fetch(BASE_API + "/kudamuzhukkus");
      if (res.ok) {
        const json = await res.json();
        const rows = json.data?.data || [];
        setData(rows.map(r => ({
          id: r.id,
          templeName: r.temple_name,
          chiefName: r.chief_name,
          period: r.period,
          yagaPeriod: r.yaga_period,
          type: r.type,
          kundamCount: r.kundam_count,
          startDate: r.start_date,
          endDate: r.end_date,
          time: r.time
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLastTempleDetails = async () => {
    try {
      const res = await fetch(`${BASE_API}/temple_basic_details`);
      if (res.ok) {
        const json = await res.json();
        const last = json.data?.data?.[0];
        if (last) {
          setLastTemple({
            templeName: last.temple_name || '',
            mulavarName: last.mulavar_name || ''
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const clearForm = () => {
    setFormData({
      period: '',
      yagaPeriod: '',
      type: '',
      kundamCount: '',
      startDate: '',
      endDate: '',
      time: '',
      daysCount: '',
      deeparadhanaTime: '',
      annadhanamTime: '',
      mandalaPooja: '',
      yagasalaiPooja: false,
      yagasalaiName: '',
      yagasalaiTime: '',
      extraField1: '',
      extraField2: '',
      extraDate: '',
      extraDay: ''
    });
    setEditingId(null);
  };

  const saveKudamuzhukku = async () => {
    try {
      const submitData = {
        temple_name: lastTemple.templeName,
        chief_name: lastTemple.mulavarName,
        period: formData.period,
        yaga_period: formData.yagaPeriod,
        type: formData.type,
        kundam_count: formData.kundamCount,
        start_date: formData.startDate,
        end_date: formData.endDate,
        time: formData.time ? (formData.time.length === 5 ? `${formData.time}:00` : formData.time) : null,
        days_count: formData.daysCount,
        deeparadhana_time: formData.deeparadhanaTime ? (formData.deeparadhanaTime.length === 5 ? `${formData.deeparadhanaTime}:00` : formData.deeparadhanaTime) : null,
        annadhanam_time: formData.annadhanamTime ? (formData.annadhanamTime.length === 5 ? `${formData.annadhanamTime}:00` : formData.annadhanamTime) : null,
        mandala_pooja: formData.mandalaPooja,
        yagasalai_pooja: formData.yagasalaiPooja,
        yagasalai_name: formData.yagasalaiName,
        yagasalai_time: formData.yagasalaiTime ? (formData.yagasalaiTime.length === 5 ? `${formData.yagasalaiTime}:00` : formData.yagasalaiTime) : null,
        extra_field1: formData.extraField1,
        extra_field2: formData.extraField2,
        extra_date: formData.extraDate,
        extra_day: formData.extraDay,
        active: true
      };

      const url = editingId ? `${BASE_API}/kudamuzhukku/update/${editingId}` : `${BASE_API}/kudamuzhukku/create`;
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) throw new Error(`Failed to save: ${response.status}`);
      showSuccess(`வெற்றிகரமாக ${editingId ? 'மாற்றப்பட்டது' : 'சேமிக்கப்பட்டது'}!`, `Successfully ${editingId ? 'updated' : 'created'}!`);
      clearForm();
      fetchKudamuzhukku();
    } catch (err) {
      showError("தோல்வி", `Failed to save: ${err.message}`);
    }
  };

  const editRecord = async (id) => {
    try {
      const res = await fetch(`${BASE_API}/kudamuzhukku/${id}`);
      if (res.ok) {
        const resJson = await res.json();
        const json = resJson.data?.data || resJson;
        setEditingId(json.id);
        const formatDate = (d) => d ? new Date(d).toISOString().split('T')[0] : '';
        setFormData({
          period: json.period || '',
          yagaPeriod: json.yaga_period || '',
          type: json.type || '',
          kundamCount: json.kundam_count || '',
          startDate: formatDate(json.start_date),
          endDate: formatDate(json.end_date),
          time: json.time?.substring(0, 5) || '',
          daysCount: json.days_count || '',
          deeparadhanaTime: json.deeparadhana_time?.substring(0, 5) || '',
          annadhanamTime: json.annadhanam_time?.substring(0, 5) || '',
          mandalaPooja: json.mandala_pooja || '',
          yagasalaiPooja: Boolean(json.yagasalai_pooja),
          yagasalaiName: json.yagasalai_name || '',
          yagasalaiTime: json.yagasalai_time?.substring(0, 5) || '',
          extraField1: json.extra_field1 || '',
          extraField2: json.extra_field2 || '',
          extraDate: formatDate(json.extra_date),
          extraDay: json.extra_day || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      showError("தோல்வி", "Failed to load data for editing.");
    }
  };

  const deleteRecord = async (id) => {
    const result = await showConfirm("நிச்சயமாக நீக்க வேண்டுமா?", "Are you sure you want to delete this record?");
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${BASE_API}/kudamuzhukku/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchKudamuzhukku();
        if (editingId === id) clearForm();
        showSuccess("நீக்கப்பட்டது", "Record deleted successfully");
      }
    } catch (err) {
      showError("தோல்வி", "Failed to delete record.");
    }
  };

  return (
    <div className="tab-content animate-fadeIn">
      <div className="card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <PlusCircle size={20} color="#6366f1" />
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>குடமுழுக்கு விவரம் சேர்க்க (Add Kudamuzhukku Detail)</h3>
        </div>

        <div className="form-grid">
          <FormInput label="தல பெயர்" value={lastTemple.templeName} icon={Church} readOnly />
          <FormInput label="தலைமை பெயர்" value={lastTemple.mulavarName} icon={User} readOnly />
          
          <FormSelect 
            label="காலம்" 
            name="period" 
            value={formData.period} 
            onChange={handleInputChange} 
            icon={Clock}
            options={['ஒரு காலம் பூஜை', 'இரண்டு கால பூஜை']} 
          />
          
          <FormSelect 
            label="யாகங்கள் காலம்" 
            name="yagaPeriod" 
            value={formData.yagaPeriod} 
            onChange={handleInputChange} 
            icon={Activity}
            options={['2 காலம்', '4 காலம்', '8 காலம்']} 
          />
          
          <FormSelect 
            label="வகைகள்" 
            name="type" 
            value={formData.type} 
            onChange={handleInputChange} 
            icon={Layers}
            options={['ஆவர்த்தம்', 'அனாவர்த்தம்', 'புனராவர்த்தம்']} 
          />
          
          <FormSelect 
            label="குண்டங்களின் எண்ணிக்கை" 
            name="kundamCount" 
            value={formData.kundamCount} 
            onChange={handleInputChange} 
            icon={Layers}
            options={['5 குண்டம்', '7 குண்டம்', '9 குண்டம்']} 
          />

          <FormInput label="தொடக்க தேதி" name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} icon={Calendar} />
          <FormInput label="முடிவு தேதி" name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} icon={Calendar} />
          <FormInput label="நேரம்" name="time" type="time" value={formData.time} onChange={handleInputChange} icon={Clock} />
          <FormInput label="நாட்களின் எண்ணிக்கை" name="daysCount" value={formData.daysCount} onChange={handleInputChange} icon={FileText} placeholder="எ.கா: 10" />
          <FormInput label="தீபாரதனை நேரம்" name="deeparadhanaTime" type="time" value={formData.deeparadhanaTime} onChange={handleInputChange} icon={Clock} />
          <FormInput label="அன்னதானம் நேரம்" name="annadhanamTime" type="time" value={formData.annadhanamTime} onChange={handleInputChange} icon={Clock} />
          
          <FormSelect 
            label="மண்டல பூஜை" 
            name="mandalaPooja" 
            value={formData.mandalaPooja} 
            onChange={handleInputChange} 
            icon={Activity}
            options={['48 நாட்கள்', '24 நாட்கள்', 'ஒரு நாள் பூஜை']} 
          />

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <div style={{ 
              background: formData.yagasalaiPooja ? '#ecfdf5' : '#f8fafc', 
              padding: '16px', 
              borderRadius: '12px', 
              border: formData.yagasalaiPooja ? '1px solid #10b981' : '1px solid #e2e8f0',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="yagasalaiPooja" name="yagasalaiPooja" checked={formData.yagasalaiPooja} onChange={handleInputChange} className="form-check-input" />
                <label htmlFor="yagasalaiPooja" style={{ fontWeight: '600', fontSize: '14px', cursor: 'pointer', color: formData.yagasalaiPooja ? '#047857' : '#1e293b' }}>
                  <Building size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> யாகசாலை பூஜை
                </label>
              </div>

              {formData.yagasalaiPooja && (
                <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <input type="text" name="yagasalaiName" className="form-control" placeholder="யாகசாலை பெயர்" style={{ paddingLeft: '12px' }} value={formData.yagasalaiName} onChange={handleInputChange} />
                  </div>
                  <div style={{ width: '150px' }}>
                    <input type="time" name="yagasalaiTime" className="form-control" style={{ paddingLeft: '12px' }} value={formData.yagasalaiTime} onChange={handleInputChange} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <FormInput label="கூடுதல் தகவல் 1" name="extraField1" value={formData.extraField1} onChange={handleInputChange} icon={Info} placeholder="கூடுதல் விவரங்கள்..." />
          <FormInput label="கூடுதல் தகவல் 2" name="extraField2" value={formData.extraField2} onChange={handleInputChange} icon={Info} placeholder="கூடுதல் விவரங்கள்..." />
          <FormInput label="கூடுதல் தேதி" name="extraDate" type="date" value={formData.extraDate} onChange={handleInputChange} icon={Calendar} />
          
          <FormSelect 
            label="கூடுதல் நாள்" 
            name="extraDay" 
            value={formData.extraDay} 
            onChange={handleInputChange} 
            icon={Calendar}
            options={['திங்கட்கிழமை', 'செவ்வாய்க்கிழமை', 'புதன்கிழமை', 'வியாழக்கிழமை', 'வெள்ளிக்கிழமை', 'சனிக்கிழமை', 'ஞாயிற்றுக்கிழமை']} 
          />
        </div>

        <div className="form-actions">
          <button onClick={clearForm} className="btn btn-outline">Clear Form</button>
          <button onClick={saveKudamuzhukku} className="btn btn-primary">
            {editingId ? (
              <>Update Details <RefreshCw size={18} /></>
            ) : (
              <>Save Details <Save size={18} /></>
            )}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <List size={20} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>குடமுழுக்கு பட்டியல் (Kudamuzhukku Records)</h3>
          </div>
          <button onClick={fetchKudamuzhukku} className="btn btn-outline" style={{ padding: '8px 12px' }}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>தல & தலைமை பெயர்</th>
                <th>காலம் / வகை</th>
                <th>தொடக்க / முடிவு தேதி</th>
                <th>நேரம்</th>
                <th className="sticky-column" style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '60px' }}>Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>No records found.</td></tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: '700', color: '#6366f1' }}>#{row.id}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{row.templeName || '-'}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{row.chiefName || '-'}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px' }}>{row.period || '-'}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{row.type || '-'}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px' }}>
                        <Calendar size={12} style={{ marginRight: '4px' }} />
                        {row.startDate ? new Date(row.startDate).toLocaleDateString('en-GB') : '-'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                         to {row.endDate ? new Date(row.endDate).toLocaleDateString('en-GB') : '-'}
                      </div>
                    </td>
                    <td>
                      <span className="badge-status badge-success" style={{ background: '#f1f5f9', color: '#475569' }}>
                        <Clock size={12} style={{ marginRight: '4px' }} />
                        {row.time || '-'}
                      </span>
                    </td>
                    <td className="sticky-column">
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button className="icon-action" onClick={() => editRecord(row.id)} title="Edit"><Edit2 size={16}/></button>
                        <button className="icon-action" style={{ color: '#ef4444', background: '#fef2f2' }} onClick={() => deleteRecord(row.id)} title="Delete"><Trash2 size={16}/></button>
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

export default Varalaru;
