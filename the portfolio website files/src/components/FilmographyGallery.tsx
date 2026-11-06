import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { sfx } from "../audio/SoundEngine";
import { FILM_STILLS, type FilmStill } from "../data/filmStills";
import AudioToggle from "./AudioToggle";

const WORKS: FilmStill[] = FILM_STILLS;


const N = WORKS.length;
const CARD_W = 155, CARD_H = 210, PERSPECTIVE = 1000;
const RX_BASE = 520, RY_BASE = 300, RZ_BASE = 400;
const RING_R = 380, FORM_DUR = 0.50, SPIN_DUR = 0.55, RING_TOTAL = FORM_DUR + SPIN_DUR;
const IDLE_H = 0.006, CURSOR_H = 0.12, CURSOR_V = 0.07;
const DRAG_MULT = 0.90, FRICTION = 0.84, MIN_SPEED = 0.004;

function buildSpherePositions(n: number, RX: number, RY: number, RZ: number) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = golden * i;
    return { x: Math.cos(a) * r * RX, y: y * RY, z: Math.sin(a) * r * RZ };
  });
}

const easeOut3  = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2;

export default function FilmographyGallery({ onClose }: { onClose: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const detailImgRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const catRef = useRef<HTMLSpanElement>(null);
  const yearRef = useRef<HTMLSpanElement>(null);
  const noteRef = useRef<HTMLParagraphElement>(null);
  const cntRef = useRef<HTMLSpanElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const ringActive = useRef(false);
  const ringStart = useRef(0);
  const ringIdx = useRef(-1);
  const snapX = useRef(new Float32Array(N));
  const snapY = useRef(new Float32Array(N));
  const snapZ = useRef(new Float32Array(N));

  const S = useRef({
    thetaH:0, thetaV:0, velH:0, velV:0,
    curNX:0, curNY:0, curPX:0, curPY:0, ringX:0, ringY:0,
    dragging:false, lastX:0, lastY:0, dragVX:0, dragVY:0,
    holding:false, holdTimer:0 as unknown as ReturnType<typeof setTimeout>,
    cursorMode:"default" as "default"|"hover"|"drag"|"scroll",
    detailOpen:false, detailIdx:-1, hoverIdx:-1, rafId:0,
    cards:[] as HTMLDivElement[],
    curX:new Float32Array(N), curY:new Float32Array(N), curZ:new Float32Array(N),
    tgtX:new Float32Array(N), tgtY:new Float32Array(N), tgtZ:new Float32Array(N),
  });

  const populateDetail = useCallback((idx: number) => {
    const w = WORKS[idx];
    if (detailImgRef.current) { detailImgRef.current.src=w.url; detailImgRef.current.alt=w.title; }
    if (titleRef.current) titleRef.current.textContent=w.title;
    if (catRef.current) catRef.current.textContent=w.film;
    if (yearRef.current) yearRef.current.textContent=w.year;
    if (noteRef.current) noteRef.current.textContent=w.note;
    if (cntRef.current) cntRef.current.textContent=`${String(idx+1).padStart(2,"0")} / ${String(N).padStart(2,"0")}`;
    if (prevRef.current) prevRef.current.disabled=idx===0;
    if (nextRef.current) nextRef.current.disabled=idx===N-1;
  }, []);

  const openDetail = useCallback((idx: number) => {
    const s=S.current; s.detailOpen=true; s.detailIdx=idx;
    populateDetail(idx);
    detailRef.current?.classList.add("fg-open");
    detailRef.current?.focus();
  }, [populateDetail]);

  const closeDetail = useCallback(() => {
    S.current.detailOpen=false; S.current.detailIdx=-1;
    detailRef.current?.classList.remove("fg-open");
  }, []);

  useEffect(() => {
    const onKey=(e:KeyboardEvent)=>{
      const s=S.current;
      if(e.key==="Escape"){if(s.detailOpen)closeDetail();else onClose();return;}
      if(!s.detailOpen)return;
      if((e.key==="ArrowLeft"||e.key==="ArrowUp")&&s.detailIdx>0){s.detailIdx--;populateDetail(s.detailIdx);}
      if((e.key==="ArrowRight"||e.key==="ArrowDown")&&s.detailIdx<N-1){s.detailIdx++;populateDetail(s.detailIdx);}
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[closeDetail,onClose,populateDetail]);

  useEffect(()=>{
    const s=S.current,wrap=wrapRef.current,scene=sceneRef.current,dot=dotRef.current,ring=ringRef.current;
    if(!wrap||!scene)return;
    const vw=window.innerWidth,vh=window.innerHeight;
    const RX=Math.min(RX_BASE,vw*0.44),RY=Math.min(RY_BASE,vh*0.30),RZ=Math.min(RZ_BASE,vw*0.32);
    const spherePts=buildSpherePositions(N,RX,RY,RZ);
    spherePts.forEach((p,i)=>{s.tgtX[i]=p.x;s.tgtY[i]=p.y;s.tgtZ[i]=p.z;s.curX[i]=p.x;s.curY[i]=p.y;s.curZ[i]=p.z-2800;});
    s.curPX=vw/2;s.curPY=vh/2;s.ringX=vw/2;s.ringY=vh/2;s.cards=[];

    WORKS.forEach((work,i)=>{
      const card=document.createElement("div");
      card.style.cssText=`position:absolute;width:${CARD_W}px;height:${CARD_H}px;left:50%;top:50%;margin-left:-${CARD_W/2}px;margin-top:-${CARD_H/2}px;will-change:transform;opacity:0;`;
      const face=document.createElement("div");
      face.style.cssText=`position:relative;width:100%;height:100%;overflow:hidden;border:1px solid rgba(238,243,250,0.07);box-shadow:0 12px 50px rgba(0,0,0,0.6),0 2px 12px rgba(0,0,0,0.4);transition:border-color 0.4s;`;
      const img=document.createElement("img");
      img.src=work.url;img.alt=work.title;img.loading="lazy";img.draggable=false;
      img.style.cssText=`display:block;width:100%;height:100%;object-fit:cover;pointer-events:none;transition:filter 0.5s,transform 0.5s;transform:scale(1);`;
      const ret=document.createElement("div");
      ret.style.cssText="position:absolute;inset:0;opacity:0;transition:opacity 0.4s;pointer-events:none;";
      ret.innerHTML=`<span style="position:absolute;top:7px;left:7px;width:14px;height:14px;border-top:1.5px solid var(--accent);border-left:1.5px solid var(--accent);"></span><span style="position:absolute;top:7px;right:7px;width:14px;height:14px;border-top:1.5px solid var(--accent);border-right:1.5px solid var(--accent);"></span><span style="position:absolute;bottom:7px;left:7px;width:14px;height:14px;border-bottom:1.5px solid var(--accent);border-left:1.5px solid var(--accent);"></span><span style="position:absolute;bottom:7px;right:7px;width:14px;height:14px;border-bottom:1.5px solid var(--accent);border-right:1.5px solid var(--accent);"></span><span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:10px;height:10px;"><span style="position:absolute;width:1px;height:100%;left:50%;transform:translateX(-50%);background:rgba(61,159,255,0.7);"></span><span style="position:absolute;height:1px;width:100%;top:50%;transform:translateY(-50%);background:rgba(61,159,255,0.7);"></span></span>`;
      const cap=document.createElement("div");
      cap.style.cssText=`position:absolute;top:calc(100% + 9px);left:0;right:0;text-align:center;font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:0.22em;text-transform:uppercase;color:var(--accent-bright);opacity:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:opacity 0.4s;pointer-events:none;`;
      cap.textContent=`${String(i+1).padStart(2,"0")} · ${work.title} · ${work.film}`;
      face.appendChild(img);face.appendChild(ret);card.appendChild(face);card.appendChild(cap);
      scene.appendChild(card);s.cards.push(card);

      card.addEventListener("mouseenter",()=>{if(s.detailOpen||ringActive.current)return;s.hoverIdx=i;s.cursorMode="hover";face.style.borderColor="rgba(61,159,255,0.5)";ret.style.opacity="1";img.style.filter="saturate(0.14) contrast(1.08) brightness(1.06)";img.style.transform="scale(1.04)";cap.style.opacity="1";sfx.hover();});
      card.addEventListener("mouseleave",()=>{if(s.hoverIdx===i){s.hoverIdx=-1;s.cursorMode="default";}face.style.borderColor="rgba(238,243,250,0.07)";ret.style.opacity="0";img.style.filter="";img.style.transform="scale(1)";cap.style.opacity="0";});
      card.addEventListener("click",()=>{if(s.detailOpen||ringActive.current)return;sfx.click();for(let j=0;j<N;j++){snapX.current[j]=s.curX[j];snapY.current[j]=s.curY[j];snapZ.current[j]=s.curZ[j];}ringActive.current=true;ringStart.current=performance.now();ringIdx.current=i;});
    });

    function tick(){
      if(ringActive.current){
        const elapsed=(performance.now()-ringStart.current)/1000;
        const formT=Math.min(1,elapsed/FORM_DUR);
        const spinT=Math.max(0,elapsed-FORM_DUR)/SPIN_DUR;
        const spinClamp=Math.min(1,spinT);
        const spinAngle=easeInOut(spinClamp)*Math.PI*2;
        for(let i=0;i<N;i++){
          const baseAngle=(i/N)*Math.PI*2;const angle=baseAngle+spinAngle;
          const rX=Math.cos(angle)*RING_R,rY=0,rZ=Math.sin(angle)*RING_R;
          const fe=easeOut3(formT);
          const tx=snapX.current[i]+(rX-snapX.current[i])*fe;
          const ty=snapY.current[i]+(rY-snapY.current[i])*fe;
          const tz=snapZ.current[i]+(rZ-snapZ.current[i])*fe;
          const lk=spinT>0?1.0:Math.min(0.35,fe*0.4+0.05);
          s.curX[i]+=(tx-s.curX[i])*lk;s.curY[i]+=(ty-s.curY[i])*lk;s.curZ[i]+=(tz-s.curZ[i])*lk;
          const op=(0.42+Math.max(0,Math.min(1,(s.curZ[i]+400)/700))*0.50);
          s.cards[i].style.transform=`translate3d(${s.curX[i].toFixed(1)}px,${s.curY[i].toFixed(1)}px,${s.curZ[i].toFixed(1)}px) scale(1)`;
          s.cards[i].style.opacity=op.toFixed(3);s.cards[i].style.zIndex="50";
        }
        if(elapsed>=RING_TOTAL){ringActive.current=false;const idx=ringIdx.current;ringIdx.current=-1;openDetail(idx);sfx.open();}
        if(dot&&ring){dot.style.left=`${s.curPX}px`;dot.style.top=`${s.curPY}px`;s.ringX+=(s.curPX-s.ringX)*0.14;s.ringY+=(s.curPY-s.ringY)*0.14;ring.style.left=`${s.ringX}px`;ring.style.top=`${s.ringY}px`;}
        s.rafId=requestAnimationFrame(tick);return;
      }

      const tH=s.curNX*CURSOR_H+IDLE_H,tV=s.curNY*CURSOR_V;
      if(s.dragging){s.velH=s.dragVX*DRAG_MULT;s.velV=s.dragVY*DRAG_MULT;s.dragVX=0;s.dragVY=0;}
      else{s.velH=s.velH*FRICTION+tH*(1-FRICTION);s.velV=s.velV*FRICTION+tV*(1-FRICTION);}
      if(Math.abs(s.velH)<MIN_SPEED)s.velH=MIN_SPEED*(s.velH>=0?1:-1);
      s.thetaH+=s.velH;s.thetaV+=s.velV;
      const thH=(s.thetaH*Math.PI)/180,thV=(s.thetaV*Math.PI)/180;
      const cosH=Math.cos(thH),sinH=Math.sin(thH),cosV=Math.cos(thV),sinV=Math.sin(thV);

      s.cards.forEach((card,i)=>{
        s.curX[i]+=(s.tgtX[i]-s.curX[i])*0.05;s.curY[i]+=(s.tgtY[i]-s.curY[i])*0.05;s.curZ[i]+=(s.tgtZ[i]-s.curZ[i])*0.05;
        const lx=s.curX[i],ly=s.curY[i],lz=s.curZ[i];
        const rx1=lx*cosH-lz*sinH,ry1=ly,rz1=lx*sinH+lz*cosH;
        const rx2=rx1,ry2=ry1*cosV-rz1*sinV,rz2=ry1*sinV+rz1*cosV;
        const depthT=Math.max(0,Math.min(1,(rz2/Math.max(RZ,1)+1)/2));
        const scale=0.52+depthT*0.68,opacity=0.42+depthT*0.58;
        card.style.transform=`translate3d(${rx2.toFixed(1)}px,${ry2.toFixed(1)}px,${rz2.toFixed(1)}px) scale(${scale.toFixed(4)})`;
        card.style.opacity=opacity.toFixed(3);card.style.zIndex=String(Math.round(depthT*100));
        /* Still displayed exactly as supplied — no grading, no blur. */
      });

      if(dot&&ring){dot.style.left=`${s.curPX}px`;dot.style.top=`${s.curPY}px`;s.ringX+=(s.curPX-s.ringX)*0.14;s.ringY+=(s.curPY-s.ringY)*0.14;ring.style.left=`${s.ringX}px`;ring.style.top=`${s.ringY}px`;const mode=s.cursorMode;const sz=mode==="hover"?56:mode==="drag"?42:mode==="scroll"?36:28;ring.style.width=`${sz}px`;ring.style.height=`${sz}px`;ring.style.borderColor=mode==="hover"?"rgba(61,159,255,0.7)":mode==="drag"?"rgba(61,159,255,0.55)":"rgba(238,243,250,0.45)";ring.style.background=mode==="hover"?"rgba(61,159,255,0.08)":"transparent";}
      s.rafId=requestAnimationFrame(tick);
    }
    s.rafId=requestAnimationFrame(tick);

    const onMouseMove=(e:MouseEvent)=>{s.curPX=e.clientX;s.curPY=e.clientY;s.curNX=(e.clientX/window.innerWidth-0.5)*2;s.curNY=(e.clientY/window.innerHeight-0.5)*2;if(s.dragging){const dx=e.clientX-s.lastX,dy=e.clientY-s.lastY;s.lastX=e.clientX;s.lastY=e.clientY;s.dragVX+=dx;s.dragVY+=dy;}};
    const onMouseDown=(e:MouseEvent)=>{if(s.detailOpen||ringActive.current)return;s.dragging=true;s.lastX=e.clientX;s.lastY=e.clientY;s.dragVX=0;s.dragVY=0;s.cursorMode="drag";s.holdTimer=setTimeout(()=>{s.holding=true;},420);};
    const onMouseUp=()=>{if(!s.dragging)return;clearTimeout(s.holdTimer);s.holding=false;s.dragging=false;s.cursorMode=s.hoverIdx!==-1?"hover":"default";};
    const onWheel=(e:WheelEvent)=>{if(s.detailOpen)return;e.preventDefault();s.velH+=e.deltaX*0.005+e.deltaY*0.005;s.cursorMode="scroll";clearTimeout((onWheel as any)._t);(onWheel as any)._t=setTimeout(()=>{if(!s.dragging&&s.hoverIdx===-1)s.cursorMode="default";},400);};
    let tLX=0,tLY=0,tVX=0,tVY=0;
    const onTs=(e:TouchEvent)=>{if(s.detailOpen||ringActive.current)return;tLX=e.touches[0].clientX;tLY=e.touches[0].clientY;tVX=0;tVY=0;s.dragging=true;s.curNX=(tLX/window.innerWidth-0.5)*2;s.curNY=(tLY/window.innerHeight-0.5)*2;s.holdTimer=setTimeout(()=>{s.holding=true;},480);};
    const onTm=(e:TouchEvent)=>{if(!s.dragging||s.detailOpen)return;e.preventDefault();const dx=e.touches[0].clientX-tLX,dy=e.touches[0].clientY-tLY;tLX=e.touches[0].clientX;tLY=e.touches[0].clientY;tVX=dx;tVY=dy;s.curNX=(tLX/window.innerWidth-0.5)*2;s.curNY=(tLY/window.innerHeight-0.5)*2;s.dragVX+=dx;s.dragVY+=dy;};
    const onTe=()=>{clearTimeout(s.holdTimer);s.holding=false;s.dragging=false;s.velH=tVX*DRAG_MULT;s.velV=tVY*DRAG_MULT;};

    window.addEventListener("mousemove",onMouseMove,{passive:true});
    window.addEventListener("mousedown",onMouseDown);
    window.addEventListener("mouseup",onMouseUp);
    wrap.addEventListener("wheel",onWheel,{passive:false});
    wrap.addEventListener("touchstart",onTs,{passive:true});
    wrap.addEventListener("touchmove",onTm,{passive:false});
    wrap.addEventListener("touchend",onTe);

    return()=>{cancelAnimationFrame(s.rafId);clearTimeout(s.holdTimer);window.removeEventListener("mousemove",onMouseMove);window.removeEventListener("mousedown",onMouseDown);window.removeEventListener("mouseup",onMouseUp);wrap.removeEventListener("wheel",onWheel);wrap.removeEventListener("touchstart",onTs);wrap.removeEventListener("touchmove",onTm);wrap.removeEventListener("touchend",onTe);while(scene.firstChild)scene.removeChild(scene.firstChild);};
  },[openDetail]);

  const css=`.fg-wrap{user-select:none;-webkit-user-select:none;}.fg-dot{position:fixed;z-index:9999;pointer-events:none;width:5px;height:5px;border-radius:50%;background:var(--accent-bright);box-shadow:0 0 10px var(--accent-glow);transform:translate(-50%,-50%);transition:opacity 0.2s;}.fg-ring{position:fixed;z-index:9998;pointer-events:none;border-radius:50%;border:1px solid rgba(238,243,250,0.45);transform:translate(-50%,-50%);transition:width 0.3s cubic-bezier(0.16,1,0.3,1),height 0.3s cubic-bezier(0.16,1,0.3,1),border-color 0.3s,background 0.3s;width:28px;height:28px;}.fg-detail{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(5,7,9,0.92);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);opacity:0;pointer-events:none;transition:opacity 0.55s cubic-bezier(0.16,1,0.3,1);}.fg-detail.fg-open{opacity:1;pointer-events:auto;}.fg-inner{position:relative;width:min(92vw,640px);display:flex;flex-direction:column;align-items:center;gap:clamp(0.9rem,2vw,1.5rem);transform:translateY(20px);transition:transform 0.65s cubic-bezier(0.16,1,0.3,1);}.fg-detail.fg-open .fg-inner{transform:translateY(0);}.fg-img-wrap{position:relative;width:100%;max-height:60vh;overflow:hidden;border:1px solid rgba(238,243,250,0.08);}.fg-img-wrap::before{content:"";position:absolute;top:8px;left:8px;z-index:2;width:16px;height:16px;pointer-events:none;border-top:1px solid rgba(61,159,255,0.6);border-left:1px solid rgba(61,159,255,0.6);}.fg-img-wrap::after{content:"";position:absolute;bottom:8px;right:8px;z-index:2;width:16px;height:16px;pointer-events:none;border-bottom:1px solid rgba(61,159,255,0.6);border-right:1px solid rgba(61,159,255,0.6);}.fg-det-img{display:block;width:100%;max-height:60vh;object-fit:contain;}.fg-det-btn{display:flex;align-items:center;gap:0.4rem;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:var(--muted);opacity:0.7;background:none;border:none;padding:0.5rem;transition:opacity 0.3s;}.fg-det-btn:hover{opacity:1;}.fg-det-btn:disabled{opacity:0.18;pointer-events:none;}.fg-root,.fg-root *{cursor:none !important;}`;

  return (
    <motion.div className="fg-root" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.65,ease:[0.16,1,0.3,1]}}
      style={{position:"fixed",inset:0,zIndex:200,background:"var(--bg)",overflow:"hidden"}}>
      <style>{css}</style>
      <div ref={dotRef} className="fg-dot" aria-hidden/>
      <div ref={ringRef} className="fg-ring" aria-hidden/>

      <div style={{position:"fixed",top:0,left:0,right:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"clamp(1.25rem,2.5vw,2rem) clamp(1.5rem,4vw,3.5rem)",pointerEvents:"none"}}>
        <button onClick={onClose} aria-label="Back to portfolio" style={{pointerEvents:"auto",display:"flex",alignItems:"center",gap:"0.55rem",fontFamily:"var(--font-mono)",fontSize:10,letterSpacing:"0.28em",textTransform:"uppercase",color:"rgba(238,243,250,0.5)",background:"none",border:"none",transition:"color 0.3s"}} onMouseEnter={e=>(e.currentTarget.style.color="rgba(238,243,250,0.9)")} onMouseLeave={e=>(e.currentTarget.style.color="rgba(238,243,250,0.5)")}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><polyline points="8,2 4,6 8,10"/></svg>Portfolio
        </button>
        <span style={{fontFamily:"var(--font-display)",fontWeight:350,fontSize:"clamp(0.85rem,1.1vw,1rem)",letterSpacing:"-0.01em",color:"rgba(238,243,250,0.6)"}}>
          <em style={{fontStyle:"italic",color:"var(--accent)"}}>Filmography</em>
        </span>
        <div style={{pointerEvents:"auto",display:"flex",alignItems:"center"}}><AudioToggle/></div>
      </div>

      <div ref={wrapRef} className="fg-wrap" style={{position:"absolute",inset:0,zIndex:10,display:"flex",alignItems:"center",justifyContent:"center",perspective:`${PERSPECTIVE}px`,perspectiveOrigin:"50% 50%"}}>
        <div ref={sceneRef} style={{position:"relative",width:0,height:0,transformStyle:"preserve-3d"}}/>
      </div>

      <div style={{position:"fixed",bottom:"1.75rem",left:"50%",transform:"translateX(-50%)",zIndex:20,display:"flex",gap:"1rem",alignItems:"center",whiteSpace:"nowrap",pointerEvents:"none"}}>
        {["Move cursor to spin","·","Drag to steer","·","Click to open"].map((t,i)=>(<span key={i} style={{fontFamily:"var(--font-mono)",fontSize:8,letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(238,243,250,0.22)"}}>{t}</span>))}
      </div>

      <div ref={detailRef} className="fg-detail" role="dialog" aria-modal="true" aria-label="Project detail" tabIndex={-1} onClick={e=>{if(e.target===detailRef.current)closeDetail();}}>
        <div className="fg-inner">
          <button onClick={closeDetail} aria-label="Close" style={{position:"absolute",top:"-2.5rem",right:0,display:"flex",alignItems:"center",gap:"0.4rem",fontFamily:"var(--font-mono)",fontSize:10,letterSpacing:"0.24em",textTransform:"uppercase",color:"var(--muted)",opacity:0.7,background:"none",border:"none",transition:"opacity 0.3s"}} onMouseEnter={e=>(e.currentTarget.style.opacity="1")} onMouseLeave={e=>(e.currentTarget.style.opacity="0.7")}>
            Close<svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><line x1="1" y1="1" x2="10" y2="10"/><line x1="10" y1="1" x2="1" y2="10"/></svg>
          </button>
          <div className="fg-img-wrap"><img ref={detailImgRef} className="fg-det-img" src="" alt="" loading="lazy"/></div>
          <div style={{width:"100%",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:"1rem",flexWrap:"wrap"}}>
            <h2 ref={titleRef} style={{fontFamily:"var(--font-display)",fontWeight:350,fontStyle:"italic",fontSize:"clamp(1.2rem,3vw,2.1rem)",lineHeight:1,letterSpacing:"-0.03em",color:"var(--ink)"}}/>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"0.25rem",flexShrink:0}}>
              <span ref={catRef} style={{fontFamily:"var(--font-mono)",fontSize:9,letterSpacing:"0.24em",textTransform:"uppercase",color:"var(--muted)"}}/>
              <span ref={yearRef} style={{fontFamily:"var(--font-mono)",fontSize:9,letterSpacing:"0.24em",textTransform:"uppercase",color:"var(--accent)",opacity:0.85}}/>
            </div>
          </div>
          <p ref={noteRef} style={{width:"100%",fontFamily:"var(--font-sans)",fontWeight:300,fontSize:"clamp(0.83rem,1.1vw,0.93rem)",lineHeight:1.72,color:"var(--ink-dim)",borderTop:"1px solid rgba(238,243,250,0.08)",paddingTop:"0.9rem"}}/>
          <div style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <button ref={prevRef} className="fg-det-btn" aria-label="Previous" onClick={()=>{const s=S.current;if(s.detailIdx>0){s.detailIdx--;populateDetail(s.detailIdx);}}}><svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><polyline points="8,2 4,6.5 8,11"/></svg>Prev</button>
            <span ref={cntRef} style={{fontFamily:"var(--font-mono)",fontSize:9,letterSpacing:"0.22em",textTransform:"uppercase",color:"var(--muted)",opacity:0.5}}/>
            <button ref={nextRef} className="fg-det-btn" aria-label="Next" onClick={()=>{const s=S.current;if(s.detailIdx<N-1){s.detailIdx++;populateDetail(s.detailIdx);}}}> Next<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden><polyline points="5,2 9,6.5 5,11"/></svg></button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
