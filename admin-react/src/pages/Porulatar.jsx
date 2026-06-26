import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { 
  Edit2, 
  Trash2, 
  Save, 
  Eraser, 
  User, 
  Package, 
  IndianRupee, 
  Calendar, 
  Activity, 
  RefreshCw, 
  List, 
  Coins, 
  Search,
  CheckCircle,
  TrendingUp,
  CreditCard,
  Plus
} from 'lucide-react';
import { showSuccess, showError, showConfirm, showWarning } from '../utils/swal';

const API_BASE_URL = BASE_API + '/porulatar';
const CURRENT_TEMPLE_ID = 1;

const FormInput = ({ label, name, value, onChange, icon: Icon, placeholder, type = "text", required = false }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <div className="input-wrapper">
      {Icon && <Icon className="input-icon" size={16} />}
      <input 
        type={type} 
        name={name}
        className="form-control" 
        placeholder={placeholder}
        value={value} 
        onChange={onChange} 
        required={required} 
        style={{ paddingLeft: Icon ? '38px' : '12px', height: '42px', fontSize: '14.5px' }}
      />
    </div>
  </div>
);

const Porulatar = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    devoteeName: '',
    value: '',
    date: new Date().toISOString().split('T')[0],
    status: 'active'
  });
  const [currentItem, setCurrentItem] = useState('');
  const [itemsList, setItemsList] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/temple/${CURRENT_TEMPLE_ID}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data?.data || []);
      } else {
        // Fallback to mock data if API fails or doesn't exist yet
        setData([
          { id: 1, devotee_name: 'சுரேஷ்', item_name: 'பன்னீர்', amount: '500', date: '2023-01-10', status: 'active', items: ['பன்னீர்'] },
          { id: 2, devotee_name: 'ரமேஷ்', item_name: 'புஷ்பம்', amount: '1000', date: '2023-01-11', status: 'active', items: ['புஷ்பம்'] }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const clearForm = () => {
    setFormData({
      devoteeName: '',
      value: '',
      date: new Date().toISOString().split('T')[0],
      status: 'active'
    });
    setCurrentItem('');
    setItemsList([]);
    setEditingId(null);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    
    // Add current typed item if any before saving
    let finalItems = [...itemsList];
    if (currentItem.trim()) {
      finalItems.push(currentItem.trim());
    }

    if (finalItems.length === 0) {
      showWarning("பொருள் தேவை", "குறைந்தது ஒரு பொருளை ஆவது சேர்க்கவும் / Please add at least one item.");
      return;
    }

    try {
      const isEditMode = !!editingId;
      const url = isEditMode ? `${API_BASE_URL}/update/${editingId}` : `${API_BASE_URL}/create`;
      
      const payload = {
        temple_id: CURRENT_TEMPLE_ID,
        devotee_name: formData.devoteeName,
        items: finalItems,
        amount: formData.value,
        date: formData.date,
        status: formData.status
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
        showError("தோல்வி", "Failed to save record");
      }
    } catch (err) {
      showError("தொடர்பு பிழை", "Connection error");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      devoteeName: item.devotee_name || '',
      value: item.amount || '',
      date: item.date ? item.date.split('T')[0] : '',
      status: item.status || 'active'
    });
    setItemsList(item.items || (item.item_name ? item.item_name.split(', ').filter(Boolean) : []));
    setCurrentItem('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const result = await showConfirm("நிச்சயமாக நீக்க வேண்டுமா?", "Are you sure?");
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API_BASE_URL}/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
        showSuccess("நீக்கப்பட்டது", "Deleted");
      }
    } catch (err) {
      showError("நீக்குவதில் பிழை", "Error deleting");
    }
  };

  const filteredData = data.filter(item => 
    (item.devotee_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.item_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="form-card" style={{ maxWidth: '1400px' }}>
      <div className="form-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Coins size={24} color="#6366f1" />
          <h2 style={{ margin: 0, fontSize: '20px' }}>பொருளாதார பங்களிப்பு (Economy)</h2>
        </div>
        <p style={{ fontSize: '13px' }}>பொருள்கள், நிதி பங்களிப்புகள் மற்றும் மற்ற உபயங்களை நிர்வகிக்கவும்.</p>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '20px' }}>
        <form onSubmit={handleSave}>
          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <FormInput label="பக்தர் பெயர் *" name="devoteeName" value={formData.devoteeName} onChange={handleInputChange} icon={User} required />
            
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
              <label className="form-label">பொருள் / வகை *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="input-wrapper" style={{ flex: 1 }}>
                  <Package className="input-icon" size={16} />
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="எ.கா. தேங்காய், பழம்..." 
                    value={currentItem} 
                    onChange={(e) => setCurrentItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (currentItem.trim()) {
                          setItemsList(prev => [...prev, currentItem.trim()]);
                          setCurrentItem('');
                        }
                      }
                    }}
                    style={{ paddingLeft: '38px', height: '42px', fontSize: '14.5px' }}
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    if (currentItem.trim()) {
                      setItemsList(prev => [...prev, currentItem.trim()]);
                      setCurrentItem('');
                    }
                  }}
                  className="btn btn-primary" 
                  style={{ height: '42px', padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Plus size={16} />
                </button>
              </div>
              
              {/* Items List Badges */}
              {itemsList.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {itemsList.map((item, idx) => (
                    <span 
                      key={idx} 
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        background: '#eef2ff', 
                        color: '#4f46e5', 
                        border: '1px solid #e0e7ff',
                        borderRadius: '16px', 
                        padding: '4px 10px', 
                        fontSize: '12.5px',
                        fontWeight: '600'
                      }}
                    >
                      {item}
                      <button 
                        type="button" 
                        onClick={() => setItemsList(prev => prev.filter((_, i) => i !== idx))}
                        style={{ 
                          border: 'none', 
                          background: 'none', 
                          color: '#94a3b8', 
                          cursor: 'pointer', 
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          lineHeight: 1
                        }}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <FormInput label="மதிப்பு (₹)" name="value" value={formData.value} onChange={handleInputChange} icon={IndianRupee} type="number" />
            <FormInput label="தேதி" name="date" value={formData.date} onChange={handleInputChange} icon={Calendar} type="date" />
          </div>

          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button type="button" onClick={clearForm} className="btn btn-outline" style={{ height: '42px' }}>
              <Eraser size={16}/> Clear
            </button>
            <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>
              {editingId ? <>Update <RefreshCw size={16} /></> : <>Save <Save size={16} /></>}
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <List size={18} color="#6366f1" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>பங்களிப்பு விவரங்கள் (Records)</h3>
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
                <th>பக்தர் பெயர்</th>
                <th>பொருள் / வகை</th>
                <th>மதிப்பு (₹)</th>
                <th>தேதி</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>பதிவுகள் இல்லை</td></tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: '700', color: '#6366f1', fontSize: '13px' }}>{idx + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={16} color="#6366f1" />
                        </div>
                        <div style={{ fontWeight: '600', fontSize: '13.5px' }}>{item.devotee_name}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                        <Package size={14} color="#94a3b8" style={{ marginRight: '2px' }} />
                        {item.items && item.items.length > 0 ? (
                          item.items.map((it, i) => (
                            <span 
                              key={i} 
                              style={{ 
                                background: '#f1f5f9', 
                                color: '#334155', 
                                padding: '2px 8px', 
                                borderRadius: '12px', 
                                fontSize: '11.5px', 
                                fontWeight: '500',
                                border: '1px solid #e2e8f0'
                              }}
                            >
                              {it}
                            </span>
                          ))
                        ) : (
                          <span>{item.item_name || '--'}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#16a34a', fontSize: '13px' }}>
                        {item.amount ? `₹${parseFloat(item.amount).toLocaleString()}` : '₹0'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>{item.date ? item.date.split('T')[0] : '--'}</div>
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

export default Porulatar;
