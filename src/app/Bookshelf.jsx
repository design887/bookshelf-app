"use client";
import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { AuthProvider, useAuth } from "./AuthProvider";
import { useShelfData } from "./useShelfData";
function useDebounce(val, ms) {
  const [d, setD] = useState(val);
  useEffect(() => { const t = setTimeout(() => setD(val), ms); return () => clearTimeout(t); }, [val, ms]);
  return d;
}

function useWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 480);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}


/* ══════════════════════════════════════════
   THEME SYSTEM — 5 distinct visual styles
   ══════════════════════════════════════════ */
const THEMES = {
  classic: {
    id: "classic", name: "Classic", desc: "Warm & cozy dark",
    icon: "📚",
    bg: "#121212", surface: "#1e1a16", surfaceAlt: "#151210",
    text: "#e8dcc8", textSub: "rgba(200,180,150,.6)", textMuted: "rgba(200,180,150,.35)",
    textFaint: "rgba(200,180,150,.2)", textPlaceholder: "rgba(200,180,150,.3)",
    accent: "#e8d5a3", accentBg: "rgba(200,168,76,.18)", accentBorder: "rgba(200,168,76,.35)",
    accentSoft: "rgba(200,168,76,.12)", accentText: "#e8d5a3",
    fab: "#d4b45e", fabText: "#1a1510",
    cardBg: "rgba(255,255,255,.03)", cardBorder: "rgba(255,255,255,.06)",
    inputBg: "rgba(255,255,255,.06)", inputBorder: "rgba(255,255,255,.08)",
    navBg: "rgba(30,28,26,.65)", navBorder: "rgba(255,255,255,.1)",
    navActive: "rgba(212,180,94,.2)", navIcon: "rgba(220,210,195,.55)",
    shelfFront: "linear-gradient(180deg, #5a4632 0%, #4a3828 40%, #3d2e1f 100%)",
    shelfShadow: "0 4px 12px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.08)",
    shelfBg: "linear-gradient(180deg, rgba(30,25,20,.25) 0%, rgba(40,32,24,.08) 100%)",
    wood: "#5a4230", woodDark: "#3d2c1a", woodLight: "#6b5040", bookcaseBg: "rgba(20,16,12,.85)",
    sheetBg: "linear-gradient(180deg, #1e1a16, #151210)",
    overlayBg: "rgba(0,0,0,.7)",
    headingFont: "'Instrument Serif', serif",
    bodyFont: "'Inter', sans-serif",
    chipRadius: 16, cardRadius: 14, sheetRadius: 22, inputRadius: 12,
    statusColors: {
      want:     { color: "#c9a84c", bg: "rgba(200,168,76,.12)", ring: "rgba(200,168,76,.25)" },
      reading:  { color: "#6a9f5b", bg: "rgba(106,159,91,.12)", ring: "rgba(106,159,91,.25)" },
      finished: { color: "#8a8ac4", bg: "rgba(138,138,196,.12)", ring: "rgba(138,138,196,.25)" },
    },
    starColor: "#e2b340", starOff: "rgba(255,255,255,.15)",
    optionBg: "#1a1714",
    divider: "rgba(255,255,255,.04)",
    dangerBg: "rgba(180,60,40,.08)", dangerBorder: "rgba(180,60,40,.15)", dangerText: "#c47a6a",
    barBg: "rgba(200,168,76,", // + opacity) for rating bars
    bodyBg: "#121212",
    avatarBg: "rgba(200,168,76,.15)", avatarText: "#e8d5a3",
  },
  light: {
    id: "light", name: "Light", desc: "Clean & bright",
    icon: "☀️",
    bg: "#fdf5f5", surface: "#ffffff", surfaceAlt: "#faf0f0",
    text: "#111111", textSub: "rgba(0,0,0,.6)", textMuted: "rgba(0,0,0,.4)",
    textFaint: "rgba(0,0,0,.2)", textPlaceholder: "rgba(0,0,0,.25)",
    accent: "#c9707d", accentBg: "rgba(201,112,125,.1)", accentBorder: "rgba(201,112,125,.25)",
    accentSoft: "rgba(201,112,125,.06)", accentText: "#111111",
    fab: "#c9707d", fabText: "#fff",
    cardBg: "rgba(0,0,0,.02)", cardBorder: "rgba(0,0,0,.08)",
    inputBg: "rgba(0,0,0,.03)", inputBorder: "rgba(0,0,0,.1)",
    navBg: "rgba(253,245,245,.85)", navBorder: "rgba(0,0,0,.08)",
    navActive: "rgba(201,112,125,.12)", navIcon: "rgba(0,0,0,.4)",
    shelfFront: "linear-gradient(180deg, #d4a0a8 0%, #c99098 40%, #b88088 100%)",
    shelfShadow: "0 3px 8px rgba(0,0,0,.1), inset 0 1px 0 rgba(255,255,255,.5)",
    shelfBg: "linear-gradient(180deg, rgba(220,180,185,.08) 0%, rgba(220,180,185,.02) 100%)",
    wood: "#c9a0a8", woodDark: "#b08890", woodLight: "#e0c0c5", bookcaseBg: "rgba(250,235,238,.6)",
    sheetBg: "linear-gradient(180deg, #ffffff, #fdf5f5)",
    overlayBg: "rgba(0,0,0,.35)",
    headingFont: "'Instrument Serif', serif",
    bodyFont: "'Inter', sans-serif",
    chipRadius: 16, cardRadius: 14, sheetRadius: 22, inputRadius: 12,
    statusColors: {
      want:     { color: "#b07040", bg: "rgba(176,112,64,.1)",  ring: "rgba(176,112,64,.2)" },
      reading:  { color: "#3d7a2e", bg: "rgba(61,122,46,.1)",   ring: "rgba(61,122,46,.2)" },
      finished: { color: "#5a5ab0", bg: "rgba(90,90,176,.1)",   ring: "rgba(90,90,176,.2)" },
    },
    starColor: "#c9707d", starOff: "rgba(0,0,0,.1)",
    optionBg: "#fdf5f5",
    divider: "rgba(0,0,0,.06)",
    dangerBg: "rgba(200,50,30,.06)", dangerBorder: "rgba(200,50,30,.12)", dangerText: "#b83a2a",
    barBg: "rgba(201,112,125,",
    bodyBg: "#fdf5f5",
    avatarBg: "rgba(201,112,125,.12)", avatarText: "#c9707d",
  },
  noir: {
    id: "noir", name: "Noir", desc: "Bold & graphic",
    icon: "🖤",
    bg: "#000000", surface: "#111111", surfaceAlt: "#0a0a0a",
    text: "#ffffff", textSub: "rgba(255,255,255,.6)", textMuted: "rgba(255,255,255,.35)",
    textFaint: "rgba(255,255,255,.18)", textPlaceholder: "rgba(255,255,255,.2)",
    accent: "#ff3b30", accentBg: "rgba(255,59,48,.12)", accentBorder: "rgba(255,59,48,.3)",
    accentSoft: "rgba(255,59,48,.08)", accentText: "#ff3b30",
    fab: "#ff3b30", fabText: "#fff",
    cardBg: "rgba(255,255,255,.04)", cardBorder: "rgba(255,255,255,.08)",
    inputBg: "rgba(255,255,255,.06)", inputBorder: "rgba(255,255,255,.1)",
    navBg: "rgba(15,15,15,.8)", navBorder: "rgba(255,255,255,.1)",
    navActive: "rgba(255,59,48,.15)", navIcon: "rgba(255,255,255,.4)",
    shelfFront: "linear-gradient(180deg, #333 0%, #222 40%, #1a1a1a 100%)",
    shelfShadow: "0 4px 12px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.06)",
    shelfBg: "linear-gradient(180deg, rgba(255,255,255,.03) 0%, transparent 100%)",
    wood: "#2a2a2a", woodDark: "#1a1a1a", woodLight: "#3a3a3a", bookcaseBg: "rgba(15,15,15,.9)",
    sheetBg: "linear-gradient(180deg, #151515, #0a0a0a)",
    overlayBg: "rgba(0,0,0,.85)",
    headingFont: "'Space Grotesk', sans-serif",
    bodyFont: "'Space Grotesk', sans-serif",
    chipRadius: 8, cardRadius: 10, sheetRadius: 16, inputRadius: 8,
    statusColors: {
      want:     { color: "#ff9500", bg: "rgba(255,149,0,.12)",  ring: "rgba(255,149,0,.25)" },
      reading:  { color: "#30d158", bg: "rgba(48,209,88,.12)",  ring: "rgba(48,209,88,.25)" },
      finished: { color: "#5e5ce6", bg: "rgba(94,92,230,.12)",  ring: "rgba(94,92,230,.25)" },
    },
    starColor: "#ff3b30", starOff: "rgba(255,255,255,.12)",
    optionBg: "#111",
    divider: "rgba(255,255,255,.06)",
    dangerBg: "rgba(255,59,48,.1)", dangerBorder: "rgba(255,59,48,.2)", dangerText: "#ff6b5e",
    barBg: "rgba(255,59,48,",
    bodyBg: "#000000",
    avatarBg: "rgba(255,59,48,.15)", avatarText: "#ff3b30",
  },
  vapor: {
    id: "vapor", name: "Vapor", desc: "Neon retro-future",
    icon: "🌆",
    bg: "#0f0a1a", surface: "#16102a", surfaceAlt: "#0d0818",
    text: "#e8dff0", textSub: "rgba(200,180,240,.6)", textMuted: "rgba(200,180,240,.35)",
    textFaint: "rgba(200,180,240,.2)", textPlaceholder: "rgba(200,180,240,.25)",
    accent: "#e040fb", accentBg: "rgba(224,64,251,.12)", accentBorder: "rgba(224,64,251,.3)",
    accentSoft: "rgba(224,64,251,.08)", accentText: "#e878ff",
    fab: "linear-gradient(135deg, #e040fb, #536dfe)", fabText: "#fff",
    cardBg: "rgba(255,255,255,.04)", cardBorder: "rgba(224,64,251,.12)",
    inputBg: "rgba(255,255,255,.06)", inputBorder: "rgba(224,64,251,.15)",
    navBg: "rgba(16,10,28,.75)", navBorder: "rgba(224,64,251,.15)",
    navActive: "rgba(224,64,251,.18)", navIcon: "rgba(200,180,240,.4)",
    shelfFront: "linear-gradient(180deg, #3a2560 0%, #2a1848 40%, #1e1235 100%)",
    shelfShadow: "0 4px 12px rgba(100,20,180,.25), inset 0 1px 0 rgba(224,64,251,.1)",
    shelfBg: "linear-gradient(180deg, rgba(224,64,251,.04) 0%, transparent 100%)",
    wood: "#2a1848", woodDark: "#1a1030", woodLight: "#3a2560", bookcaseBg: "rgba(15,10,26,.85)",
    sheetBg: "linear-gradient(180deg, #1a1230, #0f0a1a)",
    overlayBg: "rgba(8,4,18,.85)",
    headingFont: "'Space Grotesk', sans-serif",
    bodyFont: "'DM Sans', sans-serif",
    chipRadius: 20, cardRadius: 16, sheetRadius: 24, inputRadius: 14,
    statusColors: {
      want:     { color: "#ffab40", bg: "rgba(255,171,64,.12)", ring: "rgba(255,171,64,.25)" },
      reading:  { color: "#69f0ae", bg: "rgba(105,240,174,.12)", ring: "rgba(105,240,174,.25)" },
      finished: { color: "#536dfe", bg: "rgba(83,109,254,.12)",  ring: "rgba(83,109,254,.25)" },
    },
    starColor: "#e040fb", starOff: "rgba(200,180,240,.12)",
    optionBg: "#16102a",
    divider: "rgba(224,64,251,.06)",
    dangerBg: "rgba(255,82,82,.1)", dangerBorder: "rgba(255,82,82,.2)", dangerText: "#ff8a80",
    barBg: "rgba(224,64,251,",
    bodyBg: "#0f0a1a",
    avatarBg: "rgba(224,64,251,.15)", avatarText: "#e878ff",
  },
  moss: {
    id: "moss", name: "Moss", desc: "Earthy & organic",
    icon: "🌿",
    bg: "#0e1410", surface: "#151e18", surfaceAlt: "#0c1210",
    text: "#d4e0d0", textSub: "rgba(170,200,160,.6)", textMuted: "rgba(170,200,160,.35)",
    textFaint: "rgba(170,200,160,.2)", textPlaceholder: "rgba(170,200,160,.25)",
    accent: "#7cb342", accentBg: "rgba(124,179,66,.14)", accentBorder: "rgba(124,179,66,.3)",
    accentSoft: "rgba(124,179,66,.08)", accentText: "#8bc34a",
    fab: "#7cb342", fabText: "#0e1410",
    cardBg: "rgba(255,255,255,.03)", cardBorder: "rgba(124,179,66,.1)",
    inputBg: "rgba(255,255,255,.05)", inputBorder: "rgba(124,179,66,.12)",
    navBg: "rgba(14,20,16,.75)", navBorder: "rgba(124,179,66,.12)",
    navActive: "rgba(124,179,66,.15)", navIcon: "rgba(170,200,160,.4)",
    shelfFront: "linear-gradient(180deg, #4a5a3a 0%, #3a4a2e 40%, #2e3a22 100%)",
    shelfShadow: "0 4px 12px rgba(0,0,0,.35), inset 0 1px 0 rgba(124,179,66,.1)",
    shelfBg: "linear-gradient(180deg, rgba(124,179,66,.04) 0%, transparent 100%)",
    wood: "#3a4a2e", woodDark: "#2a3620", woodLight: "#4a5a3a", bookcaseBg: "rgba(14,20,16,.85)",
    sheetBg: "linear-gradient(180deg, #182018, #0e1410)",
    overlayBg: "rgba(5,10,5,.8)",
    headingFont: "'Playfair Display', serif",
    bodyFont: "'DM Sans', sans-serif",
    chipRadius: 12, cardRadius: 12, sheetRadius: 20, inputRadius: 10,
    statusColors: {
      want:     { color: "#ffb74d", bg: "rgba(255,183,77,.12)", ring: "rgba(255,183,77,.25)" },
      reading:  { color: "#81c784", bg: "rgba(129,199,132,.12)", ring: "rgba(129,199,132,.25)" },
      finished: { color: "#9fa8da", bg: "rgba(159,168,218,.12)", ring: "rgba(159,168,218,.25)" },
    },
    starColor: "#aed581", starOff: "rgba(170,200,160,.12)",
    optionBg: "#151e18",
    divider: "rgba(124,179,66,.06)",
    dangerBg: "rgba(200,80,60,.1)", dangerBorder: "rgba(200,80,60,.18)", dangerText: "#e57373",
    barBg: "rgba(124,179,66,",
    bodyBg: "#0e1410",
    avatarBg: "rgba(124,179,66,.15)", avatarText: "#8bc34a",
  },
};

const ThemeCtx = createContext(THEMES.light);
function useTheme() { return useContext(ThemeCtx); }

const ScaleCtx = createContext(1);
function useScale() { return useContext(ScaleCtx); }

/* ── Profile Menu + Appearance Sheet ── */
function ProfileMenu({ theme, setThemeId, onClose, isDesktop, screenW, contentMax, user, signIn, signOut, isCloud }) {
  const [showAppearance, setShowAppearance] = useState(false);
  const T = theme;

  if (showAppearance) return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:T.overlayBg, backdropFilter:"blur(8px)",
      zIndex:200, display:"flex", alignItems:isDesktop?"center":"flex-end", justifyContent:"center",
      animation:"fadeIn .15s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:T.sheetBg, borderRadius:isDesktop?`${T.sheetRadius}px`:`${T.sheetRadius}px ${T.sheetRadius}px 0 0`,
        padding:"22px 22px 36px", width:"100%", maxWidth:440, maxHeight:"80vh", overflowY:"auto",
        border:`1px solid ${T.cardBorder}`, borderBottom:isDesktop?`1px solid ${T.cardBorder}`:"none",
        animation:"sheetUp .28s cubic-bezier(.34,1.15,.64,1)",
      }}>
        <div style={{ width:36, height:4, background:T.textFaint, borderRadius:2, margin:"0 auto 18px" }}/>
        <button onClick={() => setShowAppearance(false)} style={{
          background:"none", border:"none", color:T.textMuted, fontSize:12, cursor:"pointer",
          fontFamily:T.bodyFont, marginBottom:12, display:"flex", alignItems:"center", gap:4,
        }}>← Back</button>
        <h3 style={{ fontFamily:T.headingFont, fontSize:26, fontWeight:400, fontStyle:"italic", color:T.text, marginBottom:16 }}>Appearance</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {Object.values(THEMES).map(t => {
            const active = T.id === t.id;
            return (
              <button key={t.id} onClick={() => setThemeId(t.id)} style={{
                display:"flex", alignItems:"center", gap:14, padding:"14px 16px",
                background: active ? T.accentSoft : T.cardBg,
                border: `1.5px solid ${active ? T.accentBorder : T.cardBorder}`,
                borderRadius: T.cardRadius, cursor:"pointer", textAlign:"left", width:"100%",
                transition:"all .2s",
              }}>
                <span style={{ fontSize:24, width:36, textAlign:"center" }}>{t.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:600, color: active ? T.accentText : T.text, fontFamily:T.bodyFont }}>{t.name}</div>
                  <div style={{ fontSize:12, color:T.textMuted, marginTop:2 }}>{t.desc}</div>
                </div>
                {/* Preview dots */}
                <div style={{ display:"flex", gap:3 }}>
                  <div style={{ width:14, height:14, borderRadius:7, background:t.bg, border:`1px solid ${t.cardBorder}` }}/>
                  <div style={{ width:14, height:14, borderRadius:7, background:t.accent }}/>
                  <div style={{ width:14, height:14, borderRadius:7, background:t.fab?.startsWith?.("linear") ? t.accent : t.fab }}/>
                </div>
                {active && <span style={{ color:T.accentText, fontSize:16 }}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, zIndex:200, animation:"fadeIn .1s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        position:"absolute", top:52, right:isDesktop?Math.max(16,(screenW-contentMax)/2+16):16,
        background:T.surface, border:`1px solid ${T.cardBorder}`,
        borderRadius:T.cardRadius, padding:6, minWidth:180,
         animation:"fadeIn .12s ease",
      }}>
        {[
          { icon:"palette", label:"Appearance", action:() => setShowAppearance(true) },
          ...(user ? [
            { icon:"cloud_done", label: user.email ? `Signed in as ${user.email.split("@")[0]}` : "Synced to cloud", action:() => {}, disabled: true },
            { icon:"logout", label:"Sign out", action: signOut },
          ] : signIn ? [
            { icon:"login", label:"Sign in with Google", action: signIn },
          ] : []),
        ].map(item => (
          <button key={item.label} onClick={item.disabled ? undefined : item.action} style={{
            display:"flex", alignItems:"center", gap:10, padding:"12px 14px", width:"100%",
            background:"none", border:"none", cursor: item.disabled ? "default" : "pointer", borderRadius:T.cardRadius - 2,
            transition:"background .12s", opacity: item.disabled ? .6 : 1,
          }}
            onMouseEnter={e => { if(!item.disabled) e.currentTarget.style.background = T.cardBg }}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            <span className="m3-icon" style={{ fontSize:20, color: item.disabled ? T.accent : T.textMuted }}>{item.icon}</span>
            <span style={{ fontSize:14, color:T.text, fontFamily:T.bodyFont }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}


/* ── Local book database (~600 popular books) ── */
const B=`The Hobbit|J.R.R. Tolkien|1937|310|9780547928227
The Lord of the Rings|J.R.R. Tolkien|1954|1216|9780618640157
The Silmarillion|J.R.R. Tolkien|1977|365|9780618391110
Harry Potter and the Sorcerer's Stone|J.K. Rowling|1997|309|9780590353427
Harry Potter and the Chamber of Secrets|J.K. Rowling|1998|341|9780439064873
Harry Potter and the Prisoner of Azkaban|J.K. Rowling|1999|435|9780439136365
Harry Potter and the Goblet of Fire|J.K. Rowling|2000|734|9780439139601
Harry Potter and the Order of the Phoenix|J.K. Rowling|2003|870|9780439358071
Harry Potter and the Half-Blood Prince|J.K. Rowling|2005|607|9780439785969
Harry Potter and the Deathly Hallows|J.K. Rowling|2007|759|9780545139700
1984|George Orwell|1949|328|9780451524935
Animal Farm|George Orwell|1945|112|9780451526342
Brave New World|Aldous Huxley|1932|311|9780060850524
Fahrenheit 451|Ray Bradbury|1953|249|9781451673319
The Catcher in the Rye|J.D. Salinger|1951|277|9780316769488
To Kill a Mockingbird|Harper Lee|1960|281|9780061120084
The Great Gatsby|F. Scott Fitzgerald|1925|180|9780743273565
Pride and Prejudice|Jane Austen|1813|432|9780141439518
Jane Eyre|Charlotte Brontë|1847|500|9780141441146
Wuthering Heights|Emily Brontë|1847|416|9780141439556
Sense and Sensibility|Jane Austen|1811|409|9780141439662
Emma|Jane Austen|1815|474|9780141439587
Persuasion|Jane Austen|1818|249|9780141439686
Northanger Abbey|Jane Austen|1817|260|9780141439792
Great Expectations|Charles Dickens|1861|544|9780141439563
A Tale of Two Cities|Charles Dickens|1859|489|9780141439600
Oliver Twist|Charles Dickens|1838|554|9780141439747
David Copperfield|Charles Dickens|1850|882|9780140439441
Crime and Punishment|Fyodor Dostoevsky|1866|671|9780143058144
The Brothers Karamazov|Fyodor Dostoevsky|1880|796|9780374528379
Notes from Underground|Fyodor Dostoevsky|1864|136|9780679734529
War and Peace|Leo Tolstoy|1869|1225|9781400079988
Anna Karenina|Leo Tolstoy|1877|864|9780143035008
The Death of Ivan Ilyich|Leo Tolstoy|1886|86|9780553210354
One Hundred Years of Solitude|Gabriel García Márquez|1967|417|9780060883287
Love in the Time of Cholera|Gabriel García Márquez|1985|368|9780307389732
Don Quixote|Miguel de Cervantes|1605|992|9780060934347
The Count of Monte Cristo|Alexandre Dumas|1844|1276|9780140449266
Les Misérables|Victor Hugo|1862|1463|9780451419439
The Alchemist|Paulo Coelho|1988|197|9780062315007
The Little Prince|Antoine de Saint-Exupéry|1943|96|9780156012195
Moby-Dick|Herman Melville|1851|720|9780142437247
The Odyssey|Homer|-800|541|9780140268867
The Iliad|Homer|-750|683|9780140275360
Dune|Frank Herbert|1965|688|9780441013593
Dune Messiah|Frank Herbert|1969|337|9780593098233
Children of Dune|Frank Herbert|1976|444|9780593098240
Foundation|Isaac Asimov|1951|244|9780553293357
Foundation and Empire|Isaac Asimov|1952|247|9780553293371
Second Foundation|Isaac Asimov|1953|256|9780553293364
Neuromancer|William Gibson|1984|271|9780441569595
Snow Crash|Neal Stephenson|1992|480|9780553380958
The Left Hand of Darkness|Ursula K. Le Guin|1969|304|9780441478125
A Wizard of Earthsea|Ursula K. Le Guin|1968|183|9780547722023
Ender's Game|Orson Scott Card|1985|324|9780812550702
The Hitchhiker's Guide to the Galaxy|Douglas Adams|1979|224|9780345391803
Slaughterhouse-Five|Kurt Vonnegut|1969|275|9780440180296
Cat's Cradle|Kurt Vonnegut|1963|306|9780385333481
The Handmaid's Tale|Margaret Atwood|1985|311|9780385490818
Beloved|Toni Morrison|1987|324|9781400033416
Song of Solomon|Toni Morrison|1977|337|9781400033423
The Bluest Eye|Toni Morrison|1970|216|9780307278463
The Color Purple|Alice Walker|1982|295|9780156028356
Invisible Man|Ralph Ellison|1952|581|9780679732761
On the Road|Jack Kerouac|1957|307|9780140283297
The Bell Jar|Sylvia Plath|1963|288|9780060837020
Frankenstein|Mary Shelley|1818|280|9780141439471
Dracula|Bram Stoker|1897|488|9780141439846
The Picture of Dorian Gray|Oscar Wilde|1890|254|9780141439570
The Metamorphosis|Franz Kafka|1915|55|9780553213690
The Trial|Franz Kafka|1925|255|9780805209990
The Castle|Franz Kafka|1926|316|9780805211061
The Stranger|Albert Camus|1942|123|9780679720201
The Plague|Albert Camus|1947|308|9780679720218
The Myth of Sisyphus|Albert Camus|1942|212|9780525564454
Nausea|Jean-Paul Sartre|1938|253|9780811220309
Siddhartha|Hermann Hesse|1922|152|9780553208849
Steppenwolf|Hermann Hesse|1927|256|9780312278670
The Name of the Rose|Umberto Eco|1980|536|9780544176560
Catch-22|Joseph Heller|1961|453|9781451626650
Lord of the Flies|William Golding|1954|224|9780399501487
Brave New World Revisited|Aldous Huxley|1958|123|9780060898526
The Grapes of Wrath|John Steinbeck|1939|464|9780143039433
Of Mice and Men|John Steinbeck|1937|107|9780140186420
East of Eden|John Steinbeck|1952|601|9780142000656
The Old Man and the Sea|Ernest Hemingway|1952|127|9780684801223
A Farewell to Arms|Ernest Hemingway|1929|332|9780684801469
For Whom the Bell Tolls|Ernest Hemingway|1940|471|9780684803357
The Sun Also Rises|Ernest Hemingway|1926|251|9780743297332
The Road|Cormac McCarthy|2006|287|9780307387899
Blood Meridian|Cormac McCarthy|1985|337|9780679728757
No Country for Old Men|Cormac McCarthy|2005|309|9780375706677
Beloved|Toni Morrison|1987|324|9781400033416
Midnight's Children|Salman Rushdie|1981|536|9780812976533
The Satanic Verses|Salman Rushdie|1988|546|9780812976717
The God of Small Things|Arundhati Roy|1997|321|9780812979657
The Kite Runner|Khaled Hosseini|2003|371|9781594631931
A Thousand Splendid Suns|Khaled Hosseini|2007|372|9781594483851
Life of Pi|Yann Martel|2001|326|9780156027328
The Book Thief|Markus Zusak|2005|584|9780375842207
The Hunger Games|Suzanne Collins|2008|374|9780439023481
Catching Fire|Suzanne Collins|2009|391|9780439023498
Mockingjay|Suzanne Collins|2010|390|9780439023511
Divergent|Veronica Roth|2011|487|9780062024039
The Maze Runner|James Dashner|2009|375|9780385737951
The Fault in Our Stars|John Green|2012|313|9780142424179
Looking for Alaska|John Green|2005|221|9780142402511
The Perks of Being a Wallflower|Stephen Chbosky|1999|213|9781451696196
Eleanor & Park|Rainbow Rowell|2013|325|9781250012579
The Giver|Lois Lowry|1993|180|9780544336261
Ender's Shadow|Orson Scott Card|1999|469|9780812575712
The Name of the Wind|Patrick Rothfuss|2007|662|9780756404741
The Wise Man's Fear|Patrick Rothfuss|2011|994|9780756407919
A Game of Thrones|George R.R. Martin|1996|694|9780553573404
A Clash of Kings|George R.R. Martin|1998|761|9780553579901
A Storm of Swords|George R.R. Martin|2000|973|9780553573428
A Feast for Crows|George R.R. Martin|2005|753|9780553582024
A Dance with Dragons|George R.R. Martin|2011|1016|9780553582017
The Eye of the World|Robert Jordan|1990|782|9780812511819
The Way of Kings|Brandon Sanderson|2010|1007|9780765326355
Words of Radiance|Brandon Sanderson|2014|1087|9780765326362
Mistborn: The Final Empire|Brandon Sanderson|2006|541|9780765311788
The Final Empire|Brandon Sanderson|2006|541|9780765311788
Elantris|Brandon Sanderson|2005|496|9780765350374
Warbreaker|Brandon Sanderson|2009|592|9780765360038
The Lies of Locke Lamora|Scott Lynch|2006|499|9780553588941
American Gods|Neil Gaiman|2001|465|9780063081918
Good Omens|Neil Gaiman|1990|288|9780060853983
Coraline|Neil Gaiman|2002|162|9780380807345
Neverwhere|Neil Gaiman|1996|370|9780060557812
The Ocean at the End of the Lane|Neil Gaiman|2013|181|9780062255662
The Graveyard Book|Neil Gaiman|2008|312|9780060530945
Stardust|Neil Gaiman|1999|248|9780061689246
The Chronicles of Narnia|C.S. Lewis|1950|767|9780066238500
The Lion, the Witch and the Wardrobe|C.S. Lewis|1950|206|9780064404990
Watership Down|Richard Adams|1972|478|9780743277709
The Princess Bride|William Goldman|1973|456|9780156035217
The Neverending Story|Michael Ende|1979|396|9780140386332
His Dark Materials|Philip Pullman|1995|944|9780440238607
The Golden Compass|Philip Pullman|1995|399|9780440418320
Percy Jackson and the Lightning Thief|Rick Riordan|2005|377|9780786838653
Eragon|Christopher Paolini|2003|503|9780375826696
The Martian|Andy Weir|2011|369|9780553418026
Project Hail Mary|Andy Weir|2021|476|9780593135204
Ready Player One|Ernest Cline|2011|374|9780307887443
The Three-Body Problem|Cixin Liu|2008|400|9780765382030
The Dark Forest|Cixin Liu|2008|400|9780765386694
Death's End|Cixin Liu|2010|604|9780765386632
Hyperion|Dan Simmons|1989|482|9780553283686
The Expanse: Leviathan Wakes|James S.A. Corey|2011|561|9780316129084
Do Androids Dream of Electric Sheep?|Philip K. Dick|1968|210|9780345404473
The Man in the High Castle|Philip K. Dick|1962|259|9780547572482
2001: A Space Odyssey|Arthur C. Clarke|1968|297|9780451457998
Rendezvous with Rama|Arthur C. Clarke|1973|243|9780553287899
Childhood's End|Arthur C. Clarke|1953|224|9780345347510
The Dispossessed|Ursula K. Le Guin|1974|387|9780061054884
Contact|Carl Sagan|1985|432|9781501197987
Solaris|Stanislaw Lem|1961|204|9780156027601
Flowers for Algernon|Daniel Keyes|1966|311|9780156030083
The Time Machine|H.G. Wells|1895|118|9780451530707
The War of the Worlds|H.G. Wells|1898|192|9780141441030
Twenty Thousand Leagues Under the Sea|Jules Verne|1870|392|9780553213522
Around the World in Eighty Days|Jules Verne|1873|312|9780140449068
Journey to the Center of the Earth|Jules Verne|1864|183|9780140622461
Treasure Island|Robert Louis Stevenson|1883|292|9780141321004
The Adventures of Tom Sawyer|Mark Twain|1876|274|9780143039563
Adventures of Huckleberry Finn|Mark Twain|1884|366|9780143107323
The Secret Garden|Frances Hodgson Burnett|1911|331|9780064401883
Anne of Green Gables|Lucy Maud Montgomery|1908|320|9781402289286
Little Women|Louisa May Alcott|1868|449|9780147514011
Charlotte's Web|E.B. White|1952|184|9780064400558
Charlie and the Chocolate Factory|Roald Dahl|1964|162|9780142410318
Matilda|Roald Dahl|1988|240|9780142410370
James and the Giant Peach|Roald Dahl|1961|160|9780142410363
The BFG|Roald Dahl|1982|195|9780142410387
The Witches|Roald Dahl|1983|208|9780142410110
A Wrinkle in Time|Madeleine L'Engle|1962|256|9780312367541
The Phantom Tollbooth|Norton Juster|1961|256|9780394820378
Where the Wild Things Are|Maurice Sendak|1963|48|9780064431781
The Very Hungry Caterpillar|Eric Carle|1969|26|9780399226908
Green Eggs and Ham|Dr. Seuss|1960|62|9780394800165
Goodnight Moon|Margaret Wise Brown|1947|32|9780694003617
The Giving Tree|Shel Silverstein|1964|64|9780060256654
Where the Sidewalk Ends|Shel Silverstein|1974|176|9780060256678
The Da Vinci Code|Dan Brown|2003|454|9780307474278
Angels & Demons|Dan Brown|2000|713|9781416524793
Inferno|Dan Brown|2013|480|9781400079155
The Girl with the Dragon Tattoo|Stieg Larsson|2005|465|9780307454546
Gone Girl|Gillian Flynn|2012|415|9780307588371
The Silent Patient|Alex Michaelides|2019|325|9781250301697
The Girl on the Train|Paula Hawkins|2015|336|9781594634024
Big Little Lies|Liane Moriarty|2014|460|9780399587191
The Woman in the Window|A.J. Finn|2018|427|9780062678416
In the Woods|Tana French|2007|429|9780143113492
The Shining|Stephen King|1977|447|9780307743657
It|Stephen King|1986|1138|9781501142970
The Stand|Stephen King|1978|1153|9780307743688
Misery|Stephen King|1987|310|9781501143106
Pet Sematary|Stephen King|1983|374|9781501156700
Carrie|Stephen King|1974|199|9780307743664
Salem's Lot|Stephen King|1975|439|9780307743671
The Dark Tower: The Gunslinger|Stephen King|1982|224|9781501143519
11/22/63|Stephen King|2011|849|9781451627299
Doctor Sleep|Stephen King|2013|531|9781451698855
Interview with the Vampire|Anne Rice|1976|340|9780345337665
The Exorcist|William Peter Blatty|1971|385|9780061007224
Dracula|Bram Stoker|1897|488|9780141439846
Jurassic Park|Michael Crichton|1990|448|9780345538987
The Andromeda Strain|Michael Crichton|1969|295|9780060541811
World War Z|Max Brooks|2006|342|9780307346612
The Hunger Games|Suzanne Collins|2008|374|9780439023481
Sapiens|Yuval Noah Harari|2011|443|9780062316097
Homo Deus|Yuval Noah Harari|2015|448|9780062464316
21 Lessons for the 21st Century|Yuval Noah Harari|2018|372|9780525512196
A Brief History of Time|Stephen Hawking|1988|212|9780553380163
The Selfish Gene|Richard Dawkins|1976|360|9780198788607
Cosmos|Carl Sagan|1980|396|9780345539434
The Elegant Universe|Brian Greene|1999|448|9780393338102
Thinking, Fast and Slow|Daniel Kahneman|2011|499|9780374533557
Outliers|Malcolm Gladwell|2008|309|9780316017930
The Tipping Point|Malcolm Gladwell|2000|301|9780316346627
Blink|Malcolm Gladwell|2005|296|9780316010665
Freakonomics|Steven D. Levitt|2005|315|9780060731335
Guns, Germs, and Steel|Jared Diamond|1997|480|9780393354324
The Power of Habit|Charles Duhigg|2012|371|9780812981605
Atomic Habits|James Clear|2018|320|9780735211292
Deep Work|Cal Newport|2016|296|9781455586691
Digital Minimalism|Cal Newport|2019|284|9780525536512
The 7 Habits of Highly Effective People|Stephen Covey|1989|381|9781982137274
How to Win Friends and Influence People|Dale Carnegie|1936|291|9780671027032
Rich Dad Poor Dad|Robert Kiyosaki|1997|336|9781612680194
The Lean Startup|Eric Ries|2011|336|9780307887894
Zero to One|Peter Thiel|2014|224|9780804139298
The Hard Thing About Hard Things|Ben Horowitz|2014|304|9780062273208
Shoe Dog|Phil Knight|2016|386|9781501135927
Steve Jobs|Walter Isaacson|2011|656|9781451648539
Elon Musk|Walter Isaacson|2023|670|9781982181284
Einstein|Walter Isaacson|2007|704|9780743264747
Leonardo da Vinci|Walter Isaacson|2017|600|9781501139161
The Diary of a Young Girl|Anne Frank|1947|283|9780553296983
Night|Elie Wiesel|1956|120|9780374500016
Man's Search for Meaning|Viktor Frankl|1946|184|9780807014295
The Art of War|Sun Tzu|-500|68|9781590302255
Meditations|Marcus Aurelius|180|256|9780140449334
The Republic|Plato|-375|416|9780140455113
Thus Spoke Zarathustra|Friedrich Nietzsche|1883|352|9780140441185
Beyond Good and Evil|Friedrich Nietzsche|1886|240|9780140449235
Being and Time|Martin Heidegger|1927|589|9780061575594
The Prince|Niccolò Machiavelli|1532|140|9780140449150
Walden|Henry David Thoreau|1854|352|9780140390445
On Liberty|John Stuart Mill|1859|128|9780140432077
The Social Contract|Jean-Jacques Rousseau|1762|176|9780140442014
A Room of One's Own|Virginia Woolf|1929|112|9780156787338
Mrs Dalloway|Virginia Woolf|1925|194|9780156628709
To the Lighthouse|Virginia Woolf|1927|209|9780156907392
The Waves|Virginia Woolf|1931|297|9780156949606
Ulysses|James Joyce|1922|730|9780679722762
A Portrait of the Artist as a Young Man|James Joyce|1916|299|9780142437346
Dubliners|James Joyce|1914|152|9780140186475
The Sound and the Fury|William Faulkner|1929|326|9780679732242
As I Lay Dying|William Faulkner|1930|267|9780679732259
Absalom, Absalom!|William Faulkner|1936|313|9780679732181
Lolita|Vladimir Nabokov|1955|317|9780679723165
Pale Fire|Vladimir Nabokov|1962|315|9780679723424
One Flew Over the Cuckoo's Nest|Ken Kesey|1962|325|9780451163967
A Clockwork Orange|Anthony Burgess|1962|192|9780393312836
Infinite Jest|David Foster Wallace|1996|1079|9780316066525
White Noise|Don DeLillo|1985|326|9780140077025
The Wind-Up Bird Chronicle|Haruki Murakami|1994|607|9780679775430
Norwegian Wood|Haruki Murakami|1987|296|9780375704024
Kafka on the Shore|Haruki Murakami|2002|467|9781400079278
1Q84|Haruki Murakami|2009|925|9780307476463
Colorless Tsukuru Tazaki|Haruki Murakami|2013|386|9780385352109
The Remains of the Day|Kazuo Ishiguro|1989|245|9780679731726
Never Let Me Go|Kazuo Ishiguro|2005|288|9781400078776
Klara and the Sun|Kazuo Ishiguro|2021|303|9780593318171
The Unbearable Lightness of Being|Milan Kundera|1984|314|9780061148521
Blindness|José Saramago|1995|349|9780156007757
The Shadow of the Wind|Carlos Ruiz Zafón|2001|487|9780143034902
The House of the Spirits|Isabel Allende|1982|433|9781501117015
Pedro Páramo|Juan Rulfo|1955|124|9780802133908
Ficciones|Jorge Luis Borges|1944|174|9780802130303
2666|Roberto Bolaño|2004|898|9780312429218
The Savage Detectives|Roberto Bolaño|1998|577|9780312427481
My Brilliant Friend|Elena Ferrante|2011|331|9781609450786
Normal People|Sally Rooney|2018|266|9781984822178
Beautiful World, Where Are You|Sally Rooney|2021|356|9780374602604
Conversations with Friends|Sally Rooney|2017|321|9780451499066
The Goldfinch|Donna Tartt|2013|771|9780316055437
The Secret History|Donna Tartt|1992|559|9781400031702
A Little Life|Hanya Yanagihara|2015|720|9780385539265
The Vanishing Half|Brit Bennett|2020|343|9780525536291
Circe|Madeline Miller|2018|393|9780316556347
The Song of Achilles|Madeline Miller|2011|378|9780062060624
Piranesi|Susanna Clarke|2020|245|9781635575996
Jonathan Strange & Mr Norrell|Susanna Clarke|2004|782|9780765356154
Pachinko|Min Jin Lee|2017|490|9781455563920
Educated|Tara Westover|2018|334|9780399590504
Becoming|Michelle Obama|2018|426|9781524763138
The Autobiography of Malcolm X|Malcolm X|1965|500|9780345350688
Long Walk to Freedom|Nelson Mandela|1994|656|9780316548182
Born a Crime|Trevor Noah|2016|304|9780399588198
Just Kids|Patti Smith|2010|279|9780060936228
When Breath Becomes Air|Paul Kalanithi|2016|228|9780812988406
The Year of Magical Thinking|Joan Didion|2005|227|9781400078431
Crying in H Mart|Michelle Zauner|2021|239|9780525657743
Between the World and Me|Ta-Nehisi Coates|2015|176|9780451482211
The Fire Next Time|James Baldwin|1963|128|9780679744726
Giovanni's Room|James Baldwin|1956|169|9780345806567
Go Tell It on the Mountain|James Baldwin|1953|224|9780375701870
Their Eyes Were Watching God|Zora Neale Hurston|1937|219|9780061120060
I Know Why the Caged Bird Sings|Maya Angelou|1969|289|9780345514400
The Handmaid's Tale|Margaret Atwood|1985|311|9780385490818
Oryx and Crake|Margaret Atwood|2003|374|9780385721677
The Testaments|Margaret Atwood|2019|419|9780385543781
Atonement|Ian McEwan|2001|351|9780385721790
On Chesil Beach|Ian McEwan|2007|166|9780307386175
The Remains of the Day|Kazuo Ishiguro|1989|245|9780679731726
Wolf Hall|Hilary Mantel|2009|604|9780312429980
The Underground Railroad|Colson Whitehead|2016|306|9780385542364
Lincoln in the Bardo|George Saunders|2017|343|9780812995343
Tenth of December|George Saunders|2013|251|9780812984255
Where the Crawdads Sing|Delia Owens|2018|368|9780735219090
The Midnight Library|Matt Haig|2020|288|9780525559474
Anxious People|Fredrik Backman|2019|341|9781501160837
A Man Called Ove|Fredrik Backman|2012|337|9781476738024
The House in the Cerulean Sea|TJ Klune|2020|398|9781250217318
The Invisible Life of Addie LaRue|V.E. Schwab|2020|444|9780765387561
Mexican Gothic|Silvia Moreno-Garcia|2020|301|9780525620785
Hamnet|Maggie O'Farrell|2020|320|9780525657606
Shuggie Bain|Douglas Stuart|2020|430|9780802148049
Klara and the Sun|Kazuo Ishiguro|2021|303|9780593318171
The Seven Husbands of Evelyn Hugo|Taylor Jenkins Reid|2017|389|9781501139239
Daisy Jones & The Six|Taylor Jenkins Reid|2019|355|9781524798628
Malibu Rising|Taylor Jenkins Reid|2021|369|9781524798659
It Ends with Us|Colleen Hoover|2016|385|9781501110368
Verity|Colleen Hoover|2018|314|9781538724736
Ugly Love|Colleen Hoover|2014|322|9781476753188
Fourth Wing|Rebecca Yarros|2023|498|9781649374042
Iron Flame|Rebecca Yarros|2023|623|9781649374172
The Atlas Six|Olivie Blake|2020|374|9781250854513
Babel|R.F. Kuang|2022|545|9780063021426
The Poppy War|R.F. Kuang|2018|527|9780062662569
Yellowface|R.F. Kuang|2023|323|9780063250833
Tomorrow, and Tomorrow, and Tomorrow|Gabrielle Zevin|2022|401|9780593321201
Lessons in Chemistry|Bonnie Garmus|2022|390|9780385547345
The Personal Librarian|Marie Benedict|2021|368|9780593101544
Cloud Cuckoo Land|Anthony Doerr|2021|622|9781982168438
All the Light We Cannot See|Anthony Doerr|2014|531|9781501173219
The Nightingale|Kristin Hannah|2015|438|9780312577223
The Great Alone|Kristin Hannah|2018|432|9780312577230
The Four Winds|Kristin Hannah|2021|454|9781250178602
Before We Were Yours|Lisa Wingate|2017|352|9780425284681
The Alice Network|Kate Quinn|2017|530|9780062654199
The Rose Code|Kate Quinn|2021|642|9780063116795
Project Hail Mary|Andy Weir|2021|476|9780593135204
Klara and the Sun|Kazuo Ishiguro|2021|303|9780593318171
Anxious People|Fredrik Backman|2019|341|9781501160837
The Midnight Library|Matt Haig|2020|288|9780525559474
The Hitchhiker's Guide to the Galaxy|Douglas Adams|1979|224|9780345391803
Good Omens|Neil Gaiman|1990|288|9780060853983
Discworld: The Colour of Magic|Terry Pratchett|1983|288|9780062225672
Guards! Guards!|Terry Pratchett|1989|288|9780062225757
Small Gods|Terry Pratchett|1992|389|9780062237378
Going Postal|Terry Pratchett|2004|480|9780060502935
Mort|Terry Pratchett|1987|243|9780062225719
Wyrd Sisters|Terry Pratchett|1988|265|9780062225733
Night Watch|Terry Pratchett|2002|480|9780060013127
Good Omens|Neil Gaiman|1990|288|9780060853983
The Fifth Season|N.K. Jemisin|2015|468|9780316229296
The Obelisk Gate|N.K. Jemisin|2016|410|9780316229265
The Stone Sky|N.K. Jemisin|2017|398|9780316229241
Piranesi|Susanna Clarke|2020|245|9781635575996
The Priory of the Orange Tree|Samantha Shannon|2019|848|9781635570298
The Blade Itself|Joe Abercrombie|2006|515|9780316387316
Assassin's Apprentice|Robin Hobb|1995|435|9780553573398
The Wheel of Time: Eye of the World|Robert Jordan|1990|782|9780812511819
Gardens of the Moon|Steven Erikson|1999|496|9780765348784
The First Law|Joe Abercrombie|2006|515|9780316387316
Black Sun|Rebecca Roanhorse|2020|454|9781534437678
A Deadly Education|Naomi Novik|2020|336|9780593128480
Spinning Silver|Naomi Novik|2018|466|9780399180996
Uprooted|Naomi Novik|2015|435|9780804179058
The Bear and the Nightingale|Katherine Arden|2017|322|9781101885956
Circe|Madeline Miller|2018|393|9780316556347
The Song of Achilles|Madeline Miller|2011|378|9780062060624
The Starless Sea|Erin Morgenstern|2019|498|9780385541213
The Night Circus|Erin Morgenstern|2011|387|9780307744432
Station Eleven|Emily St. John Mandel|2014|333|9780385353304
Sea of Tranquility|Emily St. John Mandel|2022|255|9780593321447
The Glass Hotel|Emily St. John Mandel|2020|301|9780525521143
Recursion|Blake Crouch|2019|305|9781524759780
Dark Matter|Blake Crouch|2016|342|9781101904220
The 7½ Deaths of Evelyn Hardcastle|Stuart Turton|2018|432|9781492657965
And Then There Were None|Agatha Christie|1939|272|9780062073488
Murder on the Orient Express|Agatha Christie|1934|274|9780062073501
The Murder of Roger Ackroyd|Agatha Christie|1926|256|9780062073563
The Hound of the Baskervilles|Arthur Conan Doyle|1902|256|9780140437867
A Study in Scarlet|Arthur Conan Doyle|1887|107|9780140439083
Rebecca|Daphne du Maurier|1938|380|9780380730407
The Talented Mr. Ripley|Patricia Highsmith|1955|287|9780393332148
In Cold Blood|Truman Capote|1966|343|9780679745587
The Big Sleep|Raymond Chandler|1939|231|9780394758282
The Maltese Falcon|Dashiell Hammett|1930|217|9780679722649
The Long Goodbye|Raymond Chandler|1953|379|9780394757681
Fight Club|Chuck Palahniuk|1996|218|9780393327342
American Psycho|Bret Easton Ellis|1991|399|9780679735779
Trainspotting|Irvine Welsh|1993|344|9780393314809
Fear and Loathing in Las Vegas|Hunter S. Thompson|1971|204|9780679785897
Breakfast of Champions|Kurt Vonnegut|1973|303|9780385334204
Mother Night|Kurt Vonnegut|1961|268|9780385334143
Player Piano|Kurt Vonnegut|1952|341|9780385333788
The Sirens of Titan|Kurt Vonnegut|1959|326|9780385333498
Atlas Shrugged|Ayn Rand|1957|1168|9780451191144
The Fountainhead|Ayn Rand|1943|753|9780451191151
Zen and the Art of Motorcycle Maintenance|Robert M. Pirsig|1974|418|9780060839871
The Tao of Pooh|Benjamin Hoff|1982|158|9780140067477
Sophie's World|Jostein Gaarder|1991|518|9780374530716
The Alchemist|Paulo Coelho|1988|197|9780062315007
The Prophet|Kahlil Gibran|1923|107|9780394404288
Jonathan Livingston Seagull|Richard Bach|1970|127|9780743278904
The Celestine Prophecy|James Redfield|1993|247|9780446671002
Siddhartha|Hermann Hesse|1922|152|9780553208849
Demian|Hermann Hesse|1919|171|9780060931919
Narcissus and Goldmund|Hermann Hesse|1930|312|9780553275865
The Glass Bead Game|Hermann Hesse|1943|558|9780312278496`.split("\n").map(l=>{const p=l.split("|");return{title:p[0],author:p[1],year:parseInt(p[2])||null,pages:parseInt(p[3])||null,isbn:p[4]||null}});

/* ── Fuzzy search ── */
function fuzzyMatch(query, text) {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return 100 + (q.length / t.length) * 50; // substring match
  // word-start matching
  const words = q.split(/\s+/);
  let score = 0;
  for (const w of words) {
    if (t.includes(w)) score += 30 + w.length * 3;
    else {
      // prefix match on any word in text
      const tWords = t.split(/\s+/);
      for (const tw of tWords) { if (tw.startsWith(w)) { score += 15 + w.length * 2; break; } }
    }
  }
  return score;
}

function searchLocal(query) {
  if (!query || query.length < 2) return [];
  const results = [];
  const seen = new Set();
  for (const book of B) {
    const tScore = fuzzyMatch(query, book.title);
    const aScore = fuzzyMatch(query, book.author) * 0.8;
    const score = Math.max(tScore, aScore);
    if (score > 15) {
      const key = `${book.title}|${book.author}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({ ...book, score });
      }
    }
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 8).map((r, i) => ({
    olKey: `local-${r.isbn || r.title}-${i}`,
    title: r.title,
    author: r.author,
    year: r.year,
    pages: r.pages,
    isbn: r.isbn || null,
    cover: r.isbn ? `https://covers.openlibrary.org/b/isbn/${r.isbn}-L.jpg` : null,
  }));
}

/* ── Spine colors — wide variety ── */
const SPINE_COLORS = [
  "#4a6670","#c4785a","#e8c468","#6b8f71","#9b6b8a","#5478a0","#d4956a",
  "#7a9e82","#b87070","#5c7ca0","#c49858","#8b7eb8","#6a9480","#d48070",
  "#7888a0","#b8a060","#6b7860","#a06878","#5890a0","#c87868","#88a878",
  "#a0789c","#7098a0","#d0a058","#607888","#b87888","#689878","#987898",
  "#788898","#c88058","#608878","#8878a8","#a08868","#589080","#a87070",
  "#708058","#885888","#587898","#a89058","#786050","#906090","#609070",
];

const SPINE_TEXTURES = []; // unused — flat style

const STATUS = {
  want:     { label: "Want to Read", icon: "📋", color: "#c9a84c", bg: "rgba(200,168,76,.12)", ring: "rgba(200,168,76,.25)" },
  reading:  { label: "Reading",      icon: "📖", color: "#6a9f5b", bg: "rgba(106,159,91,.12)", ring: "rgba(106,159,91,.25)" },
  finished: { label: "Finished",     icon: "✓",  color: "#8a8ac4", bg: "rgba(138,138,196,.12)", ring: "rgba(138,138,196,.25)" },
};

function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); }

function spineWidth(pages, title) {
  if (pages && pages > 0) {
    const clamped = Math.max(80, Math.min(1200, pages));
    return Math.round(20 + (clamped - 80) * (32 / 1120));
  }
  return 26 + (hash(title) % 16);
}

/* ── Stars ── */
function Stars({ rating = 0, onChange, size = 20, interactive = true }) {
  const T = useTheme();
  const [hov, setHov] = useState(0);
  return (
    <div style={{ display: "flex", gap: 1 }} onMouseLeave={() => setHov(0)}>
      {[1,2,3,4,5].map(s => (
        <span key={s}
          onClick={() => interactive && onChange?.(rating === s ? 0 : s)}
          onMouseEnter={() => interactive && setHov(s)}
          style={{
            fontSize: size, cursor: interactive ? "pointer" : "default", lineHeight: 1,
            color: (hov || rating) >= s ? T.starColor : T.starOff,
            transition: "color .15s, transform .15s",
            transform: hov === s ? "scale(1.25)" : "scale(1)",
          }}
        >★</span>
      ))}
    </div>
  );
}

/* ── Book Spine — flat 2D vector style ── */
function BookSpine({ book, index, onClick }) {
  const scale = useScale();
  const T = useTheme();
  const h = hash(book.title + (book.author || ""));
  const color = SPINE_COLORS[h % SPINE_COLORS.length];
  const w = Math.round(spineWidth(book.pages, book.title) * scale);
  const hoverY = Math.round(8 * scale);
  const r = Math.round(3 * scale);

  // Decorative bands at FIXED positions (consistent across all books)
  const hasBand = h % 3 !== 0;
  const hasBand2 = h % 5 < 2;
  const accent = `rgba(255,255,255,${.12 + (h%3)*.05})`;

  return (
    <div style={{ flexShrink: 0, height: "100%",
      animation: `spineUp .4s cubic-bezier(.34,1.56,.64,1) ${index * .04}s both`,
    }}>
    <div className="book-spine" onClick={() => onClick(book)} style={{
      width: w, height: "100%", background: color,
      borderRadius: `${r}px`,
      position: "relative", cursor: "pointer",
      overflow: "hidden",
    }}
    >
      {/* Decorative bands — fixed positions so they align across books */}
      {hasBand && <div style={{ position:"absolute", left:"15%", right:"15%", top:"8%",
        height: Math.max(2, 2*scale), background: accent, borderRadius: 1 }}/>}
      {hasBand2 && <div style={{ position:"absolute", left:"15%", right:"15%", top:"88%",
        height: Math.max(2, 2*scale), background: accent, borderRadius: 1 }}/>}
      {/* Title — truncated well before bands */}
      <div style={{
        position:"absolute", top:"50%", left:"50%",
        transform:"translate(-50%,-50%) rotate(-90deg)",
        whiteSpace:"nowrap", fontSize: Math.min(10*scale, w * .28),
        fontFamily: T.bodyFont, fontWeight: 600,
        color: "rgba(255,255,255,.8)",
        letterSpacing: ".3px",
        maxWidth: Math.round(105*scale), overflow:"hidden", textOverflow:"ellipsis",
      }}>{book.title}</div>
    </div>
    </div>
  );
}


/* ── Book Cover — front-facing cover view ── */
function BookCover({ book, index, onClick }) {
  const scale = useScale();
  const T = useTheme();
  const h = hash(book.title + (book.author || ""));
  const color = SPINE_COLORS[h % SPINE_COLORS.length];
  const [imgErr, setImgErr] = useState(false);
  const coverH = Math.round(140 * scale);
  const coverW = Math.round(coverH * .667);
  const showCover = book.cover && !imgErr;

  return (
    <div style={{ flexShrink: 0, height: "100%", display: "flex", alignItems: "flex-end",
      animation: `spineUp .4s cubic-bezier(.34,1.56,.64,1) ${index * .04}s both`,
    }}>
    <div className="book-spine" onClick={() => onClick(book)} style={{
      width: coverW, height: coverH,
      borderRadius: `${Math.round(4 * scale)}px`,
      position: "relative", cursor: "pointer",
      overflow: "hidden", background: color,
    }}>
      {showCover && (
        <img src={book.cover} alt="" style={{
          width: "100%", height: "100%", objectFit: "cover", display: "block",
        }} onError={() => setImgErr(true)} />
      )}
      {!showCover && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: Math.round(6 * scale), gap: Math.round(4 * scale),
        }}>
          <span style={{
            fontSize: Math.min(11 * scale, coverW * .22),
            fontFamily: T.bodyFont, fontWeight: 600,
            color: "rgba(255,255,255,.85)",
            textAlign: "center", lineHeight: 1.25,
            overflow: "hidden", display: "-webkit-box",
            WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
          }}>{book.title}</span>
          {book.author && <span style={{
            fontSize: Math.min(8 * scale, coverW * .16),
            fontFamily: T.bodyFont, fontWeight: 400,
            color: "rgba(255,255,255,.55)",
            textAlign: "center", lineHeight: 1.2,
            overflow: "hidden", textOverflow: "ellipsis",
            whiteSpace: "nowrap", maxWidth: "100%",
          }}>{book.author}</span>}
        </div>
      )}
    </div>
    </div>
  );
}

/* ── Shelf ── */
function Shelf({ books, si, onBookClick, onAdd, isFirst, isLast, totalShelves, viewMode }) {
  const T = useTheme();
  const scale = useScale();
  const shelfH = Math.round(155 * scale);
  const r = Math.round(14 * scale);
  const radius = isFirst && isLast ? `${r}px` :
    isFirst ? `${r}px ${r}px 0 0` :
    isLast ? `0 0 ${r}px ${r}px` : '0';
  return (
    <div style={{ position:"relative" }}>
      <div style={{
        height: shelfH, padding: `${Math.round(8*scale)}px ${Math.round(12*scale)}px 0`,
        display: "flex", alignItems: "flex-end", gap: Math.round((viewMode === "cover" ? 6 : 3) * scale),
        cursor: books.length === 0 ? "pointer" : "default",
        position: "relative",
        background: `${T.wood}0a`,
        borderRadius: radius,
        overflow: "hidden",
      }} onClick={books.length === 0 ? onAdd : undefined}>
        {(books||[]).map((b, i) => viewMode === "cover"
          ? <BookCover key={b.id} book={b} index={i + si * 8} onClick={onBookClick} />
          : <BookSpine key={b.id} book={b} index={i + si * 8} onClick={onBookClick} />
        )}
      </div>
      {!isLast && <div data-shelf-plank style={{ height: Math.round(14 * scale) }}/>}
      {isLast && <div data-shelf-plank style={{ height: 0 }}/>}
    </div>
  );
}

/* ── Bookcase — dashed border with gap to shelf panels ── */
function Bookcase({ children }) {
  const T = useTheme();
  const scale = useScale();
  const inset = Math.round(14 * scale);
  const r = Math.round(22 * scale);

  return (
    <div data-bookcase style={{
      position: "relative",
      padding: inset,
    }}>
      <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}>
        <rect x="0.5" y="0.5" width="calc(100% - 1px)" height="calc(100% - 1px)"
          rx={r} ry={r} fill="none"
          stroke={T.wood} strokeWidth="1" strokeDasharray="14 10"
          strokeOpacity="0.45" strokeLinecap="round"/>
      </svg>
      {children}
    </div>
  );
}

function ManualAdd({ query, onAdd }) {
  const T = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState(query);
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState("");

  useEffect(() => { setTitle(query); }, [query]);

  const submit = () => {
    if (!title.trim()) return;
    onAdd({ title: title.trim(), author: author.trim(), year: null, pages: pages ? parseInt(pages) : null, cover: null });
    setAuthor(""); setPages("");
  };

  if (!expanded) return (
    <div style={{ padding:"8px 16px", borderTop:`1px solid ${T.divider}` }}>
      <button onClick={() => setExpanded(true)} style={{
        width:"100%", padding:"12px 16px", background:T.cardBg, border:`1px dashed ${T.cardBorder}`,
        borderRadius:T.cardRadius, cursor:"pointer", display:"flex", alignItems:"center",
        gap:10, fontFamily:T.bodyFont, fontSize:13, color:T.textSub,
      }}>
        <span style={{ fontSize:18, opacity:.5 }}>✏️</span>
        <span>Add <strong style={{ color:T.accentText }}>"{query}"</strong> manually</span>
      </button>
    </div>
  );

  return (
    <div style={{ padding:"12px 16px", borderTop:`1px solid ${T.divider}` }}>
      <div style={{ background:T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:T.cardRadius, padding:16 }}>
        <div style={{ fontSize:11, color:T.textMuted, marginBottom:10, textTransform:"uppercase", letterSpacing:".5px", fontWeight:600 }}>Add custom book</div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title"
          style={{ width:"100%", padding:"10px 12px", marginBottom:8, background:T.inputBg, border:`1px solid ${T.inputBorder}`,
            borderRadius:T.inputRadius, color:T.text, fontSize:14, fontFamily:T.bodyFont, outline:"none", boxSizing:"border-box" }}/>
        <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author (optional)"
          style={{ width:"100%", padding:"10px 12px", marginBottom:8, background:T.inputBg, border:`1px solid ${T.inputBorder}`,
            borderRadius:T.inputRadius, color:T.text, fontSize:14, fontFamily:T.bodyFont, outline:"none", boxSizing:"border-box" }}/>
        <input value={pages} onChange={e => setPages(e.target.value.replace(/\D/g,""))} placeholder="Pages (optional)" type="text" inputMode="numeric"
          style={{ width:"100%", padding:"10px 12px", marginBottom:12, background:T.inputBg, border:`1px solid ${T.inputBorder}`,
            borderRadius:T.inputRadius, color:T.text, fontSize:14, fontFamily:T.bodyFont, outline:"none", boxSizing:"border-box" }}/>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => setExpanded(false)} style={{ flex:1, padding:"10px", background:"none", border:`1px solid ${T.cardBorder}`,
            borderRadius:T.cardRadius, color:T.textMuted, fontSize:13, cursor:"pointer", fontFamily:T.bodyFont }}>Cancel</button>
          <button onClick={submit} style={{ flex:2, padding:"10px", background:T.accentSoft, border:`1px solid ${T.accentBorder}`,
            borderRadius:T.cardRadius, color:T.accentText, fontSize:13, cursor:"pointer", fontFamily:T.bodyFont, fontWeight:600 }}>Add to shelf</button>
        </div>
      </div>
    </div>
  );
}

/* ── Search Suggestion ── */
function SugItem({ item, onSelect, exists }) {
  const T = useTheme();
  return (
    <button onClick={() => onSelect(item)} style={{
      display:"flex", gap:10, padding:"10px 14px", width:"100%", textAlign:"left",
      background:"none", border:"none", borderBottom:`1px solid ${T.divider}`,
      cursor:"pointer", transition:"background .12s",
    }}
      onMouseEnter={e => e.currentTarget.style.background = T.cardBg}
      onMouseLeave={e => e.currentTarget.style.background = "none"}
    >
      {item.cover ? (
        <img src={item.cover} alt="" style={{ width:32, height:48, objectFit:"cover", borderRadius:3, flexShrink:0, background:"#2a2520" }}
          onError={e => { e.target.onerror=null; e.target.style.display="none"; e.target.nextSibling && (e.target.nextSibling.style.display="flex"); }}/>
      ) : null}
      <div style={{ width:32, height:48, borderRadius:3, flexShrink:0, background:T.inputBg, display:item.cover?"none":"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:T.textFaint }}>📖</div>
      <div style={{ minWidth:0, flex:1 }}>
        <div style={{ fontSize:14, color:T.text, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {item.title}
          {exists && <span style={{ fontSize:11, color:T.textMuted, marginLeft:6 }}>on shelf</span>}
        </div>
        <div style={{ fontSize:12, color:T.textSub, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {item.author || "Unknown author"}{item.year ? ` · ${item.year}` : ""}{item.pages ? ` · ${item.pages}p` : ""}
        </div>
      </div>
      <div style={{ alignSelf:"center", fontSize:16, color:T.accentText, opacity:.5, flexShrink:0 }}>+</div>
    </button>
  );
}

/* ── Book Detail Sheet ── */
function Detail({ book, onClose, onRemove, onUpdate, years, fetchCover }) {
  const T = useTheme();
  const screenW = useWidth();
  const isDesktop = screenW >= 900;
  useEffect(() => { if (book) fetchCover(book); }, [book, fetchCover]);
  if (!book) return null;
  const tSC = T.statusColors || {};
  const sc = tSC[book.status] || STATUS[book.status] || STATUS.want;
  const curYear = new Date().getFullYear();
  const bookYear = book.shelfYear || curYear;
  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, background:T.overlayBg, backdropFilter:"blur(8px)",
      zIndex:100, display:"flex", alignItems:isDesktop?"center":"flex-end", justifyContent:"center",
      animation:"fadeIn .15s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:T.sheetBg,
        borderRadius:isDesktop?`${T.sheetRadius}px`:`${T.sheetRadius}px ${T.sheetRadius}px 0 0`,
        padding:isDesktop?"28px 28px 32px":"22px 22px 36px",
        width:"100%", maxWidth:isDesktop?480:440, maxHeight:isDesktop?"80vh":"85vh", overflowY:"auto",
        border:`1px solid ${T.cardBorder}`, borderBottom:isDesktop?`1px solid ${T.cardBorder}`:"none",
        animation:"sheetUp .28s cubic-bezier(.34,1.15,.64,1)",
      }}>
        <div style={{ width:36, height:4, background:T.textFaint, borderRadius:2, margin:"0 auto 18px" }}/>

        <div style={{ display:"flex", gap:16 }}>
          {book.cover ? (
            <img src={book.cover} alt="" style={{ width:85, height:128, objectFit:"cover", borderRadius:6, flexShrink:0, background:SPINE_COLORS[hash(book.title)%SPINE_COLORS.length] }}
              onError={e => { e.target.onerror=null; e.target.src=""; e.target.style.display="none"; e.target.nextSibling && (e.target.nextSibling.style.display="flex"); }}/>
          ) : null}
          <div style={{ width:85, height:128, borderRadius:6, flexShrink:0, background:SPINE_COLORS[hash(book.title)%SPINE_COLORS.length], display:book.cover?"none":"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:28 }}>📕</span>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <h3 style={{ margin:0, fontSize:18, fontFamily:T.headingFont, fontWeight:700, color:T.text, lineHeight:1.3 }}>{book.title}</h3>
            <p style={{ margin:"5px 0 0", fontSize:14, color:T.textSub }}>{book.author || "Unknown author"}</p>
            {(book.year || book.pages) && <p style={{ margin:"3px 0 0", fontSize:12, color:T.textMuted }}>{book.year || ""}{book.year && book.pages ? " · " : ""}{book.pages ? `${book.pages} pages` : ""}</p>}
            <div style={{ marginTop:10 }}><Stars rating={book.rating||0} onChange={r => onUpdate(book.id, { rating: r })} size={22}/></div>
          </div>
        </div>

        <div style={{ display:"flex", gap:6, marginTop:18 }}>
          {Object.entries(STATUS).map(([k, v]) => (
            <button key={k} onClick={() => onUpdate(book.id, { status: k })} style={{
              flex:1, padding:"10px 4px", borderRadius:T.cardRadius, cursor:"pointer", textAlign:"center",
              background: book.status === k ? (tSC[k]?.bg||v.bg) : T.cardBg,
              border: `1.5px solid ${book.status === k ? (tSC[k]?.ring||v.ring) : T.cardBorder}`,
              color: book.status === k ? (tSC[k]?.color||v.color) : T.textMuted,
              fontSize:12, fontWeight: book.status===k ? 600 : 400, fontFamily:T.bodyFont,
              transition:"all .2s",
            }}>
              <span style={{ fontSize:15, display:"block", marginBottom:2 }}>{v.icon}</span>
              {v.label}
            </button>
          ))}
        </div>

        {/* Year / Shelf picker */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:14 }}>
          <span style={{ fontSize:11, color:T.textMuted, fontWeight:500 }}>Shelf</span>
          <select value={bookYear} onChange={e => onUpdate(book.id, { shelfYear: parseInt(e.target.value) })} style={{
            padding:"6px 10px", borderRadius:T.inputRadius, fontSize:14,
            background:T.inputBg, border:`1px solid ${T.inputBorder}`,
            color:T.accentText, fontFamily:T.headingFont, fontWeight:600,
            outline:"none", cursor:"pointer", WebkitAppearance:"auto",
          }}>
            {Array.from({length:30},(_,i)=>curYear-i).map(y=>(
              <option key={y} value={y} style={{background:T.optionBg,color:T.accentText}}>{y}</option>
            ))}
          </select>
        </div>

        <textarea placeholder="Add a note about this book..."
          value={book.notes||""} onChange={e => onUpdate(book.id, { notes: e.target.value })}
          style={{
            width:"100%", marginTop:14, padding:"12px 14px", borderRadius:12,
            background:T.cardBg, border:`1px solid ${T.cardBorder}`, color:T.text,
            fontSize:13, fontFamily:T.bodyFont, outline:"none",
            resize:"vertical", minHeight:56, maxHeight:130, lineHeight:1.5,
          }}
        />

        {book.addedAt && <p style={{ margin:"12px 0 0", fontSize:11, color:T.textFaint, textAlign:"center" }}>Added {new Date(book.addedAt).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</p>}

        <div style={{ display:"flex", gap:8, marginTop:14, alignItems:"center" }}>
          <button onClick={onClose} style={{
            flex:1, padding:"11px",
            background:T.accentSoft, border:`1px solid ${T.accentBorder}`,
            borderRadius:T.cardRadius, color:T.accentText, fontSize:13, cursor:"pointer",
            fontFamily:T.bodyFont, fontWeight:600,
          }}>Done</button>
          <button onClick={() => { if(confirm("Remove this book from your shelf?")){ onRemove(book.id); onClose(); }}} title="Remove from shelf" style={{
            width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center",
            background:T.dangerBg, border:`1px solid ${T.dangerBorder}`,
            borderRadius:T.cardRadius, color:T.dangerText, fontSize:15, cursor:"pointer",
            flexShrink:0, transition:"opacity .2s", opacity:.7,
          }}
          onMouseEnter={e => e.currentTarget.style.opacity="1"}
          onMouseLeave={e => e.currentTarget.style.opacity=".7"}
          >🗑</button>
        </div>
      </div>
    </div>
  );
}

/* ── Stats ── */
function AnimNum({ val, duration = 800, format }) {
  const [display, setDisplay] = useState(typeof val === "number" ? 0 : val);
  useEffect(() => {
    const numVal = typeof val === "number" ? val : parseFloat(String(val));
    if (isNaN(numVal) || val === "—") { setDisplay(val); return; }
    const isFloat = String(val).includes(".");
    let start = null, raf;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / duration);
      const ease = 1 - Math.pow(1 - p, 3);
      const cur = numVal * ease;
      setDisplay(isFloat ? cur.toFixed(1) : format ? Math.round(cur).toLocaleString() : Math.round(cur));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [val]);
  return <>{display}</>;
}

function Stats({ books, label }) {
  const T = useTheme();
  const total = books.length;
  const fin = books.filter(b => b.status==="finished").length;
  const rdg = books.filter(b => b.status==="reading").length;
  const wnt = books.filter(b => b.status==="want").length;
  const rated = books.filter(b => b.rating > 0);
  const avg = rated.length ? (rated.reduce((s,b) => s+b.rating, 0)/rated.length).toFixed(1) : "—";
  const pgs = books.filter(b => b.status==="finished").reduce((s,b) => s+(b.pages||0), 0);
  const rDist = [0,0,0,0,0]; rated.forEach(b => rDist[b.rating-1]++);
  const maxRD = Math.max(1,...rDist);
  const [barsVisible, setBarsVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setBarsVisible(true), 300); return () => clearTimeout(t); }, []);

  const Card = ({ emoji, val, label, accent, delay = 0, fmt }) => (
    <div style={{ flex:1, background:T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:T.cardRadius, padding:"18px 8px", textAlign:"center",
      animation:`fadeUp .5s ease ${delay}s both` }}>
      <div style={{ fontSize:16, marginBottom:6, opacity:.7 }}>{emoji}</div>
      <div style={{ fontSize:40, fontWeight:400, fontStyle:"italic", fontFamily:T.headingFont, color: accent || T.accentText, lineHeight:1, letterSpacing:"-1px" }}><AnimNum val={val} format={fmt}/></div>
      <div style={{ fontSize:10, color:T.textMuted, marginTop:6, fontFamily:T.bodyFont, fontWeight:500, letterSpacing:".5px", textTransform:"uppercase" }}>{label}</div>
    </div>
  );

  return (
    <div style={{ padding:"4px 4px", maxWidth:600, margin:"0 auto" }}>
      {label && <div style={{ fontSize:11, color:T.textMuted, marginBottom:10, fontWeight:600, letterSpacing:".5px", textTransform:"uppercase", textAlign:"center" }}>{label} Stats</div>}
      <div style={{ display:"flex", gap:8, marginBottom:10 }}>
        <Card emoji="📚" val={total} label="Total" delay={0}/>
        <Card emoji="✓" val={fin} label="Finished" accent={T.statusColors?.finished?.color || "#8a8ac4"} delay={.05}/>
        <Card emoji="📖" val={rdg} label="Reading" accent={T.statusColors?.reading?.color || "#6a9f5b"} delay={.1}/>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:18 }}>
        <Card emoji="⭐" val={avg} label="Avg Rating" delay={.15}/>
        <Card emoji="📄" val={pgs>0?pgs:"—"} label="Pages Read" fmt delay={.2}/>
        <Card emoji="📋" val={wnt} label="Want to Read" accent={T.statusColors?.want?.color || "#c9a84c"} delay={.25}/>
      </div>
      {rated.length > 0 && (
        <div style={{ background:T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:T.cardRadius, padding:16,
          animation:"fadeUp .5s ease .3s both" }}>
          <div style={{ fontSize:11, color:T.textMuted, marginBottom:12, fontWeight:600, letterSpacing:".5px", textTransform:"uppercase" }}>Rating Distribution</div>
          <div style={{ display:"flex", gap:8, alignItems:"flex-end", height:56 }}>
            {rDist.map((c,i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                {c > 0 && <div style={{ fontSize:10, color:T.textMuted, fontWeight:600 }}>{c}</div>}
                <div style={{ width:"100%", borderRadius:6,
                  height: barsVisible ? Math.max(6, (c/maxRD)*44) : 0,
                  background:`${T.barBg}${.15+i*.12})`,
                  transition:`height .6s cubic-bezier(.34,1.4,.64,1) ${.35+i*.08}s` }}/>
                <div style={{ fontSize:10, color:T.textFaint }}>{i+1}★</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {total===0 && <div style={{ textAlign:"center", padding:"30px 20px" }}><div style={{ fontSize:36, marginBottom:8, opacity:.3 }}>📊</div><p style={{ color:T.textMuted, fontSize:13 }}>Add books to see your reading stats</p></div>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   DECORATION SYSTEM
   ═══════════════════════════════════════════ */
const DECO_CATALOG = [
  { cat: "Plants", items: [
    { id: "plant-1", emoji: "🪴", label: "Potted Plant" },
    { id: "plant-2", emoji: "🌵", label: "Cactus" },
    { id: "plant-3", emoji: "🌿", label: "Fern" },
    { id: "plant-4", emoji: "🌱", label: "Sprout" },
    { id: "plant-5", emoji: "🍀", label: "Clover" },
    { id: "plant-6", emoji: "🌸", label: "Blossom" },
    { id: "plant-7", emoji: "🌻", label: "Sunflower" },
    { id: "plant-8", emoji: "🌷", label: "Tulip" },
  ]},
  { cat: "Lighting", items: [
    { id: "light-1", emoji: "🕯️", label: "Candle" },
    { id: "light-2", emoji: "💡", label: "Bulb" },
    { id: "light-3", emoji: "🔮", label: "Crystal Ball" },
    { id: "light-4", emoji: "⭐", label: "Star" },
    { id: "light-5", emoji: "🌙", label: "Moon" },
    { id: "light-6", emoji: "✨", label: "Sparkles" },
  ]},
  { cat: "Figures", items: [
    { id: "fig-1", emoji: "🐱", label: "Cat" },
    { id: "fig-2", emoji: "🦉", label: "Owl" },
    { id: "fig-3", emoji: "🐉", label: "Dragon" },
    { id: "fig-4", emoji: "🧸", label: "Teddy Bear" },
    { id: "fig-5", emoji: "🎭", label: "Masks" },
    { id: "fig-6", emoji: "🗿", label: "Statue" },
    { id: "fig-7", emoji: "🦊", label: "Fox" },
    { id: "fig-8", emoji: "🐸", label: "Frog" },
    { id: "fig-9", emoji: "🦋", label: "Butterfly" },
  ]},
  { cat: "Objects", items: [
    { id: "obj-1", emoji: "☕", label: "Coffee" },
    { id: "obj-2", emoji: "🍵", label: "Tea" },
    { id: "obj-3", emoji: "⏰", label: "Clock" },
    { id: "obj-4", emoji: "🌍", label: "Globe" },
    { id: "obj-5", emoji: "🎵", label: "Music" },
    { id: "obj-6", emoji: "📷", label: "Camera" },
    { id: "obj-7", emoji: "🧭", label: "Compass" },
    { id: "obj-8", emoji: "⌛", label: "Hourglass" },
    { id: "obj-9", emoji: "🎨", label: "Palette" },
    { id: "obj-10", emoji: "✒️", label: "Pen" },
  ]},
  { cat: "Cozy", items: [
    { id: "cozy-1", emoji: "🧶", label: "Yarn" },
    { id: "cozy-2", emoji: "🧣", label: "Scarf" },
    { id: "cozy-3", emoji: "🎀", label: "Ribbon" },
    { id: "cozy-4", emoji: "🏠", label: "House" },
    { id: "cozy-5", emoji: "🪵", label: "Log" },
    { id: "cozy-6", emoji: "🕰️", label: "Mantel Clock" },
  ]},
  { cat: "Seasonal", items: [
    { id: "sea-1", emoji: "🎃", label: "Pumpkin" },
    { id: "sea-2", emoji: "❄️", label: "Snowflake" },
    { id: "sea-3", emoji: "🎄", label: "Tree" },
    { id: "sea-4", emoji: "💝", label: "Heart Gift" },
    { id: "sea-5", emoji: "🎊", label: "Confetti" },
    { id: "sea-6", emoji: "🌈", label: "Rainbow" },
    { id: "sea-7", emoji: "🎁", label: "Gift" },
    { id: "sea-8", emoji: "🧧", label: "Red Envelope" },
  ]},
  { cat: "Spooky", items: [
    { id: "spk-1", emoji: "💀", label: "Skull" },
    { id: "spk-2", emoji: "👻", label: "Ghost" },
    { id: "spk-3", emoji: "🕷️", label: "Spider" },
    { id: "spk-4", emoji: "🕸️", label: "Web" },
    { id: "spk-5", emoji: "🦇", label: "Bat" },
    { id: "spk-6", emoji: "🧛", label: "Vampire" },
    { id: "spk-7", emoji: "⚰️", label: "Coffin" },
    { id: "spk-8", emoji: "🪦", label: "Gravestone" },
    { id: "spk-9", emoji: "🔥", label: "Fire" },
    { id: "spk-10", emoji: "🐍", label: "Snake" },
  ]},
];

function DecoCatalog({ onAdd, onClose }) {
  const T = useTheme();
  const [cat, setCat] = useState(DECO_CATALOG[0].cat);
  const items = DECO_CATALOG.find(c => c.cat === cat)?.items || [];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,.6)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 480, maxHeight: "70vh",
        background: T.surface, borderRadius: "20px 20px 0 0",
        padding: "16px 0 24px", display: "flex", flexDirection: "column",
        animation: "sheetUp .3s ease both",
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: T.textMuted, margin: "0 auto 12px", opacity: .4 }}/>

        <div style={{ padding: "0 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: T.headingFont, fontSize: 18, fontWeight: 600, color: T.accentText }}>Add Decoration</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.textMuted, fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        {/* Category tabs */}
        <div style={{ display: "flex", gap: 4, padding: "0 16px 12px", overflowX: "auto", flexShrink: 0 }}>
          {DECO_CATALOG.map(c => (
            <button key={c.cat} onClick={() => setCat(c.cat)} style={{
              padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 500, fontFamily: T.bodyFont, whiteSpace: "nowrap",
              background: cat === c.cat ? T.accent + "22" : "transparent",
              color: cat === c.cat ? T.accentText : T.textSub,
              transition: ".15s",
            }}>{c.cat}</button>
          ))}
        </div>

        {/* Items grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, padding: "0 16px", overflowY: "auto" }}>
          {items.map(item => (
            <button key={item.id} onClick={() => { onAdd(item); onClose(); }} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              padding: "12px 4px", background: T.cardBg, border: `1px solid ${T.cardBorder}`,
              borderRadius: T.cardRadius || 12, cursor: "pointer",
              transition: "all .15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = T.accent + "15"; e.currentTarget.style.transform = "scale(1.05)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = T.cardBg; e.currentTarget.style.transform = ""; }}
            >
              <span style={{ fontSize: 28 }}>{item.emoji}</span>
              <span style={{ fontSize: 10, color: T.textSub }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DraggableDecoration({ deco, onMove, onRemove, selected, onSelect, containerRef }) {
  const [dragging, setDragging] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);
  const DRAG_THRESHOLD = 5;

  const handleStart = useCallback((clientX, clientY) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    offsetRef.current = {
      x: clientX - rect.left - (deco.x / 100) * rect.width,
      y: clientY - rect.top - (deco.y / 100) * rect.height,
    };
    startPos.current = { x: clientX, y: clientY };
    didDrag.current = false;
    setDragging(true);
  }, [deco.x, deco.y, containerRef]);

  const handleMove = useCallback((clientX, clientY) => {
    if (!dragging) return;
    if (!didDrag.current) {
      const dx = clientX - startPos.current.x;
      const dy = clientY - startPos.current.y;
      if (dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) return;
      didDrag.current = true;
    }
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    let x = ((clientX - rect.left - offsetRef.current.x) / rect.width) * 100;
    let y = ((clientY - rect.top - offsetRef.current.y) / rect.height) * 100;
    x = Math.max(-2, Math.min(98, x));
    y = Math.max(-2, Math.min(98, y));
    const SNAP_PX = 18;
    const emojiH = 88;

    // Snap to shelf plank tops (horizontal)
    const shelves = container.querySelectorAll("[data-shelf-plank]");
    if (shelves.length > 0) {
      const absY = (y / 100) * rect.height;
      let bestSnapY = null;
      let bestDist = Infinity;
      shelves.forEach(plank => {
        const pr = plank.getBoundingClientRect();
        const plankTop = pr.top - rect.top;
        const snapCenter = plankTop - emojiH / 2;
        const dist = Math.abs(absY - snapCenter);
        if (dist < SNAP_PX && dist < bestDist) {
          bestDist = dist;
          bestSnapY = (snapCenter / rect.height) * 100;
        }
      });
      if (bestSnapY !== null) y = bestSnapY;
    }

    // Snap to bookcase edges (left, right, top, bottom)
    const bookcase = container.querySelector("[data-bookcase]");
    if (bookcase) {
      const br = bookcase.getBoundingClientRect();
      const absX = (x / 100) * rect.width;
      const absY2 = (y / 100) * rect.height;
      // Left inner edge
      const leftEdge = br.left - rect.left + emojiH / 2;
      if (Math.abs(absX - leftEdge) < SNAP_PX) x = (leftEdge / rect.width) * 100;
      // Right inner edge
      const rightEdge = br.right - rect.left - emojiH / 2;
      if (Math.abs(absX - rightEdge) < SNAP_PX) x = (rightEdge / rect.width) * 100;
      // Top inner edge
      const topEdge = br.top - rect.top + emojiH / 2;
      if (Math.abs(absY2 - topEdge) < SNAP_PX) y = (topEdge / rect.height) * 100;
      // Bottom inner edge
      const botEdge = br.bottom - rect.top - emojiH / 2;
      if (Math.abs(absY2 - botEdge) < SNAP_PX) y = (botEdge / rect.height) * 100;
    }

    onMove(deco.uid, x, y);
  }, [dragging, deco.uid, onMove, containerRef]);

  const handleEnd = useCallback(() => {
    setDragging(false);
    if (!didDrag.current) {
      onSelect(selected ? null : deco.uid);
    }
  }, [deco.uid, selected, onSelect]);

  useEffect(() => {
    if (!dragging) return;
    const mm = (e) => { e.preventDefault(); handleMove(e.clientX, e.clientY); };
    const mu = () => handleEnd();
    const tm = (e) => { e.preventDefault(); handleMove(e.touches[0].clientX, e.touches[0].clientY); };
    const te = () => handleEnd();
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", mu);
    window.addEventListener("touchmove", tm, { passive: false });
    window.addEventListener("touchend", te);
    return () => {
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", mu);
      window.removeEventListener("touchmove", tm);
      window.removeEventListener("touchend", te);
    };
  }, [dragging, handleMove, handleEnd]);

  const scale = deco.scale || 1;
  const realDragging = dragging && didDrag.current;

  return (
    <div
      data-decoration-uid={deco.uid}
      onMouseDown={e => { e.preventDefault(); e.stopPropagation(); handleStart(e.clientX, e.clientY); }}
      onTouchStart={e => { e.stopPropagation(); handleStart(e.touches[0].clientX, e.touches[0].clientY); }}
      style={{
        position: "absolute",
        left: `${deco.x}%`, top: `${deco.y}%`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        fontSize: 88, lineHeight: 1,
        cursor: realDragging ? "grabbing" : "grab",
        zIndex: realDragging ? 100 : (deco.z || 10),
        userSelect: "none", WebkitUserSelect: "none",
        filter: "none",
        transition: realDragging ? "none" : "filter .2s, top .15s, left .15s",
        outline: selected && !realDragging ? "2px solid rgba(201,185,138,.5)" : "none",
        outlineOffset: 4,
        borderRadius: 8,
        pointerEvents: "auto",
      }}
    >
      {deco.emoji}
      {selected && !realDragging && (
        <button
          onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); onRemove(deco.uid); }}
          onTouchStart={(e) => { e.stopPropagation(); e.preventDefault(); onRemove(deco.uid); }}
          style={{
            position: "absolute", top: -6, right: -6,
            width: 26, height: 26, borderRadius: 13,
            background: "#e53935", border: "2px solid #fff", color: "#fff",
            fontSize: 13, lineHeight: 1, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            
          }}>✕</button>
      )}
    </div>
  );
}

function DecorationOverlay({ decorations, setDecorations, containerRef }) {
  const [selectedUid, setSelectedUid] = useState(null);

  const handleMove = useCallback((uid, x, y) => {
    setDecorations(prev => prev.map(d => d.uid === uid ? { ...d, x, y } : d));
  }, [setDecorations]);

  const handleRemove = useCallback((uid) => {
    setDecorations(prev => prev.filter(d => d.uid !== uid));
    setSelectedUid(null);
  }, [setDecorations]);

  // Delete/Backspace removes selected decoration
  useEffect(() => {
    if (!selectedUid) return;
    const handler = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        e.preventDefault();
        handleRemove(selectedUid);
      }
      if (e.key === "Escape") setSelectedUid(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedUid, handleRemove]);

  return (
    <>
      {/* When a decoration is selected, show a full overlay that catches clicks to deselect.
          This prevents clicks from reaching the shelf "add book" handler underneath. */}
      {selectedUid && (
        <div
          onClick={(e) => { e.stopPropagation(); setSelectedUid(null); }}
          style={{ position: "absolute", inset: 0, zIndex: 4, cursor: "default" }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }}>
        {(decorations||[]).map(d => (
          <DraggableDecoration
            key={d.uid}
            deco={d}
            onMove={handleMove}
            onRemove={handleRemove}
            selected={selectedUid === d.uid}
            onSelect={setSelectedUid}
            containerRef={containerRef}
          />
        ))}
      </div>
    </>
  );
}




/* ═══════════════════════════════════════════
   Landing Page — shown when not signed in
   ═══════════════════════════════════════════ */
function LandingPage({ signIn }) {
  const [hovered, setHovered] = useState(false);
  const screenW = useWidth();
  const isMobile = screenW < 600;

  return (
    <div style={{
      minHeight: "100vh", background: "#0e0c09",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', sans-serif", color: "#e8dcc8",
      padding: isMobile ? "40px 24px" : "40px",
      position: "relative", overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes float { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-8px) rotate(1deg); } }
        @keyframes float2 { 0%,100% { transform: translateY(0) rotate(3deg); } 50% { transform: translateY(-6px) rotate(-1deg); } }
        @keyframes float3 { 0%,100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-10px) rotate(2deg); } }
      `}</style>

      {/* Decorative floating book spines */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.07 }}>
        {[
          { left: "8%", top: "15%", w: 28, h: 120, bg: "#c9a96e", anim: "float 6s ease-in-out infinite" },
          { left: "15%", top: "60%", w: 24, h: 100, bg: "#8b6b4a", anim: "float2 7s ease-in-out infinite 1s" },
          { right: "10%", top: "20%", w: 30, h: 130, bg: "#a0522d", anim: "float3 5.5s ease-in-out infinite .5s" },
          { right: "18%", top: "65%", w: 22, h: 90, bg: "#6b4423", anim: "float 8s ease-in-out infinite 2s" },
          { left: "35%", top: "8%", w: 26, h: 110, bg: "#d4a853", anim: "float2 6.5s ease-in-out infinite 1.5s" },
          { right: "30%", top: "80%", w: 20, h: 85, bg: "#8b7355", anim: "float3 7.5s ease-in-out infinite .8s" },
        ].map((b, i) => (
          <div key={i} style={{
            position: "absolute", ...b, width: b.w, height: b.h,
            background: b.bg, borderRadius: 3, animation: b.anim,
          }}/>
        ))}
      </div>

      {/* Content */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        maxWidth: 440, textAlign: "center", position: "relative", zIndex: 1,
      }}>
        {/* Icon */}
        <div style={{
          fontSize: isMobile ? 56 : 72, lineHeight: 1,
          marginBottom: 24,
          animation: "fadeUp .6s ease-out both",
        }}>📚</div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: isMobile ? 36 : 48, fontWeight: 400, fontStyle: "italic",
          color: "#e8dcc8", letterSpacing: "-0.5px",
          lineHeight: 1.15, marginBottom: 12,
          animation: "fadeUp .6s ease-out .1s both",
        }}>
          Your Bookshelf,{" "}
          <span style={{
            background: "linear-gradient(135deg, #c9a96e 0%, #e8d5a8 40%, #c9a96e 60%, #a07e4f 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            animation: "shimmer 4s linear infinite",
          }}>Anywhere</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: isMobile ? 15 : 17, color: "rgba(200,180,150,.55)",
          lineHeight: 1.6, marginBottom: 36, maxWidth: 360,
          animation: "fadeUp .6s ease-out .2s both",
        }}>
          Track what you read, build your collection, and see your shelves come to life — synced across all your devices.
        </p>

        {/* Sign in button */}
        <button
          onClick={signIn}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "14px 32px",
            background: hovered
              ? "linear-gradient(135deg, #c9a96e, #a07e4f)"
              : "linear-gradient(135deg, #b8943d, #8b6b2a)",
            border: "none", borderRadius: 14,
            color: "#0e0c09", fontSize: 16, fontWeight: 600,
            fontFamily: "'Inter', sans-serif",
            cursor: "pointer",
            transform: hovered ? "scale(1.03)" : "scale(1)",

            transition: "all .2s ease",
            animation: "fadeUp .6s ease-out .35s both",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#0e0c09" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#0e0c09" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#0e0c09" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#0e0c09" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Footer note */}
        <p style={{
          fontSize: 12, color: "rgba(200,180,150,.3)",
          marginTop: 24,
          animation: "fadeUp .6s ease-out .45s both",
        }}>
          Free forever · Your data stays private
        </p>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════
   Main App
   ═══════════════════════════════════════════ */
export default function App() {
  const {
    books, setBooks, addBook: shelfAddBook, removeBook, updateBook,
    themeId, setThemeId: changeTheme, shelfName, setShelfName,
    decorations, setDecorations,
    loading: dataLoading, user, signIn, signOut, isCloud,
  } = useShelfData();
  const loaded = !dataLoading;
  const [showProfile, setShowProfile] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [showDecoCatalog, setShowDecoCatalog] = useState(false);
  const [shelfView, setShelfView] = useState("spine"); // "spine" | "cover"
  const nameInputRef = useRef(null);
  const bookcaseRef = useRef(null);
  const T = THEMES[themeId] || THEMES.light;
  const screenW = useWidth();
  const isDesktop = screenW >= 900;
  const isTablet = screenW >= 600 && screenW < 900;
  const isMobile = screenW < 600;
  const contentMax = isDesktop ? 1400 : isTablet ? 720 : 480;
  const shelfScale = isDesktop ? 1.8 : isTablet ? 1.35 : 1;

  const [query, setQuery] = useState("");
  const [sugs, setSugs] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [addYear, setAddYear] = useState(new Date().getFullYear());
  const [addStatus, setAddStatus] = useState(() => {
    try { return localStorage.getItem("shelf-add-status") || "finished"; } catch { return "finished"; }
  });
  const updateAddStatus = useCallback(v => { setAddStatus(v); try { localStorage.setItem("shelf-add-status", v); } catch {} }, []);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("shelf");
  const [filter, setFilter] = useState("finished");
  const [shelfYear, setShelfYear] = useState(new Date().getFullYear());
  const inpRef = useRef(null);

  // Derive available years from books (always include current year)
  const currentYear = new Date().getFullYear();
  const yearSet = new Set([currentYear]);
  books.forEach(b => { if (b.shelfYear) yearSet.add(b.shelfYear); });
  const years = [...yearSet].sort((a, b) => b - a); // newest first

  // Books for selected year
  const yearBooks = shelfYear === "all" ? books : books.filter(b => (b.shelfYear || currentYear) === shelfYear);

  useEffect(() => {
    if (selected) { const u = books.find(b => b.id === selected.id); if (u) setSelected(u); }
  }, [books]);

  /* ── Instant local search + API fallback ── */
  const [apiSugs, setApiSugs] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [triedApi, setTriedApi] = useState("");

  // Instant local search (no debounce needed)
  useEffect(() => {
    if (!query || query.length < 2) { setSugs([]); setApiSugs([]); setTriedApi(""); return; }
    const local = searchLocal(query);
    setSugs(local);
    setApiSugs([]); setTriedApi("");
  }, [query]);

  // Online search via Open Library API
  const searchApi = useCallback(async (q) => {
    if (!q || q.length < 2 || triedApi === q) return;
    setApiLoading(true); setTriedApi(q);
    try {
      const resp = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=8&fields=key,title,author_name,first_publish_year,number_of_pages_median,isbn,cover_i`);
      const data = await resp.json();
      if (data.docs && Array.isArray(data.docs)) {
        const existTitles = new Set(sugs.map(s => s.title.toLowerCase()));
        const extra = data.docs
          .filter(doc => doc.title && !existTitles.has(doc.title.toLowerCase()))
          .map((doc, i) => {
            const isbn = doc.isbn && doc.isbn.length > 0 ? doc.isbn.find(x => x.length === 13) || doc.isbn[0] : null;
            return {
              olKey: doc.key || `ol-${q}-${i}`,
              title: doc.title,
              author: doc.author_name ? doc.author_name[0] : "",
              year: doc.first_publish_year || null,
              pages: doc.number_of_pages_median || null,
              cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
                : isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : null,
            };
          });
        setApiSugs(extra);
      }
    } catch {}
    finally { setApiLoading(false); }
  }, [sugs, triedApi]);

  const allSugs = [...sugs, ...apiSugs];

  const addBook = useCallback(item => {
    shelfAddBook({ ...item, status: addStatus, shelfYear: addYear });
    setShelfYear(addYear);
    setQuery(""); setSugs([]); setShowSearch(false);
  }, [addYear, addStatus, shelfAddBook]);

  // Lazy cover fetcher — searches Open Library for books without covers
  // (works when deployed to Vercel/native, blocked in artifact sandbox)
  const coverCache = useRef({});
  const fetchCover = useCallback((book) => {
    if (!book || book.cover || book.coverTried) return;
    if (coverCache.current[book.id]) return;
    coverCache.current[book.id] = "fetching";
    const q = encodeURIComponent(`${book.title} ${book.author || ""}`.trim());
    fetch(`https://openlibrary.org/search.json?q=${q}&limit=3&fields=isbn,cover_i`)
      .then(r => r.json())
      .then(data => {
        const doc = (data?.docs || []).find(d => d.cover_i);
        if (doc?.cover_i) {
          const url = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
          coverCache.current[book.id] = url;
          updateBook(book.id, { cover: url, coverTried: true });
        } else {
          const isbn = (data?.docs || []).flatMap(d => d.isbn || []).find(i => i.length === 13);
          if (isbn) {
            const url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
            coverCache.current[book.id] = url;
            updateBook(book.id, { cover: url, coverTried: true });
          } else {
            coverCache.current[book.id] = "none";
            updateBook(book.id, { coverTried: true });
          }
        }
      })
      .catch(() => {
        coverCache.current[book.id] = "none";
        updateBook(book.id, { coverTried: true });
      });
  }, [updateBook]);
  const addManual = useCallback(() => { if (query.trim()) addBook({ title:query.trim(), author:"", cover:null, year:null, pages:null }); }, [query, addBook]);

  const fBooks = filter === "all" ? yearBooks : yearBooks.filter(b => b.status === filter);
  const spinePerShelf = isDesktop ? 14 : isTablet ? 9 : 8;
  const coverPerShelf = isDesktop ? 6 : isTablet ? 4 : 3;
  const perShelf = shelfView === "cover" ? coverPerShelf : spinePerShelf;
  const minShelves = isDesktop ? 2 : 3;
  const shelves = [];
  for (let i = 0; i < Math.max(minShelves, Math.ceil(fBooks.length / perShelf)); i++)
    shelves.push(fBooks.slice(i * perShelf, (i + 1) * perShelf));
  const addDecoration = useCallback((item) => {
    const uid = `deco-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const x = 15 + Math.random() * 70;
    let y = 10 + Math.random() * 70;
    const container = bookcaseRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const planks = container.querySelectorAll("[data-shelf-plank]");
      if (planks.length > 0) {
        const plank = planks[Math.floor(Math.random() * planks.length)];
        const pr = plank.getBoundingClientRect();
        const plankTop = pr.top - rect.top;
        const snapCenter = plankTop - 40;
        y = (snapCenter / rect.height) * 100;
      }
    }
    setDecorations(prev => [...prev, { uid, id: item.id, emoji: item.emoji, label: item.label, x, y, scale: 1, z: 10 }]);
  }, [setDecorations]);

  const openSearch = useCallback(() => {
    setAddYear(shelfYear === "all" ? currentYear : shelfYear);
    setShowSearch(true);
    setTimeout(() => inpRef.current?.focus(), 150);
  }, [shelfYear, currentYear]);

  const existKeys = new Set(books.map(b => b.olKey).filter(Boolean));
  const yearPgs = yearBooks.reduce((s, b) => s + (b.pages || 0), 0);

  // ─── Auth gate: show landing page when not signed in ───
  if (!dataLoading && !user) {
    return <LandingPage signIn={signIn} />;
  }

  return (
    <ScaleCtx.Provider value={shelfScale}>
    <ThemeCtx.Provider value={T}>
    <div style={{
      minHeight:"100vh", maxWidth:contentMax, margin:"0 auto", position:"relative",
      background:T.bg,
      fontFamily:T.bodyFont, color:T.text,
      display:"flex", flexDirection:"column",
      "--shelf-bg": T.bodyBg,
    }}>
      <style suppressHydrationWarning>{`body { background:${T.bodyBg}; }`}</style>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Space+Grotesk:wght@300;400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0&display=swap" rel="stylesheet"/>
      <style suppressHydrationWarning>{`
        @keyframes spineUp { from { transform: translateY(20px) scaleY(.9); opacity:0; } to { transform: translateY(0) scaleY(1); opacity:1; } }
.book-spine { transition: transform .25s cubic-bezier(.22,1,.36,1); }
        .book-spine:hover { transform: translateY(-6px) scale(1.03); }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes sheetUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes dotPulse { 0%,100%{opacity:.2} 50%{opacity:.8} }
        @keyframes fabIn { from { transform:scale(0) rotate(-45deg); opacity:0; } to { transform:scale(1) rotate(0); opacity:1; } }
        * { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }
        body { background:var(--shelf-bg, #121212); }
        ::-webkit-scrollbar { width:0; }
        input::placeholder, textarea::placeholder { color:${T.textPlaceholder}; }
        .m3-icon { font-family:'Material Symbols Rounded'; font-size:24px; font-weight:normal; font-style:normal; line-height:1; letter-spacing:normal; text-transform:none; white-space:nowrap; direction:ltr; -webkit-font-smoothing:antialiased; }
      `}</style>

      {/* Header — M3 top app bar (small) */}
      <div style={{ padding:isDesktop?"20px 32px 0":"16px 20px 0", flexShrink:0, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          {editingName ? (
            <input ref={nameInputRef} defaultValue={shelfName}
              autoFocus
              onBlur={e => {
                const v = e.target.value.trim() || "My Shelf";
                setShelfName(v); setEditingName(false);
              }}
              onKeyDown={e => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") { setEditingName(false); } }}
              style={{
                fontFamily:T.headingFont, fontSize:42, fontWeight:400, fontStyle:"italic",
                color:T.accentText, letterSpacing:"-.5px", lineHeight:1.1,
                background:"none", border:"none", borderBottom:`2px solid ${T.accent}`,
                outline:"none", padding:"0 0 2px", margin:0, width:"100%", maxWidth:380,
              }}/>
          ) : (
            <h1 onClick={() => setEditingName(true)} title="Click to rename" style={{
              fontFamily:T.headingFont, fontSize:42, fontWeight:400, fontStyle:"italic",
              color:T.accentText, letterSpacing:"-.5px", lineHeight:1.1,
              cursor:"pointer", borderBottom:"2px solid transparent",
              transition:"border-color .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderBottomColor = T.accent + "40"}
            onMouseLeave={e => e.currentTarget.style.borderBottomColor = "transparent"}
            >{shelfName}</h1>
          )}
          <p style={{ fontSize:13, color:T.textMuted, marginTop:4, fontFamily:T.bodyFont, fontWeight:400, letterSpacing:".2px" }}>
            {yearBooks.length} book{yearBooks.length!==1?"s":""}{yearPgs > 0 ? ` · ${yearPgs.toLocaleString()} pages` : ""}
          </p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        {/* Filter dropdown */}
        {(tab==="shelf"||tab==="list") && (
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{
            background:T.inputBg, border:`1px solid ${T.inputBorder}`,
            borderRadius:T.inputRadius, padding:"7px 28px 7px 12px", color:T.accentText,
            fontSize:13, fontFamily:T.bodyFont, fontWeight:500,
            outline:"none", cursor:"pointer", marginTop:2,
            WebkitAppearance:"none", MozAppearance:"none", appearance:"none",
            backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23888'/%3E%3C/svg%3E")`,
            backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center",
          }}>
            <option value="all" style={{background:T.optionBg,color:T.accentText}}>All</option>
            {Object.entries(STATUS).map(([k,v]) => (
              <option key={k} value={k} style={{background:T.optionBg,color:T.accentText}}>{v.label}</option>
            ))}
          </select>
        )}
          {/* View toggle — spine vs cover */}
          {tab === "shelf" && (
            <button onClick={() => setShelfView(v => v === "spine" ? "cover" : "spine")}
              title={shelfView === "spine" ? "Show covers" : "Show spines"}
              style={{
                width: 34, height: 34, borderRadius: 17,
                background: "transparent",
                border: `1px solid ${T.cardBorder || "transparent"}`,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .2s", flexShrink: 0, fontSize: 16,
              }}
            >{shelfView === "spine" ? "📖" : "📚"}</button>
          )}
          {/* Decorate — opens catalog */}
          {tab === "shelf" && (
            <button onClick={() => setShowDecoCatalog(true)}
              title="Add decoration"
              style={{
                width: 34, height: 34, borderRadius: 17,
                background: "transparent",
                border: `1px solid ${T.cardBorder || "transparent"}`,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .2s", flexShrink: 0, fontSize: 16,
              }}
            >🪴</button>
          )}
          {/* Profile avatar */}
          <button onClick={() => setShowProfile(true)} style={{
            width:34, height:34, borderRadius:17, border: isCloud ? `2px solid ${T.accent}` : "none", cursor:"pointer",
            background: user?.user_metadata?.avatar_url ? "transparent" : T.avatarBg,
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"transform .15s", flexShrink:0, overflow:"hidden",
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
            onMouseLeave={e => e.currentTarget.style.transform = ""}
          >
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="" style={{ width:34, height:34, borderRadius:17, objectFit:"cover" }}/>
            ) : (
              <span className="m3-icon" style={{ fontSize:18, color:T.avatarText }}>person</span>
            )}
          </button>
        </div>
      </div>

      {/* Year selector — M3 segmented/scrollable chips */}
      <div style={{ display:"flex", gap:6, padding:isDesktop?"14px 32px 0":"12px 20px 0", flexShrink:0, overflowX:"auto" }}>
        {[...years, ...(years.length >= 2 ? ["all"] : [])].map(y => {
          const isActive = shelfYear === y;
          const cnt = y === "all" ? books.length : books.filter(b => (b.shelfYear || currentYear) === y).length;
          return (
            <button key={y} onClick={() => setShelfYear(y)} style={{
              padding:"6px 16px", borderRadius:T.chipRadius, cursor:"pointer",
              background: isActive ? T.accentBg : "transparent",
              border: `1px solid ${isActive ? T.accentBorder : T.inputBorder}`,
              fontSize: y === "all" ? 12 : 14,
              fontWeight: isActive ? 600 : 400,
              fontFamily: y === "all" ? T.bodyFont : T.headingFont,
              color: isActive ? T.accentText : T.textMuted,
              transition:"all .2s", whiteSpace:"nowrap",
              textTransform: y === "all" ? "uppercase" : "none",
              letterSpacing: y === "all" ? ".5px" : 0,
            }}>
              {y === "all" ? "All" : y}
              {cnt > 0 && <span style={{ fontSize:10, opacity:.45, marginLeft:4 }}>{cnt}</span>}
            </button>
          );
        })}
      </div>


      {/* Content area — scrolls, with bottom padding for nav bar */}
      <div style={{ flex:1, overflowY:"auto", padding:isDesktop?"16px 24px 100px":isTablet?"14px 16px 140px":"12px 12px 140px", background:T.bg }}>
        {tab==="shelf" && (
          <div ref={bookcaseRef} style={{ position: "relative" }}>
            <Bookcase>
              {(shelves||[]).map((sb,i) => <Shelf key={`${shelfView}-${i}`} books={sb} si={i} onBookClick={setSelected} onAdd={openSearch}
                isFirst={i===0} isLast={i===shelves.length-1} totalShelves={shelves.length} viewMode={shelfView}/>)}
              {fBooks.length===0 && shelves.length === 0 && (
                <div onClick={openSearch} style={{ textAlign:"center", padding:"44px 20px", cursor:"pointer" }}>
                  <div style={{ fontSize:40, marginBottom:10, opacity:.3 }}>+</div>
                  <p style={{ fontSize:13, color:T.textFaint }}>Tap to add your first book</p>
                </div>
              )}
            </Bookcase>
            {/* Decoration overlay — always interactive */}
            <DecorationOverlay
              decorations={decorations}
              setDecorations={setDecorations}
              containerRef={bookcaseRef}
            />
          </div>
        )}

        {tab==="list" && (
          <div style={{ padding:"4px 6px", display:isDesktop?"grid":"block", gridTemplateColumns:isDesktop?"1fr 1fr":"1fr", gap:isDesktop?"0 20px":"0" }}>
            {fBooks.length===0 ? <div style={{ textAlign:"center", padding:"60px 20px", gridColumn:"1/-1" }}><div style={{ fontSize:36, marginBottom:12, opacity:.3 }}>📖</div><p style={{ color:T.textMuted, fontSize:14, fontFamily:T.bodyFont }}>No books yet</p><p style={{ color:T.textFaint, fontSize:12, marginTop:4 }}>Tap + to add your first book</p></div>
            : (fBooks||[]).map((book,i) => {
              if (!book.cover && !book.coverTried) fetchCover(book);
              const sc = STATUS[book.status]||STATUS.want;
              return (
                <div key={book.id} onClick={() => setSelected(book)} style={{
                  display:"flex", gap:12, padding:"12px 4px",
                  borderBottom:`1px solid ${T.divider}`, cursor:"pointer",
                  animation:`spineUp .3s ease ${i*.02}s both`,
                }}>
                  {book.cover ? (
                    <img src={book.cover} alt="" style={{ width:36, height:54, objectFit:"cover", borderRadius:4, flexShrink:0, background:SPINE_COLORS[hash(book.title)%SPINE_COLORS.length] }}
                      onError={e => { e.target.onerror=null; e.target.src=""; e.target.style.display="none"; e.target.nextSibling && (e.target.nextSibling.style.display="flex"); }}/>
                  ) : null}
                  <div style={{ width:36, height:54, borderRadius:4, flexShrink:0, background:SPINE_COLORS[hash(book.title)%SPINE_COLORS.length], display:book.cover?"none":"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>📕</div>
                  <div style={{ flex:1, minWidth:0, display:"flex", flexDirection:"column", justifyContent:"center" }}>
                    <div style={{ fontSize:14, fontWeight:500, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{book.title}</div>
                    <div style={{ fontSize:11, color:T.textMuted, marginTop:2 }}>{book.author||"Unknown"}{book.year?` · ${book.year}`:""}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
                      <span style={{ fontSize:9, padding:"2px 8px", borderRadius:8, background:sc.bg, border:`1px solid ${sc.ring}`, color:sc.color, fontWeight:600 }}>{sc.label}</span>
                      {book.rating>0 && <span style={{ fontSize:10, color:"rgba(226,179,64,.6)" }}>{"★".repeat(book.rating)}</span>}
                      {shelfYear==="all" && book.shelfYear && <span style={{ fontSize:9, color:T.textFaint, marginLeft:"auto" }}>{book.shelfYear}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab==="stats" && <Stats books={yearBooks} label={shelfYear === "all" ? "All Time" : `${shelfYear}`}/>}
      </div>

      {/* Circle FAB — floating above nav */}
      <button onClick={openSearch}
        style={{
          position:"fixed", bottom:isDesktop?24:80, right:isDesktop?`max(20px, calc(50% - ${contentMax/2 - 20}px))`:20,
          width:56, height:56, borderRadius:28,
          background:T.fab, border:"none",
          cursor:"pointer", fontSize:28, color:T.fabText, fontWeight:300,
          display:"flex", alignItems:"center", justifyContent:"center",
          
          zIndex:40, animation:"fabIn .25s cubic-bezier(.34,1.3,.64,1)",
          transition:"transform .15s, box-shadow .15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.06)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
      >+</button>

      {/* Floating Glass Nav Bar */}
      <div style={{
        position:"fixed", bottom:12, left:"50%", transform:"translateX(-50%)",
        width:isDesktop?"min(420px, calc(100% - 48px))":"min(320px, calc(100% - 48px))",
        background:T.navBg,
        backdropFilter:"blur(40px) saturate(1.8)",
        WebkitBackdropFilter:"blur(40px) saturate(1.8)",
        border:`1px solid ${T.navBorder}`,
        borderRadius:28,
        display:"flex", justifyContent:"space-around", alignItems:"center",
        padding:"4px 8px", height:56,
        zIndex:35,
        
      }}>
        {[
          { id:"shelf", label:"Shelf", icon:"auto_stories" },
          { id:"list",  label:"List",  icon:"format_list_bulleted" },
          { id:"stats", label:"Stats", icon:"bar_chart" },
        ].map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:1,
              padding:"6px 0 4px", background:"none", border:"none", cursor:"pointer",
              transition:"all .2s",
            }}>
              <div style={{
                width:40, height:28, borderRadius:14,
                background: active ? T.navActive : "transparent",
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"all .25s cubic-bezier(.34,1.3,.64,1)",
              }}>
                <span className="m3-icon" style={{
                  color: active ? T.accentText : T.navIcon,
                  transition:"color .2s", fontSize:21,
                }}>{t.icon}</span>
              </div>
              <span style={{
                fontSize:10, fontWeight: active ? 600 : 400,
                color: active ? T.accentText : T.navIcon,
                transition:"color .2s", fontFamily:T.bodyFont,
                letterSpacing:".2px",
              }}>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Overlay */}
      {showSearch && (
        <div style={{
          position:"fixed", inset:0,
          background:isDesktop?T.overlayBg:(T.id==="light"?"rgba(250,248,244,.97)":"rgba(8,6,4,.96)"),
          backdropFilter:"blur(12px)", zIndex:50,
          display:"flex", flexDirection:"column", alignItems:isDesktop?"center":"stretch",
          animation:"fadeIn .15s ease",
        }}>
          <div style={{
            padding:isDesktop?"20px 24px":"16px 16px 0", flexShrink:0,
            ...(isDesktop ? { background:T.surface, borderRadius:T.sheetRadius, border:`1px solid ${T.cardBorder}`,
              maxWidth:520, width:"100%", marginTop:60, maxHeight:"calc(100vh - 120px)",
              display:"flex", flexDirection:"column",  } : {}),
          }}>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <div style={{
                flex:1, display:"flex", alignItems:"center", gap:10,
                background:T.inputBg, borderRadius:T.inputRadius+2, padding:"0 14px",
                border:`1px solid ${T.inputBorder}`,
              }}>
                <span style={{ fontSize:15, color:T.textMuted, flexShrink:0 }}>🔍</span>
                <input ref={inpRef} type="text" value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => { if (e.key==="Enter"&&query.trim()&&allSugs.length===0) addManual(); }}
                  placeholder="Search by title or author..."
                  autoComplete="off" autoCorrect="off"
                  style={{ flex:1, padding:"14px 0", background:"none", border:"none", color:T.text, fontSize:15, outline:"none", fontFamily:T.bodyFont }}
                />
                {query && <button onClick={() => { setQuery(""); setSugs([]); }} style={{ background:T.inputBg, border:"none", borderRadius:10, width:22, height:22, cursor:"pointer", color:T.textSub, fontSize:11, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>✕</button>}
              </div>
              <button onClick={() => { setShowSearch(false); setQuery(""); setSugs([]); }} style={{ background:"none", border:"none", color:T.textSub, fontSize:14, cursor:"pointer", padding:"8px 2px", fontFamily:T.bodyFont, flexShrink:0 }}>Cancel</button>
            </div>
            {/* Adding to year + status */}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10, flexWrap:"wrap" }}>
              <span style={{ fontSize:11, color:T.textFaint, flexShrink:0 }}>Add to</span>
              <select value={addYear} onChange={e => setAddYear(parseInt(e.target.value))} style={{
                padding:"5px 10px", borderRadius:T.inputRadius-2, fontSize:14,
                background:T.inputBg, border:`1px solid ${T.inputBorder}`,
                color:T.accentText, fontFamily:T.headingFont, fontWeight:600,
                outline:"none", cursor:"pointer", WebkitAppearance:"auto",
              }}>
                {Array.from({length:30},(_,i)=>currentYear-i).map(y=>(
                  <option key={y} value={y} style={{background:T.optionBg,color:T.accentText}}>{y}</option>
                ))}
              </select>
              <span style={{ fontSize:11, color:T.textFaint, flexShrink:0 }}>as</span>
              <select value={addStatus} onChange={e => updateAddStatus(e.target.value)} style={{
                padding:"5px 10px", borderRadius:T.inputRadius-2, fontSize:13,
                background:T.inputBg, border:`1px solid ${T.inputBorder}`,
                color:T.accentText, fontFamily:T.bodyFont, fontWeight:500,
                outline:"none", cursor:"pointer", WebkitAppearance:"auto",
              }}>
                {Object.entries(STATUS).map(([k,v])=>(
                  <option key={k} value={k} style={{background:T.optionBg,color:T.accentText}}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ flex:1, overflowY:"auto", padding:"8px 0" }}>
            {allSugs.length > 0 && allSugs.map((item,i) => (
              <SugItem key={item.olKey||i} item={item} onSelect={addBook} exists={item.olKey ? existKeys.has(item.olKey) : false}/>
            ))}
            {query.length >= 2 && !apiLoading && triedApi !== query && (
              <div style={{ padding:"12px 16px", textAlign:"center" }}>
                <button onClick={() => searchApi(query)} style={{
                  padding:"10px 22px", background:T.cardBg, border:`1px solid ${T.cardBorder}`,
                  borderRadius:T.cardRadius, color:T.textSub, fontSize:13, cursor:"pointer",
                  fontFamily:T.bodyFont,
                }}>{allSugs.length > 0 ? "Search online for more..." : "Search online..."}</button>
              </div>
            )}
            {apiLoading && (
              <div style={{ padding:16, textAlign:"center" }}>
                <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:8 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:5, height:5, borderRadius:"50%", background:T.accentText, animation:`dotPulse .9s ease ${i*.15}s infinite` }}/>)}
                </div>
                <div style={{ color:T.textMuted, fontSize:12 }}>Searching online...</div>
              </div>
            )}
            {query.length >= 2 && allSugs.length === 0 && triedApi === query && !apiLoading && (
              <div style={{ padding:"16px 20px", textAlign:"center" }}>
                <p style={{ color:T.textMuted, fontSize:13, marginBottom:12 }}>No results found online</p>
              </div>
            )}
            {/* Manual add — always visible when query has text */}
            {query.length >= 2 && (
              <ManualAdd query={query} onAdd={addBook} />
            )}
            {query.length < 2 && (
              <div style={{ padding:"44px 20px", textAlign:"center" }}>
                <div style={{ fontSize:36, marginBottom:10, opacity:.35 }}>📖</div>
                <p style={{ color:T.textFaint, fontSize:13 }}>Start typing to search for books</p>
                <p style={{ color:T.textFaint, fontSize:12, marginTop:6, opacity:.6 }}>Search by title, author, or ISBN</p>
              </div>
            )}
          </div>
        </div>
      )}

      <Detail book={selected} onClose={() => setSelected(null)} onRemove={removeBook} onUpdate={updateBook} years={years} fetchCover={fetchCover}/>

      {/* Profile menu */}
      {showProfile && <ProfileMenu theme={T} setThemeId={changeTheme} onClose={() => setShowProfile(false)} isDesktop={isDesktop} screenW={screenW} contentMax={contentMax} user={user} signIn={signIn} signOut={signOut} isCloud={isCloud}/>}

      {/* Decoration catalog */}
      {showDecoCatalog && (
        <DecoCatalog onAdd={addDecoration} onClose={() => setShowDecoCatalog(false)} />
      )}
    </div>
    </ThemeCtx.Provider>
    </ScaleCtx.Provider>
  );
}
