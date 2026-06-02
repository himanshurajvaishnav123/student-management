import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout, Badge, ProgressBar, Modal, FormInput, Spinner } from "../components/Common/Layout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import api from "../utils/api";
import toast from "react-hot-toast";

const NAV = [
  { path:"/admin", icon:"🏠", label:"Dashboard" },
  { path:"/admin/students", icon:"👨‍🎓", label:"Students" },
];

const gradeColor = g => ({ "A+":"var(--green)","A":"var(--green)","B+":"var(--accent)","B":"var(--accent)","C":"var(--yellow)","D":"var(--yellow)","F":"var(--red)","N/A":"var(--text-3)" }[g]||"var(--text-3)");

export default function AdminStudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [attForm, setAttForm] = useState({ status:"present", date:new Date().toISOString().split("T")[0], subject:"General" });
  const [marksForm, setMarksForm] = useState({ subject:"Mathematics", obtained:0, total:100 });
  const [feesForm, setFeesForm] = useState({ status:"paid", amount:0, dueDate:"" });
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState("overview");

  const load = () => {
    setLoading(true);
    api.get(`/admin/students/${id}`).then(res=>{ setStudent(res.data); setLoading(false); }).catch(()=>{ toast.error("Student not found"); navigate("/admin/students"); });
  };

  useEffect(()=>{ load(); }, [id]);

  const submit = async (endpoint, method, data, msg) => {
    setSubmitting(true);
    try {
      if (method==="post") await api.post(endpoint, data);
      else await api.put(endpoint, data);
      toast.success(msg);
      setModal(null); load();
    } catch(e) { toast.error(e.message||"Failed"); }
    setSubmitting(false);
  };

  if (loading) return <Layout navItems={NAV} title="Student Detail"><Spinner /></Layout>;
  if (!student) return null;

  const marksArr = Object.entries(student.marks||{});
  const barData = marksArr.map(([s,m])=>({ name:s.slice(0,5), marks:m.obtained, grade:m.grade }));
  const attPct = student.attendance?.percentage || 0;
  const attColor = attPct>=75?"var(--green)":attPct>=50?"var(--yellow)":"var(--red)";

  const s = {
    backBtn:{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"8px 14px", background:"var(--card)", border:"1px solid var(--border)", borderRadius:"8px", color:"var(--text-2)", cursor:"pointer", fontSize:"13px", fontWeight:"600", fontFamily:"var(--font-body)", marginBottom:"20px", transition:"all 0.2s" },
    profileCard:{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"24px", marginBottom:"20px", display:"flex", alignItems:"flex-start", gap:"20px", flexWrap:"wrap" },
    avatar:{ width:"72px", height:"72px", borderRadius:"18px", background:"linear-gradient(135deg, var(--accent), var(--accent-2))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px", fontWeight:"800", color:"#fff", flexShrink:0, boxShadow:"0 0 25px var(--accent-glow)", fontFamily:"var(--font-display)" },
    name:{ fontFamily:"var(--font-display)", fontWeight:"800", fontSize:"22px", color:"var(--text)", marginBottom:"4px" },
    sub:{ color:"var(--text-3)", fontSize:"13px", marginBottom:"10px" },
    chips:{ display:"flex", flexWrap:"wrap", gap:"8px", marginBottom:"10px" },
    chip:{ padding:"4px 12px", borderRadius:"20px", fontSize:"12px", fontWeight:"600", background:"var(--bg-2)", border:"1px solid var(--border)", color:"var(--text-2)" },
    actions:{ display:"flex", flexWrap:"wrap", gap:"8px", marginLeft:"auto" },
    actBtn:{ padding:"9px 16px", border:"1px solid var(--border)", borderRadius:"9px", background:"var(--bg-2)", color:"var(--text-2)", cursor:"pointer", fontSize:"13px", fontWeight:"600", fontFamily:"var(--font-body)", transition:"all 0.2s" },
    tabs:{ display:"flex", gap:"4px", background:"var(--card)", border:"1px solid var(--border)", borderRadius:"10px", padding:"4px", marginBottom:"20px", flexWrap:"wrap" },
    tab:{ padding:"8px 16px", borderRadius:"8px", border:"none", cursor:"pointer", fontFamily:"var(--font-display)", fontWeight:"600", fontSize:"13px", transition:"all 0.2s" },
    section:{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"22px", marginBottom:"16px" },
    sTitle:{ fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"15px", color:"var(--text)", marginBottom:"14px" },
    grid2:{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))", gap:"14px" },
    infoRow:{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid var(--border)", fontSize:"13px", alignItems:"center" },
    markCard:{ background:"var(--bg-2)", border:"1px solid var(--border)", borderRadius:"10px", padding:"14px" },
    modalBtn:{ padding:"10px 22px", borderRadius:"10px", border:"none", fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"14px", cursor:"pointer", transition:"all 0.2s" },
  };

  const getInitials = name => name?.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase() || "S";

  return (
    <Layout navItems={NAV} title={`Student: ${student.name}`}>
      <button style={s.backBtn} onClick={()=>navigate("/admin/students")}
        onMouseEnter={e=>{e.target.style.borderColor="var(--accent)";e.target.style.color="var(--accent)"}}
        onMouseLeave={e=>{e.target.style.borderColor="var(--border)";e.target.style.color="var(--text-2)"}}>
        ← Back to Students
      </button>

      <div style={s.profileCard} className="animate-fade">
        <div style={s.avatar}>{getInitials(student.name)}</div>
        <div style={{flex:1, minWidth:"200px"}}>
          <div style={s.name}>{student.name}</div>
          <div style={s.sub}>{student.email}</div>
          <div style={s.chips}>
            <span style={s.chip}>📚 {student.course}</span>
            <span style={s.chip}>📋 Sem {student.semester}</span>
            <span style={s.chip}>🆔 {student.rollNumber||"N/A"}</span>
            <span style={s.chip}>📅 Enrolled {student.enrollmentYear}</span>
          </div>
          <div style={{display:"flex", gap:"10px", alignItems:"center"}}>
            <Badge text={student.fees?.status||"unpaid"} />
            <span style={{fontSize:"13px", fontWeight:"700", color:attColor}}>📅 {attPct}% Attendance</span>
          </div>
        </div>
        <div style={s.actions}>
          {[
            {label:"📅 Attendance", color:"var(--green)", fn:()=>setModal("att")},
            {label:"📊 Marks", color:"var(--purple)", fn:()=>setModal("marks")},
            {label:"💰 Fees", color:"var(--cyan)", fn:()=>setModal("fees")},
          ].map(({label,color,fn})=>(
            <button key={label} style={s.actBtn} onClick={fn}
              onMouseEnter={e=>{e.currentTarget.style.background=`${color}22`;e.currentTarget.style.color=color;e.currentTarget.style.borderColor=color}}
              onMouseLeave={e=>{e.currentTarget.style.background="var(--bg-2)";e.currentTarget.style.color="var(--text-2)";e.currentTarget.style.borderColor="var(--border)"}}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={s.tabs}>
        {[["overview","📋 Overview"],["marks","📈 Marks"],["attendance","📅 Attendance"],["info","👤 Info"]].map(([id,lbl])=>(
          <button key={id} style={{...s.tab, background:tab===id?"var(--accent)":"transparent", color:tab===id?"#fff":"var(--text-3)"}} onClick={()=>setTab(id)}>{lbl}</button>
        ))}
      </div>

      {tab==="overview" && (
        <div className="animate-fade">
          <div style={s.grid2}>
            <div style={s.section}>
              <div style={s.sTitle}>📅 Attendance</div>
              <div style={{textAlign:"center", marginBottom:"12px"}}>
                <div style={{fontFamily:"var(--font-display)", fontSize:"48px", fontWeight:"800", color:attColor, lineHeight:1}}>{attPct}%</div>
                <div style={{color:"var(--text-3)", fontSize:"13px", marginTop:"4px"}}>{student.attendance?.records?.length||0} total classes</div>
              </div>
              <ProgressBar value={attPct} max={100} color="auto" height={10} />
              <div style={{fontSize:"12px", color:attColor, fontWeight:"600", marginTop:"10px", textAlign:"center"}}>
                {attPct>=75 ? "✅ Good standing" : "⚠️ Below required 75%"}
              </div>
            </div>
            <div style={s.section}>
              <div style={s.sTitle}>💰 Fees</div>
              {[["Status", <Badge text={student.fees?.status||"unpaid"} />], ["Amount", student.fees?.amount ? `₹${student.fees.amount.toLocaleString("en-IN")}` : "Not set"], ["Semester", student.fees?.semester||"—"], ["Due Date", student.fees?.dueDate ? new Date(student.fees.dueDate).toLocaleDateString("en-IN") : "—"]].map(([k,v])=>(
                <div key={k} style={s.infoRow}><span style={{color:"var(--text-3)"}}>{k}</span><span style={{fontWeight:"600"}}>{v}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==="marks" && (
        <div className="animate-fade">
          <div style={s.section}>
            <div style={s.sTitle}>📊 Performance Chart</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{top:5,right:10,left:-20,bottom:5}}>
                <XAxis dataKey="name" tick={{fill:"var(--text-2)",fontSize:12}} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{fill:"var(--text-3)",fontSize:11}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:"8px",color:"var(--text)",fontSize:"12px"}} cursor={{fill:"rgba(255,255,255,0.03)"}} />
                <Bar dataKey="marks" radius={[6,6,0,0]}>
                  {barData.map((e,i)=><Cell key={i} fill={gradeColor(e.grade)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={s.grid2}>
            {marksArr.map(([subj,m])=>(
              <div key={subj} style={s.markCard}>
                <div style={{fontFamily:"var(--font-display)", fontWeight:"700", marginBottom:"6px"}}>{subj}</div>
                <div style={{fontSize:"24px", fontWeight:"800", fontFamily:"var(--font-display)", color:gradeColor(m.grade), marginBottom:"6px"}}>{m.obtained}<span style={{fontSize:"14px", color:"var(--text-3)"}}>/{m.total}</span></div>
                <span style={{display:"inline-block", padding:"2px 10px", borderRadius:"20px", fontSize:"11px", fontWeight:"700", background:`${gradeColor(m.grade)}22`, color:gradeColor(m.grade), marginBottom:"8px"}}>{m.grade}</span>
                <ProgressBar value={m.obtained} max={m.total} color={gradeColor(m.grade)} height={5} showLabel={false} />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="attendance" && (
        <div className="animate-fade">
          <div style={s.section}>
            <div style={s.sTitle}>📅 Attendance Records ({student.attendance?.records?.length||0} records)</div>
            {!student.attendance?.records?.length ? (
              <div style={{textAlign:"center", padding:"30px", color:"var(--text-3)"}}>No attendance records yet.</div>
            ) : (
              <div style={{display:"flex", flexWrap:"wrap", gap:"6px"}}>
                {[...student.attendance.records].reverse().map((r,i)=>(
                  <div key={i} title={`${new Date(r.date).toLocaleDateString("en-IN")} — ${r.status} (${r.subject})`}
                    style={{width:"40px", height:"40px", borderRadius:"8px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:"600", cursor:"default", background:r.status==="present"?"rgba(16,185,129,0.15)":"rgba(239,68,68,0.15)", color:r.status==="present"?"var(--green)":"var(--red)", border:`1px solid ${r.status==="present"?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.3)"}`}}>
                    <span>{new Date(r.date).getDate()}</span>
                    <span style={{fontSize:"9px"}}>{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][new Date(r.date).getMonth()]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab==="info" && (
        <div className="animate-fade">
          <div style={s.section}>
            <div style={s.sTitle}>👤 Student Information</div>
            {[["Name",student.name],["Email",student.email],["Roll No",student.rollNumber||"—"],["Course",student.course],["Semester",`Sem ${student.semester}`],["Gender",student.gender||"—"],["Phone",student.phone||"—"],["Address",student.address||"—"],["Enrollment Year",student.enrollmentYear],["Account Active",student.isActive?"Yes":"No"],["Joined",new Date(student.createdAt).toLocaleDateString("en-IN")]].map(([k,v])=>(
              <div key={k} style={s.infoRow}><span style={{color:"var(--text-3)"}}>{k}</span><span style={{fontWeight:"600", color:"var(--text)"}}>{v}</span></div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      <Modal open={modal==="att"} onClose={()=>setModal(null)} title="📅 Mark Attendance" width={400}>
        <FormInput label="Date" type="date" value={attForm.date} onChange={v=>setAttForm(p=>({...p,date:v}))} />
        <FormInput label="Subject" value={attForm.subject} onChange={v=>setAttForm(p=>({...p,subject:v}))} placeholder="Mathematics, General..." />
        <FormInput label="Status" value={attForm.status} onChange={v=>setAttForm(p=>({...p,status:v}))} options={[{value:"present",label:"✅ Present"},{value:"absent",label:"❌ Absent"}]} />
        <div style={{display:"flex", justifyContent:"flex-end", gap:"10px", marginTop:"8px"}}>
          <button style={{...s.modalBtn, background:"var(--bg-2)", color:"var(--text-2)", border:"1px solid var(--border)"}} onClick={()=>setModal(null)}>Cancel</button>
          <button style={{...s.modalBtn, background:attForm.status==="present"?"var(--green)":"var(--red)", color:"#fff"}} onClick={()=>submit(`/admin/students/${id}/attendance`,"post",attForm,`Marked ${attForm.status}`)} disabled={submitting}>
            {submitting?"Saving...":"Save"}
          </button>
        </div>
      </Modal>

      {/* Marks Modal */}
      <Modal open={modal==="marks"} onClose={()=>setModal(null)} title="📊 Update Marks" width={420}>
        <FormInput label="Subject" value={marksForm.subject} onChange={v=>setMarksForm(p=>({...p,subject:v}))} options={["Mathematics","Science","English","History","Computer","Physics","Chemistry","Biology","Economics","Commerce"].map(s=>({value:s,label:s}))} />
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px"}}>
          <FormInput label="Obtained" type="number" value={marksForm.obtained} onChange={v=>setMarksForm(p=>({...p,obtained:Number(v)}))} />
          <FormInput label="Total" type="number" value={marksForm.total} onChange={v=>setMarksForm(p=>({...p,total:Number(v)}))} />
        </div>
        <div style={{display:"flex", justifyContent:"flex-end", gap:"10px", marginTop:"8px"}}>
          <button style={{...s.modalBtn, background:"var(--bg-2)", color:"var(--text-2)", border:"1px solid var(--border)"}} onClick={()=>setModal(null)}>Cancel</button>
          <button style={{...s.modalBtn, background:"var(--purple)", color:"#fff"}} onClick={()=>submit(`/admin/students/${id}/marks`,"put",marksForm,"Marks updated!")} disabled={submitting}>
            {submitting?"Saving...":"Update"}
          </button>
        </div>
      </Modal>

      {/* Fees Modal */}
      <Modal open={modal==="fees"} onClose={()=>setModal(null)} title="💰 Update Fees" width={420}>
        <FormInput label="Status" value={feesForm.status} onChange={v=>setFeesForm(p=>({...p,status:v}))} options={[{value:"paid",label:"✅ Paid"},{value:"unpaid",label:"❌ Unpaid"},{value:"partial",label:"🔶 Partial"}]} />
        <FormInput label="Amount (₹)" type="number" value={feesForm.amount} onChange={v=>setFeesForm(p=>({...p,amount:Number(v)}))} />
        <FormInput label="Due Date" type="date" value={feesForm.dueDate} onChange={v=>setFeesForm(p=>({...p,dueDate:v}))} />
        <div style={{display:"flex", justifyContent:"flex-end", gap:"10px", marginTop:"8px"}}>
          <button style={{...s.modalBtn, background:"var(--bg-2)", color:"var(--text-2)", border:"1px solid var(--border)"}} onClick={()=>setModal(null)}>Cancel</button>
          <button style={{...s.modalBtn, background:"var(--cyan)", color:"#0a0e1a"}} onClick={()=>submit(`/admin/students/${id}/fees`,"put",feesForm,"Fees updated!")} disabled={submitting}>
            {submitting?"Saving...":"Update"}
          </button>
        </div>
      </Modal>
    </Layout>
  );
}
