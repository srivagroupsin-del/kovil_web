import { BASE_API } from '../api/api_list';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle, X } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const navigate = useNavigate();
  const emailRef = useRef(null);

  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') === 'true') {
      navigate('/');
    }
    if (emailRef.current) {
      emailRef.current.focus();
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('மின்னஞ்சல் மற்றும் கடவுச்சொல் உள்ளிடவும்');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(BASE_API + "/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok && data.result === "Success") {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', data.user?.username || email.split('@')[0]);
        localStorage.setItem('name', data.user?.name || 'Administrator');
        localStorage.setItem('email', data.user?.email || email);
        localStorage.setItem('loginTime', new Date().toISOString());
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        navigate('/');
      } else {
        setError(data.error || 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல். (Invalid email or password.)');
        setLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError('சேவையக இணைப்பு தோல்வி. (Server connection failed.)');
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Animated Background Blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      {/* Decorative floating particles */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ ...styles.particle, ...particlePositions[i] }} />
      ))}

      <div style={styles.container}>
        {/* Left Panel - Branding */}
        <div style={styles.leftPanel}>
          <div style={styles.templeIcon}>
            <svg viewBox="0 0 80 80" width="64" height="64" fill="none">
              <circle cx="40" cy="40" r="38" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
              <path d="M40 12 L48 24 L52 22 L52 52 L28 52 L28 22 L32 24 Z" fill="rgba(255,255,255,0.9)" />
              <rect x="34" y="38" width="12" height="14" rx="1" fill="rgba(99,102,241,0.7)" />
              <path d="M28 52 L52 52 L56 58 L24 58 Z" fill="rgba(255,255,255,0.8)" />
              <circle cx="40" cy="20" r="3" fill="#fbbf24" />
            </svg>
          </div>
          <h1 style={styles.brandTitle}>கோவில் நிர்வாகம்</h1>
          <p style={styles.brandSubtitle}>Temple Administration System</p>
          <div style={styles.brandDivider} />
          <p style={styles.brandDesc}>
            தெய்வீக பணிகளை திறமையாக நிர்வகிக்கும் தவிர்க்க முடியாத ஆன்மீக நிர்வாக தளம்
          </p>
          <p style={{ ...styles.brandDesc, fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
            Seamlessly manage rituals, festivals, and devotee records in one sacred space.
          </p>

          <div style={styles.statsRow}>
            {[
              { label: 'பூஜைகள்', sublabel: 'Rituals', icon: '🕉️' },
              { label: 'நிகழ்வுகள்', sublabel: 'Events', icon: '🪔' },
              { label: 'பக்தர்கள்', sublabel: 'Devotees', icon: '🙏' },
            ].map((s) => (
              <div key={s.label} style={styles.statItem}>
                <span style={{ fontSize: '20px' }}>{s.icon}</span>
                <div>
                  <div style={styles.statLabel}>{s.label}</div>
                  <div style={styles.statSub}>{s.sublabel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div style={styles.rightPanel}>
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <div style={styles.formIconWrap}>
                <Lock size={22} color="#6366f1" />
              </div>
              <h2 style={styles.formTitle}>உள்நுழைக</h2>
              <p style={styles.formSubtitle}>Sign in to your admin account</p>
            </div>

            {error && (
              <div style={styles.errorBox}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '13px' }}>{error}</span>
                <button onClick={() => setError('')} style={styles.errorClose}>
                  <X size={14} />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Email Field */}
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>
                  மின்னஞ்சல் முகவரி <span style={{ color: '#94a3b8', fontWeight: '400' }}>(Email)</span>
                </label>
                <div style={{
                  ...styles.inputWrap,
                  ...(focused === 'email' ? styles.inputWrapFocused : {})
                }}>
                  <Mail size={18} style={styles.inputIcon} />
                  <input
                    ref={emailRef}
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused('')}
                    placeholder="admin@example.com"
                    required
                    autoComplete="email"
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>
                  கடவுச்சொல் <span style={{ color: '#94a3b8', fontWeight: '400' }}>(Password)</span>
                </label>
                <div style={{
                  ...styles.inputWrap,
                  ...(focused === 'password' ? styles.inputWrapFocused : {})
                }}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused('')}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    style={{ ...styles.input, paddingRight: '48px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember / Show Password */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="showPwd"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  style={{ accentColor: '#6366f1', width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="showPwd" style={{ fontSize: '13px', color: '#64748b', cursor: 'pointer', userSelect: 'none' }}>
                  கடவுச்சொல் காட்டு (Show Password)
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submitBtn,
                  ...(loading ? styles.submitBtnLoading : {})
                }}
              >
                {loading ? (
                  <>
                    <span style={styles.spinner} />
                    <span>உள்நுழைகிறது... (Signing in...)</span>
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    <span>உள்நுழைக (Login to Dashboard)</span>
                  </>
                )}
              </button>
            </form>

            <div style={styles.formFooter}>
              <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                🔐 Secured Admin Access · கோவில் நிர்வாக அமைப்பு
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes blob-drift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes blob-drift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(1.08); }
          66% { transform: translate(20px, -30px) scale(0.92); }
        }
        @keyframes blob-drift3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.1); }
        }
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.4; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-32px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

const particlePositions = [
  { top: '15%', left: '10%', width: '8px', height: '8px', animationDelay: '0s' },
  { top: '70%', left: '5%', width: '6px', height: '6px', animationDelay: '1s' },
  { top: '30%', right: '8%', width: '10px', height: '10px', animationDelay: '2s' },
  { top: '80%', right: '12%', width: '7px', height: '7px', animationDelay: '0.5s' },
  { top: '55%', left: '50%', width: '5px', height: '5px', animationDelay: '1.5s' },
  { top: '10%', right: '30%', width: '8px', height: '8px', animationDelay: '2.5s' },
];

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #312e81 70%, #1e1b4b 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },
  blob1: {
    position: 'absolute',
    top: '-150px',
    left: '-150px',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)',
    animation: 'blob-drift1 8s ease-in-out infinite',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute',
    bottom: '-200px',
    right: '-100px',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
    animation: 'blob-drift2 10s ease-in-out infinite',
    pointerEvents: 'none',
  },
  blob3: {
    position: 'absolute',
    top: '40%',
    left: '40%',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)',
    animation: 'blob-drift3 12s ease-in-out infinite',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(251,191,36,0.6)',
    animation: 'float-particle 4s ease-in-out infinite',
    pointerEvents: 'none',
  },
  container: {
    display: 'flex',
    width: '100%',
    maxWidth: '920px',
    minHeight: '540px',
    borderRadius: '28px',
    overflow: 'hidden',
    boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
    position: 'relative',
    zIndex: 10,
    animation: 'fadeInUp 0.6s ease-out both',
  },

  /* Left branding panel */
  leftPanel: {
    flex: '1 1 45%',
    background: 'linear-gradient(160deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.15) 100%)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRight: '1px solid rgba(255,255,255,0.08)',
    padding: '48px 40px',
    display: 'flex',
    flexDirection: 'column',
    color: 'white',
    animation: 'slideInLeft 0.7s ease-out 0.1s both',
  },
  templeIcon: {
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  brandTitle: {
    fontSize: '26px',
    fontWeight: '800',
    margin: '0 0 6px 0',
    background: 'linear-gradient(135deg, #ffffff 0%, #c7d2fe 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.5px',
  },
  brandSubtitle: {
    fontSize: '13px',
    color: 'rgba(199,210,254,0.8)',
    margin: '0 0 24px 0',
    fontWeight: '500',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  brandDivider: {
    height: '1px',
    background: 'linear-gradient(90deg, rgba(255,255,255,0.3), transparent)',
    marginBottom: '20px',
  },
  brandDesc: {
    fontSize: '13.5px',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: '1.7',
    margin: 0,
  },
  statsRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginTop: 'auto',
    paddingTop: '32px',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '12px 16px',
  },
  statLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'white',
  },
  statSub: {
    fontSize: '11px',
    color: 'rgba(199,210,254,0.7)',
    marginTop: '2px',
  },

  /* Right form panel */
  rightPanel: {
    flex: '1 1 55%',
    background: 'rgba(255,255,255,0.97)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 40px',
  },
  formCard: {
    width: '100%',
    maxWidth: '380px',
  },
  formHeader: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  formIconWrap: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
    border: '1px solid #c7d2fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px auto',
    boxShadow: '0 4px 12px rgba(99,102,241,0.2)',
  },
  formTitle: {
    fontSize: '26px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 6px 0',
    letterSpacing: '-0.5px',
  },
  formSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    borderRadius: '12px',
    padding: '12px 14px',
    marginBottom: '20px',
  },
  errorClose: {
    background: 'none',
    border: 'none',
    color: '#dc2626',
    cursor: 'pointer',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  fieldLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    border: '1.5px solid #e2e8f0',
    borderRadius: '12px',
    background: '#f8fafc',
    transition: 'all 0.2s ease',
    overflow: 'hidden',
  },
  inputWrapFocused: {
    border: '1.5px solid #6366f1',
    background: '#ffffff',
    boxShadow: '0 0 0 3px rgba(99,102,241,0.12)',
  },
  inputIcon: {
    color: '#94a3b8',
    flexShrink: 0,
    marginLeft: '14px',
    marginRight: '2px',
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    padding: '13px 14px',
    fontSize: '14px',
    color: '#0f172a',
    fontFamily: "'Inter', sans-serif",
    width: '100%',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
    borderRadius: '6px',
    transition: 'color 0.2s',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '14px 20px',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: 'white',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    boxShadow: '0 8px 20px rgba(99,102,241,0.4)',
    transition: 'all 0.2s ease',
    letterSpacing: '0.2px',
  },
  submitBtnLoading: {
    opacity: 0.8,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  spinner: {
    display: 'inline-block',
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.35)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  formFooter: {
    textAlign: 'center',
    marginTop: '28px',
    paddingTop: '20px',
    borderTop: '1px solid #f1f5f9',
  },
};

export default Login;
