import { ImageResponse } from "next/og";
export const runtime = "edge";
export const alt = "Saifullah Suleman — Applied AI & Full-Stack Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() { return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"70px",background:"#08080a",color:"white",fontFamily:"sans-serif",backgroundImage:"linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px)",backgroundSize:"64px 64px"}}><div style={{display:"flex",fontSize:24,letterSpacing:4,color:"#b7ff3c"}}>SAIFULLAH SULEMAN / ENGINEERING</div><div style={{display:"flex",maxWidth:1000,fontSize:76,lineHeight:1.02,letterSpacing:-4,fontWeight:600}}>Applied AI & Full-Stack Engineer — Backend Focus</div><div style={{display:"flex",fontSize:24,color:"#a0a0a8"}}>RAG · LLM infrastructure · ML APIs · backend systems · product engineering</div></div>,size); }
