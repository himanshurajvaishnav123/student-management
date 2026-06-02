import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const COURSES = ['B.Tech CSE','B.Tech ECE','B.Tech ME','BCA','MCA','MBA','B.Sc','M.Sc','B.Com','M.Com'];

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', email:'', password:'', course:'B.Tech CSE', phone:'', semester:1, gender:'' });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handle = (k, v) => setForm(prev => ({...prev, [k]: v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.course) return setError('Please fill all required fields.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    const res = await register(form);
    if (res.success) navigate('/dashboard');
    else setError('Registration failed. Email may already be in use.');
  };

  const s = {
    page:{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'20px', position:'relative', overflow:'hidden' },
    bg:{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(99,102,241,0.15) 0%, transparent 60%)', pointerEvents:'none' },
    card:{ width:'100%', maxWidth:'520px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'40px', boxShadow:'var(--shadow-lg)', animation:'fadeIn 0.5s ease', position:'relative', zIndex:1 },
    header:{ textAlign:'center', marginBottom:'28px' },
    icon:{ width:'52px', height:'52px', background:'linear-gradient(135deg, var(--accent-2), var(--purple))', borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontSize:'24px', boxShadow:'0 0 25px rgba(99,102,241,0.3)' },
    title:{ fontFamily:'var(--font-display)', fontSize:'24px', fontWeight:'800', background:'linear-gradient(135deg, #fff, var(--text-2))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:'4px' },
    sub:{ color:'var(--text-3)', fontSize:'13px' },
    grid2:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' },
    label:{ display:'block', fontSize:'12px', fontWeight:'600', color:'var(--text-2)', marginBottom:'6px', letterSpacing:'0.05em', textTransform:'uppercase' },
    input:{ width:'100%', padding:'11px 14px', background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text)', fontSize:'14px', outline:'none', boxSizing:'border-box', fontFamily:'var(--font-body)' },
    select:{ width:'100%', padding:'11px 14px', background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text)', fontSize:'14px', outline:'none', boxSizing:'border-box', fontFamily:'var(--font-body)', cursor:'pointer' },
    group:{ marginBottom:'14px' },
    btn:{ width:'100%', padding:'13px', background:'linear-gradient(135deg, var(--accent-2), var(--purple))', color:'#fff', borderRadius:'10px', fontSize:'15px', fontWeight:'700', fontFamily:'var(--font-display)', cursor:'pointer', border:'none', marginTop:'8px', transition:'all 0.2s' },
    footer:{ textAlign:'center', marginTop:'20px', color:'var(--text-3)', fontSize:'13px' },
    link:{ color:'var(--accent)', fontWeight:'600' },
    err:{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px', padding:'10px 14px', color:'#fca5a5', fontSize:'13px', marginBottom:'16px' },
    req:{ color:'var(--red)' },
  };

  const inputFocus = e => { e.target.style.borderColor='var(--accent-2)'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.2)'; };
  const inputBlur = e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; };

  return (
    <div style={s.page}>
      <div style={s.bg} />
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.icon}>📝</div>
          <div style={s.title}>Create Account</div>
          <div style={s.sub}>Join EduTrack as a Student</div>
        </div>
        {error && <div style={s.err}>⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={s.grid2}>
            <div style={s.group}>
              <label style={s.label}>Full Name <span style={s.req}>*</span></label>
              <input style={s.input} value={form.name} onChange={e=>handle('name',e.target.value)} placeholder="John Doe" onFocus={inputFocus} onBlur={inputBlur} />
            </div>
            <div style={s.group}>
              <label style={s.label}>Phone</label>
              <input style={s.input} value={form.phone} onChange={e=>handle('phone',e.target.value)} placeholder="9876543210" onFocus={inputFocus} onBlur={inputBlur} />
            </div>
          </div>
          <div style={s.group}>
            <label style={s.label}>Email Address <span style={s.req}>*</span></label>
            <input style={s.input} type="email" value={form.email} onChange={e=>handle('email',e.target.value)} placeholder="john@example.com" onFocus={inputFocus} onBlur={inputBlur} />
          </div>
          <div style={s.group}>
            <label style={s.label}>Password <span style={s.req}>*</span></label>
            <input style={s.input} type="password" value={form.password} onChange={e=>handle('password',e.target.value)} placeholder="Min. 6 characters" onFocus={inputFocus} onBlur={inputBlur} />
          </div>
          <div style={s.grid2}>
            <div style={s.group}>
              <label style={s.label}>Course <span style={s.req}>*</span></label>
              <select style={s.select} value={form.course} onChange={e=>handle('course',e.target.value)} onFocus={inputFocus} onBlur={inputBlur}>
                {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={s.group}>
              <label style={s.label}>Semester</label>
              <select style={s.select} value={form.semester} onChange={e=>handle('semester',Number(e.target.value))} onFocus={inputFocus} onBlur={inputBlur}>
                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Semester {n}</option>)}
              </select>
            </div>
          </div>
          <div style={s.group}>
            <label style={s.label}>Gender</label>
            <select style={s.select} value={form.gender} onChange={e=>handle('gender',e.target.value)} onFocus={inputFocus} onBlur={inputBlur}>
              <option value="">Select gender</option>
              {['Male','Female','Other'].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <button style={{...s.btn, opacity:loading?0.7:1}} type="submit" disabled={loading}
            onMouseEnter={e=>{if(!loading)e.target.style.transform='translateY(-1px)'}}
            onMouseLeave={e=>e.target.style.transform='none'}>
            {loading ? '⏳ Creating account...' : '🚀 Create Student Account'}
          </button>
        </form>
        <div style={s.footer}>Already have an account? <Link to="/login" style={s.link}>Sign in</Link></div>
      </div>
    </div>
  );
}
