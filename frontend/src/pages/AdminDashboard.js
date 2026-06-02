import React, { useEffect, useState } from "react";
import { Layout, StatCard, Spinner } from "../components/Common/Layout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import api from "../utils/api";

const NAV = [
  { path:"/admin", icon:"🏠", label:"Dashboard" },
  { path:"/admin/students", icon:"👨‍🎓", label:"Students" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/dashboard").then(res => { setStats(res.data); setLoading(false); }).catch(()=>setLoading(false));
  }, []);

  if (loading) return <Layout navItems={NAV} title="Admin Dashboard"><Spinner /></Layout>;
  if (!stats) return <Layout navItems={NAV} title="Admin Dashboard"><div>Failed to load.</div></Layout>;

  const pieData = [
    { name:"Fees Paid", value: stats.feesPaid, fill:"var(--green)" },
    { name:"Fees Unpaid", value: stats.feesUnpaid, fill:"var(--red)" },
  ];

  const barData = (stats.courseWise || []).map(c => ({ name: c._id?.slice(0,8) || "Unknown", count: c.count }));
  const COLORS = ["var(--accent)","var(--accent-2)","var(--purple)","var(--cyan)","var(--green)","var(--yellow)"];

  const s = {
    grid4:{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px,1fr))", gap:"16px", marginBottom:"24px" },
    grid2:{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px,1fr))", gap:"20px", marginTop:"24px" },
    section:{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"24px" },
    sectionTitle:{ fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"16px", color:"var(--text)", marginBottom:"16px" },
    quickActions:{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px,1fr))", gap:"12px", marginTop:"24px" },
    action:{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"20px", display:"flex", flexDirection:"column", alignItems:"center", gap:"10px", cursor:"pointer", transition:"all 0.2s", textDecoration:"none" },
    actionIcon:{ fontSize:"28px" },
    actionLabel:{ fontFamily:"var(--font-display)", fontWeight:"600", fontSize:"13px", color:"var(--text)", textAlign:"center" },
  };

  return (
    <Layout navItems={NAV} title="Admin Dashboard">
      <div style={{background:"linear-gradient(135deg, rgba(59,130,246,0.12), rgba(99,102,241,0.08))", border:"1px solid rgba(59,130,246,0.2)", borderRadius:"var(--radius)", padding:"20px 24px", marginBottom:"24px"}} className="animate-fade">
        <div style={{fontFamily:"var(--font-display)", fontWeight:"800", fontSize:"22px", color:"var(--text)", marginBottom:"4px"}}>Admin Control Panel 👨‍💼</div>
        <div style={{color:"var(--text-2)", fontSize:"14px"}}>Manage students, attendance, marks, and fees from one place.</div>
      </div>

      <div style={s.grid4} className="stagger">
        <StatCard icon="👨‍🎓" label="Total Students" value={stats.totalStudents} color="var(--accent)" delay={0.05} />
        <StatCard icon="✅" label="Fees Paid" value={stats.feesPaid} color="var(--green)" delay={0.1} />
        <StatCard icon="❌" label="Fees Unpaid" value={stats.feesUnpaid} color="var(--red)" delay={0.15} />
        <StatCard icon="📅" label="Avg Attendance" value={`${stats.avgAttendance}%`} color="var(--purple)" delay={0.2} />
      </div>

      <div style={s.grid2} className="animate-fade">
        <div style={s.section}>
          <div style={s.sectionTitle}>📊 Students per Course</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{top:5,right:5,left:-20,bottom:5}}>
              <XAxis dataKey="name" tick={{fill:"var(--text-2)", fontSize:11}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:"var(--text-3)", fontSize:11}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{background:"var(--card)", border:"1px solid var(--border)", borderRadius:"8px", color:"var(--text)", fontSize:"12px"}} cursor={{fill:"rgba(255,255,255,0.03)"}} />
              <Bar dataKey="count" radius={[6,6,0,0]}>
                {barData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={s.section}>
          <div style={s.sectionTitle}>💰 Fee Collection Status</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {pieData.map((e,i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip contentStyle={{background:"var(--card)", border:"1px solid var(--border)", borderRadius:"8px", color:"var(--text)", fontSize:"12px"}} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{fontSize:"13px", color:"var(--text-2)"}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={s.quickActions} className="stagger">
        {[
          {icon:"➕", label:"Add Student", href:"/admin/students", action:"add"},
          {icon:"👥", label:"View All Students", href:"/admin/students"},
          {icon:"📅", label:"Mark Attendance", href:"/admin/students"},
          {icon:"📊", label:"Update Marks", href:"/admin/students"},
          {icon:"💰", label:"Manage Fees", href:"/admin/students"},
        ].map((a,i) => (
          <a key={i} href={a.href + (a.action?`?action=${a.action}`:"")} style={s.action}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent)";e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 25px rgba(0,0,0,0.3)"}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=""}}>
            <span style={s.actionIcon}>{a.icon}</span>
            <span style={s.actionLabel}>{a.label}</span>
          </a>
        ))}
      </div>
    </Layout>
  );
}
