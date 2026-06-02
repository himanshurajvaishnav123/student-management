import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--bg)", padding:"20px", textAlign:"center" }}>
      <div style={{ fontFamily:"var(--font-display)", fontSize:"120px", fontWeight:"800", background:"linear-gradient(135deg, var(--accent), var(--accent-2))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", lineHeight:1, marginBottom:"16px" }}>404</div>
      <div style={{ fontFamily:"var(--font-display)", fontSize:"24px", fontWeight:"700", color:"var(--text)", marginBottom:"8px" }}>Page Not Found</div>
      <div style={{ color:"var(--text-3)", fontSize:"15px", marginBottom:"32px" }}>The page you are looking for does not exist.</div>
      <Link to="/" style={{ padding:"12px 28px", background:"var(--accent)", color:"#fff", borderRadius:"10px", fontFamily:"var(--font-display)", fontWeight:"700", fontSize:"15px", textDecoration:"none" }}>Go Home</Link>
    </div>
  );
}
