import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Please fill in all fields.');
    const res = await login(email, password, role);
    if (res.success) navigate(res.role === 'admin' ? '/admin' : '/dashboard');
    else setError('Invalid credentials. Please try again.');
  };

  const fillDemo = (r) => {
    setRole(r);
    if (r === 'admin') { setEmail('admin@sms.com'); setPassword('Admin@123'); }
    else { setEmail('priya@student.com'); setPassword('Student@123'); }
  };

  const s = {
    page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '20px', position: 'relative', overflow: 'hidden' },
    bg: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(59,130,246,0.15) 0%, transparent 60%)', pointerEvents: 'none' },
    grid: { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '60px 60px', opacity: 0.3, pointerEvents: 'none' },
    card: { width: '100%', maxWidth: '440px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '48px 40px', boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.5s ease', position: 'relative', zIndex: 1 },
    logoIcon: { width: '56px', height: '56px', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '26px', boxShadow: '0 0 30px var(--accent-glow)' },
    title: { fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '800', background: 'linear-gradient(135deg, #fff, var(--text-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '4px', textAlign: 'center' },
    sub: { color: 'var(--text-3)', fontSize: '13px', textAlign: 'center', marginBottom: '0' },
    tabRow: { display: 'flex', background: 'var(--bg-2)', borderRadius: '10px', padding: '4px', marginBottom: '28px', gap: '4px', marginTop: '28px' },
    tabActive: { flex: 1, padding: '9px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-display)', cursor: 'pointer', border: 'none', background: 'var(--accent)', color: '#fff', boxShadow: '0 2px 10px var(--accent-glow)', transition: 'all 0.2s' },
    tabInactive: { flex: 1, padding: '9px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-display)', cursor: 'pointer', border: 'none', background: 'transparent', color: 'var(--text-3)', transition: 'all 0.2s' },
    label: { display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-2)', marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' },
    input: { width: '100%', padding: '12px 16px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text)', fontSize: '15px', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' },
    group: { marginBottom: '16px' },
    btn: { width: '100%', padding: '13px', background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: '#fff', borderRadius: '10px', fontSize: '15px', fontWeight: '700', fontFamily: 'var(--font-display)', cursor: 'pointer', border: 'none', marginTop: '8px', transition: 'all 0.2s', letterSpacing: '0.02em' },
    footer: { textAlign: 'center', marginTop: '24px', color: 'var(--text-3)', fontSize: '13px' },
    link: { color: 'var(--accent)', fontWeight: '600' },
    err: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#fca5a5', fontSize: '13px', marginBottom: '16px' },
    demo: { marginTop: '20px', padding: '14px', background: 'var(--bg-2)', borderRadius: '10px', border: '1px solid var(--border)' },
    demoTitle: { fontSize: '11px', fontWeight: '700', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' },
    demoRow: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-2)', marginBottom: '3px' },
    demoBtn: { flex: 1, padding: '6px', background: 'var(--border)', border: 'none', borderRadius: '6px', color: 'var(--text-2)', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--font-body)' },
    madeBy: { textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', color: 'var(--text-3)', fontSize: '12px' },
    socialRow: { display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '8px' },
    socialLink: { color: 'var(--text-3)', fontSize: '11px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' },
  };

  return (
    <div style={s.page}>
      <div style={s.bg} />
      <div style={s.grid} />
      <div style={s.card}>

        {/* Logo & Title */}
        <div style={{ textAlign: 'center' }}>
          <div style={s.logoIcon}>🎓</div>
          <div style={s.title}>EduTrack SMS</div>
          <div style={s.sub}>Student Management System</div>
        </div>

        {/* Role Tabs */}
        <div style={s.tabRow}>
          {['student', 'admin'].map(r => (
            <button key={r} style={role === r ? s.tabActive : s.tabInactive} onClick={() => setRole(r)}>
              {r === 'student' ? '👨‍🎓 Student' : '👨‍💼 Admin'}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && <div style={s.err}>⚠️ {error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={s.group}>
            <label style={s.label}>Email Address</label>
            <input
              style={s.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <div style={s.group}>
            <label style={s.label}>Password</label>
            <input
              style={s.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <button
            style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
            type="submit"
            disabled={loading}
            onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 8px 25px var(--accent-glow)'; } }}
            onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = 'none'; }}
          >
            {loading ? '⏳ Signing in...' : `Sign In as ${role === 'admin' ? 'Admin' : 'Student'}`}
          </button>
        </form>

        {/* Register link */}
        {role === 'student' && (
          <div style={s.footer}>
            Don&apos;t have an account? <Link to="/register" style={s.link}>Register here</Link>
          </div>
        )}

        {/* Made by — card ke andar */}
        <div style={{
          textAlign: "center",
          marginTop: "20px",
          paddingTop: "16px",
          borderTop: "1px solid var(--border)",
          color: "var(--text-3)",
          fontSize: "12px",
        }}>
          <p style={{ marginBottom: "12px" }}> Made with ❤️ by <span style={{ color: 'var(--accent)', fontWeight: '700' }}>Himanshu Raj Vaishnav</span> </p>
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "18px",
            marginTop: "10px",
          }}>
            <a
              href="https://www.instagram.com/himanshu_raj_vaishnav?igsh=eHpzemhocm81OHF0"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "10px 16px",
                borderRadius: "12px",
                background: "#E1306C20",
                color: "#ff4d94",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "0.3s",
                fontWeight: "600",

              }}

              onMouseOver={(e) => {
        e.currentTarget.style.transform = "scale(1.1) translateY(-3px)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }} 
            >
              📸 Instagram
            </a>
            <a
              href="https://www.linkedin.com/in/himanshu-raj-vaishnav-a09962363?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
              target="_blank"
              rel="noopener noreferrer"
              style={{
        padding: "10px 16px",
        borderRadius: "12px",
        background: "#0A66C220",
        color: "#4da6ff",
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        transition: "0.3s",
        fontWeight: "600",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "scale(1.1) translateY(-3px)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
            >
              💼 LinkedIn
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}