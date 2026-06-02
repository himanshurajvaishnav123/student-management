import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout, Badge, Modal, FormInput, Spinner } from "../components/Common/Layout";
import api from "../utils/api";
import toast from "react-hot-toast";

const NAV = [
  { path:"/admin", icon:"🏠", label:"Dashboard" },
  { path:"/admin/students", icon:"👨‍🎓", label:"Students" },
];

const COURSES = ["B.Tech CSE","B.Tech ECE","B.Tech ME","BCA","MCA","MBA","B.Sc","M.Sc","B.Com","M.Com"];
const EMPTY_FORM = { name:"", email:"", password:"", course:"B.Tech CSE", phone:"", semester:1, gender:"", address:"", enrollmentYear: new Date().getFullYear() };

export default function AdminStudents() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [feesFilter, setFeesFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [modal, setModal] = useState(null); // "add" | "edit" | "delete" | "attendance" | "marks" | "fees"
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [attForm, setAttForm] = useState({ status:"present", date:"", subject:"General" });
  const [marksForm, setMarksForm] = useState({ subject:"Mathematics", obtained:0, total:100 });
  const [feesForm, setFeesForm] = useState({ status:"paid", amount:0, dueDate:"", semester:1 });
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit:15 });
      if (search) params.set("search", search);
      if (courseFilter) params.set("course", courseFilter);
      if (feesFilter) params.set("feesStatus", feesFilter);
      const res = await api.get(`/admin/students?${params}`);
      setStudents(res.data || []);
      setPagination(res.pagination || {});
    } catch(e) { toast.error("Failed to load students"); }
    setLoading(false);
  }, [page, search, courseFilter, feesFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);
  useEffect(() => { if (searchParams.get("action")==="add") { openModal("add"); } }, [searchParams]);

  const openModal = (type, student=null) => {
    setModal(type);
    setSelected(student);
    if (type === "edit" && student) setForm({ name:student.name, email:student.email, password:"", course:student.course, phone:student.phone||"", semester:student.semester, gender:student.gender||"", address:student.address||"", enrollmentYear:student.enrollmentYear });
    else if (type === "add") setForm(EMPTY_FORM);
    else if (type === "attendance") setAttForm({ status:"present", date:new Date().toISOString().split("T")[0], subject:"General" });
    else if (type === "marks") setMarksForm({ subject:"Mathematics", obtained:0, total:100 });
    else if (type === "fees" && student) setFeesForm({ status:student.fees?.status||"unpaid", amount:student.fees?.amount||0, dueDate:"", semester:student.semester });
  };

  const closeModal = () => { setModal(null); setSelected(null); };

  const handleAddEdit = async () => {
    setSubmitting(true);
    try {
      if (modal === "add") {
        await api.post("/admin/students", form);
        toast.success("Student added successfully!");
      } else {
        await api.put(`/admin/students/${selected._id}`, form);
        toast.success("Student updated!");
      }
      fetchStudents(); closeModal();
    } catch(e) { toast.error(e.message || "Operation failed"); }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/admin/students/${selected._id}`);
      toast.success("Student deleted.");
      fetchStudents(); closeModal();
    } catch(e) { toast.error(e.message || "Delete failed"); }
    setSubmitting(false);
  };

  const handleAttendance = async () => {
    setSubmitting(true);
    try {
      await api.post(`/admin/students/${selected._id}/attendance`, attForm);
      toast.success(`Attendance marked as ${attForm.status}`);
      fetchStudents(); closeModal();
    } catch(e) { toast.error(e.message || "Failed"); }
    setSubmitting(false);
  };

  const handleMarks = async () => {
    setSubmitting(true);
    try {
      await api.put(`/admin/students/${selected._id}/marks`, marksForm);
      toast.success("Marks updated!");
      fetchStudents(); closeModal();
    } catch(e) { toast.error(e.message || "Failed"); }
    setSubmitting(false);
  };

  const handleFees = async () => {
    setSubmitting(true);
    try {
      await api.put(`/admin/students/${selected._id}/fees`, feesForm);
      toast.success("Fees status updated!");
      fetchStudents(); closeModal();
    } catch(e) { toast.error(e.message || "Failed"); }
    setSubmitting(false);
  };

  const s = {
    toolbar:{ display:"flex", flexWrap:"wrap", gap:"10px", marginBottom:"20px", alignItems:"center" },
    searchInput:{ flex:1, minWidth:"180px", padding:"10px 14px", background:"var(--card)", border:"1px solid var(--border)", borderRadius:"10px", color:"var(--text)", fontSize:"14px", outline:"none", fontFamily:"var(--font-body)" },
    filterSelect:{ padding:"10px 12px", background:"var(--card)", border:"1px solid var(--border)", borderRadius:"10px", color:"var(--text)", fontSize:"13px", outline:"none", cursor:"pointer", fontFamily:"var(--font-body)" },
    addBtn:{ padding:"10px 18px", background:"var(--accent)", color:"#fff", border:"none", borderRadius:"10px", fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"14px", cursor:"pointer", display:"flex", alignItems:"center", gap:"6px", transition:"all 0.2s", whiteSpace:"nowrap" },
    table:{ width:"100%", borderCollapse:"collapse", fontSize:"14px" },
    th:{ padding:"12px 16px", textAlign:"left", fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"12px", color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.05em", borderBottom:"2px solid var(--border)", background:"var(--bg-2)", whiteSpace:"nowrap" },
    td:{ padding:"13px 16px", borderBottom:"1px solid var(--border)", color:"var(--text)", verticalAlign:"middle" },
    tr:{ transition:"background 0.15s", cursor:"pointer" },
    actionBtns:{ display:"flex", gap:"6px", flexWrap:"wrap" },
    iconBtn:{ padding:"6px 10px", border:"1px solid var(--border)", borderRadius:"7px", background:"var(--bg-2)", color:"var(--text-2)", cursor:"pointer", fontSize:"12px", fontFamily:"var(--font-body)", fontWeight:"600", transition:"all 0.15s", whiteSpace:"nowrap" },
    tableWrap:{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--radius)", overflow:"auto" },
    pagination:{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 20px", borderTop:"1px solid var(--border)", background:"var(--bg-2)", fontSize:"13px", color:"var(--text-2)", flexWrap:"wrap", gap:"10px" },
    pageBtn:{ padding:"6px 12px", border:"1px solid var(--border)", borderRadius:"8px", background:"var(--card)", color:"var(--text-2)", cursor:"pointer", fontSize:"13px", fontFamily:"var(--font-body)", transition:"all 0.15s" },
    formGrid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 16px" },
    modalBtn:{ padding:"11px 24px", borderRadius:"10px", border:"none", fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"14px", cursor:"pointer", transition:"all 0.2s" },
    emptyState:{ textAlign:"center", padding:"60px 20px", color:"var(--text-3)" },
  };

  const actionBtnHover = (e, color) => { e.currentTarget.style.background=`${color}22`; e.currentTarget.style.color=color; e.currentTarget.style.borderColor=color; };
  const actionBtnLeave = e => { e.currentTarget.style.background="var(--bg-2)"; e.currentTarget.style.color="var(--text-2)"; e.currentTarget.style.borderColor="var(--border)"; };

  return (
    <Layout navItems={NAV} title="Student Management">
      <div style={s.toolbar}>
        <input style={s.searchInput} placeholder="🔍  Search by name, email, roll no..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} onFocus={e=>e.target.style.borderColor="var(--accent)"} onBlur={e=>e.target.style.borderColor="var(--border)"} />
        <select style={s.filterSelect} value={courseFilter} onChange={e=>{setCourseFilter(e.target.value);setPage(1)}}>
          <option value="">All Courses</option>
          {COURSES.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
        <select style={s.filterSelect} value={feesFilter} onChange={e=>{setFeesFilter(e.target.value);setPage(1)}}>
          <option value="">All Fees</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
        </select>
        <button style={s.addBtn} onClick={()=>openModal("add")} onMouseEnter={e=>e.target.style.transform="translateY(-1px)"} onMouseLeave={e=>e.target.style.transform=""}>
          ➕ Add Student
        </button>
      </div>

      <div style={s.tableWrap} className="animate-fade">
        {loading ? <Spinner /> : (
          <table style={s.table}>
            <thead>
              <tr>
                {["Student","Roll No","Course","Sem","Attendance","Fees","Actions"].map(h => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={7} style={s.emptyState}>
                  <div style={{fontSize:"40px", marginBottom:"12px"}}>🎓</div>
                  <div>No students found</div>
                  {search && <div style={{fontSize:"12px", marginTop:"8px"}}>Try a different search query</div>}
                </td></tr>
              ) : students.map(st => (
                <tr key={st._id} style={s.tr}
                  onMouseEnter={e=>e.currentTarget.style.background="var(--bg-2)"}
                  onMouseLeave={e=>e.currentTarget.style.background=""}>
                  <td style={s.td}>
                    <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
                      <div style={{width:"34px", height:"34px", borderRadius:"50%", background:"linear-gradient(135deg, var(--accent), var(--accent-2))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:"700", color:"#fff", flexShrink:0}}>
                        {st.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{fontWeight:"600", color:"var(--text)"}}>{st.name}</div>
                        <div style={{fontSize:"12px", color:"var(--text-3)"}}>{st.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{...s.td, fontFamily:"var(--font-display)", fontSize:"12px", color:"var(--text-3)"}}>{st.rollNumber||"—"}</td>
                  <td style={s.td}>{st.course}</td>
                  <td style={{...s.td, textAlign:"center"}}>{st.semester}</td>
                  <td style={s.td}>
                    <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
                      <span style={{fontWeight:"700", color: st.attendance?.percentage>=75?"var(--green)":st.attendance?.percentage>=50?"var(--yellow)":"var(--red)"}}>
                        {st.attendance?.percentage||0}%
                      </span>
                    </div>
                  </td>
                  <td style={s.td}><Badge text={st.fees?.status||"unpaid"} /></td>
                  <td style={s.td}>
                    <div style={s.actionBtns}>
                      <button style={s.iconBtn} onClick={()=>navigate(`/admin/students/${st._id}`)} onMouseEnter={e=>actionBtnHover(e,"var(--accent)")} onMouseLeave={actionBtnLeave}>👁 View</button>
                      <button style={s.iconBtn} onClick={()=>openModal("edit",st)} onMouseEnter={e=>actionBtnHover(e,"var(--yellow)")} onMouseLeave={actionBtnLeave}>✏️ Edit</button>
                      <button style={s.iconBtn} onClick={()=>openModal("attendance",st)} onMouseEnter={e=>actionBtnHover(e,"var(--green)")} onMouseLeave={actionBtnLeave}>📅 Att.</button>
                      <button style={s.iconBtn} onClick={()=>openModal("marks",st)} onMouseEnter={e=>actionBtnHover(e,"var(--purple)")} onMouseLeave={actionBtnLeave}>📊 Marks</button>
                      <button style={s.iconBtn} onClick={()=>openModal("fees",st)} onMouseEnter={e=>actionBtnHover(e,"var(--cyan)")} onMouseLeave={actionBtnLeave}>💰 Fees</button>
                      <button style={s.iconBtn} onClick={()=>openModal("delete",st)} onMouseEnter={e=>actionBtnHover(e,"var(--red)")} onMouseLeave={actionBtnLeave}>🗑️ Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {pagination.pages > 1 && (
          <div style={s.pagination}>
            <span>Showing {students.length} of {pagination.total} students</span>
            <div style={{display:"flex", gap:"6px"}}>
              <button style={s.pageBtn} onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} onMouseEnter={e=>e.target.style.borderColor="var(--accent)"} onMouseLeave={e=>e.target.style.borderColor="var(--border)"}>← Prev</button>
              {Array.from({length:Math.min(5,pagination.pages)},(_,i)=>i+1).map(p=>(
                <button key={p} style={{...s.pageBtn, background:page===p?"var(--accent)":"var(--card)", color:page===p?"#fff":"var(--text-2)", borderColor:page===p?"var(--accent)":"var(--border)"}} onClick={()=>setPage(p)}>{p}</button>
              ))}
              <button style={s.pageBtn} onClick={()=>setPage(p=>Math.min(pagination.pages,p+1))} disabled={page===pagination.pages} onMouseEnter={e=>e.target.style.borderColor="var(--accent)"} onMouseLeave={e=>e.target.style.borderColor="var(--border)"}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal open={modal==="add"||modal==="edit"} onClose={closeModal} title={modal==="add"?"➕ Add New Student":"✏️ Edit Student"} width={600}>
        <div style={s.formGrid}>
          <FormInput label="Full Name" value={form.name} onChange={v=>setForm(p=>({...p,name:v}))} placeholder="John Doe" required />
          <FormInput label="Email" type="email" value={form.email} onChange={v=>setForm(p=>({...p,email:v}))} placeholder="john@example.com" required />
          <FormInput label={modal==="add"?"Password *":"New Password (leave blank)"} type="password" value={form.password} onChange={v=>setForm(p=>({...p,password:v}))} placeholder={modal==="add"?"Min 6 chars":"Leave blank to keep current"} />
          <FormInput label="Phone" value={form.phone} onChange={v=>setForm(p=>({...p,phone:v}))} placeholder="9876543210" />
          <FormInput label="Course" value={form.course} onChange={v=>setForm(p=>({...p,course:v}))} options={COURSES.map(c=>({value:c,label:c}))} required />
          <FormInput label="Semester" value={form.semester} onChange={v=>setForm(p=>({...p,semester:Number(v)}))} options={[1,2,3,4,5,6,7,8].map(n=>({value:n,label:`Semester ${n}`}))} />
          <FormInput label="Gender" value={form.gender} onChange={v=>setForm(p=>({...p,gender:v}))} options={[{value:"",label:"Select"},{value:"Male",label:"Male"},{value:"Female",label:"Female"},{value:"Other",label:"Other"}]} />
          <FormInput label="Enrollment Year" type="number" value={form.enrollmentYear} onChange={v=>setForm(p=>({...p,enrollmentYear:Number(v)}))} />
        </div>
        <FormInput label="Address" value={form.address} onChange={v=>setForm(p=>({...p,address:v}))} placeholder="Full address" rows={2} />
        <div style={{display:"flex", justifyContent:"flex-end", gap:"10px", marginTop:"8px"}}>
          <button style={{...s.modalBtn, background:"var(--bg-2)", color:"var(--text-2)", border:"1px solid var(--border)"}} onClick={closeModal}>Cancel</button>
          <button style={{...s.modalBtn, background:"var(--accent)", color:"#fff", opacity:submitting?0.7:1}} onClick={handleAddEdit} disabled={submitting}>
            {submitting ? "Saving..." : modal==="add" ? "✅ Create Student" : "💾 Save Changes"}
          </button>
        </div>
      </Modal>

      {/* DELETE MODAL */}
      <Modal open={modal==="delete"} onClose={closeModal} title="🗑️ Delete Student" width={420}>
        <div style={{textAlign:"center", padding:"16px 0"}}>
          <div style={{fontSize:"48px", marginBottom:"16px"}}>⚠️</div>
          <div style={{fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"18px", color:"var(--text)", marginBottom:"8px"}}>Delete {selected?.name}?</div>
          <div style={{color:"var(--text-3)", fontSize:"14px", marginBottom:"24px"}}>This action cannot be undone. All student data will be permanently removed.</div>
          <div style={{display:"flex", gap:"10px", justifyContent:"center"}}>
            <button style={{...s.modalBtn, background:"var(--bg-2)", color:"var(--text-2)", border:"1px solid var(--border)"}} onClick={closeModal}>Cancel</button>
            <button style={{...s.modalBtn, background:"var(--red)", color:"#fff", opacity:submitting?0.7:1}} onClick={handleDelete} disabled={submitting}>
              {submitting ? "Deleting..." : "🗑️ Yes, Delete"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ATTENDANCE MODAL */}
      <Modal open={modal==="attendance"} onClose={closeModal} title={`📅 Mark Attendance — ${selected?.name}`} width={400}>
        <FormInput label="Date" type="date" value={attForm.date} onChange={v=>setAttForm(p=>({...p,date:v}))} required />
        <FormInput label="Subject" value={attForm.subject} onChange={v=>setAttForm(p=>({...p,subject:v}))} placeholder="e.g. Mathematics, General" />
        <FormInput label="Status" value={attForm.status} onChange={v=>setAttForm(p=>({...p,status:v}))} options={[{value:"present",label:"✅ Present"},{value:"absent",label:"❌ Absent"}]} />
        <div style={{display:"flex", justifyContent:"flex-end", gap:"10px", marginTop:"8px"}}>
          <button style={{...s.modalBtn, background:"var(--bg-2)", color:"var(--text-2)", border:"1px solid var(--border)"}} onClick={closeModal}>Cancel</button>
          <button style={{...s.modalBtn, background: attForm.status==="present"?"var(--green)":"var(--red)", color:"#fff", opacity:submitting?0.7:1}} onClick={handleAttendance} disabled={submitting}>
            {submitting ? "Saving..." : `Mark as ${attForm.status}`}
          </button>
        </div>
      </Modal>

      {/* MARKS MODAL */}
      <Modal open={modal==="marks"} onClose={closeModal} title={`📊 Update Marks — ${selected?.name}`} width={420}>
        <FormInput label="Subject" value={marksForm.subject} onChange={v=>setMarksForm(p=>({...p,subject:v}))} options={["Mathematics","Science","English","History","Computer","Physics","Chemistry","Biology","Economics","Commerce"].map(s=>({value:s,label:s}))} />
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px"}}>
          <FormInput label="Obtained Marks" type="number" value={marksForm.obtained} onChange={v=>setMarksForm(p=>({...p,obtained:Number(v)}))} placeholder="0-100" />
          <FormInput label="Total Marks" type="number" value={marksForm.total} onChange={v=>setMarksForm(p=>({...p,total:Number(v)}))} placeholder="100" />
        </div>
        <div style={{display:"flex", justifyContent:"flex-end", gap:"10px", marginTop:"8px"}}>
          <button style={{...s.modalBtn, background:"var(--bg-2)", color:"var(--text-2)", border:"1px solid var(--border)"}} onClick={closeModal}>Cancel</button>
          <button style={{...s.modalBtn, background:"var(--purple)", color:"#fff", opacity:submitting?0.7:1}} onClick={handleMarks} disabled={submitting}>
            {submitting ? "Saving..." : "💾 Update Marks"}
          </button>
        </div>
      </Modal>

      {/* FEES MODAL */}
      <Modal open={modal==="fees"} onClose={closeModal} title={`💰 Update Fees — ${selected?.name}`} width={420}>
        <FormInput label="Fee Status" value={feesForm.status} onChange={v=>setFeesForm(p=>({...p,status:v}))} options={[{value:"paid",label:"✅ Paid"},{value:"unpaid",label:"❌ Unpaid"},{value:"partial",label:"🔶 Partial"}]} />
        <FormInput label="Amount (₹)" type="number" value={feesForm.amount} onChange={v=>setFeesForm(p=>({...p,amount:Number(v)}))} placeholder="e.g. 75000" />
        <FormInput label="Due Date" type="date" value={feesForm.dueDate} onChange={v=>setFeesForm(p=>({...p,dueDate:v}))} />
        <div style={{display:"flex", justifyContent:"flex-end", gap:"10px", marginTop:"8px"}}>
          <button style={{...s.modalBtn, background:"var(--bg-2)", color:"var(--text-2)", border:"1px solid var(--border)"}} onClick={closeModal}>Cancel</button>
          <button style={{...s.modalBtn, background:"var(--cyan)", color:"#0a0e1a", opacity:submitting?0.7:1}} onClick={handleFees} disabled={submitting}>
            {submitting ? "Saving..." : "💰 Update Fees"}
          </button>
        </div>
      </Modal>
    </Layout>
  );
}
