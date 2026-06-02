import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export function Layout({ children, navItems, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const handleResize = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    api.get('/notifications').then(res => {
      setNotifications(res.data || []);
      setUnread(res.unreadCount || 0);
    }).catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const markAllRead = async () => {
    await api.put('/notifications/read-all').catch(()=>{});
    setUnread(0);
    setNotifications(prev => prev.map(n => ({...n, isRead: true})));
  };

  const sideW = collapsed ? 72 : 240;

  const s = {
    wrap:{ display:'flex', minHeight:'100vh', background:'var(--bg)', fontFamily:'var(--font-body)' },
    sidebar:{ width: mobile ? (mobileOpen ? '240px' : '0') : `${sideW}px`, minWidth: mobile ? undefined : `${sideW}px`, background:'var(--card)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', transition:'all 0.3s cubic-bezier(0.4,0,0.2,1)', overflow:'hidden', position: mobile ? 'fixed' : 'relative', zIndex:100, top:0, left:0, bottom:0, boxShadow: mobile && mobileOpen ? '4px 0 24px rgba(0,0,0,0.5)' : 'none' },
    overlay:{ display: mobile && mobileOpen ? 'block' : 'none', position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99 },
    logo:{ padding: collapsed ? '20px 0' : '20px 20px', display:'flex', alignItems:'center', gap:'10px', borderBottom:'1px solid var(--border)', minHeight:'64px' },
    logoIcon:{ width:'36px', height:'36px', background:'linear-gradient(135deg, var(--accent), var(--accent-2))', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0, boxShadow:'0 0 15px var(--accent-glow)' },
    logoText:{ fontFamily:'var(--font-display)', fontWeight:'800', fontSize:'16px', color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', opacity: collapsed ? 0 : 1, transition:'opacity 0.2s' },
    nav:{ flex:1, padding:'12px 8px', overflowY:'auto' },
    navItem:{ display:'flex', alignItems:'center', gap:'12px', padding: collapsed ? '11px 18px' : '11px 14px', borderRadius:'10px', cursor:'pointer', transition:'all 0.2s', marginBottom:'2px', textDecoration:'none', color:'var(--text-2)', fontSize:'14px', fontWeight:'500', whiteSpace:'nowrap', overflow:'hidden' },
    navItemActive:{ background:'rgba(59,130,246,0.15)', color:'var(--accent)', borderLeft:'2px solid var(--accent)' },
    navIcon:{ fontSize:'18px', flexShrink:0, width:'20px', textAlign:'center' },
    navLabel:{ opacity: collapsed ? 0 : 1, transition:'opacity 0.2s', overflow:'hidden' },
    bottom:{ padding:'12px 8px', borderTop:'1px solid var(--border)' },
    userCard:{ display:'flex', alignItems:'center', gap:'10px', padding:'10px', borderRadius:'10px', background:'var(--bg-2)', overflow:'hidden' },
    avatar:{ width:'34px', height:'34px', borderRadius:'50%', background:'linear-gradient(135deg, var(--accent), var(--accent-2))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'700', color:'#fff', flexShrink:0 },
    userName:{ fontSize:'13px', fontWeight:'600', color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', opacity: collapsed ? 0 : 1, transition:'opacity 0.2s' },
    userRole:{ fontSize:'11px', color:'var(--text-3)', textTransform:'capitalize', opacity: collapsed ? 0 : 1, transition:'opacity 0.2s' },
    main:{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 },
    topbar:{ height:'64px', background:'var(--card)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', gap:'16px', flexShrink:0 },
    pageTitle:{ fontFamily:'var(--font-display)', fontWeight:'700', fontSize:'18px', color:'var(--text)' },
    topRight:{ display:'flex', alignItems:'center', gap:'12px' },
    iconBtn:{ width:'38px', height:'38px', border:'1px solid var(--border)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', background:'var(--bg-2)', color:'var(--text-2)', fontSize:'18px', transition:'all 0.2s', position:'relative', flexShrink:0 },
    badge:{ position:'absolute', top:'-4px', right:'-4px', width:'16px', height:'16px', background:'var(--red)', borderRadius:'50%', fontSize:'9px', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700' },
    notifPanel:{ position:'absolute', top:'48px', right:'0', width:'320px', background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', boxShadow:'var(--shadow-lg)', zIndex:200, animation:'fadeIn 0.2s ease' },
    notifHeader:{ padding:'14px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' },
    notifTitle:{ fontFamily:'var(--font-display)', fontWeight:'700', fontSize:'14px', color:'var(--text)' },
    notifItem:{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', gap:'10px', cursor:'pointer', transition:'background 0.2s' },
    notifIcon:{ fontSize:'20px', flexShrink:0 },
    notifMsg:{ fontSize:'12px', color:'var(--text-2)', lineHeight:'1.4' },
    notifTime:{ fontSize:'11px', color:'var(--text-3)', marginTop:'3px' },
    content:{ flex:1, overflow:'auto', padding:'24px' },
    collapseBtn:{ width:'28px', height:'28px', background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-2)', fontSize:'14px', marginLeft:'auto', flexShrink:0 },
  };

  const getInitials = (name) => name ? name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : 'U';

  return ( 
    <div style={s.wrap}>
      <div style={s.overlay} onClick={()=>setMobileOpen(false)} />
      <div style={s.sidebar}>
        <div style={s.logo}>
          <div style={s.logoIcon}></div>
          <span style={s.logoText}>EduTrack SMS</span>
          {!mobile && (
            <div style={s.collapseBtn} onClick={()=>setCollapsed(!collapsed)}>
              {collapsed ? '›' : '‹'}
            </div>
          )}
        </div>
        <nav style={s.nav}>
          {navItems.map(item => {
            const active = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link key={item.path} to={item.path} style={{...s.navItem, ...(active?s.navItemActive:{})}}
                onClick={()=>mobile&&setMobileOpen(false)}
                onMouseEnter={e=>{ if(!active){ e.currentTarget.style.background='var(--bg-2)'; e.currentTarget.style.color='var(--text)'; } }}
                onMouseLeave={e=>{ if(!active){ e.currentTarget.style.background=''; e.currentTarget.style.color='var(--text-2)'; } }}>
                <span style={s.navIcon}>{item.icon}</span>
                <span style={s.navLabel}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div style={s.bottom}>
          <div style={s.userCard}>
            <div style={s.avatar}>{getInitials(user?.name)}</div>
            <div style={{overflow:'hidden', flex:1}}>
              <div style={s.userName}>{user?.name}</div>
              <div style={s.userRole}>{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{...s.navItem, width:'100%', marginTop:'6px', border:'none', justifyContent:'center', color:'var(--red)', background:'rgba(239,68,68,0.08)'}}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.15)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(239,68,68,0.08)'}}>
            <span style={s.navIcon}>🚪</span>
            <span style={s.navLabel}>Logout</span>
          </button>
        </div>
      </div>

      <div style={s.main}>
        <div style={s.topbar}>
          {mobile && (
            <button style={{...s.iconBtn, marginRight:'8px'}} onClick={()=>setMobileOpen(!mobileOpen)}>☰</button>
          )}
          <div style={s.pageTitle}>{title}</div>
          <div style={s.topRight}>
            <div style={{...s.iconBtn, position:'relative'}} onClick={()=>setShowNotif(!showNotif)}>
              🔔
              {unread > 0 && <span style={s.badge}>{unread}</span>}
              {showNotif && (
                <div style={s.notifPanel}>
                  <div style={s.notifHeader}>
                    <span style={s.notifTitle}>Notifications</span>
                    {unread > 0 && <button onClick={markAllRead} style={{fontSize:'11px', color:'var(--accent)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font-body)'}}>Mark all read</button>}
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{padding:'24px', textAlign:'center', color:'var(--text-3)', fontSize:'13px'}}>No notifications yet</div>
                  ) : notifications.map(n => (
                    <div key={n._id} style={{...s.notifItem, background: n.isRead ? '' : 'rgba(59,130,246,0.05)'}}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--bg-2)'}
                      onMouseLeave={e=>e.currentTarget.style.background=n.isRead?'':'rgba(59,130,246,0.05)'}>
                      <span style={s.notifIcon}>{n.icon}</span>
                      <div>
                        <div style={{fontSize:'13px', fontWeight:'600', color:'var(--text)', marginBottom:'2px'}}>{n.title}</div>
                        <div style={s.notifMsg}>{n.message}</div>
                        <div style={s.notifTime}>{new Date(n.createdAt).toLocaleDateString('en-IN')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{...s.iconBtn, background:'var(--bg-2)', fontSize:'13px', fontWeight:'700', fontFamily:'var(--font-display)', color:'var(--text)', width:'auto', padding:'0 12px', gap:'6px'}}>
              <span>{user?.role === 'admin' ? '👨‍💼' : '👨‍🎓'}</span>
              <span style={{whiteSpace:'nowrap'}}>{user?.name?.split(' ')[0]}</span>
            </div>
          </div>
        </div>
        <div style={s.content}>{children}</div>
      </div>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────
export function StatCard({ icon, label, value, sub, color='var(--accent)', trend, delay=0 }) {
  const s = {
    card:{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'20px', transition:'all 0.25s', cursor:'default', animation:'fadeIn 0.4s ease both', animationDelay:`${delay}s`, position:'relative', overflow:'hidden' },
    topLine:{ position:'absolute', top:0, left:0, right:0, height:'3px', background:color, borderRadius:'3px 3px 0 0' },
    icon:{ fontSize:'28px', marginBottom:'12px' },
    value:{ fontFamily:'var(--font-display)', fontSize:'30px', fontWeight:'800', color:'var(--text)', marginBottom:'4px', animation:'countUp 0.6s cubic-bezier(0.34,1.56,0.64,1) both', animationDelay:`${delay+0.1}s` },
    label:{ fontSize:'13px', color:'var(--text-3)', fontWeight:'500', marginBottom:'6px' },
    sub:{ fontSize:'12px', color:'var(--text-3)' },
    trend:{ fontSize:'12px', fontWeight:'600', display:'inline-flex', alignItems:'center', gap:'3px', padding:'2px 8px', borderRadius:'20px', background: trend > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: trend > 0 ? 'var(--green)' : 'var(--red)' },
  };
  return (
    <div style={s.card}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 8px 30px rgba(0,0,0,0.3)`;e.currentTarget.style.borderColor=color}}
      onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';e.currentTarget.style.borderColor='var(--border)'}}>
      <div style={s.topLine} />
      <div style={s.icon}>{icon}</div>
      <div style={s.value}>{value}</div>
      <div style={s.label}>{label}</div>
      {sub && <div style={s.sub}>{sub}</div>}
      {trend !== undefined && (
        <div style={{marginTop:'8px'}}>
          <span style={s.trend}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  );
}

// ── Progress Bar ─────────────────────────────────────────────────────────
export function ProgressBar({ value, max=100, color='var(--accent)', showLabel=true, height=8, animated=true }) {
  const pct = Math.min(100, Math.round((value/max)*100));
  const barColor = pct >= 75 ? 'var(--green)' : pct >= 50 ? 'var(--yellow)' : 'var(--red)';
  return (
    <div>
      {showLabel && <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', color:'var(--text-2)', marginBottom:'5px'}}>
        <span>{value}/{max}</span>
        <span style={{fontWeight:'700', color: color === 'auto' ? barColor : color}}>{pct}%</span>
      </div>}
      <div style={{height:`${height}px`, background:'var(--bg-2)', borderRadius:`${height}px`, overflow:'hidden'}}>
        <div style={{height:'100%', width:`${pct}%`, background: color === 'auto' ? barColor : color, borderRadius:`${height}px`, transition: animated ? 'width 1s cubic-bezier(0.4,0,0.2,1)' : 'none', position:'relative'}} />
      </div>
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────────
export function Badge({ text, color='var(--accent)', bg }) {
  const colors = { paid:'var(--green)', unpaid:'var(--red)', partial:'var(--yellow)', present:'var(--green)', absent:'var(--red)', good:'var(--green)', warning:'var(--yellow)', critical:'var(--red)' };
  const c = colors[text?.toLowerCase?.()] || color;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'600', background: bg || `${c}22`, color:c, textTransform:'capitalize', whiteSpace:'nowrap' }}>
      {text}
    </span>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width=560 }) {
  if (!open) return null;
  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', backdropFilter:'blur(4px)'}}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', width:'100%', maxWidth:`${width}px`, maxHeight:'90vh', overflow:'auto', boxShadow:'var(--shadow-lg)', animation:'fadeIn 0.25s ease'}}>
        <div style={{padding:'20px 24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'var(--card)', zIndex:1}}>
          <h3 style={{fontFamily:'var(--font-display)', fontWeight:'700', fontSize:'18px', color:'var(--text)', margin:0}}>{title}</h3>
          <button onClick={onClose} style={{width:'32px', height:'32px', border:'1px solid var(--border)', borderRadius:'8px', background:'var(--bg-2)', color:'var(--text-2)', cursor:'pointer', fontSize:'18px', display:'flex', alignItems:'center', justifyContent:'center'}}>×</button>
        </div>
        <div style={{padding:'24px'}}>{children}</div>
      </div>
    </div>
  );
}

// ── Form Input ─────────────────────────────────────────────────────────────
export function FormInput({ label, type='text', value, onChange, placeholder, required, options, rows }) {
  const s = {
    wrap:{ marginBottom:'14px' },
    label:{ display:'block', fontSize:'12px', fontWeight:'600', color:'var(--text-2)', marginBottom:'6px', letterSpacing:'0.05em', textTransform:'uppercase' },
    input:{ width:'100%', padding:'11px 14px', background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'10px', color:'var(--text)', fontSize:'14px', outline:'none', boxSizing:'border-box', fontFamily:'var(--font-body)', resize:'vertical' },
    req:{ color:'var(--red)', marginLeft:'2px' },
  };
  const focusFn = e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--accent-glow)'; };
  const blurFn = e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; };

  return (
    <div style={s.wrap}>
      <label style={s.label}>{label}{required && <span style={s.req}>*</span>}</label>
      {options ? (
        <select style={s.input} value={value} onChange={e=>onChange(e.target.value)} onFocus={focusFn} onBlur={blurFn}>
          {options.map(o => <option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
        </select>
      ) : rows ? (
        <textarea style={s.input} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} onFocus={focusFn} onBlur={blurFn} />
      ) : (
        <input style={s.input} type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} onFocus={focusFn} onBlur={blurFn} />
      )}
    </div>
  );
}

// ── Loading Spinner ────────────────────────────────────────────────────────
export function Spinner({ size=40 }) {
  return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px', gap:'16px'}}>
      <div style={{width:`${size}px`, height:`${size}px`, border:`3px solid var(--border)`, borderTop:`3px solid var(--accent)`, borderRadius:'50%', animation:'spin 0.8s linear infinite'}} />
      <div style={{color:'var(--text-3)', fontSize:'13px'}}>Loading...</div>
    </div>
  );
}
