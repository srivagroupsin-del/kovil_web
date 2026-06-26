import { BASE_API } from '../api/api_list';
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Edit2, 
  Trash2, 
  ArrowUpDown, 
  X, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  Plus,
  MoreHorizontal,
  Eye,
  List,
  Calendar,
  Compass,
  Building,
  Activity,
  ArrowRight,
  Camera
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal, { showSuccess, showError, showConfirm } from '../utils/swal';

const API_BASE = BASE_API + "/temple_detail";
const GET_ALL_URL = BASE_API + "/temple_details";

const DynamicInputList = ({ label, name, values, onChange, icon: Icon, placeholder }) => {
  const handleAdd = () => {
    onChange(name, [...values, '']);
  };

  const handleRemove = (index) => {
    const updated = values.filter((_, i) => i !== index);
    onChange(name, updated.length > 0 ? updated : ['']);
  };

  const handleChange = (index, val) => {
    const updated = [...values];
    updated[index] = val;
    onChange(name, updated);
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {values.map((val, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="input-wrapper" style={{ flex: 1, margin: 0 }}>
              {Icon && <Icon className="input-icon" size={18} />}
              <input
                type="text"
                className="form-control"
                placeholder={placeholder}
                value={val}
                onChange={(e) => handleChange(idx, e.target.value)}
                style={Icon ? {} : { paddingLeft: '16px' }}
              />
            </div>
            {values.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                style={{
                  padding: '8px',
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  borderRadius: '12px',
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '42px',
                  width: '42px',
                  minWidth: '42px'
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAdd}
          className="btn btn-outline"
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            width: 'fit-content',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '2px',
            borderColor: '#6366f1',
            color: '#6366f1',
            background: 'transparent',
            borderRadius: '12px'
          }}
        >
          <Plus size={14} /> Add More (மேலும் சேர்க்க)
        </button>
      </div>
    </div>
  );
};



const getDeityPhotoUrl = (val, sectors = []) => {
  if (val.previewUrl) return val.previewUrl;
  if (val.photo) {
    if (val.photo.startsWith('http://') || val.photo.startsWith('https://')) return val.photo;
    if (val.photo.startsWith('sectors/')) return `https://srivagroups.in/uploads/${val.photo}`;
    return `${BASE_API}/files/${val.photo}`;
  }
  if (sectors && sectors.length > 0 && val.deivam) {
    const selectedSector = sectors.find(s => s.sector_name === val.deivam);
    if (selectedSector && selectedSector.image) {
      if (selectedSector.image.startsWith('http')) return selectedSector.image;
      return `https://srivagroups.in/uploads/${selectedSector.image}`;
    }
  }
  return BASE_API + '/files/default_god.svg';
};

const DynamicDeityList = ({ label, name, values, onChange }) => {
  const [sectors, setSectors] = useState([]);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const res = await fetch(BASE_API + "/outsideapis/deity-sectors");
        const json = await res.json();
        const list = Array.isArray(json.data) ? json.data : (json.data?.data || json || []);
        setSectors(list);
      } catch (err) {
        console.error("Error fetching sectors:", err);
      }
    };
    fetchSectors();
  }, []);

  const deivamOptions = sectors.length > 0 
    ? sectors.map(s => s.sector_name) 
    : [
        'விநாயகர் (Vinayagar)',
        'முருகன் (Murugan)',
        'சிவன் (Shivan)',
        'பெருமாள் / விஷ்ணு (Perumal / Vishnu)',
        'அம்மன் (Amman)',
        'துர்க்கை (Durga)',
        'தட்சிணாமூர்த்தி (Dakshinamurthy)',
        'பைரவர் (Bhairavar)',
        'சண்டிகேஸ்வரர் (Chandikeswarar)',
        'நவகிரகங்கள் (Navagrahangal)',
        'ஆஞ்சநேயர் (Anjaneyar)',
        'கருப்பசாமி (Karuppasamy)',
        'அனுமார் (Anumar)',
        'சரஸ்வதி (Saraswati)',
        'லட்சுமி (Lakshmi)',
        'மற்றவை (Other)'
      ];

  const thesaiOptions = [
    'கிழக்கு (East)',
    'மேற்கு (West)',
    'வடக்கு (North)',
    'தெற்கு (South)',
    'வடகிழக்கு (Northeast)',
    'வடமேற்கு (Northwest)',
    'தென்கிழக்கு (Southeast)',
    'தென்மேற்கு (Southwest)'
  ];

  const handleAdd = () => {
    onChange(name, [...values, { deivam: '', thesai: '', photo: '', file: null, previewUrl: '' }]);
  };

  const handleRemove = (index) => {
    const updated = values.filter((_, i) => i !== index);
    onChange(name, updated.length > 0 ? updated : [{ deivam: '', thesai: '', photo: '', file: null, previewUrl: '' }]);
  };

  const handleChange = (index, field, val) => {
    const updated = [...values];
    if (field === 'deivam') {
      updated[index] = {
        ...updated[index],
        deivam: val,
        photo: '', // Do not store external image in DB unless explicitly uploaded
        file: null,
        previewUrl: ''
      };
    } else {
      updated[index] = { ...updated[index], [field]: val };
    }
    onChange(name, updated);
  };

  return (
    <div className="form-group" style={{ gridColumn: 'span 3' }}>
      <label className="form-label" style={{ fontWeight: 600, color: '#1e293b' }}>{label}</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
        {values.map((val, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px', color: '#64748b' }}>தெய்வம் (Deity)</label>
                <select
                  className="form-control"
                  value={val.deivam}
                  onChange={(e) => handleChange(idx, 'deivam', e.target.value)}
                  style={{ appearance: 'auto', paddingLeft: '12px', height: '42px' }}
                >
                  <option value="">தெய்வத்தை தேர்ந்தெடுக்கவும் (Select Deity)</option>
                  {deivamOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px', color: '#64748b' }}>திசை (Direction)</label>
                <select
                  className="form-control"
                  value={val.thesai}
                  onChange={(e) => handleChange(idx, 'thesai', e.target.value)}
                  style={{ appearance: 'auto', paddingLeft: '12px', height: '42px' }}
                >
                  <option value="">திசையை தேர்ந்தெடுக்கவும் (Select Direction)</option>
                  {thesaiOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px', color: '#64748b' }}>புகைப்படம் (Photo)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {val.deivam && (
                    <div style={{ position: 'relative', width: '42px', height: '42px', flexShrink: 0 }}>
                      <img 
                        src={getDeityPhotoUrl(val, sectors)} 
                        alt="Deity preview" 
                        onError={(e) => {
                          e.target.src = BASE_API + '/files/default_god.svg';
                          e.target.onerror = null;
                        }}
                        onClick={() => {
                          const imageUrl = getDeityPhotoUrl(val, sectors);
                          Swal.fire({
                            title: val.deivam,
                            html: `
                              <div style="display: flex; justify-content: center; align-items: center; padding: 10px; background: #fafafa; border-radius: 12px; border: 1px solid #e2e8f0;">
                                <img 
                                  src="${imageUrl}" 
                                  alt="${val.deivam}" 
                                  style="max-width: 100%; max-height: 380px; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);" 
                                  onerror="this.src='${BASE_API}/files/default_god.svg'; this.onerror=null;"
                                />
                              </div>
                            `,
                            showConfirmButton: false,
                            showCloseButton: true,
                            width: '450px'
                          });
                        }}
                        style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }} 
                        title="Click to view full image"
                      />
                      {(val.previewUrl || (val.photo && !val.photo.startsWith('default_') && !val.photo.startsWith('sectors/'))) && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...values];
                            updated[idx] = { ...updated[idx], file: null, previewUrl: '', photo: '' };
                            onChange(name, updated);
                          }}
                          style={{
                            position: 'absolute',
                            top: '-4px',
                            right: '-4px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '14px',
                            height: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '8px'
                          }}
                          title="Remove custom photo"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )}

                  {/* Choose photo option */}
                  {!(val.previewUrl || (val.photo && !val.photo.startsWith('default_') && !val.photo.startsWith('sectors/'))) && (
                    <label 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '6px', 
                        padding: '8px 12px', 
                        background: '#f1f5f9', 
                        border: '1px dashed #cbd5e1', 
                        borderRadius: '10px', 
                        cursor: 'pointer',
                        height: '42px',
                        width: '100%',
                        fontSize: '12px',
                        color: '#64748b',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Camera size={16} />
                      <span style={{ whiteSpace: 'nowrap' }}>Choose Photo</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const updated = [...values];
                              updated[idx] = { ...updated[idx], file: file, previewUrl: ev.target.result };
                              onChange(name, updated);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {values.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                style={{
                  padding: '8px',
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                  borderRadius: '12px',
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '42px',
                  width: '42px',
                  minWidth: '42px',
                  marginTop: '18px'
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAdd}
          className="btn btn-outline"
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            width: 'fit-content',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '2px',
            borderColor: '#6366f1',
            color: '#6366f1',
            background: 'transparent',
            borderRadius: '12px'
          }}
        >
          <Plus size={14} /> Add Deity (மேலும் தெய்வம் சேர்க்க)
        </button>
      </div>
    </div>
  );
};

const TempleList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTemple, setEditingTemple] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(GET_ALL_URL);
      if (res.ok) {
        const json = await res.json();
        const resultData = json.data || json;
        const rows = Array.isArray(resultData) ? resultData : (resultData?.data || []);
        const mappedData = rows.map(t => ({
          id: t.id,
          active: t.active,
          otherNames: t.other_names,
          specialFeatures: t.special_features,
          characteristics: t.characteristics,
          heritage: t.heritage,
          miracles: t.miracles,
          templeStructure: t.temple_structure,
          sanctumStructure: t.sanctum_structure,
          history: t.history,
          rajagopuramDirection: t.rajagopuram_direction,
          status: t.status,
          worshipType: t.worship_type,
          songPlace: Boolean(t.song_place),
          songNote: t.song_note,
          padalPadiyavar: t.padal_padiyavar,
          enthaPathi: t.entha_pathi,
          mandapams: t.mandapams,
          theivankal: t.theivankal || [],
          createdDate: t.created_date,
          templeBasicId: t.temple_basic_id
        }));
        setData(mappedData);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(t => 
      (t.otherNames || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.id?.toString() || '').includes(searchTerm)
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        if (valA === null || valA === undefined) valA = '';
        if (valB === null || valB === undefined) valB = '';
        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [data, searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize) || 1;
  const paginatedData = filteredAndSortedData.slice((page - 1) * pageSize, page * pageSize);

  const toggleSongPlace = async (temple) => {
    const newStatus = !temple.songPlace;
    const result = await showConfirm(`பாடல் பெற்ற ஸ்தலம் - நிலையை மாற்ற வேண்டுமா?`, `Change to ${newStatus ? 'ஆம் (Yes)' : 'இல்லை (No)'}?`);
    if (!result.isConfirmed) return;

    try {
      const updated = { ...temple, songPlace: newStatus };
      const payload = {
        id: updated.id,
        active: updated.active !== undefined ? updated.active : true,
        other_names: updated.otherNames,
        special_features: updated.specialFeatures,
        characteristics: updated.characteristics,
        heritage: updated.heritage,
        miracles: updated.miracles,
        temple_structure: updated.templeStructure,
        sanctum_structure: updated.sanctumStructure,
        history: updated.history,
        rajagopuram_direction: updated.rajagopuramDirection,
        status: updated.status,
        worship_type: updated.worshipType,
        song_place: updated.songPlace,
        song_note: updated.songNote,
        mandapams: updated.mandapams,
        temple_basic_id: updated.templeBasicId
      };
      
      const res = await fetch(`${API_BASE}/update/${temple.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to update status');
      setData(prev => prev.map(t => t.id === temple.id ? updated : t));
      showSuccess("வெற்றிகரமாக மாற்றப்பட்டது", "Status updated successfully");
    } catch (err) {
      showError("தோல்வி", "Update failed");
    }
  };

  const openEditModal = (temple) => {
    setEditingTemple({
      ...temple,
      mandapams: temple.mandapams ? temple.mandapams.split(',').map(s => s.trim()) : [''],
      otherNames: temple.otherNames ? temple.otherNames.split(',').map(s => s.trim()) : [''],
      padalPadiyavar: temple.padalPadiyavar || '',
      enthaPathi: temple.enthaPathi || '',
      theivankal: temple.theivankal && temple.theivankal.length > 0 
        ? temple.theivankal.map(t => ({ deivam: t.deivam, thesai: t.thesai, photo: t.photo || '', file: null, previewUrl: '' })) 
        : [{ deivam: '', thesai: '', photo: '', file: null, previewUrl: '' }]
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingTemple(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditArrayChange = (name, newValues) => {
    setEditingTemple(prev => ({
      ...prev,
      [name]: newValues
    }));
  };

  const saveEdit = async () => {
    try {
      const mandapamsStr = Array.isArray(editingTemple.mandapams) ? editingTemple.mandapams.filter(s => s.trim() !== '').join(', ') : editingTemple.mandapams;
      const otherNamesStr = Array.isArray(editingTemple.otherNames) ? editingTemple.otherNames.filter(s => s.trim() !== '').join(', ') : editingTemple.otherNames;

      const validDeities = (editingTemple.theivankal || [])
        .filter(t => t.deivam && t.thesai)
        .map(t => ({
          deivam: t.deivam,
          thesai: t.thesai,
          photo: t.photo || ''
        }));

      const formDataObj = new FormData();
      formDataObj.append('id', editingTemple.id);
      formDataObj.append('active', editingTemple.active !== undefined ? editingTemple.active : true);
      formDataObj.append('other_names', otherNamesStr);
      formDataObj.append('special_features', editingTemple.specialFeatures || '');
      formDataObj.append('characteristics', editingTemple.characteristics || '');
      formDataObj.append('heritage', editingTemple.heritage || '');
      formDataObj.append('miracles', editingTemple.miracles || '');
      formDataObj.append('temple_structure', editingTemple.templeStructure || '');
      formDataObj.append('sanctum_structure', editingTemple.sanctumStructure || '');
      formDataObj.append('history', editingTemple.history || '');
      formDataObj.append('rajagopuram_direction', editingTemple.rajagopuramDirection || '');
      formDataObj.append('status', editingTemple.status || '');
      formDataObj.append('worship_type', editingTemple.worshipType || '');
      formDataObj.append('song_place', editingTemple.songPlace ? 'true' : 'false');
      formDataObj.append('song_note', editingTemple.songNote || '');
      formDataObj.append('padal_padiyavar', editingTemple.padalPadiyavar || '');
      formDataObj.append('entha_pathi', editingTemple.enthaPathi || '');
      formDataObj.append('mandapams', mandapamsStr);
      formDataObj.append('temple_basic_id', editingTemple.templeBasicId);
      formDataObj.append('theivankal', JSON.stringify(validDeities));

      (editingTemple.theivankal || []).forEach((t, idx) => {
        if (t.deivam && t.thesai && t.file) {
          formDataObj.append(`theivankal_photo_${idx}`, t.file);
        }
      });

      const res = await fetch(`${API_BASE}/update/${editingTemple.id}`, {
        method: 'PUT',
        body: formDataObj
      });
      if (!res.ok) throw new Error('Update failed');
      
      await fetchData();
      setIsEditModalOpen(false);
      showSuccess("வெற்றிகரமாக மாற்றப்பட்டது", "Update successful");
    } catch (err) {
      showError("தோல்வி", "Update failed");
    }
  };

  const deleteTemple = async (id) => {
    const result = await showConfirm("நிச்சயமாக நீக்க வேண்டுமா?", "Delete this temple?");
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API_BASE}/delete/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setData(prev => prev.filter(t => t.id !== id));
      showSuccess("வெற்றிகரமாக நீக்கப்பட்டது", "Deleted successfully");
    } catch (err) {
      showError("தோல்வி", "Delete failed");
    }
  };

  const SortHeader = ({ label, sortKey }) => (
    <th onClick={() => requestSort(sortKey)} style={{ cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {label}
        <ArrowUpDown size={14} style={{ color: sortConfig.key === sortKey ? '#6366f1' : '#94a3b8' }} />
      </div>
    </th>
  );

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
      <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#6366f115', color: '#6366f1', padding: '10px', borderRadius: '12px' }}>
              <List size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: 0 }}>கோவில் பட்டியல் (Temple List)</h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>அனைத்து கோவில் விவரங்களை இங்கே நிர்வகிக்கவும்.</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/koviljoin')}>
            <Plus size={18} /> கோவில் சேர்க்க
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="header-search" style={{ width: '350px', background: '#f8fafc' }}>
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Page Size:</div>
            <select 
              className="form-control" 
              style={{ width: '80px', padding: '8px', paddingLeft: '12px' }} 
              value={pageSize} 
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
        <table className="premium-table">
          <thead>
            <tr>
              <SortHeader label="ID" sortKey="id" />
              <SortHeader label="தல பெயர்கள்" sortKey="otherNames" />
              <SortHeader label="தல சிறப்பு" sortKey="specialFeatures" />
              <SortHeader label="தொன்மை" sortKey="heritage" />
              <SortHeader label="அமைப்பு" sortKey="templeStructure" />
              <SortHeader label="நிலை" sortKey="status" />
              <SortHeader label="பாடல் பெற்ற" sortKey="songPlace" />
              <SortHeader label="தேதி" sortKey="createdDate" />
              <th className="sticky-column" style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '100px 0' }}>
                <Activity className="spin" size={32} color="#6366f1" />
                <p style={{ marginTop: '12px', color: '#64748b' }}>Loading temple data...</p>
              </td></tr>
            ) : paginatedData.length === 0 ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '100px 0' }}>
                <div style={{ color: '#94a3b8' }}>
                  <MoreHorizontal size={48} />
                  <p style={{ marginTop: '12px' }}>No temples found matching your search.</p>
                </div>
              </td></tr>
            ) : (
              paginatedData.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: '700', color: '#6366f1' }}>#{t.id}</td>
                  <td>
                    <div style={{ maxWidth: '200px' }}>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>{t.otherNames || '-'}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ maxWidth: '250px', fontSize: '13px', color: '#64748b' }}>
                      {t.specialFeatures ? (t.specialFeatures.length > 80 ? t.specialFeatures.substring(0, 80) + '...' : t.specialFeatures) : '-'}
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span style={{ color: '#64748b', fontSize: '13px' }}><Calendar size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {t.heritage || '-'}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px' }}><Building size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {t.templeStructure || '-'}</span>
                  </td>
                  <td>
                    <span className="badge-status badge-success" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                      {t.status || '-'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      onClick={() => toggleSongPlace(t)}
                      style={{ 
                        border: 'none', 
                        padding: '6px 16px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: '700',
                        cursor: 'pointer',
                        background: t.songPlace ? '#ecfdf5' : '#f1f5f9',
                        color: t.songPlace ? '#059669' : '#64748b',
                        transition: 'all 0.2s'
                      }}
                    >
                      {t.songPlace ? 'ஆம்' : 'இல்லை'}
                    </button>
                  </td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '13px', color: '#94a3b8' }}>
                    {t.createdDate ? new Date(t.createdDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="sticky-column">
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button className="icon-action" onClick={() => openEditModal(t)} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-action" style={{ color: '#ef4444', background: '#fef2f2' }} onClick={() => deleteTemple(t.id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
        <div className="pagination-wrapper">
          <div className="pagination-info">
            Showing <b>{(page - 1) * pageSize + 1}</b> to <b>{Math.min(page * pageSize, filteredAndSortedData.length)}</b> of <b>{filteredAndSortedData.length}</b> temples
          </div>
          
          <div className="pagination-btns">
            <button 
              className="btn btn-outline"
              disabled={page === 1} 
              onClick={() => setPage(page - 1)}
              style={{ padding: '8px 16px' }}
            >
              <ChevronLeft size={18} /> Prev
            </button>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', margin: '0 8px' }}>
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setPage(i + 1)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: 'none',
                    background: page === i + 1 ? '#6366f1' : 'transparent',
                    color: page === i + 1 ? 'white' : '#64748b',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              className="btn btn-outline"
              disabled={page >= totalPages} 
              onClick={() => setPage(page + 1)}
              style={{ padding: '8px 16px' }}
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {isEditModalOpen && editingTemple && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '10px' }}>
                  <Edit2 size={20} />
                </div>
                <h3 style={{ margin: 0 }}>கோவில் திருத்தம் (Edit Temple) - #{editingTemple.id}</h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group" style={{ gridColumn: 'span 3' }}>
                  <DynamicInputList 
                    label="தல வேறு பெயர்கள்" 
                    name="otherNames"
                    values={editingTemple.otherNames || ['']}
                    onChange={handleEditArrayChange}
                    placeholder="தலத்திற்கு வழங்கும் வேறு பெயர்கள்..."
                  />
                </div>
                
                <div className="form-group" style={{ gridColumn: 'span 3' }}>
                  <label className="form-label">தல சிறப்பு</label>
                  <textarea name="specialFeatures" className="form-control" style={{ paddingLeft: '16px' }} rows="2" value={editingTemple.specialFeatures} onChange={handleEditChange} />
                </div>

                <div className="form-group">
                  <label className="form-label">தொன்மை</label>
                  <input type="text" name="heritage" className="form-control" style={{ paddingLeft: '16px' }} value={editingTemple.heritage} onChange={handleEditChange} />
                </div>

                <div className="form-group">
                  <label className="form-label">கோயில் அமைப்பு</label>
                  <input type="text" name="templeStructure" className="form-control" style={{ paddingLeft: '16px' }} value={editingTemple.templeStructure} onChange={handleEditChange} />
                </div>

                <div className="form-group">
                  <label className="form-label">நிலை</label>
                  <select name="status" className="form-control" style={{ paddingLeft: '16px', appearance: 'auto' }} value={editingTemple.status} onChange={handleEditChange}>
                    <option value="ஒன்று">ஒன்று</option><option value="மூன்று">மூன்று</option>
                    <option value="ஐந்து">ஐந்து</option><option value="ஏழு">ஏழு</option>
                    <option value="ஒன்பது">ஒன்பது</option><option value="பதினொன்று">பதினொன்று</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">வழிபாட்டு வகை (Worship Type)</label>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                    {['குலத்தவர் மட்டும்', 'குலத்தவர் + பொது', 'பொது மட்டும்'].map(type => (
                      <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="worshipType" 
                          value={type} 
                          checked={editingTemple.worshipType === type} 
                          onChange={handleEditChange} 
                          className="form-check-input"
                        /> {type}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 3' }}>
                  <DynamicInputList 
                    label="மண்டபங்கள் (Mandapams)" 
                    name="mandapams"
                    values={editingTemple.mandapams || ['']}
                    onChange={handleEditArrayChange}
                    placeholder="மண்டபங்களின் பெயர்கள்"
                  />
                </div>

                <DynamicDeityList 
                  label="தெய்வங்கள் மற்றும் திசைகள் (Deities and Directions)" 
                  name="theivankal"
                  values={editingTemple.theivankal || [{ deivam: '', thesai: '' }]}
                  onChange={handleEditArrayChange}
                />

                <div className="form-group" style={{ gridColumn: 'span 3' }}>
                  <label className="form-label">தல வரலாறு</label>
                  <textarea name="history" className="form-control" style={{ paddingLeft: '16px' }} rows="4" value={editingTemple.history} onChange={handleEditChange} />
                </div>

                <div className="form-group">
                  <label className="form-label">பாடல் பாடியவர்</label>
                  <input type="text" name="padalPadiyavar" className="form-control" style={{ paddingLeft: '16px' }} value={editingTemple.padalPadiyavar || ''} onChange={handleEditChange} />
                </div>

                <div className="form-group">
                  <label className="form-label">எந்தப் பதி</label>
                  <input type="text" name="enthaPathi" className="form-control" style={{ paddingLeft: '16px' }} value={editingTemple.enthaPathi || ''} onChange={handleEditChange} />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '28px' }}>
                  <input type="checkbox" name="songPlace" id="editSongPlace" checked={editingTemple.songPlace} onChange={handleEditChange} className="form-check-input" />
                  <label htmlFor="editSongPlace" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>பாடல் பெற்ற ஸ்தலம்</label>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 3' }}>
                  <label className="form-label">பாடல் குறிப்பு</label>
                  <textarea name="songNote" className="form-control" style={{ paddingLeft: '16px' }} rows="2" value={editingTemple.songNote} onChange={handleEditChange} />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={() => setIsEditModalOpen(false)} className="btn btn-outline">
                Cancel
              </button>
              <button onClick={saveEdit} className="btn btn-primary">
                Update Details <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TempleList;
