import { BASE_API } from '../api/api_list';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Briefcase, Phone, Mail, Building, Activity, CheckCircle, Shield } from 'lucide-react';

const TrustOverview = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('trustUser');
    if (!userData) {
      navigate('/trust-login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('trustUser');
    navigate('/trust-login');
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>Trust Overview Dashboard</h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Welcome back, manage your assigned duties</p>
          </div>
          <button 
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', background: '#fff', border: '1px solid #e2e8f0', color: '#ef4444', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s' }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Profile Card */}
        <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', display: 'flex', gap: '32px', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', marginBottom: '32px', flexWrap: 'wrap' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '4px solid #f1f5f9', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user.photo_path ? (
              <img src={`${BASE_API}/files/${user.photo_path}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
            ) : (
              <User size={48} color="#94a3b8" />
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>{user.name}</h2>
              <span style={{ padding: '4px 12px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>
                {user.role || 'Member'}
              </span>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
                <Phone size={16} color="#6366f1" /> {user.phone || 'N/A'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
                <Mail size={16} color="#6366f1" /> {user.email || 'N/A'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
                <Building size={16} color="#6366f1" /> Temple ID: {user.temple_id || 'Global'}
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Work Assignment Card */}
          <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', borderTop: '4px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ padding: '10px', background: '#ecfdf5', borderRadius: '12px', color: '#10b981' }}>
                <Briefcase size={24} />
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Assigned Work / Role</h3>
            </div>
            
            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <p style={{ margin: 0, color: '#334155', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontWeight: '500' }}>
                {user.assigned_work || 'You currently do not have specific work assigned.'}
              </p>
            </div>
          </div>

          {/* Account Status Card */}
          <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', borderTop: '4px solid #3b82f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ padding: '10px', background: '#eff6ff', borderRadius: '12px', color: '#3b82f6' }}>
                <Activity size={24} />
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Account Status</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Current Status</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: user.status === 'active' ? '#059669' : '#dc2626', fontWeight: '700', fontSize: '14px', background: user.status === 'active' ? '#ecfdf5' : '#fef2f2', padding: '6px 12px', borderRadius: '20px' }}>
                  <CheckCircle size={14} /> {user.status ? user.status.toUpperCase() : 'UNKNOWN'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                <span style={{ color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Temple Creation Rights</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: user.can_create_temple === 1 ? '#059669' : '#64748b', fontWeight: '700', fontSize: '14px', background: user.can_create_temple === 1 ? '#ecfdf5' : '#f1f5f9', padding: '6px 12px', borderRadius: '20px' }}>
                  <Shield size={14} /> {user.can_create_temple === 1 ? 'GRANTED' : 'DENIED'}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TrustOverview;
