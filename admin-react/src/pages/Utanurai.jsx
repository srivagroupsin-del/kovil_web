import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { 
  Edit2, 
  Trash2, 
  Eye, 
  X, 
  User, 
  Camera, 
  Image as ImageIcon, 
  CheckCircle, 
  Clock, 
  Info, 
  Save, 
  RefreshCw, 
  Plus, 
  List, 
  Layers, 
  Church, 
  Flower, 
  TreePine, 
  Truck,
  PlusCircle,
  Activity,
  History,
  Heart
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

const API_BASE_URL = BASE_API + '/udanurai';
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

const Utanurai = () => {
  const location = useLocation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    status: '',
    name: '',
    deityName: '',
    specialName: '',
    goddessName: '',
    deityForm: '',
    formSpeciality: '',
    divineSpeciality: '',
    vehicle: '',
    templeTree: '',
    preferredFlower: '',
    vimanaLevel: '',
    worshipTime: '',
    worshipType: '',
    goddessPresentGirl: '',
    goddessMotherName: '',
    utsavarPhoto: false,
    chariotPhoto: false,
    balipitham: false,
    kodimaram: false,
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [goddessPhotoFile, setGoddessPhotoFile] = useState(null);
  const [utsavarFile, setUtsavarFile] = useState(null);
  const [chariotFile, setChariotFile] = useState(null);

  const [photoPreview, setPhotoPreview] = useState('');
  const [goddessPhotoPreview, setGoddessPhotoPreview] = useState('');
  const [utsavarPreview, setUtsavarPreview] = useState('');
  const [chariotPreview, setChariotPreview] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [viewModalData, setViewModalData] = useState(null);

  useEffect(() => {
    fetchData();
    // Check if we arrived here with an item to edit
    if (location.state?.editItem) {
      handleEdit(location.state.editItem.realId || location.state.editItem.id);
    }
  }, [location.state]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/temple/${CURRENT_TEMPLE_ID}`);
      if (res.ok) {
        const json = await res.json();
        const rows = json.data?.data || [];
        const mappedData = rows.map(r => ({
          id: r.id,
          balipitham: Boolean(r.balipitham),
          chariotFile: r.chariot_file,
          chariotPhoto: Boolean(r.chariot_photo),
          createdDate: r.created_date,
          deityForm: r.deity_form,
          deityName: r.deity_name,
          divineSpeciality: r.divine_speciality,
          formSpeciality: r.form_speciality,
          goddessMotherName: r.goddess_mother_name,
          goddessName: r.goddess_name,
          goddessPhoto: r.goddess_photo,
          goddessPresentGirl: r.goddess_present_girl,
          kodimaram: Boolean(r.kodimaram),
          name: r.name,
          photo: r.photo,
          preferredFlower: r.preferred_flower,
          specialName: r.special_name,
          status: r.status,
          templeTree: r.temple_tree,
          updatedDate: r.updated_date,
          utsavarFile: r.utsavar_file,
          utsavarPhoto: Boolean(r.utsavar_photo),
          vehicle: r.vehicle,
          vimanaLevel: r.vimana_level,
          worshipTime: r.worship_time,
          worshipType: r.worship_type,
          templeId: r.temple_id
        }));
        setData(mappedData);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreview(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearForm = () => {
    setFormData({
      status: '',
      name: '',
      deityName: '',
      specialName: '',
      goddessName: '',
      deityForm: '',
      formSpeciality: '',
      divineSpeciality: '',
      vehicle: '',
      templeTree: '',
      preferredFlower: '',
      vimanaLevel: '',
      worshipTime: '',
      worshipType: '',
      goddessPresentGirl: '',
      goddessMotherName: '',
      utsavarPhoto: false,
      chariotPhoto: false,
      balipitham: false,
      kodimaram: false,
    });
    setPhotoFile(null);
    setGoddessPhotoFile(null);
    setUtsavarFile(null);
    setChariotFile(null);
    setPhotoPreview('');
    setGoddessPhotoPreview('');
    setUtsavarPreview('');
    setChariotPreview('');
    setEditingId(null);
    ['photoInput', 'goddessPhotoInput', 'utsavarInput', 'chariotInput'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
  };

  const handleSave = async () => {
    if (!formData.status) {
      showWarning("நிலை தேர்ந்தெடுக்கவும்", "Please select status!");
      return;
    }

    try {
      const isEditMode = !!editingId;
      const url = isEditMode ? `${API_BASE_URL}/update/${editingId}` : `${API_BASE_URL}/create`;
      const method = isEditMode ? 'PUT' : 'POST';

      const formDataObj = new FormData();
      
      // Append text fields
      Object.keys(formData).forEach(key => {
        const apiKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        formDataObj.append(apiKey, formData[key]);
      });
      
      formDataObj.append('temple_id', CURRENT_TEMPLE_ID);

      // Append file fields
      if (photoFile) formDataObj.append('photo', photoFile);
      if (goddessPhotoFile) formDataObj.append('goddess_photo', goddessPhotoFile);
      if (utsavarFile) formDataObj.append('utsavar_file', utsavarFile);
      if (chariotFile) formDataObj.append('chariot_file', chariotFile);

      // If editing and no new file selected, preserve existing filename
      if (isEditMode) {
        if (!photoFile && photoPreview && !photoPreview.startsWith('data:')) {
          formDataObj.append('photo', photoPreview.split('/').pop());
        }
        if (!goddessPhotoFile && goddessPhotoPreview && !goddessPhotoPreview.startsWith('data:')) {
          formDataObj.append('goddess_photo', goddessPhotoPreview.split('/').pop());
        }
        if (!utsavarFile && utsavarPreview && !utsavarPreview.startsWith('data:')) {
          formDataObj.append('utsavar_file', utsavarPreview.split('/').pop());
        }
        if (!chariotFile && chariotPreview && !chariotPreview.startsWith('data:')) {
          formDataObj.append('chariot_file', chariotPreview.split('/').pop());
        }
      }

      console.log("Saving Utanurai to:", url, "Method:", method);
      console.log("FormData content:");
      for (let [key, value] of formDataObj.entries()) {
        if (value instanceof File) {
          console.log(key, ": File -", value.name, "(", value.size, "bytes)");
        } else {
          console.log(key, ":", value);
        }
      }

      const res = await fetch(url, {
        method: method,
        body: formDataObj
      });

      if (!res.ok) throw new Error(`Failed to save: ${res.status}`);

      showSuccess(`வெற்றிகரமாக ${isEditMode ? 'மாற்றப்பட்டது' : 'சேமிக்கப்பட்டது'}!`, `Successfully ${isEditMode ? 'updated' : 'created'}!`);
      clearForm();
      fetchData();
    } catch (err) {
      showError("தோல்வி", err.message);
    }
  };

  const handleEdit = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`);
      if (res.ok) {
        const resJson = await res.json();
        const json = resJson.data?.data || resJson;
        setEditingId(json.id);
        setFormData({
          status: json.status || '',
          name: json.name || '',
          deityName: json.deity_name || '',
          specialName: json.special_name || '',
          goddessName: json.goddess_name || '',
          deityForm: json.deity_form || '',
          formSpeciality: json.form_speciality || '',
          divineSpeciality: json.divine_speciality || '',
          vehicle: json.vehicle || '',
          templeTree: json.temple_tree || '',
          preferredFlower: json.preferred_flower || '',
          vimanaLevel: json.vimana_level || '',
          worshipTime: json.worship_time || '',
          worshipType: json.worship_type || '',
          goddessPresentGirl: json.goddess_present_girl || '',
          goddessMotherName: json.goddess_mother_name || '',
          utsavarPhoto: !!json.utsavar_photo,
          chariotPhoto: !!json.chariot_photo,
          balipitham: !!json.balipitham,
          kodimaram: !!json.kodimaram,
        });

        if (json.photo) setPhotoPreview(`${BASE_API}/files/${json.photo}`);
        else setPhotoPreview('');
        if (json.goddess_photo) setGoddessPhotoPreview(`${BASE_API}/files/${json.goddess_photo}`);
        else setGoddessPhotoPreview('');
        if (json.utsavar_file) setUtsavarPreview(`${BASE_API}/files/${json.utsavar_file}`);
        else setUtsavarPreview('');
        if (json.chariot_file) setChariotPreview(`${BASE_API}/files/${json.chariot_file}`);
        else setChariotPreview('');

        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      showError("தகவல் பெறுவதில் பிழை", "Error fetching record for edit");
    }
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
          <Heart size={28} color="#6366f1" />
          <h2 style={{ margin: 0 }}>உடனுறை தெய்வங்கள் (Udanurai Deities)</h2>
        </div>
        <p>கோவிலின் உடனுறை தெய்வங்கள் மற்றும் அவர்களின் சிறப்புகளை இங்கே நிர்வகிக்கலாம்.</p>
      </div>

      <div className="card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <PlusCircle size={20} color="#6366f1" />
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
            {editingId ? 'உடனுறை விவரத்தை மாற்ற (Edit Udanurai)' : 'புதிய உடனுறை பதிவு (Add New Udanurai)'}
          </h3>
        </div>

        <div className="form-grid">
          <FormSelect 
            label="நிலை (Status)" 
            name="status" 
            value={formData.status} 
            onChange={handleInputChange} 
            icon={Activity}
            options={[
              { value: 'அருவம்', label: 'அருவம்' },
              { value: 'உருவம்', label: 'உருவம்' },
              { value: 'அருவுருவம்', label: 'அருவுருவம்' }
            ]} 
          />
          
          <FormInput label="உடனுறை பெயர்" name="name" value={formData.name} onChange={handleInputChange} icon={User} placeholder="பெயர்..." />
          <FormInput label="திருமேனி பெயர்" name="deityName" value={formData.deityName} onChange={handleInputChange} icon={User} placeholder="திருமேனி பெயர்..." />
          <FormInput label="சிறப்பு பெயர்" name="specialName" value={formData.specialName} onChange={handleInputChange} icon={Info} placeholder="சிறப்பு பெயர்..." />
          <FormInput label="இறைவி பெயர்" name="goddessName" value={formData.goddessName} onChange={handleInputChange} icon={Heart} placeholder="இறைவி பெயர்..." />
          <FormInput label="திருவுருவம்" name="deityForm" value={formData.deityForm} onChange={handleInputChange} icon={Layers} placeholder="திருவுருவம்..." />
          <FormInput label="திருவுருவச் சிறப்பு" name="formSpeciality" value={formData.formSpeciality} onChange={handleInputChange} icon={Info} placeholder="சிறப்பு..." />
          <FormInput label="தெய்வீக சிறப்புக்கள்" name="divineSpeciality" value={formData.divineSpeciality} onChange={handleInputChange} icon={History} placeholder="சிறப்புக்கள்..." />
          <FormInput label="வாகனம்" name="vehicle" value={formData.vehicle} onChange={handleInputChange} icon={Truck} placeholder="வாகனம்..." />
          <FormInput label="தல விருட்சம்" name="templeTree" value={formData.templeTree} onChange={handleInputChange} icon={TreePine} placeholder="விருட்சம்..." />
          <FormInput label="உகந்த மலர்" name="preferredFlower" value={formData.preferredFlower} onChange={handleInputChange} icon={Flower} placeholder="மலர்..." />
          
          <FormSelect 
            label="விமானம் / கோபுரம்" 
            name="vimanaLevel" 
            value={formData.vimanaLevel} 
            onChange={handleInputChange} 
            icon={Church}
            options={[
              { value: 'ஒன்று', label: 'ஒன்று' },
              { value: 'மூன்று', label: 'மூன்று' },
              { value: 'ஐந்து', label: 'ஐந்து' },
              { value: 'ஏழு', label: 'ஏழு' },
              { value: 'ஒன்பது', label: 'ஒன்பது' },
              { value: 'பதினொன்று', label: 'பதினொன்று' }
            ]} 
          />
          
          <FormInput label="வணக்கம் நேரம்" name="worshipTime" value={formData.worshipTime} onChange={handleInputChange} icon={Clock} placeholder="எ.கா: காலை 6:00 - 8:00" />
          <FormInput label="எழுந்தருளிய பெண்" name="goddessPresentGirl" value={formData.goddessPresentGirl} onChange={handleInputChange} icon={User} placeholder="பெண் பெயர்..." />
          <FormInput label="தாயார் பெயர்" name="goddessMotherName" value={formData.goddessMotherName} onChange={handleInputChange} icon={Heart} placeholder="தாயார் பெயர்..." />

          {/* Photo Sections */}
          <div className="form-group" style={{ gridColumn: 'span 3' }}>
            <div className="form-grid" style={{ padding: 0 }}>
              <div className="form-group">
                <label className="form-label">உடனுறை புகைப்படம்</label>
                <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center', background: '#f8fafc' }}>
                  <input type="file" id="photoInput" accept="image/*" onChange={(e) => handleFileChange(e, setPhotoFile, setPhotoPreview)} style={{ display: 'none' }} />
                  <label htmlFor="photoInput" style={{ cursor: 'pointer' }}>
                    <Camera size={24} color="#94a3b8" style={{ marginBottom: '4px' }} />
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Choose Udanurai Photo</p>
                  </label>
                  {photoPreview && <img src={photoPreview} alt="Preview" style={{ marginTop: '8px', width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">இறைவி புகைப்படம்</label>
                <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center', background: '#f8fafc' }}>
                  <input type="file" id="goddessPhotoInput" accept="image/*" onChange={(e) => handleFileChange(e, setGoddessPhotoFile, setGoddessPhotoPreview)} style={{ display: 'none' }} />
                  <label htmlFor="goddessPhotoInput" style={{ cursor: 'pointer' }}>
                    <Camera size={24} color="#94a3b8" style={{ marginBottom: '4px' }} />
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Choose Goddess Photo</p>
                  </label>
                  {goddessPhotoPreview && <img src={goddessPhotoPreview} alt="Preview" style={{ marginTop: '8px', width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" name="utsavarPhoto" checked={formData.utsavarPhoto} onChange={handleInputChange} className="form-check-input" /> உற்சவர் புகைப்படம்
                </label>
                <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center', background: formData.utsavarPhoto ? '#f8fafc' : '#f1f5f9', opacity: formData.utsavarPhoto ? 1 : 0.6 }}>
                  <input type="file" id="utsavarInput" accept="image/*" disabled={!formData.utsavarPhoto} onChange={(e) => handleFileChange(e, setUtsavarFile, setUtsavarPreview)} style={{ display: 'none' }} />
                  <label htmlFor="utsavarInput" style={{ cursor: formData.utsavarPhoto ? 'pointer' : 'not-allowed' }}>
                    <ImageIcon size={24} color="#94a3b8" style={{ marginBottom: '4px' }} />
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Choose Utsavar Photo</p>
                  </label>
                  {utsavarPreview && formData.utsavarPhoto && <img src={utsavarPreview} alt="Preview" style={{ marginTop: '8px', width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" name="chariotPhoto" checked={formData.chariotPhoto} onChange={handleInputChange} className="form-check-input" /> தேர் புகைப்படம்
                </label>
                <div style={{ border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '16px', textAlign: 'center', background: formData.chariotPhoto ? '#f8fafc' : '#f1f5f9', opacity: formData.chariotPhoto ? 1 : 0.6 }}>
                  <input type="file" id="chariotInput" accept="image/*" disabled={!formData.chariotPhoto} onChange={(e) => handleFileChange(e, setChariotFile, setChariotPreview)} style={{ display: 'none' }} />
                  <label htmlFor="chariotInput" style={{ cursor: formData.chariotPhoto ? 'pointer' : 'not-allowed' }}>
                    <ImageIcon size={24} color="#94a3b8" style={{ marginBottom: '4px' }} />
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Choose Chariot Photo</p>
                  </label>
                  {chariotPreview && formData.chariotPhoto && <img src={chariotPreview} alt="Preview" style={{ marginTop: '8px', width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />}
                </div>
              </div>
            </div>
          </div>

          <div className="form-group" style={{ gridColumn: 'span 3' }}>
            <div style={{ display: 'flex', gap: '24px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                <input type="checkbox" name="balipitham" checked={formData.balipitham} onChange={handleInputChange} className="form-check-input" /> பலிபீடம் (Balipitham)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>
                <input type="checkbox" name="kodimaram" checked={formData.kodimaram} onChange={handleInputChange} className="form-check-input" /> கொடி மரம் (Kodimaram)
              </label>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={clearForm} className="btn btn-outline">Clear Form</button>
          <button type="button" onClick={handleSave} className="btn btn-primary">
            {editingId ? <>Update Record <RefreshCw size={18} /></> : <>Save Record <Save size={18} /></>}
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <List size={20} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>உடனுறை பட்டியல் (Udanurai List)</h3>
          </div>
          <button onClick={fetchData} className="btn btn-outline" style={{ padding: '8px 12px' }}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>பெயர் & திருமேனி</th>
                <th>இறைவி / தாயார்</th>
                <th>நிலை</th>
                <th>விமானம்</th>
                <th>தேதி</th>
                <th className="sticky-column" style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '60px' }}>Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>No records found.</td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: '700', color: '#6366f1' }}>#{item.id}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{item.name || '-'}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{item.deityName || '-'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#db2777' }}>{item.goddessName || '-'}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{item.goddessMotherName || '-'}</div>
                    </td>
                    <td>
                      <span className="badge-status badge-success" style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px' }}>
                        {item.status || '-'}
                      </span>
                    </td>
                    <td>{item.vimanaLevel || '-'}</td>
                    <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {item.createdDate ? new Date(item.createdDate).toLocaleDateString('en-GB') : '-'}
                    </td>
                    <td className="sticky-column">
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button className="icon-action" onClick={() => setViewModalData(item)} title="View"><Eye size={16}/></button>
                        <button className="icon-action" style={{ background: '#fef9c3', color: '#a16207' }} onClick={() => handleEdit(item.id)} title="Edit"><Edit2 size={16}/></button>
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

      {/* View Modal */}
      {viewModalData && (
        <div className="modal-overlay" onClick={() => setViewModalData(null)}>
          <div className="modal-content" style={{ maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>உடனுறை விவரம் (Udanurai Details)</h3>
              <button onClick={() => setViewModalData(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px' }}>
                <div>
                  <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <p style={{ fontWeight: '700', marginBottom: '8px', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>உடனுறை புகைப்படம்</p>
                    {viewModalData.photo ? (
                      <img src={`${BASE_API}/files/${viewModalData.photo}`} style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0' }} alt="Udanurai" />
                    ) : (
                      <div style={{ width: '100%', aspectRatio: '1', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={48} color="#cbd5e1" />
                      </div>
                    )}
                  </div>
                  <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <p style={{ fontWeight: '700', marginBottom: '8px', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>இறைவி புகைப்படம்</p>
                    {viewModalData.goddessPhoto ? (
                      <img src={`${BASE_API}/files/${viewModalData.goddessPhoto}`} style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0' }} alt="Goddess" />
                    ) : (
                      <div style={{ width: '100%', aspectRatio: '1.5', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Heart size={32} color="#f9a8d4" />
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                     <div style={{ textAlign: 'center' }}>
                        <p style={{ fontWeight: '700', marginBottom: '4px', color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>உற்சவர்</p>
                        {viewModalData.utsavarFile ? (
                          <img src={`${BASE_API}/files/${viewModalData.utsavarFile}`} style={{ width: '100%', borderRadius: '8px' }} alt="Utsavar" />
                        ) : <div style={{ height: '60px', background: '#f8fafc', borderRadius: '8px' }} />}
                     </div>
                     <div style={{ textAlign: 'center' }}>
                        <p style={{ fontWeight: '700', marginBottom: '4px', color: '#64748b', fontSize: '10px', textTransform: 'uppercase' }}>தேர்</p>
                        {viewModalData.chariotFile ? (
                          <img src={`${BASE_API}/files/${viewModalData.chariotFile}`} style={{ width: '100%', borderRadius: '8px' }} alt="Chariot" />
                        ) : <div style={{ height: '60px', background: '#f8fafc', borderRadius: '8px' }} />}
                     </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {[
                    { label: 'பெயர்', value: viewModalData.name, icon: User },
                    { label: 'திருமேனி', value: viewModalData.deityName, icon: User },
                    { label: 'நிலை', value: viewModalData.status, icon: Activity },
                    { label: 'சிறப்பு பெயர்', value: viewModalData.specialName, icon: Info },
                    { label: 'இறைவி பெயர்', value: viewModalData.goddessName, icon: Heart },
                    { label: 'தாயார் பெயர்', value: viewModalData.goddessMotherName, icon: Heart },
                    { label: 'திருவுருவம்', value: viewModalData.deityForm, icon: Layers },
                    { label: 'வாகனம்', value: viewModalData.vehicle, icon: Truck },
                    { label: 'விருட்சம்', value: viewModalData.templeTree, icon: TreePine },
                    { label: 'மலர்', value: viewModalData.preferredFlower, icon: Flower },
                    { label: 'விமானம்', value: viewModalData.vimanaLevel, icon: Church },
                    { label: 'நேரம்', value: viewModalData.worshipTime, icon: Clock }
                  ].map(detail => (
                    <div key={detail.label}>
                      <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <detail.icon size={12} /> {detail.label}
                      </p>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{detail.value || '-'}</p>
                    </div>
                  ))}
                  <div style={{ gridColumn: 'span 2' }}>
                    <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>சிறப்புக்கள்</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>{viewModalData.divineSpeciality || 'தகவல் இல்லை'}</p>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>எழுந்தருளிய பெண்</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#475569' }}>{viewModalData.goddessPresentGirl || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setViewModalData(null)} className="btn btn-primary">Close Details</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Utanurai;
