import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Edit2, 
  Trash2, 
  Search, 
  Calendar, 
  Zap, 
  Activity, 
  Clock, 
  Filter, 
  Download, 
  Mail, 
  RefreshCw, 
  List, 
  ChevronRight,
  User,
  LayoutGrid,
  Sparkles,
  Info
} from 'lucide-react';
import { showConfirm, showError, showSuccess } from '../utils/swal';

const Pujaikal = () => {
  const [deityFilter, setDeityFilter] = useState('0');
  const [poojaFilter, setPoojaFilter] = useState('0');
  const [searchTerm, setSearchTerm] = useState('');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const TEMPLE_ID = 1;
      const [nityaRes, weekRes, specialRes] = await Promise.all([
        fetch(`${BASE_API}/nitya_poojas/temple/${TEMPLE_ID}`),
        fetch(`${BASE_API}/kilamai_poojas/temple/${TEMPLE_ID}`),
        fetch(`${BASE_API}/special_poojas/temple/${TEMPLE_ID}`)
      ]);

      const nityaJson = nityaRes.ok ? await nityaRes.json() : { data: { data: [] } };
      const weekJson = weekRes.ok ? await weekRes.json() : { data: { data: [] } };
      const specialJson = specialRes.ok ? await specialRes.json() : { data: { data: [] } };

      const nityaData = (nityaJson.data?.data || []).map(item => ({
        id: `nitya_${item.id}`,
        rawId: item.id,
        category: 'nitya',
        deityName: item.deity_name || 'மூலவர்', 
        deityType: item.deity_type || 'மூலவர்',
        poojaType: 'நித்திய பூஜை',
        period: item.pooja_time || '-',
        weekday: item.day || '-',
        time: item.session || '-',
        date: item.created_date ? item.created_date.split('T')[0] : '-',
        status: item.status || 'active'
      }));

      const weekData = (weekJson.data?.data || []).map(item => ({
        id: `week_${item.id}`,
        rawId: item.id,
        category: 'week',
        deityName: item.deity_name || 'மூலவர்',
        deityType: item.deity_type || 'மூலவர்',
        poojaType: 'கிழமை பூஜை',
        period: item.pooja_time || '-',
        weekday: item.day || '-',
        time: item.session || '-',
        date: item.created_date ? item.created_date.split('T')[0] : '-',
        status: item.status || 'active'
      }));

      const specialData = (specialJson.data?.data || []).map(item => ({
        id: `special_${item.id}`,
        rawId: item.id,
        category: 'special',
        deityName: item.title || 'சிறப்பு',
        deityType: item.deity_id || 'சிறப்பு',
        poojaType: 'சிறப்பு பூஜை',
        period: item.repeat_type || '-',
        weekday: item.day || '-',
        time: item.time || '-',
        date: item.date ? item.date.split('T')[0] : '-',
        status: item.status || 'active'
      }));

      setData([...nityaData, ...weekData, ...specialData]);
    } catch (error) {
      console.error("Error fetching all poojas:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const buttons = [
    { title: 'நித்திய பூஜை', color: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', link: '/nitya_pooja', description: 'Daily Rituals', icon: Zap },
    { title: 'கிழமை பூஜை', color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', link: '/week_pooja', description: 'Weekly Rituals', icon: Calendar },
    { title: 'சிறப்பு பூஜை', color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', link: '/special_pooja', description: 'Special Occasions', icon: Sparkles },
  ];

  const filteredData = data.filter(item => {
    let matchDeity = true;
    let matchPooja = true;
    let matchSearch = true;

    if (deityFilter !== '0') {
      matchDeity = item.deityType.includes(deityFilter) || item.deityName.includes(deityFilter) || (deityFilter === 'moolavar' && item.deityType === 'மூலவர்');
    }
    if (poojaFilter !== '0') {
      if (poojaFilter === 'nitya') matchPooja = item.category === 'nitya';
      if (poojaFilter === 'week') matchPooja = item.category === 'week';
      if (poojaFilter === 'special') matchPooja = item.category === 'special';
    }
    if (searchTerm) {
      matchSearch = item.deityName.toLowerCase().includes(searchTerm.toLowerCase()) || item.poojaType.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return matchDeity && matchPooja && matchSearch;
  });

  const handleDelete = async (item) => {
    const result = await showConfirm("நிச்சயமாக நீக்க வேண்டுமா?", "Are you sure you want to delete this pooja record?");
    if (!result.isConfirmed) return;
    try {
      const route = item.category === 'nitya' ? 'nitya_poojas' : (item.category === 'week' ? 'kilamai_poojas' : 'special_poojas');
      const res = await fetch(`${BASE_API}/${route}/delete/${item.rawId}`, { method: 'DELETE' });
      if (res.ok) {
        showSuccess("நீக்கப்பட்டது", "Record deleted successfully");
        fetchData();
      }
    } catch (e) {
      showError("நீக்குவதில் பிழை", "Error deleting pooja");
    }
  };

  return (
    <div className="form-card" style={{ maxWidth: '1400px' }}>
      <div className="form-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Activity size={28} color="#6366f1" />
          <h2 style={{ margin: 0 }}>தெய்வங்களுக்கான பூஜைகள் (Temple Rituals)</h2>
        </div>
        <p>நித்திய, கிழமை மற்றும் சிறப்பு பூஜைகளை இங்கே ஒருங்கிணைத்து நிர்வகிக்கலாம்.</p>
      </div>

      {/* Navigation Cards Grid */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {buttons.map((btn, idx) => (
            <NavLink 
              key={idx} 
              to={btn.link} 
              className="card"
              style={{ 
                background: btn.color, 
                color: 'white', 
                padding: '16px 16px', 
                borderRadius: '12px', 
                textAlign: 'left', 
                textDecoration: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative',
                overflow: 'hidden',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{ 
                position: 'absolute', 
                right: '-10px', 
                bottom: '-10px', 
                opacity: 0.15,
                transform: 'rotate(-15deg)'
              }}>
                <btn.icon size={100} />
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <btn.icon size={18} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>{btn.title}</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '10px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '500' }}>{btn.description}</p>
              </div>
              <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600' }}>
                நிர்வகிக்க <ChevronRight size={14} />
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <div style={{ width: '40px', height: '40px', background: '#eef2ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <List size={20} color="#6366f1" />
               </div>
               <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>அனைத்து பூஜைகள் பட்டியல்</h3>
             </div>
             <button onClick={fetchData} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <RefreshCw size={18} /> Refresh
             </button>
          </div>
          
          {/* 3-Column Filter Grid */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Search size={14} /> தேடல் (Search)
              </label>
              <div className="input-wrapper">
                <Search className="input-icon" size={18} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="பூஜை அல்லது தெய்வம் மூலம் தேடு..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} /> தெய்வங்கள் (Deities)
              </label>
              <div className="input-wrapper">
                <LayoutGrid className="input-icon" size={18} />
                <select 
                  className="form-control" 
                  value={deityFilter} 
                  onChange={(e) => setDeityFilter(e.target.value)}
                  style={{ paddingLeft: '42px', appearance: 'auto' }}
                >
                  <option value="0">அனைத்து தெய்வங்கள்</option>
                  <option value="moolavar">மூலவர்</option>
                  <option value="udanurai">உடனுறை/தாயார்</option>
                  <option value="parivara">பரிவார தெய்வங்கள்</option>
                  <option value="pikara">பிகரா தெய்வங்கள்</option>
                  <option value="upa">உப தெய்வங்கள்</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={14} /> பூஜை வகை (Ritual Category)
              </label>
              <div className="input-wrapper">
                <Info className="input-icon" size={18} />
                <select 
                  className="form-control" 
                  value={poojaFilter} 
                  onChange={(e) => setPoojaFilter(e.target.value)}
                  style={{ paddingLeft: '42px', appearance: 'auto' }}
                >
                  <option value="0">அனைத்து பூஜைகள்</option>
                  <option value="nitya">நித்திய பூஜை</option>
                  <option value="week">கிழமை பூஜை</option>
                  <option value="special">சிறப்பு பூஜை</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>தெய்வம் & வகை</th>
                <th>பூஜை வகை</th>
                <th>காலம் / நிகழ்வு</th>
                <th>கிழமை</th>
                <th>நாள் நேரம்</th>
                <th>தேதி</th>
                <th style={{ textAlign: 'center' }}>நிலை</th>
                <th className="sticky-column" style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '60px' }}>Loading...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <Search size={32} opacity={0.3} />
                    <span>பதிவுகள் எதுவும் இல்லை</span>
                  </div>
                </td></tr>
              ) : filteredData.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{item.deityName}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{item.deityType}</div>
                  </td>
                  <td>
                    <span className="badge-status" style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px' }}>
                      {item.poojaType}
                    </span>
                  </td>
                  <td>{item.period}</td>
                  <td>{item.weekday}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                      <Clock size={14} color="#94a3b8" />
                      {item.time}
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', color: '#64748b' }}>{item.date}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge-status badge-success">
                      {item.status}
                    </span>
                  </td>
                  <td className="sticky-column">
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <NavLink 
                        to={item.category === 'nitya' ? '/nitya_pooja' : (item.category === 'week' ? '/week_pooja' : '/special_pooja')}
                        state={{ editItem: item }}
                        className="icon-action" 
                        title="Edit"
                      >
                        <Edit2 size={16}/>
                      </NavLink>
                      <button className="icon-action" style={{ color: '#ef4444', background: '#fef2f2' }} onClick={() => handleDelete(item)} title="Delete"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Pujaikal;
