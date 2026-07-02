import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const generationOptions = [
  { value: '1', label: '1-ஆம் தலைமுறை (1st Generation)' },
  { value: '2', label: '2-ஆம் தலைமுறை (2nd Generation)' },
  { value: '3', label: '3-ஆம் தலைமுறை (3rd Generation)' },
  { value: '4', label: '4-ஆம் தலைமுறை (4th Generation)' },
  { value: '5', label: '5-ஆம் தலைமுறை (5th Generation)' },
  { value: '6', label: '6-ஆம் தலைமுறை (6th Generation)' },
  { value: '7', label: '7-ஆம் தலைமுறை (7th Generation)' },
  { value: '8', label: '8-ஆம் தலைமுறை (8th Generation)' },
  { value: '9', label: '9-ஆம் தலைமுறை (9th Generation)' },
  { value: '10', label: '10-ஆம் தலைமுறை + (10th Generation+)' }
];

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

const FormSelect = ({ label, name, value, onChange, icon: Icon, options, required = false, placeholder = "", extraLink = null }) => (
  <div className="form-group">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
      <label className="form-label" style={{ margin: 0 }}>{label}</label>
      {extraLink}
    </div>
    <div className="input-wrapper">
      {Icon && <Icon className="input-icon" size={16} />}
      <select 
        name={name}
        id={name}
        className="form-control" 
        value={value} 
        onChange={onChange}
        required={required}
        style={{ 
          paddingLeft: Icon ? '38px' : '12px', 
          paddingRight: '36px',
          height: '38px', 
          fontSize: '13.5px', 
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          backgroundSize: '16px',
          backgroundColor: '#f8fafc'
        }}
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
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    vagaiyara: '0',
    vagaiyara_nickname: '',
    family_type: 'muthaiya',
    parent_family_id: '0'
  });
  const [familyMembers, setFamilyMembers] = useState([{ member_name: '', generation_no: '', phone_number: '' }]);

  const [data, setData] = useState([]);
  const [vagaiyaras, setVagaiyaras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [kulaDeivams, setKulaDeivams] = useState([]);
  const [hasEerapu, setHasEerapu] = useState(false);
  const [selectedEerapuType, setSelectedEerapuType] = useState('');
  const [eerapuMembers, setEerapuMembers] = useState([{ name: '', kula_deivam_id: '0', generation_no: '' }]);
  const [currentStep, setCurrentStep] = useState(1);

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (formData.vagaiyara === '0') {
        showWarning("வகைரா தேவை", "Vagaiyara is required");
        return;
      }
      if (!formData.vagaiyara_nickname) {
        showWarning("குடும்பத்தின் பட்டப்பெயர் தேவை", "Family Nickname is required");
        return;
      }
    }
    if (currentStep === 2) {
      if (formData.family_type === 'tharpothaiya') {
        if (!formData.parent_family_id || formData.parent_family_id === '0') {
          showWarning("முத்தையா வகைரா தேவை", "Parent/Original Family is required for Branch Family");
          return;
        }
        if (!familyMembers[0]?.generation_no) {
          showWarning("தற்போதைய தலைமுறை தேவை", "Current Generation is required");
          return;
        }
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  useEffect(() => {
    fetchData();
    fetchVagaiyaras();
    fetchKulaDeivams();
  }, []);

  

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
          setVagaiyaras(apiData.map(v => {
            const nameTamil = v.our_gen_name_tamil || v.vagaiyara_name_tamil;
            const nameEnglish = v.our_gen_name_english || v.vagaiyara_name_english;
            return {
              value: v.id,
              label: nameTamil ? `${nameTamil} (${nameEnglish || ''})` : nameEnglish
            };
          }));
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

  const fetchKulaDeivams = async () => {
    try {
      const res = await fetch(BASE_API + '/kula-deivams');
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.data) {
          setKulaDeivams(json.data.data.map(d => ({
            value: d.id,
            label: d.deity_name_tamil || d.deity_name_english || 'Unnamed Deity'
          })));
        }
      }
    } catch (err) {
      console.error('Error fetching kula deivams:', err);
    }
  };

  const addEerapuMember = () => {
    setEerapuMembers([...eerapuMembers, { name: '', kula_deivam_id: '0', generation_no: '' }]);
  };

  const removeEerapuMember = (index) => {
    const newMembers = [...eerapuMembers];
    newMembers.splice(index, 1);
    setEerapuMembers(newMembers);
  };

  const handleEerapuMemberChange = (index, field, value) => {
    const newMembers = [...eerapuMembers];
    newMembers[index][field] = value;
    setEerapuMembers(newMembers);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const clearForm = () => {
    setFormData({
      vagaiyara: '0',
      vagaiyara_nickname: '',
      family_type: 'muthaiya',
      parent_family_id: '0'
    });
    setFamilyMembers([{ member_name: '', generation_no: '', phone_number: '' }]);
    setHasEerapu(false);
    setSelectedEerapuType('');
    setEerapuMembers([{ name: '', kula_deivam_id: '0', generation_no: '' }]);
    setEditingId(null);
    setCurrentStep(1);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (formData.vagaiyara === '0') {
      showWarning("வகைரா தேவை", "Vagaiyara is required");
      return;
    }
    if (!formData.vagaiyara_nickname) {
      showWarning("குடும்பத்தின் பட்டப்பெயர் தேவை", "Family Nickname is required");
      return;
    }
    if (formData.family_type === 'tharpothaiya' && (!formData.parent_family_id || formData.parent_family_id === '0')) {
      showWarning("முத்தையா வகைரா தேவை", "Parent/Original Family is required for Branch Family");
      return;
    }
    if (hasEerapu) {
      for (const m of eerapuMembers) {
        if (!m.name.trim()) {
          showWarning("நபர் பெயர் தேவை", "Member Name is required");
          return;
        }
      }
    }

    try {
      const isEditMode = !!editingId;
      const url = isEditMode ? `${API_BASE_URL}/update/${editingId}` : `${API_BASE_URL}/create`;
      
      const submitData = {
        vagaiyara: formData.vagaiyara,
        vagaiyara_nickname: formData.vagaiyara_nickname,
        family_type: formData.family_type,
        parent_family_id: formData.family_type === 'tharpothaiya' && formData.parent_family_id !== '0' ? parseInt(formData.parent_family_id) : null,
        family_members: formData.family_type === 'tharpothaiya' 
          ? [{ member_name: formData.vagaiyara_nickname, generation_no: familyMembers[0]?.generation_no || '' }] 
          : familyMembers,
        eerapu_members: hasEerapu 
          ? eerapuMembers.map(e => ({
              name: e.name,
              kula_deivam_id: null,
              generation_no: e.generation_no || null,
              status: selectedEerapuType || 'active'
            })) 
          : [],
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
        showError("தோல்வி", "Failed to save family info");
      }
    } catch (err) {
      showError("தொடர்பு பிழை", "Connection error");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      vagaiyara: item.vagaiyara_id || item.vagaiyara || '0',
      vagaiyara_nickname: item.family_nickname || (item.family_nickname || item.vagaiyara_nickname) || '',
      family_type: item.family_type || 'muthaiya',
      parent_family_id: item.parent_family_id || '0'
    });
    // If backend returns family_members as array
    if (item.family_members && item.family_members.length > 0) {
      setFamilyMembers(item.family_members);
    } else {
      setFamilyMembers([{ member_name: '', generation_no: '', phone_number: '' }]);
    }
    // If backend returns eerapu_members as array
    if (item.eerapu_members && item.eerapu_members.length > 0) {
      setHasEerapu(true);
      const loadedEerapuType = item.eerapu_members[0]?.status && item.eerapu_members[0].status !== 'active' ? item.eerapu_members[0].status : 'இறைவனடி சேர்ந்தவர்';
      setSelectedEerapuType(loadedEerapuType);
      setEerapuMembers(item.eerapu_members.map(e => ({
        id: e.id,
        name: e.name,
        kula_deivam_id: e.kula_deivam_id ? String(e.kula_deivam_id) : '0',
        generation_no: e.generation_no ? String(e.generation_no) : '',
        status: e.status || loadedEerapuType
      })));
    } else {
      setHasEerapu(false);
      setSelectedEerapuType('');
      setEerapuMembers([{ name: '', kula_deivam_id: '0', generation_no: '' }]);
    }
    setCurrentStep(1);
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
    (item.family_nickname || (item.family_nickname || item.vagaiyara_nickname) || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addMember = () => {
    setFamilyMembers([...familyMembers, { member_name: '', generation_no: '', phone_number: '' }]);
  };

  const removeMember = (index) => {
    const newMembers = [...familyMembers];
    newMembers.splice(index, 1);
    setFamilyMembers(newMembers);
  };

  const handleMemberChange = (index, field, value) => {
    const newMembers = [...familyMembers];
    newMembers[index][field] = value;
    setFamilyMembers(newMembers);
  };

  const parentFamilyOptions = data
    .filter(f => f.family_type === 'muthaiya' && String(f.vagaiyara_id || '') === String(formData.vagaiyara))
    .map(f => ({
      value: f.id,
      label: f.family_nickname
    }));

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PlusCircle size={18} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
              {editingId ? 'குடும்ப விவரத்தை மாற்ற (Edit Family)' : 'புதிய குடும்பத்தை சேர்க்க (Add New Family)'}
            </h3>
          </div>
          <span style={{ fontSize: '12px', background: '#eef2ff', color: '#6366f1', padding: '4px 10px', borderRadius: '20px', fontWeight: '600' }}>
            Step {currentStep} of 3
          </span>
        </div>

        {/* Step Indicator */}
        <div style={{ position: 'relative', marginBottom: '40px', padding: '20px 10px 10px 10px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          {/* Progress Line Background */}
          <div style={{
            position: 'absolute',
            top: '42px',
            left: '16.6%',
            right: '16.6%',
            height: '4px',
            background: '#e2e8f0',
            borderRadius: '2px',
            zIndex: 1
          }} />
          
          {/* Active Progress Line */}
          <div style={{
            position: 'absolute',
            top: '42px',
            left: '16.6%',
            width: currentStep === 1 ? '0%' : currentStep === 2 ? '33.3%' : '66.7%',
            height: '4px',
            background: '#6366f1',
            borderRadius: '2px',
            transition: 'width 0.4s ease-in-out',
            zIndex: 1
          }} />

          {/* Step Nodes */}
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
            
            {/* Step 1 */}
            <div 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, cursor: 'pointer' }}
              onClick={() => currentStep > 1 && setCurrentStep(1)}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: currentStep >= 1 ? '#6366f1' : '#fff',
                border: '3px solid',
                borderColor: currentStep >= 1 ? '#6366f1' : '#cbd5e1',
                color: currentStep >= 1 ? '#fff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '15px',
                boxShadow: currentStep === 1 ? '0 0 0 5px rgba(99, 102, 241, 0.25)' : '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'all 0.4s ease'
              }}>
                {currentStep > 1 ? <CheckCircle size={20} /> : 1}
              </div>
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: currentStep >= 1 ? '#1e293b' : '#64748b' }}>அடிப்படை விவரங்கள்</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Family Basics</div>
              </div>
            </div>

            {/* Step 2 */}
            <div 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, cursor: 'pointer' }}
              onClick={() => {
                if (currentStep > 2) {
                  setCurrentStep(2);
                } else if (currentStep === 1) {
                  handleNextStep();
                }
              }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: currentStep >= 2 ? '#6366f1' : '#fff',
                border: '3px solid',
                borderColor: currentStep >= 2 ? '#6366f1' : '#cbd5e1',
                color: currentStep >= 2 ? '#fff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '15px',
                boxShadow: currentStep === 2 ? '0 0 0 5px rgba(99, 102, 241, 0.25)' : '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'all 0.4s ease'
              }}>
                {currentStep > 2 ? <CheckCircle size={20} /> : 2}
              </div>
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: currentStep >= 2 ? '#1e293b' : '#64748b' }}>குடும்ப கட்டமைப்பு</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Members & Gen</div>
              </div>
            </div>

            {/* Step 3 */}
            <div 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, cursor: 'pointer' }}
              onClick={() => {
                if (currentStep === 1) {
                  if (formData.vagaiyara !== '0' && formData.vagaiyara_nickname) {
                    if (formData.family_type === 'tharpothaiya') {
                      if (formData.parent_family_id !== '0' && familyMembers[0]?.generation_no) {
                        setCurrentStep(3);
                      } else {
                        handleNextStep();
                      }
                    } else {
                      setCurrentStep(3);
                    }
                  } else {
                    handleNextStep();
                  }
                } else if (currentStep === 2) {
                  handleNextStep();
                }
              }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: currentStep >= 3 ? '#6366f1' : '#fff',
                border: '3px solid',
                borderColor: currentStep >= 3 ? '#6366f1' : '#cbd5e1',
                color: currentStep >= 3 ? '#fff' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '15px',
                boxShadow: currentStep === 3 ? '0 0 0 5px rgba(99, 102, 241, 0.25)' : '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'all 0.4s ease'
              }}>
                3
              </div>
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: currentStep >= 3 ? '#1e293b' : '#64748b' }}>இறப்பு விவரங்கள்</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Deceased Details</div>
              </div>
            </div>

          </div>
        </div>


        {/* Step 1 Content */}
        {currentStep === 1 && (
          <div className="form-grid animate-fade-in" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <FormSelect 
              label="வகைரா (Select Vagaiyara) *" 
              name="vagaiyara" 
              value={formData.vagaiyara} 
              onChange={handleInputChange} 
              icon={Building2} 
              options={vagaiyaras} 
              placeholder="-- வகைரா தேர்ந்தெடுக்கவும் --" 
              required 
              extraLink={
                <span 
                  onClick={() => navigate('/vagaiyara-manage')} 
                  style={{ fontSize: '12px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px', userSelect: 'none' }}
                >
                  <span style={{ color: '#10b981', fontSize: '15px', marginRight: '2px', fontWeight: '800' }}>+</span>
                  <span style={{ color: '#06b6d4', textDecoration: 'underline' }}>சேர்க்க</span>
                </span>
              }
            />
            <FormInput label="குடும்பத்தின் பட்டப்பெயர் (Family Nickname) *" name="vagaiyara_nickname" value={formData.vagaiyara_nickname} onChange={handleInputChange} icon={Tag} placeholder="Nickname..." required />
            
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontWeight: '600' }}>குடும்ப வகை (Family Type) *</label>
              <div style={{ display: 'flex', gap: '20px', marginTop: '8px', padding: '10px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="family_type" 
                    value="muthaiya" 
                    checked={formData.family_type === 'muthaiya'} 
                    onChange={handleInputChange} 
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#6366f1' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>முத்தையா வகைரா (Original Family)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="family_type" 
                    value="tharpothaiya" 
                    checked={formData.family_type === 'tharpothaiya'} 
                    onChange={handleInputChange} 
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#6366f1' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>தற்போதைய வகைரா (Branch Family)</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 Content */}
        {currentStep === 2 && (
          <div className="animate-fade-in">
            {formData.family_type === 'tharpothaiya' ? (
              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <FormSelect 
                  label="முத்தையா வகைரா (Parent/Original Family) *" 
                  name="parent_family_id" 
                  value={formData.parent_family_id} 
                  onChange={handleInputChange} 
                  icon={Users} 
                  options={parentFamilyOptions} 
                  placeholder="-- முத்தையா வகைரா தேர்ந்தெடுக்கவும் --" 
                  required 
                />
                <div className="form-group">
                  <label className="form-label">தற்போதைய தலைமுறை (Current Generation) *</label>
                  <div className="input-wrapper">
                    <select 
                      className="form-control" 
                      value={familyMembers[0]?.generation_no || ''} 
                      onChange={(e) => handleMemberChange(0, 'generation_no', e.target.value)} 
                      required
                      style={{ 
                        paddingLeft: '12px', 
                        paddingRight: '36px',
                        height: '38px', 
                        fontSize: '13.5px', 
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '16px',
                        backgroundColor: '#f8fafc'
                      }}
                    >
                      <option value="">-- தலைமுறையை தேர்ந்தெடுக்கவும் --</option>
                      {generationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={16} color="#6366f1" /> குடும்ப உறுப்பினர்கள் (Family Members)
                  </h4>
                  <button type="button" onClick={addMember} className="btn btn-sm" style={{ background: '#eef2ff', color: '#4f46e5', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <Plus size={14} /> Add Member
                  </button>
                </div>
                
                {familyMembers.map((member, index) => (
                  <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="தொலைபேசி எண் (Phone Number)" 
                        value={member.phone_number || ''} 
                        onChange={(e) => handleMemberChange(index, 'phone_number', e.target.value)} 
                        style={{ height: '38px', fontSize: '13px', paddingLeft: '12px', paddingRight: '12px', paddingTop: 0, paddingBottom: 0 }} 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="உறுப்பினர் பெயர் (Member Name)" 
                        value={member.member_name} 
                        onChange={(e) => handleMemberChange(index, 'member_name', e.target.value)} 
                        style={{ height: '38px', fontSize: '13px', paddingLeft: '12px', paddingRight: '12px', paddingTop: 0, paddingBottom: 0 }} 
                      />
                    </div>
                    <div style={{ width: '250px' }}>
                      <select 
                        className="form-control" 
                        value={member.generation_no} 
                        onChange={(e) => handleMemberChange(index, 'generation_no', e.target.value)} 
                        style={{ 
                          height: '38px', 
                          fontSize: '13px', 
                          paddingLeft: '12px', 
                          paddingRight: '36px', 
                          paddingTop: 0, 
                          paddingBottom: 0,
                          appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 12px center',
                          backgroundSize: '16px',
                          backgroundColor: '#fff'
                        }}
                      >
                        <option value="">-- தேர்ந்தெடுக்கவும் --</option>
                        {generationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                    {familyMembers.length > 1 && (
                      <button type="button" onClick={() => removeMember(index)} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', width: '38px', height: '38px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3 Content */}
        {currentStep === 3 && (
          <div className="animate-fade-in" style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            {/* Eerapu Dropdown */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontWeight: '700', color: '#1e293b', marginBottom: '8px', display: 'block' }}>
                இறப்பு நிலை (Select Deceased Status)
              </label>
              <div className="input-wrapper" style={{ maxWidth: '400px' }}>
                <select
                  className="form-control"
                  value={selectedEerapuType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedEerapuType(val);
                    if (val) {
                      setHasEerapu(true);
                      setEerapuMembers(prev => prev.map(m => ({ ...m, status: val })));
                    } else {
                      setHasEerapu(false);
                    }
                  }}
                  style={{
                    height: '38px',
                    fontSize: '13.5px',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px',
                    backgroundColor: '#fff',
                    paddingLeft: '12px',
                    paddingRight: '36px',
                    paddingTop: 0,
                    paddingBottom: 0
                  }}
                >
                  <option value="">-- தேர்ந்தெடுக்கவும் (Select Status) --</option>
                  <option value="இயற்கை எய்தியவர்">இயற்கை எய்தியவர்</option>
                  <option value="இறைவனடி சேர்ந்தவர்">இறைவனடி சேர்ந்தவர்</option>
                </select>
              </div>
            </div>

            {/* Eerapu Sub-Form */}
            {hasEerapu && (
              <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={16} color="#6366f1" /> {selectedEerapuType} நபர்கள் ({selectedEerapuType === 'இறைவனடி சேர்ந்தவர்' ? 'Eerapu Persons' : 'Deceased Persons'})
                  </h4>
                  <button type="button" onClick={addEerapuMember} className="btn btn-sm" style={{ background: '#eef2ff', color: '#4f46e5', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <Plus size={14} /> Add Person
                  </button>
                </div>
                
                {eerapuMembers.map((member, index) => (
                  <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="நபர் பெயர் (Name) *" 
                        value={member.name || ''} 
                        onChange={(e) => handleEerapuMemberChange(index, 'name', e.target.value)} 
                        required 
                        style={{ height: '38px', fontSize: '13px', paddingLeft: '12px', paddingRight: '12px', paddingTop: 0, paddingBottom: 0 }} 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <select 
                        className="form-control" 
                        value={member.generation_no || ''} 
                        onChange={(e) => handleEerapuMemberChange(index, 'generation_no', e.target.value)} 
                        style={{ 
                          height: '38px', 
                          fontSize: '13px', 
                          paddingLeft: '12px',
                          paddingRight: '36px',
                          paddingTop: 0,
                          paddingBottom: 0,
                          appearance: 'none', 
                          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 12px center',
                          backgroundSize: '16px',
                          backgroundColor: '#fff'
                        }}
                      >
                        <option value="">-- தலைமுறை (Generation) --</option>
                        {generationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                    {eerapuMembers.length > 1 && (
                      <button type="button" onClick={() => removeEerapuMember(index)} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', width: '36px', height: '36px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
          <div>
            <button type="button" onClick={clearForm} className="btn btn-outline" style={{ height: '38px', borderColor: '#f87171', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Eraser size={16}/> Clear/Reset
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {currentStep > 1 && (
              <button type="button" onClick={() => setCurrentStep(currentStep - 1)} className="btn btn-outline" style={{ height: '38px' }}>
                Back (முந்தைய)
              </button>
            )}
            
            {currentStep < 3 ? (
              <button type="button" onClick={handleNextStep} className="btn btn-primary" style={{ height: '38px', background: '#6366f1', color: '#fff' }}>
                Next (அடுத்து)
              </button>
            ) : (
              <button type="button" onClick={handleSave} className="btn btn-primary" style={{ height: '38px', background: '#10b981', color: '#fff' }}>
                {editingId ? <>Update (புதுப்பிக்கவும்) <RefreshCw size={16} /></> : <>Save (சேமிக்கவும்) <Save size={16} /></>}
              </button>
            )}
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
                <th>குடும்ப விவரங்கள்</th>
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
                          {(item.family_nickname || item.vagaiyara_nickname) && (
                            <div style={{ fontSize: '11px', color: '#6366f1', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <Tag size={10} /> {(item.family_nickname || item.vagaiyara_nickname)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {item.family_type === 'muthaiya' && <span style={{color: '#10b981', fontWeight: '600'}}>முத்தையா வகைரா (Original)</span>}
                        {item.family_type === 'tharpothaiya' && <span style={{color: '#f59e0b', fontWeight: '600'}}>தற்போதைய வகைரா (Branch)</span>}
                        {item.family_type === 'tharpothaiya' && item.parent_family_id && (
                          <span style={{ fontSize: '11px', color: '#4b5563' }}>
                            <strong>Parent:</strong> {data.find(f => f.id === item.parent_family_id)?.family_nickname || 'Unknown'}
                          </span>
                        )}
                        {item.family_type === 'muthaiya' && item.family_members && item.family_members.length > 0 && (
                          <span><strong>Members:</strong> {item.family_members.length}</span>
                        )}
                        {item.eerapu_members && item.eerapu_members.length > 0 && (
                          <span style={{ color: '#16a34a', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <strong>{item.eerapu_members[0]?.status || 'இறைவனடி சேர்ந்தவர்'}:</strong> {item.eerapu_members.map(e => e.name).join(', ')}
                          </span>
                        )}
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
