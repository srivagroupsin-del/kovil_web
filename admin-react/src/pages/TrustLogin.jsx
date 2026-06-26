import { BASE_API } from '../api/api_list';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Phone, ShieldCheck } from 'lucide-react';
import { showSuccess, showError } from '../utils/swal';

const TrustLogin = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      showError('Please enter both phone and password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(BASE_API + '/tharumakatha/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });

      const json = await res.json();

      if (res.ok && json.data?.result === 'Success') {
        // Store user data
        localStorage.setItem('trustUser', JSON.stringify(json.data.data));
        showSuccess('Login Successful', 'Welcome back!');
        navigate('/trust-overview');
      } else {
        showError('Login Failed', json.data?.message || 'Invalid credentials');
      }
    } catch (err) {
      showError('Network Error', 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '40px 32px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)' }}>
            <ShieldCheck size={32} color="white" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px 0' }}>Trust Portal Login</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Sign in to access your assigned work</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '13.5px', color: '#475569', marginBottom: '8px' }}>Phone Number</label>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <Phone size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f1f5f9', fontSize: '14px', outline: 'none', transition: 'border 0.2s' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '13.5px', color: '#475569', marginBottom: '8px' }}>Password</label>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f1f5f9', fontSize: '14px', outline: 'none', transition: 'border 0.2s' }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: '12px',
              width: '100%', 
              padding: '14px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
              color: 'white', 
              fontWeight: '700', 
              fontSize: '15px', 
              border: 'none', 
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TrustLogin;
