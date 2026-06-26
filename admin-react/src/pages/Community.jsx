import { BASE_API } from '../api/api_list';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Search, 
  PlusCircle, 
  XCircle, 
  Save, 
  RefreshCw, 
  User, 
  Trash2, 
  ChevronRight,
  Activity,
  List,
  CheckSquare,
  Square
} from 'lucide-react';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

const API_BASE_URL = BASE_API + '/user_communities';

const SearchableSelect = ({ label, placeholder, value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filteredOptions = options.filter(opt => 
    String(opt).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="form-group" ref={containerRef} style={{ position: 'relative' }}>
      <label className="form-label" style={{ fontWeight: '600', fontSize: '13px', color: '#475569', marginBottom: '6px' }}>{label}</label>
      <div className="input-wrapper" style={{ margin: 0, position: 'relative' }}>
        <div 
          onClick={() => setIsOpen(!isOpen)}
          style={{ 
            paddingLeft: '16px', 
            paddingRight: '40px',
            height: '42px', 
            fontSize: '14px', 
            borderRadius: '10px', 
            border: '1px solid #e2e8f0', 
            background: '#fff',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            color: value ? '#0f172a' : '#94a3b8'
          }}
        >
          {value || `Select ${placeholder}`}
        </div>
        <ChevronRight size={16} color="#64748b" style={{ position: 'absolute', right: '14px', top: '50%', transform: `translateY(-50%) rotate(${isOpen ? 90 : 0}deg)`, transition: 'transform 0.2s', pointerEvents: 'none' }} />
        
        {isOpen && (
          <div style={{ position: 'absolute', top: '48px', left: 0, width: '100%', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 10, overflow: 'hidden' }}>
            <div style={{ padding: '8px', borderBottom: '1px solid #f1f5f9' }}>
              <input 
                type="text" 
                placeholder={`Search ${placeholder}...`} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <div 
                onClick={() => {
                  onChange({ target: { value: '' } });
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', color: '#ef4444', fontWeight: '500' }}
                onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                -- Select None --
              </div>
              {filteredOptions.map((opt, i) => (
                <div 
                  key={i} 
                  onClick={() => {
                    onChange({ target: { value: opt } });
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', background: value === opt ? '#eff6ff' : 'transparent', borderTop: '1px solid #f8fafc' }}
                  onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
                  onMouseLeave={(e) => e.target.style.background = value === opt ? '#eff6ff' : 'transparent'}
                >
                  {opt}
                </div>
              ))}
              {filteredOptions.length === 0 && (
                <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>No options found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Community = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data states
  const [externalUsers, setExternalUsers] = useState([]);
  const [mappedUsers, setMappedUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sectorsList, setSectorsList] = useState([]);
  const [subSectorsList, setSubSectorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dropdown states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const userDropdownRef = useRef(null);
  
  // Selected categories
  const [selectedPrimary, setSelectedPrimary] = useState([]);
  const [selectedSub, setSelectedSub] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    user_id: '',
    user_main_id: '',
    religion: '',  // Sector Title Name
    community: '', // Sector Name
    sub_caste: ''  // Sub Sector Name
  });

  useEffect(() => {
    fetchExternalUsers();
    fetchMappedUsers();
    fetchCategories();
    fetchSectors();
    fetchSubSectors();

    const handleOutsideClick = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const fetchExternalUsers = async () => {
    try {
      const res = await fetch('https://user.jobes24x7.com/api/logins');
      if (res.ok) {
        const json = await res.json();
        setExternalUsers(json.data?.data || []);
      }
    } catch (err) {
      console.error('Error fetching external users:', err);
    }
  };

  const fetchMappedUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE_URL);
      if (res.ok) {
        const json = await res.json();
        setMappedUsers(json.data || []);
      }
    } catch (err) {
      console.error('Error fetching mapped users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(BASE_API + '/outsideapis/categories?t=' + Date.now());
      if (res.ok) {
        const json = await res.json();
        setCategories(json.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchSectors = async () => {
    try {
      const res = await fetch(BASE_API + '/outsideapis/sectors?t=' + Date.now());
      if (res.ok) {
        const json = await res.json();
        setSectorsList(json.data || []);
      }
    } catch (err) {
      console.error('Error fetching sectors:', err);
    }
  };

  const fetchSubSectors = async () => {
    try {
      const res = await fetch(BASE_API + '/outsideapis/sub-sectors?t=' + Date.now());
      if (res.ok) {
        const json = await res.json();
        setSubSectorsList(json.data || []);
      }
    } catch (err) {
      console.error('Error fetching sub-sectors:', err);
    }
  };

  const handleExternalUserSelect = (user) => {
    if (!user) {
      setFormData(prev => ({
        ...prev,
        user_id: '',
        user_main_id: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        user_id: String(user.id),
        user_main_id: user.user_main_id ? String(user.user_main_id) : ''
      }));
    }
    setIsDropdownOpen(false);
    setUserSearchTerm('');
  };

  const handleReligionChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      religion: value,
      community: '',
      sub_caste: ''
    }));
    setSelectedPrimary([]);
    setSelectedSub([]);
  };

  const handleCommunityChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      community: value,
      sub_caste: ''
    }));
    setSelectedPrimary([]);
    setSelectedSub([]);
  };

  const handleSubCasteChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      sub_caste: value
    }));
    setSelectedPrimary([]);
    setSelectedSub([]);
  };

  // Hierarchy derivation
  const sectorTitles = Array.from(new Set(sectorsList.map(s => s.sector_title_name).filter(Boolean))).sort();
  
  const sectors = Array.from(new Set(
    sectorsList
      .filter(s => s.sector_title_name === formData.religion)
      .map(s => s.sector_name)
      .filter(Boolean)
  )).sort();

  const subSectors = Array.from(new Set(
    subSectorsList
      .filter(s => s.sector_title_name === formData.religion && s.sector_name === formData.community)
      .map(s => s.sub_sector_name)
      .filter(Boolean)
  )).sort();

  // Primary categories belong to the selected Sub Sector, Sector, and Sector Title
  const primaryCategoriesList = categories.filter(c => 
    c.category_type === 'primary' && 
    c.sector_title_name === formData.religion &&
    c.sector_name === formData.community &&
    c.sub_sector_name === formData.sub_caste
  );

  // Sub categories belong to the selected Primary Categories
  const subCategoriesList = categories.filter(c => 
    c.category_type === 'secondary' && 
    selectedPrimary.some(p => p.id === c.parent_category_id || p.category_name === c.parent_category_name)
  );

  const handlePrimarySelect = (cat) => {
    setSelectedPrimary(prev => {
      const exists = prev.some(p => p.id === cat.id);
      let updated;
      if (exists) {
        updated = prev.filter(p => p.id !== cat.id);
      } else {
        updated = [...prev, cat];
      }
      
      // Clean up sub categories that belong to removed primary categories
      setSelectedSub(subPrev => subPrev.filter(s => 
        updated.some(p => p.id === s.parent_category_id || p.category_name === s.parent_category_name)
      ));
      
      return updated;
    });
  };

  const handleSubSelect = (cat) => {
    setSelectedSub(prev => {
      const exists = prev.some(s => s.id === cat.id);
      if (exists) {
        return prev.filter(s => s.id !== cat.id);
      } else {
        return [...prev, cat];
      }
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.user_id) {
      showWarning("பயனரை தேர்ந்தெடுக்கவும்", "Please select a user");
      return;
    }
    if (!formData.religion) {
      showWarning("துறைத் தலைப்பைத் தேர்ந்தெடுக்கவும்", "Please select a Sector Title");
      return;
    }
    if (!formData.community) {
      showWarning("துறையைத் தேர்ந்தெடுக்கவும்", "Please select a Sector");
      return;
    }
    if (!formData.sub_caste) {
      showWarning("துணைத் துறையைத் தேர்ந்தெடுக்கவும்", "Please select a Sub Sector");
      return;
    }

    // Resolve IDs and Names from sectorsList, subSectorsList, fallback to categories
    const selectedTitleObj = sectorsList.find(s => s.sector_title_name === formData.religion) || categories.find(c => c.sector_title_name === formData.religion);
    const selectedSectorObj = sectorsList.find(s => s.sector_title_name === formData.religion && s.sector_name === formData.community) || categories.find(c => c.sector_title_name === formData.religion && c.sector_name === formData.community);
    const selectedSubSectorObj = subSectorsList.find(s => s.sector_title_name === formData.religion && s.sector_name === formData.community && s.sub_sector_name === formData.sub_caste) || categories.find(c => c.sector_title_name === formData.religion && c.sector_name === formData.community && c.sub_sector_name === formData.sub_caste);

    if (!selectedTitleObj || !selectedSectorObj || !selectedSubSectorObj) {
      showError("பிழை", "Could not resolve Sector/Title/Sub-Sector IDs");
      return;
    }

    const payload = {
      user_id: formData.user_id,
      user_main_id: formData.user_main_id || null,
      sector_title_id: selectedTitleObj.sector_title_id,
      sector_title_name: selectedTitleObj.sector_title_name,
      sector_id: selectedSectorObj.id || selectedSectorObj.sector_id,
      sector_name: selectedSectorObj.sector_name,
      sub_sector_id: selectedSubSectorObj.id || selectedSubSectorObj.sub_sector_id,
      sub_sector_name: selectedSubSectorObj.sub_sector_name,
      primary_category_ids: selectedPrimary.map(p => p.id),
      sub_category_ids: selectedSub.map(s => s.id)
    };

    try {
      const res = await fetch(`${API_BASE_URL}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showSuccess("வெற்றிகரமாக சேமிக்கப்பட்டது!", "User community details mapped successfully!");
        setShowForm(false);
        setFormData({
          user_id: '',
          user_main_id: '',
          religion: '',
          community: '',
          sub_caste: ''
        });
        setSelectedPrimary([]);
        setSelectedSub([]);
        fetchMappedUsers();
      } else {
        const errData = await res.json();
        showError("தோல்வி", errData.message || "Failed to save mapping");
      }
    } catch (err) {
      showError("தொடர்பு பிழை", "Connection error");
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm("நிச்சயமாக நீக்க வேண்டுமா?", "Are you sure you want to delete this mapping?");
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API_BASE_URL}/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchMappedUsers();
        showSuccess("நீக்கப்பட்டது", "Deleted successfully");
      }
    } catch (err) {
      showError("நீக்குவதில் பிழை", "Error deleting record");
    }
  };

  // Resolve search filter dynamically
  const filteredData = mappedUsers.filter(item => {
    const matchedUser = externalUsers.find(u => String(u.id) === String(item.user_id));
    const userName = matchedUser ? (matchedUser.user_name || '') : '';
    const userPhone = matchedUser ? (matchedUser.phone_number || '') : '';
    const userMainId = item.user_main_id || '';

    const sectorTitleName = item.sector_title_name || '';
    const sectorName = item.sector_name || '';
    const subSectorName = item.sub_sector_name || '';

    const term = searchQuery.toLowerCase();
    return userName.toLowerCase().includes(term) || 
           sectorTitleName.toLowerCase().includes(term) || 
           sectorName.toLowerCase().includes(term) || 
           subSectorName.toLowerCase().includes(term) || 
           userPhone.includes(term) ||
           userMainId.toLowerCase().includes(term);
  });

  const selectedUserInfo = externalUsers.find(u => String(u.id) === String(formData.user_id));

  return (
    <div className="form-card" style={{ maxWidth: '1400px' }}>
      <div className="form-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Users size={24} color="#6366f1" />
          <h2 style={{ margin: 0, fontSize: '20px' }}>சமூகம் மற்றும் சாதி (Community & Caste)</h2>
        </div>
        <p style={{ fontSize: '13px' }}>பயனர்களின் மதம், சமூகம் மற்றும் உட்பிரிவு விவரங்களை இங்கே இணைக்கலாம்.</p>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showForm ? '20px' : '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PlusCircle size={18} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>புதிய விவரம் சேர்க்க (Add New Mapping)</h3>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ height: '36px', padding: '0 16px', fontSize: '13px' }}>
            {showForm ? <><XCircle size={14} /> Cancel</> : <><PlusCircle size={14} /> Add Mapping</>}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSave} className="animate-fade-in" style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              <div className="form-group" style={{ gridColumn: 'span 2' }} ref={userDropdownRef}>
                <label className="form-label" style={{ fontWeight: '600', fontSize: '13.5px', color: '#475569', marginBottom: '6px' }}>
                  பயனரைத் தேர்ந்தெடுக்கவும் (Select Existing User) *
                </label>
                <div className="input-wrapper" style={{ position: 'relative' }}>
                  <User className="input-icon" size={16} color="#6366f1" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{ 
                      paddingLeft: '40px', 
                      height: '44px', 
                      fontSize: '14px', 
                      borderRadius: '10px', 
                      border: '1px solid #e2e8f0', 
                      background: '#fff',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      color: formData.user_id ? '#0f172a' : '#94a3b8'
                    }}
                  >
                    {selectedUserInfo 
                      ? `${selectedUserInfo.user_name || selectedUserInfo.phone_number} ${selectedUserInfo.email ? `(${selectedUserInfo.email})` : ''}`
                      : '-- பயனரைத் தேர்ந்தெடுக்கவும் (Select User) --'
                    }
                  </div>

                  <ChevronRight size={16} color="#64748b" style={{ position: 'absolute', right: formData.user_id ? '42px' : '14px', top: '50%', transform: `translateY(-50%) rotate(${isDropdownOpen ? 90 : 0}deg)`, transition: 'transform 0.2s', pointerEvents: 'none' }} />

                  {isDropdownOpen && (
                    <div style={{ position: 'absolute', top: '50px', left: 0, width: '100%', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 10, overflow: 'hidden' }}>
                      <div style={{ padding: '10px', borderBottom: '1px solid #f1f5f9' }}>
                        <input 
                          type="text" 
                          placeholder="பயனரை தேடவும் (Search user)..." 
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        <div 
                          onClick={() => handleExternalUserSelect(null)}
                          style={{ padding: '10px 14px', fontSize: '13px', cursor: 'pointer', background: !formData.user_id ? '#f1f5f9' : 'transparent', color: '#ef4444', fontWeight: '500' }}
                          onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                          onMouseLeave={(e) => e.target.style.background = !formData.user_id ? '#f1f5f9' : 'transparent'}
                        >
                          -- தேர்வை நீக்கு (Clear Selection) --
                        </div>
                        {externalUsers.filter(u => {
                          const term = userSearchTerm.toLowerCase();
                          return String(u.user_name || '').toLowerCase().includes(term) || 
                                 String(u.email || '').toLowerCase().includes(term) || 
                                 String(u.phone_number || '').toLowerCase().includes(term) ||
                                 String(u.user_main_id || '').toLowerCase().includes(term);
                        }).map(user => (
                          <div 
                            key={user.id} 
                            onClick={() => handleExternalUserSelect(user)}
                            style={{ padding: '10px 14px', fontSize: '13px', cursor: 'pointer', borderTop: '1px solid #f8fafc', background: String(formData.user_id) === String(user.id) ? '#eff6ff' : 'transparent' }}
                            onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
                            onMouseLeave={(e) => e.target.style.background = String(formData.user_id) === String(user.id) ? '#eff6ff' : 'transparent'}
                          >
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>
                              {user.user_name || user.phone_number || 'Unnamed User'} 
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{user.email || user.phone_number}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <SearchableSelect 
                label="துறைத் தலைப்பு (Sector Title) *" 
                placeholder="Sector Title"
                value={formData.religion} 
                onChange={handleReligionChange} 
                options={sectorTitles} 
              />

              <SearchableSelect 
                label="துறை (Sector) *" 
                placeholder="Sector"
                value={formData.community} 
                onChange={handleCommunityChange} 
                options={sectors} 
              />

              <div style={{ gridColumn: 'span 2' }}>
                <SearchableSelect 
                  label="துணைத் துறை (Sub Sector) *" 
                  placeholder="Sub Sector"
                  value={formData.sub_caste} 
                  onChange={handleSubCasteChange} 
                  options={subSectors} 
                />
              </div>

              {/* Dynamic Categories Selection lists */}
              {formData.sub_caste && (
                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '20px', marginTop: '10px' }}>
                  
                  {/* Primary Categories selection list */}
                  <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fff', overflow: 'hidden' }}>
                    <div style={{ padding: '10px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', fontSize: '13px', color: '#1e293b' }}>Primary Categories</span>
                      <span style={{ background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
                        {primaryCategoriesList.length} Available
                      </span>
                    </div>
                    <div style={{ maxHeight: '250px', overflowY: 'auto', padding: '8px' }}>
                      {primaryCategoriesList.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                          No primary categories found for this sub sector.
                        </div>
                      ) : (
                        primaryCategoriesList.map(cat => {
                          const isChecked = selectedPrimary.some(p => p.id === cat.id);
                          return (
                            <div 
                              key={cat.id} 
                              onClick={() => handlePrimarySelect(cat)}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                padding: '8px 12px', 
                                borderRadius: '6px', 
                                cursor: 'pointer',
                                background: isChecked ? '#eff6ff' : 'transparent',
                                border: isChecked ? '1px solid #bfdbfe' : '1px solid transparent',
                                marginBottom: '4px',
                                transition: 'all 0.15s ease-in-out'
                              }}
                            >
                              {isChecked ? <CheckSquare size={16} color="#2563eb" /> : <Square size={16} color="#64748b" />}
                              <span style={{ fontSize: '13px', color: '#334155', fontWeight: isChecked ? '600' : '400' }}>{cat.category_name}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Sub Categories selection list */}
                  <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '10px', background: '#fff', overflow: 'hidden' }}>
                    <div style={{ padding: '10px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', fontSize: '13px', color: '#1e293b' }}>Sub Categories</span>
                      <span style={{ background: '#22c55e', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
                        {subCategoriesList.length} Showing
                      </span>
                    </div>
                    <div style={{ maxHeight: '250px', overflowY: 'auto', padding: '8px' }}>
                      {selectedPrimary.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                          Select primary categories first to load sub categories.
                        </div>
                      ) : subCategoriesList.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                          No sub categories found for selected primary categories.
                        </div>
                      ) : (
                        subCategoriesList.map(cat => {
                          const isChecked = selectedSub.some(s => s.id === cat.id);
                          return (
                            <div 
                              key={cat.id} 
                              onClick={() => handleSubSelect(cat)}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                padding: '8px 12px', 
                                borderRadius: '6px', 
                                cursor: 'pointer',
                                background: isChecked ? '#f0fdf4' : 'transparent',
                                border: isChecked ? '1px solid #bbf7d0' : '1px solid transparent',
                                marginBottom: '4px',
                                transition: 'all 0.15s ease-in-out'
                              }}
                            >
                              {isChecked ? <CheckSquare size={16} color="#16a34a" /> : <Square size={16} color="#64748b" />}
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '13px', color: '#334155', fontWeight: isChecked ? '600' : '400' }}>{cat.category_name}</span>
                                <span style={{ fontSize: '10px', color: '#64748b' }}>under {cat.parent_category_name}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* Selection Summary Chips */}
              {(selectedPrimary.length > 0 || selectedSub.length > 0) && (
                <div style={{ gridColumn: 'span 2', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedPrimary.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569', minWidth: '70px' }}>Primary:</span>
                      {selectedPrimary.map(p => (
                        <span 
                          key={p.id} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            background: '#eff6ff', 
                            color: '#1d4ed8', 
                            border: '1px solid #bfdbfe', 
                            padding: '3px 10px', 
                            borderRadius: '20px', 
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          {p.category_name}
                          <XCircle 
                            size={14} 
                            style={{ cursor: 'pointer', color: '#3b82f6' }} 
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrimarySelect(p);
                            }} 
                          />
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {selectedSub.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569', minWidth: '70px' }}>Sub:</span>
                      {selectedSub.map(s => (
                        <span 
                          key={s.id} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            background: '#f0fdf4', 
                            color: '#15803d', 
                            border: '1px solid #bbf7d0', 
                            padding: '3px 10px', 
                            borderRadius: '20px', 
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
                        >
                          {s.category_name}
                          <XCircle 
                            size={14} 
                            style={{ cursor: 'pointer', color: '#22c55e' }} 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSubSelect(s);
                            }} 
                          />
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ height: '42px', padding: '0 24px' }}>
                  Save Mapping <Save size={16} style={{ marginLeft: '8px' }} />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <List size={18} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>பதிவான விவரங்கள் (Mapped Details)</h3>
          </div>
          
          <div className="input-wrapper" style={{ width: '300px', margin: 0 }}>
            <Search className="input-icon" size={14} />
            <input 
              type="text" className="form-control" placeholder="பெயர் அல்லது துறை தேடல்..." 
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{ height: '36px', fontSize: '13px', paddingLeft: '32px' }}
            />
          </div>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>பயனர் விவரம் (User Details)</th>
                <th>துறைத் தலைப்பு (Sector Title)</th>
                <th>துறை (Sector)</th>
                <th>துணைத் துறை (Sub Sector)</th>
                <th>பிரிவுகள் (Categories)</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}><Activity className="spin" size={24} color="#6366f1" /></td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>பதிவுகள் இல்லை</td></tr>
              ) : (
                filteredData.map((item, idx) => {
                  const matchedUser = externalUsers.find(u => String(u.id) === String(item.user_id));
                  
                  const sectorTitleName = item.sector_title_name || '--';
                  const sectorName = item.sector_name || '--';
                  const subSectorName = item.sub_sector_name || '--';

                  const primaryNames = categories
                    .filter(c => c.category_type === 'primary' && item.primary_category_ids?.includes(c.id))
                    .map(c => c.category_name)
                    .join(', ');

                  const subNames = categories
                    .filter(c => c.category_type === 'secondary' && item.sub_category_ids?.includes(c.id))
                    .map(c => c.category_name)
                    .join(', ');

                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: '700', color: '#6366f1', fontSize: '13px' }}>{idx + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={16} color="#6366f1" />
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '13.5px' }}>{matchedUser?.user_name || 'Unnamed'}</div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              {matchedUser?.email && <span>{matchedUser.email}</span>}
                              {matchedUser?.phone_number && <span>{matchedUser.phone_number}</span>}
                              {!matchedUser?.email && !matchedUser?.phone_number && <span>--</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td><div style={{ fontSize: '13px', color: '#475569' }}>{sectorTitleName}</div></td>
                      <td><span className="badge-status" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', fontSize: '11px' }}>{sectorName}</span></td>
                      <td><div style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a' }}>{subSectorName}</div></td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '300px' }}>
                          {primaryNames && (
                            <div style={{ fontSize: '12px', color: '#334155' }}>
                              <strong>Primary:</strong> {primaryNames}
                            </div>
                          )}
                          {subNames && (
                            <div style={{ fontSize: '12px', color: '#166534' }}>
                              <strong>Sub:</strong> {subNames}
                            </div>
                          )}
                          {!primaryNames && !subNames && <span style={{ color: '#94a3b8' }}>--</span>}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button className="icon-action" style={{ color: '#ef4444', background: '#fef2f2' }} onClick={() => handleDelete(item.id)}><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Community;
