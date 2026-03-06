import { useState, useEffect, useRef, useCallback } from "react";

/* ════════════════════════════════════════════════════════════════
   PRICE GUARD — Background Monitoring + Notifications + i18n
   ════════════════════════════════════════════════════════════════ */

// ── TRANSLATIONS ─────────────────────────────────────────────────
const T = {
  pt: {
    appSub:"PROTEÇÃO CONTRA PREÇO DINÂMICO", tabAlerts:"🚨 Alertas", tabHow:"🔍 Como rastreiam", tabSettings:"⚙️ Config",
    highRisk:"alto risco", attention:"atenção", signals:"sinais", analyzing:"Analisando dispositivo…",
    rawData:"DADOS COLETADOS AGORA", hour:"Hora", battery:"Bateria", network:"Rede", platform:"Plataforma",
    language:"Idioma", resolution:"Resolução", footer:"PRICEGUARD · PROTEÇÃO AO CONSUMIDOR · 2025",
    notifTitle:"🛡️ PriceGuard", notifAllow:"Ativar Notificações", notifEnabled:"Notificações Ativas ✓",
    notifDenied:"Notificações Bloqueadas", notifHint:"Receba alertas mesmo com o app em segundo plano",
    bgMonitor:"Monitoramento em Segundo Plano", bgActive:"ATIVO", bgInactive:"INATIVO",
    bgInterval:"Verificar a cada", bgMin:"min", lastCheck:"Última verificação", notifSent:"notificações enviadas",
    langLabel:"Idioma do App", riskHigh:"ALTO", riskMed:"MÉDIO", riskLow:"BAIXO", riskInfo:"INFO",
    safeScore:"SEGURO", warnScore:"ATENÇÃO", highScore:"ALTO RISCO", tipLabel:"O que fazer",
    howIntro:"Grandes empresas usam", howBold:"preço dinâmico personalizado", howIntro2:"baseado em sinais do seu celular em tempo real.", source:"FONTE",
    ticker:"⚠ BATERIA BAIXA · ALMOÇO · IPHONE · LOCALIZAÇÃO · FIM DE SEMANA · REDE LENTA · MADRUGADA · HISTÓRICO ",
    alerts:{
      bat_crit: { title:"Bateria crítica — preços podem subir", detail:(b)=>`Bateria em ${b}%. Apps como Uber, iFood detectam isso.`, tip:"Carregue antes de comprar. Usuários com <20% pagam até 30% a mais." },
      bat_low:  { title:"Bateria baixa — risco moderado",       detail:(b)=>`Bateria em ${b}% — apps monitoram urgência.`,            tip:"Compare preços em outro dispositivo ou aguarde recarregar." },
      peak_meal:{ title:"Horário de almoço — comida mais cara", detail:(h)=>`${h}h — pico ativo em iFood, Rappi, Uber Eats.`,         tip:"Peça às 10:30 ou 14:30. Fora do pico, taxas caem até 40%." },
      peak_din: { title:"Jantar / rush — preços em alta",       detail:(h)=>`${h}h — surge pricing ativo.`,                           tip:"Espere após 20:30 ou use cupons acumulados." },
      weekend:  { title:"Final de semana — surge ativo",        detail:()=>"Sábado e domingo têm demanda 2× maior.",                  tip:"Programe corridas antes das 9h ou após as 22h." },
      late_night:{ title:"Madrugada — menos oferta, mais caro", detail:(h)=>`${h}h — oferta reduzida ativa surge automático.`,        tip:"Se possível, aguarde o amanhecer." },
      slow_net: { title:"Sinal fraco — vulnerabilidade",        detail:(n)=>`Conexão ${n} — ansiedade aumenta aceitação em 60%.`,     tip:"Evite transações com sinal fraco." },
      ios_dev:  { title:"iPhone — segmentação ativa",           detail:()=>"Usuários iOS pagam 20–30% a mais em média.",              tip:"Use modo incógnito ou acesse pelo computador." },
      safe_time:{ title:"Bom horário para compras",             detail:(h)=>`${h}h — demanda baixa, preços menores.`,                 tip:"Compras entre 6h–10h são até 25% mais baratas." },
    },
    howData:[
      {icon:"🪫",title:"Nível de bateria",     desc:"Uber confirmou monitorar bateria. <20% = aceitam preços maiores.",    src:"Uber (2016)"},
      {icon:"📍",title:"Localização precisa",  desc:"Aeroportos, hospitais, bairros nobres = preço mais alto.",            src:"Múltiplos apps"},
      {icon:"🍎",title:"Modelo do celular",    desc:"iPhone = renda maior. Sites cobram mais para iOS por padrão.",        src:"Harvard Business Review"},
      {icon:"🔁",title:"Histórico de buscas", desc:"Pesquisou o mesmo produto várias vezes? Urgência = preço maior.",     src:"Booking, Amazon"},
      {icon:"⏰",title:"Horário e dia",        desc:"Algoritmos ajustam preços por hora via demanda histórica.",           src:"iFood, Rappi, Uber"},
      {icon:"📶",title:"Tipo de conexão",      desc:"WiFi vs 4G indica localização: casa, trabalho, aeroporto.",          src:"Meta, Google Ads"},
      {icon:"👆",title:"Velocidade de scroll", desc:"Rolar rápido = ansioso. Apps ajustam preços em tempo real.",         src:"MIT Research 2022"},
      {icon:"🌍",title:"IP e VPN",            desc:"Localização por IP define preço regional automático.",                src:"Streaming, passagens"},
    ],
  },
  en: {
    appSub:"DYNAMIC PRICING PROTECTION", tabAlerts:"🚨 Alerts", tabHow:"🔍 How they track", tabSettings:"⚙️ Settings",
    highRisk:"high risk", attention:"warning", signals:"signals", analyzing:"Analyzing device…",
    rawData:"COLLECTED DATA NOW", hour:"Time", battery:"Battery", network:"Network", platform:"Platform",
    language:"Language", resolution:"Resolution", footer:"PRICEGUARD · CONSUMER PROTECTION · 2025",
    notifTitle:"🛡️ PriceGuard", notifAllow:"Enable Notifications", notifEnabled:"Notifications Active ✓",
    notifDenied:"Notifications Blocked", notifHint:"Receive alerts even when the app is in the background",
    bgMonitor:"Background Monitoring", bgActive:"ACTIVE", bgInactive:"INACTIVE",
    bgInterval:"Check every", bgMin:"min", lastCheck:"Last check", notifSent:"notifications sent",
    langLabel:"App Language", riskHigh:"HIGH", riskMed:"MEDIUM", riskLow:"LOW", riskInfo:"INFO",
    safeScore:"SAFE", warnScore:"WARNING", highScore:"HIGH RISK", tipLabel:"What to do",
    howIntro:"Big companies use", howBold:"personalized dynamic pricing", howIntro2:"based on real-time signals from your phone.", source:"SOURCE",
    ticker:"⚠ LOW BATTERY · LUNCH HOUR · IPHONE · LOCATION · WEEKEND · SLOW NETWORK · LATE NIGHT · SEARCH HISTORY ",
    alerts:{
      bat_crit: { title:"Critical battery — prices may rise",    detail:(b)=>`Battery at ${b}%. Apps like Uber detect this.`,              tip:"Charge before buying. Users with <20% pay up to 30% more." },
      bat_low:  { title:"Low battery — moderate risk",            detail:(b)=>`Battery at ${b}% — apps monitor urgency.`,                   tip:"Compare prices on another device or wait to recharge." },
      peak_meal:{ title:"Lunch hour — food prices higher",       detail:(h)=>`${h}h — peak demand on delivery apps.`,                      tip:"Order at 10:30 AM or 2:30 PM. Off-peak fees drop 40%." },
      peak_din: { title:"Dinner rush — prices surging",          detail:(h)=>`${h}h — surge pricing active.`,                              tip:"Wait until after 8:30 PM or use saved coupons." },
      weekend:  { title:"Weekend — surge pricing active",        detail:()=>"Sat & Sun have 2× higher demand.",                            tip:"Schedule rides before 9 AM or after 10 PM." },
      late_night:{ title:"Late night — fewer drivers",           detail:(h)=>`${h}h — reduced supply triggers surge.`,                     tip:"Wait until morning if not urgent." },
      slow_net: { title:"Weak signal — vulnerability detected",  detail:(n)=>`${n} connection — anxiety raises acceptance 60%.`,           tip:"Avoid transactions on weak signal." },
      ios_dev:  { title:"iPhone — segmentation active",          detail:()=>"iOS users pay 20–30% more on average.",                       tip:"Use incognito or access from a computer." },
      safe_time:{ title:"Good time to shop",                     detail:(h)=>`${h}h — low demand, lower prices.`,                          tip:"Purchases between 6–10 AM are up to 25% cheaper." },
    },
    howData:[
      {icon:"🪫",title:"Battery level",        desc:"Uber confirmed monitoring battery. <20% users accept higher prices.",  src:"Uber (2016)"},
      {icon:"📍",title:"Precise location",     desc:"Airports, hospitals, wealthy areas = automatically higher prices.",    src:"Multiple apps"},
      {icon:"🍎",title:"Phone model",          desc:"iPhone = higher income. Sites charge more for iOS by default.",        src:"Harvard Business Review"},
      {icon:"🔁",title:"Search history",       desc:"Searched same product multiple times? Urgency = higher price.",       src:"Booking, Amazon"},
      {icon:"⏰",title:"Time and day",         desc:"Algorithms adjust prices hourly based on historical demand.",          src:"Food/ride apps"},
      {icon:"📶",title:"Connection type",      desc:"WiFi vs 4G indicates location: home, work, airport.",                 src:"Meta, Google Ads"},
      {icon:"👆",title:"Scroll speed",         desc:"Fast scrolling = anxious user. Apps adjust prices in real time.",     src:"MIT Research 2022"},
      {icon:"🌍",title:"IP and VPN",           desc:"IP-based location sets regional automatic pricing.",                   src:"Streaming, flights"},
    ],
  },
  es: {
    appSub:"PROTECCIÓN CONTRA PRECIOS DINÁMICOS", tabAlerts:"🚨 Alertas", tabHow:"🔍 Cómo rastrean", tabSettings:"⚙️ Config",
    highRisk:"alto riesgo", attention:"atención", signals:"señales", analyzing:"Analizando dispositivo…",
    rawData:"DATOS RECOPILADOS AHORA", hour:"Hora", battery:"Batería", network:"Red", platform:"Plataforma",
    language:"Idioma", resolution:"Resolución", footer:"PRICEGUARD · PROTECCIÓN AL CONSUMIDOR · 2025",
    notifTitle:"🛡️ PriceGuard", notifAllow:"Activar Notificaciones", notifEnabled:"Notificaciones Activas ✓",
    notifDenied:"Notificaciones Bloqueadas", notifHint:"Recibe alertas incluso con la app en segundo plano",
    bgMonitor:"Monitoreo en Segundo Plano", bgActive:"ACTIVO", bgInactive:"INACTIVO",
    bgInterval:"Verificar cada", bgMin:"min", lastCheck:"Última verificación", notifSent:"notificaciones enviadas",
    langLabel:"Idioma de la App", riskHigh:"ALTO", riskMed:"MEDIO", riskLow:"BAJO", riskInfo:"INFO",
    safeScore:"SEGURO", warnScore:"ATENCIÓN", highScore:"ALTO RIESGO", tipLabel:"Qué hacer",
    howIntro:"Las grandes empresas usan", howBold:"precios dinámicos personalizados", howIntro2:"basados en señales de tu teléfono en tiempo real.", source:"FUENTE",
    ticker:"⚠ BATERÍA BAJA · ALMUERZO · IPHONE · UBICACIÓN · FIN DE SEMANA · RED LENTA · MADRUGADA · HISTORIAL ",
    alerts:{
      bat_crit: { title:"Batería crítica — precios pueden subir", detail:(b)=>`Batería al ${b}%. Apps como Uber detectan esto.`,           tip:"Carga antes de comprar. Usuarios con <20% pagan hasta 30% más." },
      bat_low:  { title:"Batería baja — riesgo moderado",          detail:(b)=>`Batería al ${b}% — las apps monitorean urgencia.`,          tip:"Compara precios en otro dispositivo." },
      peak_meal:{ title:"Hora del almuerzo — comida más cara",     detail:(h)=>`${h}h — pico de demanda en apps de delivery.`,             tip:"Pide a las 10:30 o 14:30. Fuera del pico, envíos bajan 40%." },
      peak_din: { title:"Cena / rush — precios en alza",           detail:(h)=>`${h}h — surge pricing activo.`,                            tip:"Espera después de las 20:30 o usa cupones." },
      weekend:  { title:"Fin de semana — surge activo",            detail:()=>"Sábado y domingo tienen demanda 2× mayor.",                 tip:"Programa viajes antes de las 9h o después de las 22h." },
      late_night:{ title:"Madrugada — menos conductores",          detail:(h)=>`${h}h — oferta reducida activa surge.`,                    tip:"Espera al amanecer si no es urgente." },
      slow_net: { title:"Señal débil — vulnerabilidad",            detail:(n)=>`Conexión ${n} — ansiedad aumenta aceptación en 60%.`,      tip:"Evita transacciones con señal débil." },
      ios_dev:  { title:"iPhone — segmentación activa",            detail:()=>"Usuarios iOS pagan 20–30% más en promedio.",                tip:"Usa modo incógnito o accede desde un ordenador." },
      safe_time:{ title:"Buen momento para comprar",               detail:(h)=>`${h}h — demanda baja, precios menores.`,                   tip:"Las compras entre 6–10h son hasta 25% más baratas." },
    },
    howData:[
      {icon:"🪫",title:"Nivel de batería",      desc:"Uber confirmó monitorear batería. <20% aceptan precios mayores.",   src:"Uber (2016)"},
      {icon:"📍",title:"Ubicación precisa",     desc:"Aeropuertos, hospitales, barrios ricos = precio más alto.",         src:"Múltiples apps"},
      {icon:"🍎",title:"Modelo del teléfono",   desc:"iPhone = ingresos mayores. Los sitios cobran más para iOS.",        src:"Harvard Business Review"},
      {icon:"🔁",title:"Historial de búsquedas",desc:"¿Buscaste el mismo producto varias veces? Urgencia = más caro.",   src:"Booking, Amazon"},
      {icon:"⏰",title:"Hora y día",            desc:"Algoritmos ajustan precios por hora según demanda histórica.",      src:"Apps de comida/viajes"},
      {icon:"📶",title:"Tipo de conexión",      desc:"WiFi vs 4G indica ubicación: casa, trabajo, aeropuerto.",          src:"Meta, Google Ads"},
      {icon:"👆",title:"Velocidad de scroll",   desc:"Desplazarse rápido = ansioso. Apps ajustan precios en tiempo real.",src:"MIT Research 2022"},
      {icon:"🌍",title:"IP y VPN",             desc:"La ubicación por IP define precios regionales automáticos.",         src:"Streaming, vuelos"},
    ],
  },
};

const LANGS = [
  {code:"pt",flag:"🇧🇷",label:"Português"},
  {code:"en",flag:"🇺🇸",label:"English"},
  {code:"es",flag:"🇪🇸",label:"Español"},
];

const AdSlot = ({id,h=60}) => (
  <div id={`ad-${id}`} data-ad-unit={id} style={{
    width:"100%",height:h,borderRadius:10,
    border:"1.5px dashed rgba(255,200,0,0.18)",
    background:"rgba(255,200,0,0.025)",
    display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:2,
  }}>
    <span style={{fontSize:8,letterSpacing:3,color:"rgba(255,200,0,0.22)",fontFamily:"'DM Mono',monospace",textTransform:"uppercase"}}>
      publicidade · {id}
    </span>
  </div>
);

const RC = {
  HIGH:{bg:"rgba(255,70,70,0.12)", border:"rgba(255,70,70,0.4)",   text:"#FF4646",dot:"#FF4646"},
  MED: {bg:"rgba(255,165,0,0.10)", border:"rgba(255,165,0,0.4)",   text:"#FFA500",dot:"#FFA500"},
  LOW: {bg:"rgba(80,220,120,0.10)",border:"rgba(80,220,120,0.3)",  text:"#50DC78",dot:"#50DC78"},
  INFO:{bg:"rgba(99,200,255,0.08)",border:"rgba(99,200,255,0.25)", text:"#63C8FF",dot:"#63C8FF"},
};

const rKey=(r,t)=> r===t.riskHigh?"HIGH": r===t.riskMed?"MED": r===t.riskLow?"LOW":"INFO";

const AlertCard = ({icon,title,detail,risk,tip,isNew,t}) => {
  const [open,setOpen] = useState(false);
  const c = RC[rKey(risk,t)];
  return (
    <div onClick={()=>setOpen(o=>!o)} style={{background:c.bg,border:`1px solid ${c.border}`,borderRadius:16,padding:"14px 16px",cursor:"pointer",transition:"all 0.2s",position:"relative"}}>
      {isNew && <div style={{position:"absolute",top:10,right:12,width:8,height:8,borderRadius:"50%",background:c.dot,boxShadow:`0 0 8px ${c.dot}`,animation:"blink 1.5s infinite"}}/>}
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <span style={{fontSize:22,minWidth:28,textAlign:"center"}}>{icon}</span>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13.5,color:"#fff",lineHeight:1.3}}>{title}</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"rgba(255,255,255,0.42)",marginTop:3,lineHeight:1.5}}>{detail}</div>
        </div>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,fontWeight:700,color:c.text,letterSpacing:1,minWidth:46,textAlign:"right"}}>{risk}</div>
      </div>
      {open && (
        <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${c.border}`,fontFamily:"'DM Mono',monospace",fontSize:11,color:"rgba(255,255,255,0.6)",lineHeight:1.7}}>
          💡 <strong style={{color:"#fff"}}>{t.tipLabel}:</strong> {tip}
        </div>
      )}
    </div>
  );
};

const ScoreRing = ({score,t}) => {
  const R=52,C=2*Math.PI*R;
  const color = score>65?"#FF4646":score>35?"#FFA500":"#50DC78";
  const label = score>65?t.highScore:score>35?t.warnScore:t.safeScore;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
      <div style={{position:"relative",width:116,height:116}}>
        <svg width={116} height={116} style={{transform:"rotate(-90deg)"}}>
          <circle cx={58} cy={58} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={9}/>
          <circle cx={58} cy={58} r={R} fill="none" stroke={color} strokeWidth={9}
            strokeLinecap="round" strokeDasharray={`${(score/100)*C} ${C}`}
            style={{filter:`drop-shadow(0 0 8px ${color})`,transition:"stroke-dasharray 1.5s cubic-bezier(.4,0,.2,1)"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:26,color,textShadow:`0 0 20px ${color}88`,lineHeight:1}}>{score}</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.3)",letterSpacing:1}}>/100</div>
        </div>
      </div>
      <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,color,textShadow:`0 0 10px ${color}66`}}>{label}</div>
    </div>
  );
};

export default function App() {
  const [lang,setLang]           = useState("pt");
  const [signals,setSignals]     = useState(null);
  const [alerts,setAlerts]       = useState([]);
  const [score,setScore]         = useState(0);
  const [tab,setTab]             = useState("alerts");
  const [mounted,setMounted]     = useState(false);
  const [notifPerm,setNotifPerm] = useState("default");
  const [bgActive,setBgActive]   = useState(false);
  const [bgInterval,setBgInterval] = useState(5);
  const [lastCheck,setLastCheck] = useState(null);
  const [notifCount,setNotifCount] = useState(0);
  const sentIds = useRef(new Set());
  const bgTimer = useRef(null);
  const t = T[lang];

  useEffect(()=>{ setTimeout(()=>setMounted(true),80); setNotifPerm(Notification.permission); },[]);

  const requestNotif = async () => {
    const p = await Notification.requestPermission();
    setNotifPerm(p);
    if(p==="granted") setBgActive(true);
  };

  const sendNotif = useCallback((alert)=>{
    if(Notification.permission!=="granted") return;
    if(sentIds.current.has(alert.id)) return;
    sentIds.current.add(alert.id);
    setTimeout(()=>sentIds.current.delete(alert.id), 90000);
    const urgency = alert.risk===t.riskHigh?"🔴":alert.risk===t.riskMed?"🟠":"🟢";
    try {
      new Notification(`${urgency} PriceGuard — ${alert.risk}`,{
        body:`${alert.icon} ${alert.title}\n${alert.detail}`,
        tag:alert.id,
        requireInteraction: alert.risk===t.riskHigh,
      });
      setNotifCount(c=>c+1);
    } catch(_){}
  },[t]);

  const collectSignals = useCallback(async()=>{
    const now = new Date();
    let battery=null,charging=false;
    try{ const b=await navigator.getBattery(); battery=Math.round(b.level*100); charging=b.charging; }catch(_){}
    const conn=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
    const ua=navigator.userAgent;
    setSignals({
      hour:now.getHours(),dow:now.getDay(),mins:now.getMinutes(),
      battery,charging,
      netType:conn?.effectiveType||"unknown",
      saveData:conn?.saveData??false,
      isIOS:/iPhone|iPad|iPod/.test(ua),
      isAndroid:/Android/.test(ua),
      isMobile:/iPhone|iPad|iPod|Android/.test(ua),
      lang:navigator.language||"pt-BR",
      w:window.screen.width,h:window.screen.height,
    });
    setLastCheck(now);
  },[]);

  useEffect(()=>{ collectSignals(); },[collectSignals]);

  useEffect(()=>{
    if(!signals) return;
    const {hour,dow,battery,charging,netType,isIOS} = signals;
    const found=[]; let pts=0; const a=t.alerts;

    if(battery!==null&&!charging){
      if(battery<=15){ found.push({id:"bat_crit",icon:"🪫",risk:t.riskHigh,isNew:true,title:a.bat_crit.title,detail:a.bat_crit.detail(battery),tip:a.bat_crit.tip}); pts+=35; }
      else if(battery<=30){ found.push({id:"bat_low",icon:"🔋",risk:t.riskMed,isNew:true,title:a.bat_low.title,detail:a.bat_low.detail(battery),tip:a.bat_low.tip}); pts+=18; }
    }
    if(hour>=11&&hour<=13){ found.push({id:"peak_meal",icon:"🍽️",risk:t.riskHigh,isNew:true,title:a.peak_meal.title,detail:a.peak_meal.detail(hour),tip:a.peak_meal.tip}); pts+=25; }
    if(hour>=18&&hour<=20){ found.push({id:"peak_din",icon:"🌆",risk:t.riskHigh,isNew:true,title:a.peak_din.title,detail:a.peak_din.detail(hour),tip:a.peak_din.tip}); pts+=22; }
    if(dow===0||dow===6){ found.push({id:"weekend",icon:"📅",risk:t.riskMed,title:a.weekend.title,detail:a.weekend.detail(),tip:a.weekend.tip}); pts+=15; }
    if(hour>=0&&hour<=5){ found.push({id:"late_night",icon:"🌙",risk:t.riskMed,title:a.late_night.title,detail:a.late_night.detail(hour),tip:a.late_night.tip}); pts+=12; }
    if(["slow-2g","2g","3g"].includes(netType)){ found.push({id:"slow_net",icon:"📶",risk:t.riskMed,title:a.slow_net.title,detail:a.slow_net.detail(netType.toUpperCase()),tip:a.slow_net.tip}); pts+=12; }
    if(isIOS){ found.push({id:"ios_dev",icon:"🍎",risk:t.riskMed,title:a.ios_dev.title,detail:a.ios_dev.detail(),tip:a.ios_dev.tip}); pts+=15; }
    if(hour>=6&&hour<=10){ found.push({id:"safe_time",icon:"☀️",risk:t.riskLow,title:a.safe_time.title,detail:a.safe_time.detail(hour),tip:a.safe_time.tip}); }

    setAlerts(found);
    setScore(Math.min(pts,100));
    if(bgActive) found.filter(x=>x.risk===t.riskHigh||x.risk===t.riskMed).forEach(sendNotif);
  },[signals,t,bgActive,sendNotif]);

  useEffect(()=>{
    if(bgTimer.current) clearInterval(bgTimer.current);
    if(bgActive){ bgTimer.current=setInterval(collectSignals,bgInterval*60*1000); }
    return ()=>clearInterval(bgTimer.current);
  },[bgActive,bgInterval,collectSignals]);

  const acHigh=alerts.filter(a=>a.risk===t.riskHigh).length;
  const acMed=alerts.filter(a=>a.risk===t.riskMed).length;
  const fmtTime=(d)=>d?`${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`:"—";

  return (
    <div style={{minHeight:"100vh",background:"#07090F",backgroundImage:`radial-gradient(ellipse 70% 40% at 50% -5%,rgba(255,100,0,0.08) 0%,transparent 65%),radial-gradient(ellipse 40% 30% at 90% 90%,rgba(255,50,50,0.04) 0%,transparent 60%)`,display:"flex",justifyContent:"center",padding:"0 0 40px"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.15}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes pulse2{0%,100%{opacity:0.5}50%{opacity:1}}
        .fi{animation:fadeUp 0.4s ease both}
        .tab-btn{cursor:pointer;transition:all 0.2s}.tab-btn:hover{opacity:0.75}
        .cb{cursor:pointer;transition:all 0.22s}.cb:hover{filter:brightness(1.15);transform:scale(1.02)}.cb:active{transform:scale(0.97)}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#333;border-radius:4px}
      `}</style>

      <div style={{width:"100%",maxWidth:420,display:"flex",flexDirection:"column",opacity:mounted?1:0,transition:"opacity 0.5s"}}>

        {/* TICKER */}
        <div style={{background:"#CC3300",overflow:"hidden",height:26,display:"flex",alignItems:"center",flexShrink:0}}>
          <div style={{display:"flex",animation:"ticker 22s linear infinite",whiteSpace:"nowrap",fontFamily:"'DM Mono',monospace",fontSize:9.5,fontWeight:500,color:"#fff",letterSpacing:1}}>
            {[0,1,2,3].map(i=><span key={i}>{t.ticker}</span>)}
          </div>
        </div>

        {/* HEADER */}
        <div className="fi" style={{padding:"20px 20px 14px",background:"rgba(255,255,255,0.025)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:24,color:"#fff",lineHeight:1.1}}>
                Price<span style={{color:"#FF8C00"}}>Guard</span>
              </div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"rgba(255,255,255,0.28)",letterSpacing:2,marginTop:3}}>{t.appSub}</div>
              <div style={{marginTop:8,display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:bgActive?"#50DC78":"#555",boxShadow:bgActive?"0 0 8px #50DC78":"none",animation:bgActive?"pulse2 1.5s infinite":"none",transition:"all 0.3s"}}/>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:bgActive?"#50DC78":"#555",letterSpacing:1}}>
                  {t.bgMonitor} · {bgActive?t.bgActive:t.bgInactive}
                </span>
              </div>
            </div>
            <ScoreRing score={score} t={t}/>
          </div>
          <div style={{display:"flex",gap:7,marginTop:12,flexWrap:"wrap"}}>
            {[
              {label:`${acHigh} ${t.highRisk}`,color:"#FF4646"},
              {label:`${acMed} ${t.attention}`,color:"#FFA500"},
              {label:`${alerts.length} ${t.signals}`,color:"rgba(255,255,255,0.35)"},
              {label:`${notifCount} ${t.notifSent}`,color:"#63C8FF"},
            ].map(c=>(
              <div key={c.label} style={{background:"rgba(255,255,255,0.05)",borderRadius:20,padding:"4px 10px",fontFamily:"'DM Mono',monospace",fontSize:9.5,color:c.color,letterSpacing:0.5}}>{c.label}</div>
            ))}
          </div>
        </div>

        {/* TOP AD */}
        <div style={{padding:"10px 20px"}}><AdSlot id="top-001"/></div>

        {/* TABS */}
        <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.07)",padding:"0 20px"}}>
          {[["alerts",t.tabAlerts],["how",t.tabHow],["settings",t.tabSettings]].map(([k,l])=>(
            <div key={k} className="tab-btn" onClick={()=>setTab(k)} style={{flex:1,textAlign:"center",padding:"11px 0",fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:0.5,color:tab===k?"#FF8C00":"rgba(255,255,255,0.28)",borderBottom:tab===k?"2px solid #FF8C00":"2px solid transparent",marginBottom:-1}}>{l}</div>
          ))}
        </div>

        {/* ══ ALERTS TAB ══ */}
        {tab==="alerts" && (
          <div style={{padding:"14px 20px",display:"flex",flexDirection:"column",gap:10}}>
            {!signals && <div style={{textAlign:"center",padding:40,fontFamily:"'DM Mono',monospace",fontSize:11,color:"rgba(255,255,255,0.28)"}}>{t.analyzing}</div>}
            {alerts.filter(a=>a.risk===t.riskHigh).map((a,i)=>(
              <div key={a.id} className="fi" style={{animationDelay:`${i*0.07}s`}}><AlertCard {...a} t={t}/></div>
            ))}
            {alerts.filter(a=>a.risk===t.riskMed).map((a,i)=>(
              <div key={a.id} className="fi" style={{animationDelay:`${(i+2)*0.07}s`}}><AlertCard {...a} t={t}/></div>
            ))}
            <div className="fi" style={{animationDelay:"0.32s"}}><AdSlot id="mid-002"/></div>
            {alerts.filter(a=>[t.riskLow,t.riskInfo].includes(a.risk)).map((a,i)=>(
              <div key={a.id} className="fi" style={{animationDelay:`${(i+4)*0.07}s`}}><AlertCard {...a} t={t}/></div>
            ))}
            {signals && (
              <div className="fi" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"14px 16px",animationDelay:"0.5s"}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.35)",marginBottom:10,letterSpacing:1}}>{t.rawData}</div>
                {[
                  [t.hour,`${signals.hour}:${String(signals.mins).padStart(2,"0")}`],
                  [t.battery,signals.battery!==null?`${signals.battery}%${signals.charging?" ⚡":""}`: "N/D"],
                  [t.network,signals.netType.toUpperCase()],
                  [t.platform,signals.isIOS?"iOS 🍎":signals.isAndroid?"Android 🤖":"Desktop 💻"],
                  [t.language,signals.lang],
                  [t.resolution,`${signals.w}×${signals.h}`],
                ].map(([k,v])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",fontFamily:"'DM Mono',monospace",fontSize:10,padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.38)"}}>
                    <span style={{color:"rgba(255,255,255,0.22)"}}>{k}</span><span>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ HOW TAB ══ */}
        {tab==="how" && (
          <div style={{padding:"14px 20px",display:"flex",flexDirection:"column",gap:10}}>
            <div className="fi" style={{background:"rgba(255,140,0,0.08)",border:"1px solid rgba(255,140,0,0.2)",borderRadius:14,padding:"14px 16px",fontFamily:"'DM Mono',monospace",fontSize:11,color:"rgba(255,200,100,0.75)",lineHeight:1.7}}>
              {t.howIntro} <strong style={{color:"#FF8C00"}}>{t.howBold}</strong> {t.howIntro2}
            </div>
            {t.howData.map((d,i)=>(
              <div key={d.title} className="fi" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"14px 16px",animationDelay:`${i*0.06}s`}}>
                <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <span style={{fontSize:20,minWidth:26}}>{d.icon}</span>
                  <div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:"#fff",marginBottom:4}}>{d.title}</div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:10.5,color:"rgba(255,255,255,0.42)",lineHeight:1.6}}>{d.desc}</div>
                    <div style={{marginTop:5,fontFamily:"'DM Mono',monospace",fontSize:9,color:"#FF8C00",letterSpacing:1}}>{t.source}: {d.src}</div>
                  </div>
                </div>
              </div>
            ))}
            <div className="fi" style={{animationDelay:"0.5s"}}><AdSlot id="how-003"/></div>
          </div>
        )}

        {/* ══ SETTINGS TAB ══ */}
        {tab==="settings" && (
          <div style={{padding:"14px 20px",display:"flex",flexDirection:"column",gap:12}}>

            {/* Language */}
            <div className="fi" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"18px 18px"}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.7)",marginBottom:14}}>🌐 {t.langLabel}</div>
              <div style={{display:"flex",gap:10}}>
                {LANGS.map(l=>(
                  <div key={l.code} className="cb" onClick={()=>setLang(l.code)} style={{flex:1,padding:"12px 8px",borderRadius:12,textAlign:"center",background:lang===l.code?"rgba(255,140,0,0.18)":"rgba(255,255,255,0.04)",border:lang===l.code?"1.5px solid rgba(255,140,0,0.5)":"1px solid rgba(255,255,255,0.08)"}}>
                    <div style={{fontSize:24,marginBottom:5}}>{l.flag}</div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:9.5,color:lang===l.code?"#FF8C00":"rgba(255,255,255,0.38)",letterSpacing:0.5}}>{l.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="fi" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"18px 18px",animationDelay:"0.07s"}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.7)",marginBottom:6}}>🔔 Notificações</div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:14,lineHeight:1.6}}>{t.notifHint}</div>
              <div className="cb" onClick={notifPerm!=="denied"?requestNotif:undefined} style={{padding:"13px 16px",borderRadius:12,textAlign:"center",background:notifPerm==="granted"?"rgba(80,220,120,0.15)":notifPerm==="denied"?"rgba(255,70,70,0.1)":"rgba(255,140,0,0.15)",border:notifPerm==="granted"?"1.5px solid rgba(80,220,120,0.4)":notifPerm==="denied"?"1.5px solid rgba(255,70,70,0.3)":"1.5px solid rgba(255,140,0,0.4)",fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,letterSpacing:1,color:notifPerm==="granted"?"#50DC78":notifPerm==="denied"?"#FF4646":"#FF8C00",cursor:notifPerm==="denied"?"not-allowed":"pointer"}}>
                {notifPerm==="granted"?t.notifEnabled:notifPerm==="denied"?t.notifDenied:t.notifAllow}
              </div>
            </div>

            {/* Background monitoring */}
            <div className="fi" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"18px 18px",animationDelay:"0.12s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.7)"}}>📡 {t.bgMonitor}</div>
                <div className="cb" onClick={()=>{ if(notifPerm==="granted") setBgActive(p=>!p); }} style={{padding:"6px 14px",borderRadius:20,background:bgActive?"rgba(80,220,120,0.15)":"rgba(255,255,255,0.06)",border:bgActive?"1.5px solid rgba(80,220,120,0.4)":"1px solid rgba(255,255,255,0.1)",fontFamily:"'DM Mono',monospace",fontSize:10,fontWeight:700,color:bgActive?"#50DC78":"#666",letterSpacing:1,display:"flex",alignItems:"center",gap:6,cursor:notifPerm==="granted"?"pointer":"not-allowed",opacity:notifPerm==="granted"?1:0.5}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:bgActive?"#50DC78":"#555",boxShadow:bgActive?"0 0 6px #50DC78":"none",animation:bgActive?"pulse2 1.5s infinite":"none"}}/>
                  {bgActive?t.bgActive:t.bgInactive}
                </div>
              </div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:8,letterSpacing:1}}>{t.bgInterval}</div>
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                {[1,5,15,30].map(m=>(
                  <div key={m} className="cb" onClick={()=>setBgInterval(m)} style={{flex:1,padding:"9px 4px",borderRadius:10,textAlign:"center",background:bgInterval===m?"rgba(255,140,0,0.18)":"rgba(255,255,255,0.04)",border:bgInterval===m?"1.5px solid rgba(255,140,0,0.5)":"1px solid rgba(255,255,255,0.08)",fontFamily:"'DM Mono',monospace",fontSize:11,fontWeight:700,color:bgInterval===m?"#FF8C00":"rgba(255,255,255,0.3)"}}>
                    {m}{t.bgMin}
                  </div>
                ))}
              </div>
              <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:10,display:"flex",flexDirection:"column",gap:5}}>
                {[
                  [t.lastCheck,fmtTime(lastCheck),"rgba(255,255,255,0.5)"],
                  [t.notifSent,notifCount,"#63C8FF"],
                ].map(([k,v,c])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",fontFamily:"'DM Mono',monospace",fontSize:10,color:"rgba(255,255,255,0.3)"}}>
                    <span>{k}</span><span style={{color:c}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="fi" style={{animationDelay:"0.2s"}}><AdSlot id="settings-004" h={50}/></div>
          </div>
        )}

        <div style={{textAlign:"center",padding:"6px 20px 0",fontFamily:"'DM Mono',monospace",fontSize:8,color:"rgba(255,255,255,0.12)",letterSpacing:1}}>{t.footer}</div>
      </div>
    </div>
  );
}
