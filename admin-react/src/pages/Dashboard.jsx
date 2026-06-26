import React, { useEffect, useState } from 'react';
import {
  Church,
  Users,
  Calendar,
  Activity,
  Clock,
  ShieldCheck,
  User,
  Smartphone,
  TrendingUp,
  ArrowRight,
  Bell,
  Zap,
} from 'lucide-react';

function useAnimatedCounter(rawValue, delay = 0) {
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const numeric = parseInt(rawValue.replace(/[^0-9]/g, ''), 10);
    if (isNaN(numeric)) { setDisplay(rawValue); return; }

    const prefix = rawValue.match(/^[^0-9]*/)?.[0] ?? '';
    const suffix = rawValue.match(/[^0-9.]*$/)?.[0] ?? '';
    const duration = 1400;
    let startTime = null;

    const timer = setTimeout(() => {
      const step = (ts) => {
        if (!startTime) startTime = ts;
        const progress = Math.min((ts - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * numeric);
        setDisplay(prefix + current.toLocaleString() + suffix);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);

    return () => clearTimeout(timer);
  }, [rawValue, delay]);

  return display;
}

const StatCard = ({ title, value, icon: Icon, color, trend, index }) => {
  const [visible, setVisible] = useState(false);
  const displayValue = useAnimatedCounter(value, index * 120 + 400);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80 + 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className="stat-card stat-card-v2"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.97)',
        transition: `opacity 0.55s cubic-bezier(0.4,0,0.2,1) ${index * 0.08}s, transform 0.55s cubic-bezier(0.4,0,0.2,1) ${index * 0.08}s`,
        '--accent': color,
      }}
    >
      <div className="stat-card-top">
        <div className="stat-icon-v2" style={{ background: `${color}18`, color }}>
          <Icon size={22} />
        </div>
        <div className="stat-badge-up">
          <TrendingUp size={12} />
        </div>
      </div>
      <div className="stat-value-v2">{displayValue}</div>
      <div className="stat-title-v2">{title}</div>
      {trend && (
        <div className="stat-trend-v2" style={{ color }}>
          <TrendingUp size={11} />
          <span>{trend}</span>
        </div>
      )}
      <div className="stat-bar-track">
        <div
          className="stat-bar-fill"
          style={{ background: color, width: visible ? '70%' : '0%', transition: `width 1.2s cubic-bezier(0.4,0,0.2,1) ${index * 0.08 + 0.5}s` }}
        />
      </div>
    </div>
  );
};

const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return <>{time.toLocaleString()}</>;
};


const ACTIVITIES = [
  { title: 'New Temple Added',  detail: 'Sri Ranganathaswamy Temple',           time: '2 mins ago',  Icon: Church,      color: '#6366f1' },
  { title: 'Pooja Scheduled',   detail: 'Evening Deeparadhana – Kasi Viswanathar', time: '15 mins ago', Icon: Calendar,    color: '#f59e0b' },
  { title: 'System Update',     detail: 'Backup completed successfully',         time: '1 hour ago',  Icon: ShieldCheck, color: '#10b981' },
];

const STATS = [
  { title: 'Total Temples',    value: '124',   icon: Church,    color: '#6366f1', trend: '+4 this month' },
  { title: 'Registered Users', value: '1240',  icon: Users,     color: '#a855f7', trend: '+12% increase' },
  { title: 'Daily Poojas',     value: '45',    icon: Calendar,  color: '#f59e0b', trend: 'Active now'    },
  { title: 'System Health',    value: '99.9%', icon: Activity,  color: '#10b981', trend: 'Stable'        },
];

const Dashboard = () => {
  const [bannerIn, setBannerIn] = useState(false);
  const loggedInUsernameRaw = localStorage.getItem('username') || 'admin';
  const loggedInName = localStorage.getItem('name') || 'Administrator';
  const loggedInUsername = loggedInName !== 'Administrator' && loggedInName ? loggedInName : (loggedInUsernameRaw.includes('@') ? loggedInUsernameRaw.split('@')[0] : loggedInUsernameRaw);
  const loginTimeRaw = localStorage.getItem('loginTime');
  const loginTime = loginTimeRaw ? new Date(loginTimeRaw).toLocaleString() : new Date().toLocaleString();

  const sessionRows = [
    { Icon: User,        label: 'User ID / Email', value: loggedInUsername, mono: false, green: false, truncate: true },
    { Icon: ShieldCheck, label: 'Role',            value: loggedInName,     mono: false, green: false, truncate: true },
    { Icon: Clock,       label: 'Login Time',      value: loginTime,        mono: false, green: false },
    { Icon: Activity,    label: 'Status',          value: 'Authenticated',  mono: false, green: true },
  ];

  useEffect(() => {
    const t = setTimeout(() => setBannerIn(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="dashboard-container">

      {/* ── Welcome Banner ── */}
      <div
        className="dashboard-header"
        style={{
          opacity: bannerIn ? 1 : 0,
          transform: bannerIn ? 'translateY(0)' : 'translateY(-20px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        <div className="welcome-banner">
          <div className="wb-orb wb-orb-1" />
          <div className="wb-orb wb-orb-2" />
          <div className="wb-orb wb-orb-3" />

          <div className="welcome-content">
            <div className="wb-chip">
              <Zap size={13} /> Live Dashboard
            </div>
            <h1 className="wb-title">Welcome back, <strong>{loggedInUsername}</strong>! 👋</h1>
            <p className="wb-subtitle">Here's what's happening with your temple management system today.</p>
          </div>

          <div className="wb-mini-stats">
            <div className="wb-mini-item">
              <span className="wb-mini-val">124</span>
              <span className="wb-mini-lbl">Temples</span>
            </div>
            <div className="wb-mini-divider" />
            <div className="wb-mini-item">
              <span className="wb-mini-val">1.2k</span>
              <span className="wb-mini-lbl">Users</span>
            </div>
            <div className="wb-mini-divider" />
            <div className="wb-mini-item">
              <span className="wb-mini-val">99.9%</span>
              <span className="wb-mini-lbl">Uptime</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="stats-grid">
        {STATS.map((s, i) => <StatCard key={i} {...s} index={i} />)}
      </div>

      {/* ── Content Grid ── */}
      <div className="dashboard-content-grid">

        {/* Session Card */}
        <div className="card card-slide-in" style={{ animationDelay: '0.35s' }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Current Session</h2>
              <p className="card-subtitle">Active login details</p>
            </div>
            <span className="badge-status badge-success badge-live">
              <span className="live-dot" /> Active
            </span>
          </div>

          <div className="session-rows">
            {sessionRows.map(({ Icon, label, value, mono, green, truncate }, i) => (
              <div
                key={i}
                className="session-row fade-row"
                style={{ animationDelay: `${0.45 + i * 0.07}s` }}
              >
                <div className="session-row-label">
                  <span className="session-row-icon"><Icon size={14} /></span>
                  <span>{label}</span>
                </div>
                <span className={`session-row-val${mono ? ' mono' : ''}${green ? ' green' : ''}`}>
                  {green && <span className="green-dot" />}
                  {truncate ? value.slice(0, 22) + '…' : value}
                </span>
              </div>
            ))}
            <div className="session-row fade-row" style={{ animationDelay: '0.82s' }}>
              <div className="session-row-label">
                <span className="session-row-icon"><Clock size={14} /></span>
                <span>Current Time</span>
              </div>
              <span className="session-row-val mono">
                <LiveClock />
              </span>
            </div>
          </div>
        </div>

        {/* Activity Card */}
        <div className="card card-slide-in" style={{ animationDelay: '0.45s' }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Recent Activity</h2>
              <p className="card-subtitle">Latest system events</p>
            </div>
            <button className="icon-circle-btn">
              <Bell size={16} />
            </button>
          </div>

          <div className="activity-list">
            {ACTIVITIES.map(({ title, detail, time, Icon, color }, i) => (
              <div
                key={i}
                className="activity-item activity-slide"
                style={{ animationDelay: `${0.55 + i * 0.1}s` }}
              >
                <div className="activity-icon" style={{ background: `${color}18`, color }}>
                  <Icon size={15} />
                </div>
                <div className="activity-detail">
                  <p>{title}</p>
                  <span>{detail}</span>
                  <div className="activity-time-row">
                    <Clock size={10} style={{ color: '#94a3b8' }} />
                    <span>{time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="view-all-btn">
            View All Activity <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
