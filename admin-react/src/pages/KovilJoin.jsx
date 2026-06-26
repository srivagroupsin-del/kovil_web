import { BASE_API } from '../api/api_list';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Church, 
  MapPin, 
  Flag, 
  Globe, 
  Hash, 
  User, 
  ArrowRight,
  PlusCircle,
  ChevronRight,
  XCircle,
  CheckSquare,
  Square,
  Activity,
  Compass
} from 'lucide-react';
import { showError, showWarning } from '../utils/swal';

const FormInput = ({ label, name, value, onChange, icon: Icon, placeholder, required = false, readOnly = false }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <div className="input-wrapper">
      {Icon && <Icon className="input-icon" size={18} />}
      <input 
        type="text" 
        id={name}
        name={name}
        className="form-control" 
        placeholder={placeholder}
        value={value} 
        onChange={onChange} 
        required={required} 
        readOnly={readOnly}
        style={readOnly ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' } : {}}
      />
    </div>
  </div>
);

const SearchableSelect = ({ label, placeholder, value, onChange, options, icon: Icon }) => {
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
      <label className="form-label">{label}</label>
      <div className="input-wrapper" style={{ margin: 0, position: 'relative' }}>
        {Icon && <Icon className="input-icon" size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', zIndex: 1, pointerEvents: 'none', color: '#94a3b8' }} />}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="form-control"
          style={{ 
            paddingLeft: Icon ? '42px' : '16px', 
            paddingRight: '40px',
            height: '42px', 
            fontSize: '14px', 
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            color: value ? '#1e293b' : '#94a3b8'
          }}
        >
          {value || `Select ${placeholder}`}
        </div>
        <ChevronRight size={16} color="#64748b" style={{ position: 'absolute', right: '14px', top: '50%', transform: `translateY(-50%) rotate(${isOpen ? 90 : 0}deg)`, transition: 'transform 0.2s', pointerEvents: 'none', zIndex: 2 }} />
        
        {isOpen && (
          <div style={{ position: 'absolute', top: '48px', left: 0, width: '100%', background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 10, overflow: 'hidden' }}>
            <div style={{ padding: '8px', borderBottom: '1px solid #f1f5f9' }}>
              <input 
                type="text" 
                placeholder={`Search ${placeholder}...`} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', background: '#fff' }}
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

const KovilJoin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [sectorsList, setSectorsList] = useState([]);
  const [subSectorsList, setSubSectorsList] = useState([]);
  
  // Selected categories
  const [selectedPrimary, setSelectedPrimary] = useState([]);
  const [selectedSub, setSelectedSub] = useState([]);

  const [formData, setFormData] = useState({
    mulavarName: '',
    templeName: '',
    villageName: '',
    district: '',
    state: '',
    country: 'இந்தியா',
    pincode: '',
    
    // Community hierarchy
    religion: 'Devotees',  // Sector Title Name
    community: '', // Sector Name
    sub_caste: ''  // Sub Sector Name
  });

  useEffect(() => {
    fetchCategories();
    fetchSectors();
    fetchSubSectors();
  }, []);

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

  useEffect(() => {
    const fetchPincodeDetails = async () => {
      if (formData.pincode.length === 6) {
        try {
          const response = await fetch(`https://localcity.jobes24x7.com/api/pincode/details/${formData.pincode}`);
          const res = await response.json();
          
          if (res.data?.result === 'Success' && res.data?.data?.length > 0) {
            const details = res.data.data[0];
            setFormData(prev => ({
              ...prev,
              villageName: details.city_name || details.taluk_name || prev.villageName,
              district: details.district_name || prev.district,
              state: details.state_name || prev.state,
              country: details.country_name || prev.country
            }));
          }
        } catch (error) {
          console.error('Error fetching pincode details:', error);
        }
      } else {
        setFormData(prev => ({
          ...prev,
          villageName: '',
          district: '',
          state: '',
          country: 'இந்தியா'
        }));
      }
    };

    fetchPincodeDetails();
  }, [formData.pincode]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Resolve IDs and Names from sectorsList, subSectorsList, fallback to categories
      const selectedTitleObj = sectorsList.find(s => s.sector_title_name === formData.religion) || categories.find(c => c.sector_title_name === formData.religion);
      const selectedSectorObj = sectorsList.find(s => s.sector_title_name === formData.religion && s.sector_name === formData.community) || categories.find(c => c.sector_title_name === formData.religion && c.sector_name === formData.community);
      const selectedSubSectorObj = subSectorsList.find(s => s.sector_title_name === formData.religion && s.sector_name === formData.community && s.sub_sector_name === formData.sub_caste) || categories.find(c => c.sector_title_name === formData.religion && c.sector_name === formData.community && c.sub_sector_name === formData.sub_caste);

      const payload = {
        country: formData.country,
        district: formData.district,
        mulavar_name: formData.mulavarName,
        pincode: formData.pincode,
        state: formData.state,
        temple_name: formData.templeName,
        village_name: formData.villageName,
        
        // Community mapping
        sector_title_id: selectedTitleObj ? selectedTitleObj.sector_title_id : null,
        sector_title_name: selectedTitleObj ? selectedTitleObj.sector_title_name : null,
        sector_id: selectedSectorObj ? (selectedSectorObj.id || selectedSectorObj.sector_id) : null,
        sector_name: selectedSectorObj ? selectedSectorObj.sector_name : null,
        sub_sector_id: selectedSubSectorObj ? (selectedSubSectorObj.id || selectedSubSectorObj.sub_sector_id) : null,
        sub_sector_name: selectedSubSectorObj ? selectedSubSectorObj.sub_sector_name : null,
        primary_category_ids: selectedPrimary.map(p => p.id),
        sub_category_ids: selectedSub.map(s => s.id)
      };

      const response = await fetch(BASE_API + '/temple_basic_detail/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const res = await response.json();
      const insertedId = res.data?.data?.id || '';
      
      navigate(`/kovil?basicId=${insertedId}&mulavarName=${encodeURIComponent(formData.mulavarName)}&templeName=${encodeURIComponent(formData.templeName)}`);
      
    } catch (err) {
      showError('சேமிப்பதில் பிழை ஏற்பட்டது', 'Error saving data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card" style={{ maxWidth: '1200px' }}>
      <div className="form-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <PlusCircle size={28} color="#6366f1" />
          <h2 style={{ margin: 0 }}>புதிய கோவில் சேர்க்க (Add New Temple)</h2>
        </div>
        <p>கீழே உள்ள படிவத்தைப் பூர்த்தி செய்து புதிய கோவில் விவரங்களைச் சேர்க்கவும்.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <FormInput 
              label="மூலவர் பெயர் (Mulavar Name)" 
              name="mulavarName"
              value={formData.mulavarName}
              onChange={handleChange}
              icon={User}
              placeholder="எ.கா: ஸ்ரீ விநாயகர்"
              required
            />

            <FormInput 
              label="கோவில் பெயர் (Temple Name)" 
              name="templeName"
              value={formData.templeName}
              onChange={handleChange}
              icon={Church}
              placeholder="எ.கா: அருள்மிகு விநாயகர் கோவில்"
              required
            />

            <FormInput 
              label="பின்கோடு (Pincode)" 
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              icon={Hash}
              placeholder="6 இலக்க பின்கோடு"
            />

            <FormInput 
              label="ஊர் (Village/Town)" 
              name="villageName"
              value={formData.villageName}
              onChange={handleChange}
              icon={MapPin}
              placeholder="ஊரின் பெயரை உள்ளிடவும்"
            />

            <FormInput 
              label="மாவட்டம் (District)" 
              name="district"
              value={formData.district}
              onChange={handleChange}
              icon={MapPin}
              placeholder="மாவட்டத்தின் பெயரை உள்ளிடவும்"
            />

            <FormInput 
              label="மாநிலம் (State)" 
              name="state"
              value={formData.state}
              onChange={handleChange}
              icon={Flag}
              placeholder="மாநிலத்தின் பெயரை உள்ளிடவும்"
            />

            <FormInput 
              label="நாடு (Country)" 
              name="country"
              value={formData.country}
              onChange={handleChange}
              icon={Globe}
              placeholder="நாட்டின் பெயரை உள்ளிடவும்"
            />
            
            <div style={{ gridColumn: 'span 2', margin: '10px 0', borderTop: '1px dashed #e2e8f0' }} />

            {/* Mappings selection */}
            <SearchableSelect 
              label="மதம் (Religion) *" 
              placeholder="Religion"
              value={formData.community} 
              onChange={handleCommunityChange} 
              options={sectors} 
              icon={Compass}
            />

            <SearchableSelect 
              label="தெய்வங்கள் வழிபாடு (Deities Worship) *" 
              placeholder="Deities Worship"
              value={formData.sub_caste} 
              onChange={handleSubCasteChange} 
              options={subSectors} 
              icon={Activity}
            />

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

          </div>

          <div className="form-actions" style={{ marginTop: '24px' }}>
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? 'Processing...' : (
                <>
                  Next Step <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KovilJoin;
