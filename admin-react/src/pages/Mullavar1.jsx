import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Edit2, 
  Trash2, 
  Search, 
  LayoutGrid, 
  List, 
  Filter, 
  Plus, 
  ChevronRight, 
  Users, 
  Shield, 
  Layers, 
  User, 
  Calendar,
  Settings,
  Activity,
  Clock,
  Heart
} from 'lucide-react';
import { showSuccess, showError, showWarning, showConfirm } from '../utils/swal';

const Mullavar1 = () => {
  console.log("Mullavar1 component rendering...");
  const [deityFilter, setDeityFilter] = useState('0');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddMenu, setShowAddMenu] = useState(false);
  
  useEffect(() => {
    fetchAllDeities();
  }, []);

  const fetchAllDeities = async () => {
    try {
      setLoading(true);
      const [udanuraiRes, baliRes, kavalRes, parivaraRes, pigaraRes, ubaRes] = await Promise.all([
        fetch(BASE_API + "/udanurais"),
        fetch(BASE_API + "/bali_deivangal"),
        fetch(BASE_API + "/kaval_deivangal"),
        fetch(BASE_API + "/parivara_deivangal"),
        fetch(BASE_API + "/pigara_deivangal"),
        fetch(BASE_API + "/uba_deivangal")
      ]);

      const processRes = async (res, type, typeKey) => {
        if (!res.ok) return [];
        const json = await res.json();
        const rows = json.data?.data || json.data || json || [];
        return rows.map(item => ({
          ...item,
          id: `${typeKey.substring(0,1)}-${item.id}`,
          realId: item.id,
          displayName: item.name || item.deity_name || item.deityName || '-',
          displayWorship: item.worship_method || item.worshipMethod || item.worship_type || item.worshipType || '-',
          displayTime: item.worship_time || item.worshipTime || '-',
          type: type,
          typeKey: typeKey
        }));
      };

      const [u, b, k, par, pig, upa] = await Promise.all([
        processRes(udanuraiRes, 'உடனுறை தெய்வங்கள்', 'udanurai'),
        processRes(baliRes, 'பாலி தெய்வங்கள்', 'bali'),
        processRes(kavalRes, 'காவல் தெய்வங்கள்', 'kaval'),
        processRes(parivaraRes, 'பரிவார தெய்வங்கள்', 'parivara'),
        processRes(pigaraRes, 'பிகரா தெய்வங்கள்', 'pigara'),
        processRes(ubaRes, 'உப தெய்வங்கள்', 'upa')
      ]);

      setData([...u, ...b, ...k, ...par, ...pig, ...upa]);
    } catch (err) {
      console.error("Error fetching deities:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    const result = await showConfirm('நிச்சயமாக நீக்க வேண்டுமா?', `Are you sure you want to delete ${item.displayName}?`);
    if (!result.isConfirmed) return;

    try {
      const endpoints = {
        'udanurai': BASE_API + '/udanurais',
        'bali': BASE_API + '/bali_deivangal',
        'kaval': BASE_API + '/kaval_deivangal',
        'parivara': BASE_API + '/parivara_deivangal',
        'pigara': BASE_API + '/pigara_deivangal',
        'upa': BASE_API + '/uba_deivangal'
      };

      const res = await fetch(`${endpoints[item.typeKey]}/${item.realId}`, { method: 'DELETE' });
      
      if (res.ok) {
        showSuccess("நீக்கப்பட்டது", "Record deleted successfully");
        fetchAllDeities();
      } else {
        showError("பிழை", "Failed to delete record");
      }
    } catch (err) {
      console.error(err);
      showError("பிழை", "Connection error");
    }
  };

  const buttons = [
    { title: 'பரிவார தெய்வங்கள்', color: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', link: '/parivara-deities', description: 'Parivara Deities', icon: Users },
    { title: 'பிகரா தெய்வங்கள்', color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', link: '/pikara-deities', description: 'Pigara Deities', icon: Shield },
    { title: 'உப தெய்வங்கள்', color: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', link: '/upa-deities', description: 'Upa Deities', icon: Layers },
    { title: 'காவல் தெய்வங்கள்', color: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', link: '/kaval-deities', description: 'Kaval Deities', icon: Shield },
    { title: 'பாலி தெய்வங்கள்', color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', link: '/bali-deities', description: 'Bali Deities', icon: Shield },
  ];

  const filteredData = data.filter(item => {
    let matchesDeity = true;
    if (deityFilter !== '0') {
      matchesDeity = item.typeKey === deityFilter;
    }
    const matchesSearch = (item.displayName || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDeity && matchesSearch;
  });

  return (
    <div className="form-card" style={{ maxWidth: '1400px' }}>
      <div className="form-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <LayoutGrid size={28} color="#6366f1" />
          <h2 style={{ margin: 0 }}>தெய்வங்கள் மேலாண்மை (Deities Management)</h2>
        </div>
        <p>அனைத்து வகையான தெய்வங்கள் மற்றும் அவர்களின் பூஜை விவரங்களை இங்கே நிர்வகிக்கலாம்.</p>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {buttons.map((btn, idx) => (
            <NavLink 
              key={idx} 
              to={btn.link} 
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
              className="nav-card-premium"
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
               <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>அனைத்து தெய்வங்கள் பட்டியல்</h3>
             </div>
             <div style={{ position: 'relative' }}>
               <button 
                 className="btn btn-primary" 
                 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                 onClick={() => setShowAddMenu(!showAddMenu)}
               >
                 <Plus size={18} /> புதிய தெய்வம் சேர்க்க
               </button>
               
               {showAddMenu && (
                 <div style={{ 
                   position: 'absolute', 
                   top: '100%', 
                   right: 0, 
                   marginTop: '8px',
                   background: 'white', 
                   boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
                   borderRadius: '12px', 
                   width: '240px',
                   zIndex: 100,
                   border: '1px solid #e2e8f0',
                   overflow: 'hidden'
                 }}>
                   {[
                     { label: 'உடனுறை தெய்வங்கள்', link: '/utanurai', icon: Heart },
                     { label: 'பரிவார தெய்வங்கள்', link: '/parivara-deities', icon: Users },
                     { label: 'பிகரா தெய்வங்கள்', link: '/pikara-deities', icon: Shield },
                     { label: 'உப தெய்வங்கள்', link: '/upa-deities', icon: Layers },
                     { label: 'பாலி தெய்வங்கள்', link: '/bali-deities', icon: Shield },
                     { label: 'காவல் தெய்வங்கள்', link: '/kaval-deities', icon: Shield },
                   ].map((type, i) => (
                     <NavLink 
                       key={i}
                       to={type.typeKey ? `/moolavar` : type.link}
                       style={{ 
                         display: 'flex', 
                         alignItems: 'center', 
                         gap: '10px', 
                         padding: '12px 16px', 
                         textDecoration: 'none', 
                         color: '#475569',
                         fontSize: '14px',
                         borderBottom: i === 5 ? 'none' : '1px solid #f1f5f9',
                         transition: 'background 0.2s'
                       }}
                       onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                       onMouseLeave={(e) => e.target.style.background = 'transparent'}
                       onClick={() => setShowAddMenu(false)}
                     >
                       <type.icon size={16} color="#6366f1" />
                       {type.label}
                     </NavLink>
                   ))}
                 </div>
               )}
             </div>
          </div>
          
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
                  placeholder="பெயர் மூலம் தேடு..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={14} /> தெய்வ வகை (Deity Type)
              </label>
              <div className="input-wrapper">
                <Layers className="input-icon" size={18} />
                <select 
                  className="form-control" 
                  value={deityFilter} 
                  onChange={(e) => setDeityFilter(e.target.value)}
                  style={{ paddingLeft: '42px', appearance: 'auto' }}
                >
                  <option value="0">அனைத்து வகைகள் (தவிர மூலவர்)</option>
                  <option value="udanurai">உடனுறை தெய்வங்கள்</option>
                  <option value="parivara">பரிவார தெய்வங்கள்</option>
                  <option value="pikara">பிகரா தெய்வங்கள்</option>
                  <option value="upa">உப தெய்வங்கள்</option>
                  <option value="bali">பாலி தெய்வங்கள்</option>
                </select>
              </div>
            </div>

          </div>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>படம்</th>
                <th>தெய்வ பெயர்</th>
                <th>தெய்வ வகை</th>
                <th>பூஜைகள்</th>
                <th style={{ textAlign: 'center' }}>நிலை</th>
                <th className="sticky-column" style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '60px' }}>தகவல்கள் ஏற்றப்படுகின்றன... (Loading...)</td></tr>
              ) : filteredData.length > 0 ? filteredData.map((item) => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                      {item.photo ? (
                        <img src={`${BASE_API}/files/${item.photo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                      ) : (
                        <User size={18} color="#64748b" />
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>{item.displayName}</span>
                  </td>
                  <td>
                    <span className="badge-status" style={{ background: '#f1f5f9', color: '#475569', fontSize: '11px' }}>
                      {item.type}
                    </span>
                  </td>
                  <td>{item.displayWorship}</td>
                  <td style={{ textAlign: 'center' }}>
                     <span className={`badge-status ${item.status === 'Active' || item.status === 'அருவம்' ? 'badge-success' : 'badge-warning'}`}>
                       {item.status || 'Active'}
                     </span>
                  </td>
                  <td className="sticky-column">
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <NavLink 
                        to={
                          item.typeKey === 'moolavar' ? '/mullavar' : 
                          item.typeKey === 'parivara' ? '/parivara-deities' :
                          item.typeKey === 'pigara' ? '/pikara-deities' :
                          item.typeKey === 'upa' ? '/upa-deities' :
                          item.typeKey === 'bali' ? '/bali-deities' :
                          item.typeKey === 'kaval' ? '/kaval-deities' :
                          '/utanurai'
                        } 
                        state={{ editItem: item }}
                        className="icon-action" 
                        title="Edit"
                      >
                        <Edit2 size={16}/>
                      </NavLink>
                      <button className="icon-action" style={{ color: '#ef4444', background: '#fef2f2' }} title="Delete" onClick={() => handleDelete(item)}><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <Search size={32} opacity={0.3} />
                      <span>பதிவுகள் எதுவும் இல்லை</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Mullavar1;
