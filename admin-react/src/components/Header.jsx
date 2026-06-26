import { BASE_API } from '../api/api_list';
import React, { useState, useEffect } from 'react';
import { Search, Bell, Moon, MessageSquare, Maximize, Menu, ChevronRight, Church, MapPin } from 'lucide-react';

const Header = ({ isCollapsed, setIsCollapsed }) => {
  const [templeInfo, setTempleInfo] = useState({ name: '', village: '' });

  useEffect(() => {
    const fetchTempleInfo = async () => {
      try {
        const res = await fetch(BASE_API + '/temple_basic_detail/1');
        if (res.ok) {
          const json = await res.json();
          const data = json.data?.data || json.data || json;
          setTempleInfo({
            name: data.temple_name || '',
            village: data.village_name || ''
          });
        }
      } catch (err) {
        console.error("Error fetching temple info:", err);
      }
    };
    fetchTempleInfo();
  }, []);

  const rawUsername = localStorage.getItem('username') || 'admin';
  const loggedInNameRaw = localStorage.getItem('name') || 'Administrator';
  const loggedInName = loggedInNameRaw !== 'Administrator' && loggedInNameRaw ? loggedInNameRaw : (rawUsername.includes('@') ? rawUsername.split('@')[0] : rawUsername);
  const loggedInEmail = localStorage.getItem('email') || (rawUsername.includes('@') ? rawUsername : 'admin@example.com');
  const initials = loggedInName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'AD';

  return (
    <header className="header">
      <div className="header-left">
        <button className="mobile-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
          <Menu size={20} />
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Church size={18} color="#6366f1" />
            <span style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b' }}>
              {templeInfo.name || 'Loading Temple...'}
            </span>
          </div>
          {templeInfo.village && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '2px' }}>
              <MapPin size={12} color="#94a3b8" />
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
                {templeInfo.village}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="header-actions">
        <div className="action-group">
          <div className="icon-action" title="Messages">
            <MessageSquare size={20} />
          </div>
          <div className="icon-action" title="Notifications">
            <Bell size={20} />
            <span className="badge">4</span>
          </div>
          <div className="icon-action" title="Theme">
            <Moon size={20} />
          </div>
          <div className="icon-action" title="Fullscreen">
            <Maximize size={20} />
          </div>
        </div>
        
        <div className="header-divider"></div>
        
        <div className="header-user">
          <div className="user-info">
            <span className="user-name">{loggedInName}</span>
            <span className="user-role">{loggedInEmail}</span>
          </div>
          <div className="user-avatar-wrapper">
            <div className="user-avatar">
              <span>{initials}</span>
            </div>
            <div className="status-indicator"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
