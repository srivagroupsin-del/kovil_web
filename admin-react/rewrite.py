import re

with open(r'd:\kovilback\admin-react\src\pages\KullamPeople.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace state
content = re.sub(r'const \[formData, setFormData\] = useState\(\{[\s\S]*?\}\);',
'''const [formData, setFormData] = useState({
    vagaiyara: '0',
    vagaiyara_nickname: '',
    family_type: 'muthaiya',
    phone_number: '',
    parent_family_id: '0'
  });
  const [familyMembers, setFamilyMembers] = useState([{ member_name: '', generation_no: '' }]);''', content)

# Remove pincode effect
content = re.sub(r'useEffect\(\(\) => \{\s*const fetchPincodeDetails[\s\S]*?\}, \[formData\.pincode\]\);', '', content)

# Replace clearForm
content = re.sub(r'const clearForm = \(\) => \{[\s\S]*?setEditingId\(null\);\s*\};',
'''const clearForm = () => {
    setFormData({
      vagaiyara: '0',
      vagaiyara_nickname: '',
      family_type: 'muthaiya',
      phone_number: '',
      parent_family_id: '0'
    });
    setFamilyMembers([{ member_name: '', generation_no: '' }]);
    setEditingId(null);
  };''', content)

# Replace handleSave
content = re.sub(r'const handleSave = async \(e\) => \{[\s\S]*?\}\s*catch \(err\) \{\s*showError\("தொடர்பு பிழை", "Connection error"\);\s*\}\s*\};',
'''const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (formData.vagaiyara === '0') {
      showWarning("வகைரா தேவை", "Vagaiyara is required");
      return;
    }
    if (!formData.vagaiyara_nickname) {
      showWarning("குடும்பத்தின் பட்டப்பெயர் தேவை", "Family Nickname is required");
      return;
    }

    try {
      const isEditMode = !!editingId;
      const url = isEditMode ? `${API_BASE_URL}/update/${editingId}` : `${API_BASE_URL}/create`;
      
      const submitData = {
        vagaiyara: formData.vagaiyara,
        vagaiyara_nickname: formData.vagaiyara_nickname,
        family_type: formData.family_type,
        phone_number: formData.family_type === 'muthaiya' ? formData.phone_number : '',
        parent_family_id: formData.family_type === 'tharpothaiya' ? (formData.parent_family_id === '0' ? null : formData.parent_family_id) : null,
        family_members: formData.family_type === 'muthaiya' ? familyMembers : [],
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
  };''', content)

# Replace handleEdit
content = re.sub(r'const handleEdit = \(item\) => \{[\s\S]*?window\.scrollTo\(\{ top: 0, behavior: \'smooth\' \}\);\s*\};',
'''const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      vagaiyara: item.vagaiyara || '0',
      vagaiyara_nickname: item.family_nickname || item.vagaiyara_nickname || '',
      family_type: item.family_type || 'muthaiya',
      phone_number: item.phone_number || '',
      parent_family_id: item.parent_family_id || '0'
    });
    // If backend returns family_members as array
    if (item.family_members && item.family_members.length > 0) {
      setFamilyMembers(item.family_members);
    } else {
      setFamilyMembers([{ member_name: '', generation_no: '' }]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };''', content)

# Filtered data
content = re.sub(r'const filteredData = data\.filter\(item =>[\s\S]*?\);',
'''const filteredData = data.filter(item => 
    (item.vagaiyara || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.family_nickname || item.vagaiyara_nickname || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.phone_number || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addMember = () => {
    setFamilyMembers([...familyMembers, { member_name: '', generation_no: '' }]);
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
  };''', content)

# Replace form grid
content = re.sub(r'<div className="form-grid animate-fade-in"[\s\S]*?</div>\s*</div>\s*</div>\s*<div className="card" style=\{\{ padding: 0 \}\}>',
'''<div className="form-grid animate-fade-in" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
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
          
          <FormSelect 
            label="குடும்ப வகை (Family Type) *" 
            name="family_type" 
            value={formData.family_type} 
            onChange={handleInputChange} 
            icon={Users} 
            options={[
              { value: 'muthaiya', label: 'முத்தையா வகைரா (Original Family)' },
              { value: 'tharpothaiya', label: 'தற்போதைய வகைரா (Branch Family)' }
            ]} 
            required 
          />

          {formData.family_type === 'muthaiya' && (
            <FormInput label="தொலைபேசி எண் (Phone Number)" name="phone_number" value={formData.phone_number} onChange={handleInputChange} icon={Phone} placeholder="Phone..." />
          )}

          {formData.family_type === 'tharpothaiya' && (
            <FormSelect 
              label="மூதாதையர் குடும்பம் (Parent Family) *" 
              name="parent_family_id" 
              value={formData.parent_family_id} 
              onChange={handleInputChange} 
              icon={Home} 
              options={data.filter(d => d.family_type === 'muthaiya' && d.vagaiyara === formData.vagaiyara).map(d => ({ value: d.id, label: d.family_nickname || d.vagaiyara_nickname }))}
              placeholder="-- குடும்பத்தை தேர்ந்தெடுக்கவும் --" 
              required 
            />
          )}
        </div>

        {formData.family_type === 'muthaiya' && (
          <div style={{ marginTop: '20px', background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
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
                  <input type="text" className="form-control" placeholder="உறுப்பினர் பெயர் (Member Name)" value={member.member_name} onChange={(e) => handleMemberChange(index, 'member_name', e.target.value)} style={{ height: '36px', fontSize: '13px' }} />
                </div>
                <div style={{ width: '150px' }}>
                  <input type="number" className="form-control" placeholder="தலைமுறை (Gen)" value={member.generation_no} onChange={(e) => handleMemberChange(index, 'generation_no', e.target.value)} style={{ height: '36px', fontSize: '13px' }} />
                </div>
                {familyMembers.length > 1 && (
                  <button type="button" onClick={() => removeMember(index)} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', width: '36px', height: '36px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button type="button" onClick={clearForm} className="btn btn-outline" style={{ height: '38px' }}>
            <Eraser size={16}/> Clear
          </button>
          <button type="button" onClick={handleSave} className="btn btn-primary" style={{ height: '38px' }}>
            {editingId ? <>Update <RefreshCw size={16} /></> : <>Save <Save size={16} /></>}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>''', content)


# Table columns and rows
content = re.sub(r'<th>முகவரி விவரங்கள்</th>', '<th>குடும்ப விவரங்கள்</th>', content)
content = re.sub(r'\{item\.entha_uru && <span><strong>ஊர்:</strong> \{item\.entha_uru\}</span>\}[\s\S]*?\{!item\.entha_uru && !item\.district && !item\.pincode && <span>--</span>\}',
'''{item.family_type === 'muthaiya' && <span style={{color: '#10b981', fontWeight: '600'}}>முத்தையா வகைரா (Original)</span>}
                        {item.family_type === 'tharpothaiya' && <span style={{color: '#f59e0b', fontWeight: '600'}}>தற்போதைய வகைரா (Branch)</span>}
                        {item.phone_number && <span><strong>Phone:</strong> {item.phone_number}</span>}
                        {item.family_type === 'muthaiya' && item.family_members && item.family_members.length > 0 && (
                          <span><strong>Members:</strong> {item.family_members.length}</span>
                        )}''', content)

# vagaiyara nickname field name in table
content = re.sub(r'item\.vagaiyara_nickname', '(item.family_nickname || item.vagaiyara_nickname)', content)

with open(r'd:\kovilback\admin-react\src\pages\KullamPeople.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
