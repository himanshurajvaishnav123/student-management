import React, { useEffect, useState } from "react";
import { Layout, StatCard, ProgressBar, Badge, Spinner } from "../components/Common/Layout";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from "recharts";
import api from "../utils/api";

const NAV = [
  { path:"/dashboard", icon:"🏠", label:"Dashboard" },
];

const gradeColor = g => ({ "A+":"var(--green)", "A":"var(--green)", "B+":"var(--accent)", "B":"var(--accent)", "C":"var(--yellow)", "D":"var(--yellow)", "F":"var(--red)", "N/A":"var(--text-3)" }[g] || "var(--text-3)");

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    api.get("/students/dashboard").then(res => { setData(res.data); setLoading(false); }).catch(()=>setLoading(false));
  }, []);

  if (loading) return <Layout navItems={NAV} title="My Dashboard"><Spinner /></Layout>;
  if (!data) return <Layout navItems={NAV} title="My Dashboard"><div style={{color:"var(--red)"}}>Failed to load dashboard.</div></Layout>;

  const { profile, attendance, marks, fees, avgMarks } = data;
  const marksArray = Object.entries(marks || {});
  const radarData = marksArray.map(([subj, m]) => ({ subject: subj.slice(0,4), score: m.obtained || 0, fullMark: 100 }));
  const barData = marksArray.map(([subj, m]) => ({ name: subj.slice(0,5), marks: m.obtained || 0, grade: m.grade }));

  const attColor = attendance.percentage >= 75 ? "var(--green)" : attendance.percentage >= 50 ? "var(--yellow)" : "var(--red)";
  const attPie = [
    { name:"Present", value: attendance.presentCount, fill:"var(--green)" },
    { name:"Absent", value: attendance.absentCount, fill:"var(--red)" },
  ];

  const s = {
    tabs:{ display:"flex", gap:"4px", background:"var(--card)", border:"1px solid var(--border)", borderRadius:"10px", padding:"4px", marginBottom:"24px", width:"fit-content" },
    tab:{ padding:"8px 18px", borderRadius:"8px", border:"none", cursor:"pointer", fontFamily:"var(--font-display)", fontWeight:"600", fontSize:"13px", transition:"all 0.2s" },
    section:{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"24px", marginBottom:"20px" },
    sectionTitle:{ fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"16px", color:"var(--text)", marginBottom:"16px", display:"flex", alignItems:"center", gap:"8px" },
    grid2:{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))", gap:"16px" },
    grid4:{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px,1fr))", gap:"14px" },
    infoRow:{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid var(--border)", fontSize:"14px" },
    infoLabel:{ color:"var(--text-3)", fontWeight:"500" },
    infoVal:{ color:"var(--text)", fontWeight:"600" },
    markCard:{ background:"var(--bg-2)", border:"1px solid var(--border)", borderRadius:"10px", padding:"16px", transition:"all 0.2s" },
    markSubj:{ fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"14px", color:"var(--text)", marginBottom:"8px" },
    markScore:{ fontSize:"24px", fontWeight:"800", fontFamily:"var(--font-display)", marginBottom:"4px" },
    gradeChip:{ display:"inline-block", padding:"3px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:"700", marginBottom:"10px" },
    attBig:{ textAlign:"center", padding:"20px" },
    attPct:{ fontFamily:"var(--font-display)", fontSize:"64px", fontWeight:"800", lineHeight:1 },
    attSub:{ color:"var(--text-3)", fontSize:"14px", marginTop:"8px" },
    feeCard:{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px", background:"var(--bg-2)", borderRadius:"10px", border:"1px solid var(--border)" },
    welcomeBanner:{ background:"linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.1))", border:"1px solid rgba(59,130,246,0.2)", borderRadius:"var(--radius)", padding:"20px 24px", marginBottom:"24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"12px" },
  };

  return (
    <Layout navItems={NAV} title="My Dashboard">
      <div style={s.welcomeBanner} className="animate-fade">
        <div>
          <div style={{fontFamily:"var(--font-display)", fontWeight:"800", fontSize:"22px", color:"var(--text)", marginBottom:"4px"}}>
            Welcome back, {profile.name.split(" ")[0]}! 👋
          </div>
          <div style={{color:"var(--text-2)", fontSize:"14px"}}>{profile.course} · Semester {profile.semester} · Roll No: {profile.rollNumber}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:"var(--font-display)", fontSize:"28px", fontWeight:"800", color: attColor}}>{attendance.percentage}%</div>
          <div style={{fontSize:"12px", color:"var(--text-3)"}}>Attendance</div>
        </div>
      </div>

      <div style={s.grid4} className="stagger">
        <StatCard icon="📊" label="Average Marks" value={`${avgMarks}%`} sub="Across all subjects" color="var(--accent)" delay={0.05} />
        <StatCard icon="📅" label="Attendance" value={`${attendance.percentage}%`} sub={`${attendance.presentCount}/${attendance.totalClasses} classes`} color={attColor} delay={0.1} />
        <StatCard icon="💰" label="Fees Status" value={fees.status.toUpperCase()} sub={fees.amount ? `₹${fees.amount.toLocaleString("en-IN")}` : "Not set"} color={fees.status==="paid"?"var(--green)":"var(--red)"} delay={0.15} />
        <StatCard icon="📚" label="Semester" value={`Sem ${profile.semester}`} sub={`Enrolled ${profile.enrollmentYear}`} color="var(--purple)" delay={0.2} />
      </div>

      <div style={{...s.tabs, marginTop:"24px"}}>
        {[["overview","📋 Overview"],["marks","📈 Marks"],["attendance","📅 Attendance"],["profile","👤 Profile"]].map(([id,label]) => (
          <button key={id} style={{...s.tab, background:tab===id?"var(--accent)":"transparent", color:tab===id?"#fff":"var(--text-3)", boxShadow:tab===id?"0 2px 10px var(--accent-glow)":""}}
            onClick={()=>setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="animate-fade">
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px,1fr))", gap:"20px"}}>
            <div style={s.section}>
              <div style={s.sectionTitle}>📊 Marks Overview</div>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{fill:"var(--text-3)", fontSize:12}} />
                  <Radar name="Marks" dataKey="score" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div style={s.section}>
              <div style={s.sectionTitle}>📅 Attendance Split</div>
              <div style={s.attBig}>
                <div style={{...s.attPct, color:attColor}}>{attendance.percentage}%</div>
                <div style={s.attSub}>{attendance.presentCount} present / {attendance.absentCount} absent</div>
                <div style={{marginTop:"16px"}}><ProgressBar value={attendance.percentage} max={100} color="auto" height={10} /></div>
                <div style={{marginTop:"12px", fontSize:"12px", color: attendance.percentage>=75?"var(--green)":"var(--red)", fontWeight:"600"}}>
                  {attendance.percentage >= 75 ? "✅ Good standing (≥75%)" : `⚠️ ${75-attendance.percentage}% more needed for minimum`}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={100}>
                <PieChart>
                  <Pie data={attPie} cx="50%" cy="50%" innerRadius={25} outerRadius={40} dataKey="value" paddingAngle={3}>
                    {attPie.map((e,i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{background:"var(--card)", border:"1px solid var(--border)", borderRadius:"8px", color:"var(--text)", fontSize:"12px"}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>💰 Fee Status</div>
            <div style={s.feeCard}>
              <div>
                <div style={{fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"16px", color:"var(--text)"}}>{fees.amount ? `₹${fees.amount.toLocaleString("en-IN")}` : "Amount not set"}</div>
                <div style={{fontSize:"13px", color:"var(--text-3)", marginTop:"2px"}}>Semester {fees.semester || profile.semester} Fees</div>
                {fees.dueDate && <div style={{fontSize:"12px", color:"var(--yellow)", marginTop:"4px"}}>Due: {new Date(fees.dueDate).toLocaleDateString("en-IN")}</div>}
              </div>
              <Badge text={fees.status} />
            </div>
          </div>
        </div>
      )}

      {tab === "marks" && (
        <div className="animate-fade">
          <div style={s.section}>
            <div style={s.sectionTitle}>📈 Subject-wise Performance</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{top:5,right:10,left:-20,bottom:5}}>
                <XAxis dataKey="name" tick={{fill:"var(--text-2)", fontSize:12}} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{fill:"var(--text-3)", fontSize:11}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill:"rgba(255,255,255,0.03)"}} contentStyle={{background:"var(--card)", border:"1px solid var(--border)", borderRadius:"8px", color:"var(--text)", fontSize:"12px"}} />
                <Bar dataKey="marks" radius={[6,6,0,0]}>
                  {barData.map((e,i) => <Cell key={i} fill={gradeColor(e.grade)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={s.grid2}>
            {marksArray.map(([subj, m]) => (
              <div key={subj} style={s.markCard}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent)";e.currentTarget.style.transform="translateY(-2px)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform=""}}>
                <div style={s.markSubj}>{subj}</div>
                <div style={{...s.markScore, color:gradeColor(m.grade)}}>{m.obtained}<span style={{fontSize:"16px", color:"var(--text-3)"}}>/{m.total}</span></div>
                <span style={{...s.gradeChip, background:`${gradeColor(m.grade)}22`, color:gradeColor(m.grade)}}>{m.grade}</span>
                <ProgressBar value={m.obtained} max={m.total} color={gradeColor(m.grade)} height={6} />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "attendance" && (
        <div className="animate-fade">
          <div style={s.section}>
            <div style={s.sectionTitle}>📅 Attendance History</div>
            {attendance.records.length === 0 ? (
              <div style={{textAlign:"center", padding:"40px", color:"var(--text-3)"}}>No attendance records yet.</div>
            ) : (
              <div style={{display:"flex", flexWrap:"wrap", gap:"8px"}}>
                {[...attendance.records].reverse().slice(0,60).map((r, i) => (
                  <div key={i} title={`${new Date(r.date).toLocaleDateString("en-IN")} - ${r.status}`}
                    style={{width:"36px", height:"36px", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:"600", background: r.status==="present" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", color: r.status==="present" ? "var(--green)" : "var(--red)", cursor:"default", border:`1px solid ${r.status==="present" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`}}>
                    {new Date(r.date).getDate()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "profile" && (
        <div className="animate-fade">
          <div style={s.section}>
            <div style={s.sectionTitle}>👤 Personal Information</div>
            {[
              ["Full Name", profile.name], ["Email", profile.email], ["Roll Number", profile.rollNumber],
              ["Course", profile.course], ["Semester", `Semester ${profile.semester}`],
              ["Enrollment Year", profile.enrollmentYear], ["Gender", profile.gender || "Not set"],
              ["Phone", profile.phone || "Not set"], ["Address", profile.address || "Not set"],
            ].map(([k,v]) => (
              <div key={k} style={s.infoRow}>
                <span style={s.infoLabel}>{k}</span>
                <span style={s.infoVal}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
