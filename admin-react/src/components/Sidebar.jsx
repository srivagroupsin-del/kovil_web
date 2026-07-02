import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  Calendar, 
  Heart, 
  Settings, 
  MapPin, 
  Info, 
  LogOut, 
  ChevronRight, 
  ChevronLeft,
  UserPlus,
  Church,
  ScrollText,
  UserCheck,
  Building2,
  HandHelping,
  FileText,
  Sparkles
} from 'lucide-react';

const MenuItem = ({ title, link, icon: Icon, submenus, isCollapsed }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Check if any submenu is active
  const isChildActive = submenus ? submenus.some(sub => location.pathname === sub.link) : false;
  const isActive = location.pathname === link || isChildActive;

  // Auto-open if a child is active
  useEffect(() => {
    if (isChildActive && !isCollapsed) {
      setIsOpen(true);
    }
  }, [isChildActive, isCollapsed]);

  if (submenus) {
    return (
      <li className="menu-item">
        <div 
          className={`menu-link ${isActive ? 'active' : ''} ${isOpen ? 'open-parent' : ''}`}
          onClick={() => !isCollapsed && setIsOpen(!isOpen)}
          title={isCollapsed ? title : ''}
        >
          <div className="menu-link-left">
            {Icon && <Icon size={20} className="menu-icon" />}
            {!isCollapsed && <span>{title}</span>}
          </div>
          {!isCollapsed && (
            <ChevronRight 
              size={14} 
              className={`arrow-icon ${isOpen ? 'rotated' : ''}`}
            />
          )}
        </div>
        {!isCollapsed && (
          <ul className={`submenu ${isOpen ? 'open' : ''}`}>
            {submenus.map((sub, idx) => (
              <li key={idx}>
                <NavLink 
                  to={sub.link} 
                  className={({ isActive }) => `submenu-link ${isActive ? 'active' : ''}`}
                >
                  {sub.title}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li className="menu-item">
      <NavLink 
        to={link} 
        className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
        title={isCollapsed ? title : ''}
      >
        <div className="menu-link-left">
          {Icon && <Icon size={20} className="menu-icon" />}
          {!isCollapsed && <span>{title}</span>}
        </div>
      </NavLink>
    </li>
  );
};

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const navItems = [
    { title: 'Dashboard', link: '/', icon: LayoutDashboard },
    { title: 'கோவில் சேர்க்க', link: '/koviljoin', icon: UserPlus },
    { 
      title: 'தெய்வங்கள்', 
      icon: Users,
      submenus: [
        { title: 'மூலவர்', link: '/mullavar' },
        { title: 'தெய்வங்கள் சேர்க்க', link: '/mullavar1' },
        // { title: 'உடனுறை தெய்வங்கள்', link: '/utanurai' },
        // { title: 'பரிவார தெய்வங்கள்', link: '/parivara-teyvankal' },
        // { title: 'பிகரா தெய்வங்கள்', link: '/pikara-teyvankal' },
        // { title: 'உப தெய்வங்கள்', link: '/upa-deities' },
        // { title: 'பாலி தெய்வங்கள்', link: '/bali-deities' },
        // { title: 'காவல் தெய்வங்கள்', link: '/kaval-deities' },
      ]
    },
    { 
      title: 'கோவில்', 
      icon: Church,
      submenus: [
        { title: 'கோவில்', link: '/kovil' },
        { title: 'கோவில் பட்டியல்', link: '/temple-list' },
        { title: 'வரலாறு', link: '/varalaru' },
      ]
    },
    { 
      title: 'பூஜைகள்', 
      icon: Calendar,
      submenus: [
        { title: 'பூஜைகள்', link: '/pujaikal' },
        { title: 'நித்திய பூஜை', link: '/nitya_pooja' },
        { title: 'கிழமை பூஜை', link: '/week_pooja' },
        { title: 'சிறப்பு பூஜை', link: '/special_pooja' },
      ]
    },
    { 
      title: 'திருவிழாக்கள்', 
      icon: Sparkles,
      submenus: [
        { title: 'திருவிழாக்கள்', link: '/totar_pujai' },
        { title: 'விசேஷங்கள்', link: '/visucam_neram' },
      ]
    },
    { 
      title: 'பிரார்த்தனை',
      icon: Heart,
      submenus: [
        {title: 'குறை நிவர்த்தி', link: '/kurai_nivarthi'}
      ]
    },
    { 
      title: 'பக்தர்கள்', 
      icon: UserCheck,
      submenus: [
        {title: 'நேர்த்தி கடன்', link: '/nertti_katan'},
        {title: 'சமூகம் மற்றும் சாதி', link: '/community'},
        {title: 'கட்டளை தரங்கள்', link: '/kattali'},
      ]
    },
    {
      title: 'குலம்',
      icon: Users,
      submenus: [
        {title: 'குலதெய்வம் வழிபாடு', link: '/community-select'},
        {title: 'சமூகம்', link: '/community-manage'},
        {title: 'உட்பிரிவு', link: '/subcommunity-manage'},
        {title: 'குலம்', link: '/kulam-manage'},
        {title: 'குல தெய்வம்', link: '/kula-deivam'},
        {title: 'வகைரா', link: '/vagaiyara-manage'},
        {title: 'குலம் மக்கள்', link: '/kullam_people'},
        {title: 'முன்னோர்களைச் சேர்க்க', link: '/ancestors'},
      ]
    },
    { 
      title: 'நிர்வாகம்', 
      icon: Building2,
      submenus: [
        { title: 'தர்மகர்த்தா', link: '/tharumakatha' },
        { title: 'நன்கொடையாளர் / தொண்டர்', link: '/donors-volunteers' },
        { title: 'அறநிலையத்துறை', link: '/aranilaiyatturai' },
        { title: 'பொருளாதார்', link: '/porulatar' },
        { title: 'அன்ன தானம்', link: '/annatanam' },
        { title: 'பக்தர்கள் குலு', link: '/visucam' },
        // { title: 'Trust Portal Login', link: '/trust-login' },
      ]
    },
    { title: 'முகவரி', link: '/address', icon: MapPin },
    { title: 'தகவல்', link: '/takaval', icon: Info },
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && <div className="logo-text">KOVIL<span>ADMIN</span></div>}
        <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="sidebar-menu-wrapper">
        <ul className="sidebar-menu">
          {navItems.map((item, idx) => (
            <MenuItem key={idx} {...item} isCollapsed={isCollapsed} />
          ))}
        </ul>
      </div>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
