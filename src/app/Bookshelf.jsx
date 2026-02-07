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
    headingFont: "'Playfair Display', serif",
    bodyFont: "'DM Sans', sans-serif",
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
    bg: "#faf8f4", surface: "#ffffff", surfaceAlt: "#f5f2ec",
    text: "#2c2416", textSub: "rgba(60,45,25,.6)", textMuted: "rgba(60,45,25,.4)",
    textFaint: "rgba(60,45,25,.2)", textPlaceholder: "rgba(60,45,25,.25)",
    accent: "#8b6914", accentBg: "rgba(139,105,20,.1)", accentBorder: "rgba(139,105,20,.25)",
    accentSoft: "rgba(139,105,20,.06)", accentText: "#8b6914",
    fab: "#8b6914", fabText: "#fff",
    cardBg: "rgba(0,0,0,.02)", cardBorder: "rgba(0,0,0,.07)",
    inputBg: "rgba(0,0,0,.03)", inputBorder: "rgba(0,0,0,.1)",
    navBg: "rgba(255,255,252,.75)", navBorder: "rgba(0,0,0,.08)",
    navActive: "rgba(139,105,20,.12)", navIcon: "rgba(60,45,25,.4)",
    shelfFront: "linear-gradient(180deg, #c4a67a 0%, #b89868 40%, #a88c58 100%)",
    shelfShadow: "0 3px 8px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.5)",
    shelfBg: "linear-gradient(180deg, rgba(200,180,150,.08) 0%, rgba(200,180,150,.02) 100%)",
    wood: "#b89868", woodDark: "#9a7d52", woodLight: "#d4b88a", bookcaseBg: "rgba(245,235,220,.6)",
    sheetBg: "linear-gradient(180deg, #ffffff, #faf8f4)",
    overlayBg: "rgba(0,0,0,.35)",
    headingFont: "'Playfair Display', serif",
    bodyFont: "'DM Sans', sans-serif",
    chipRadius: 16, cardRadius: 14, sheetRadius: 22, inputRadius: 12,
    statusColors: {
      want:     { color: "#9a7a1a", bg: "rgba(154,122,26,.1)",  ring: "rgba(154,122,26,.2)" },
      reading:  { color: "#3d7a2e", bg: "rgba(61,122,46,.1)",   ring: "rgba(61,122,46,.2)" },
      finished: { color: "#5a5ab0", bg: "rgba(90,90,176,.1)",   ring: "rgba(90,90,176,.2)" },
    },
    starColor: "#d4a018", starOff: "rgba(0,0,0,.1)",
    optionBg: "#faf8f4",
    divider: "rgba(0,0,0,.06)",
    dangerBg: "rgba(200,50,30,.06)", dangerBorder: "rgba(200,50,30,.12)", dangerText: "#b83a2a",
    barBg: "rgba(139,105,20,",
    bodyBg: "#faf8f4",
    avatarBg: "rgba(139,105,20,.12)", avatarText: "#8b6914",
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

const ThemeCtx = createContext(THEMES.classic);
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
        <h3 style={{ fontFamily:T.headingFont, fontSize:20, fontWeight:700, color:T.text, marginBottom:16 }}>Appearance</h3>
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
        boxShadow:"0 8px 32px rgba(0,0,0,.3)", animation:"fadeIn .12s ease",
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
  "#2D3A3A","#8B4513","#1a1a2e","#4a3728","#2c3e50","#3d1c02","#1b2838",
  "#4a1942","#0f3460","#2d4a22","#5c3317","#3b3a30","#6b2737","#2a4858",
  "#4b3621","#704214","#3c1518","#1a3a3a","#5b4a3f","#2e294e","#463730",
  "#8d3b47","#2a6041","#7c4a3a","#3a506b","#774936","#4e6e58","#6d435a",
  "#456268","#924a2a","#2b4141","#5e3a6e","#6e4b3a","#1e453e","#7a3e3e",
  "#3e4a2e","#4a2e4a","#2e3a5a","#5a4a2e","#3a2e1e","#583a58","#2e5a3a",
];

const SPINE_TEXTURES = [
  "linear-gradient(180deg, rgba(255,255,255,.08) 0%, transparent 30%, transparent 70%, rgba(0,0,0,.15) 100%)",
  "linear-gradient(180deg, rgba(255,255,255,.12) 0%, rgba(255,255,255,.03) 15%, transparent 50%, rgba(0,0,0,.08) 85%, rgba(0,0,0,.2) 100%)",
  "linear-gradient(180deg, rgba(255,255,255,.06) 0%, transparent 20%, rgba(255,255,255,.02) 50%, transparent 80%, rgba(0,0,0,.12) 100%)",
];

const STATUS = {
  want:     { label: "Want to Read", icon: "📋", color: "#c9a84c", bg: "rgba(200,168,76,.12)", ring: "rgba(200,168,76,.25)" },
  reading:  { label: "Reading",      icon: "📖", color: "#6a9f5b", bg: "rgba(106,159,91,.12)", ring: "rgba(106,159,91,.25)" },
  finished: { label: "Finished",     icon: "✓",  color: "#8a8ac4", bg: "rgba(138,138,196,.12)", ring: "rgba(138,138,196,.25)" },
};

function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); }

/* Pages → spine width: 100p→22px, 300p→32px, 600p→42px, 1000+→52px */
function spineWidth(pages, title) {
  if (pages && pages > 0) {
    const clamped = Math.max(80, Math.min(1200, pages));
    return Math.round(20 + (clamped - 80) * (32 / 1120)); // 20–52px
  }
  // Fallback: hash-based width for books without page data
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

/* ── Book Spine ── */
function BookSpine({ book, index, onClick }) {
  const scale = useScale();
  const h = hash(book.title + (book.author || ""));
  const color = SPINE_COLORS[h % SPINE_COLORS.length];
  const texture = SPINE_TEXTURES[h % SPINE_TEXTURES.length];
  const w = Math.round(spineWidth(book.pages, book.title) * scale);
  const isGold = h % 3 === 0;
  const hasBand = h % 4 < 2;
  const bandY = h % 2 === 0 ? 8 + (h % 12) : 78 + (h % 12);
  const hasDoubleBand = h % 5 === 0;
  const sc = book.status === "reading" ? STATUS.reading.color : book.status === "finished" ? STATUS.finished.color : null;
  const hoverY = Math.round(10 * scale);

  return (
    <div onClick={() => onClick(book)} style={{
      width: w, height: "100%", background: color, borderRadius: `${2*scale}px ${4*scale}px ${4*scale}px ${2*scale}px`,
      position: "relative", cursor: "pointer", flexShrink: 0,
      boxShadow: "inset -2px 0 4px rgba(0,0,0,.3), inset 1px 0 1px rgba(255,255,255,.05), 2px 0 3px rgba(0,0,0,.2)",
      transition: "transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .25s", overflow: "hidden",
      animation: `spineUp .4s cubic-bezier(.34,1.56,.64,1) ${index * .04}s both`,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = `translateY(-${hoverY}px)`; e.currentTarget.style.boxShadow = "inset -2px 0 4px rgba(0,0,0,.3), inset 1px 0 1px rgba(255,255,255,.05), 2px 6px 16px rgba(0,0,0,.45)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
      onTouchStart={e => { e.currentTarget.style.transform = `translateY(-${hoverY}px)`; e.currentTarget.style.boxShadow = "inset -2px 0 4px rgba(0,0,0,.3), inset 1px 0 1px rgba(255,255,255,.05), 2px 6px 16px rgba(0,0,0,.45)"; }}
      onTouchEnd={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
      onTouchCancel={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{ position:"absolute", inset:0, background:texture, pointerEvents:"none" }}/>
      {hasBand && <div style={{ position:"absolute", left:0, right:0, top:`${bandY}%`, height:Math.max(2, 2*scale), background: isGold ? "linear-gradient(90deg, transparent, #c9a84c, #f0d78c, #c9a84c, transparent)" : "rgba(255,255,255,.1)" }}/>}
      {hasDoubleBand && <div style={{ position:"absolute", left:0, right:0, top:`${bandY+4}%`, height:Math.max(1, 1*scale), background: isGold ? "linear-gradient(90deg, transparent, #c9a84c88, transparent)" : "rgba(255,255,255,.06)" }}/>}
      <div style={{
        position:"absolute", top:"50%", left:"50%",
        transform:"translate(-50%,-50%) rotate(-90deg)",
        whiteSpace:"nowrap", fontSize: Math.min(10*scale, w * .26),
        fontFamily:"'Playfair Display', Georgia, serif", fontWeight: 500,
        color: isGold ? "#e8d5a3" : "rgba(255,255,255,.75)",
        letterSpacing:".5px", textShadow:"0 1px 2px rgba(0,0,0,.5)",
        maxWidth: Math.round(140*scale), overflow:"hidden", textOverflow:"ellipsis",
      }}>{book.title}</div>
      {sc && <div style={{ position:"absolute", top:Math.round(5*scale), left:"50%", transform:"translateX(-50%)", width:Math.round(5*scale), height:Math.round(5*scale), borderRadius:"50%", background:sc, boxShadow:`0 0 4px ${sc}` }}/>}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(180deg, rgba(255,255,255,.1), transparent)" }}/>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:4, background:"linear-gradient(0deg, rgba(0,0,0,.2), transparent)" }}/>
    </div>
  );
}

/* ── Shelf ── */
function Shelf({ books, si, onBookClick, onAdd, isFirst, isLast, totalShelves }) {
  const T = useTheme();
  const scale = useScale();
  const shelfH = Math.round(155 * scale);
  const plankH = Math.round(16 * scale);
  return (
    <div style={{ position:"relative" }}>
      {/* Back panel — visible behind books */}
      <div style={{
        height: shelfH, padding: `${Math.round(8*scale)}px ${Math.round(10*scale)}px 0`,
        display: "flex", alignItems: "flex-end", gap: Math.round(3 * scale),
        background: T.bookcaseBg,
        cursor: books.length === 0 ? "pointer" : "default",
        position: "relative",
      }} onClick={books.length === 0 ? onAdd : undefined}>
        {/* Subtle back panel texture */}
        <div style={{ position:"absolute", inset:0, opacity:.04,
          background:"repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255,255,255,.3) 30px, rgba(255,255,255,.3) 31px)",
          pointerEvents:"none" }}/>
        {books.map((b, i) => <BookSpine key={b.id} book={b} index={i + si * 8} onClick={onBookClick} />)}
      </div>
      {/* Shelf plank — thick wooden ledge */}
      <div style={{
        height: plankH, position:"relative",
        background: T.shelfFront,
        boxShadow: T.shelfShadow,
      }}>
        {/* Wood grain lines */}
        <div style={{ position:"absolute", inset:0, opacity:.08,
          background:"repeating-linear-gradient(180deg, transparent, transparent 3px, rgba(255,255,255,.2) 3px, rgba(255,255,255,.2) 4px)",
          pointerEvents:"none" }}/>
        {/* Top edge highlight */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:1,
          background:"linear-gradient(90deg, rgba(255,255,255,.06), rgba(255,255,255,.12), rgba(255,255,255,.06))" }}/>
      </div>
    </div>
  );
}

/* ── Bookcase wrapper — adds wood side panels ── */
function Bookcase({ children }) {
  const T = useTheme();
  const scale = useScale();
  const sideW = Math.round(8 * scale);
  const topH = Math.round(6 * scale);
  const botH = Math.round(8 * scale);
  return (
    <div style={{
      position:"relative",
      borderLeft:`${sideW}px solid ${T.wood}`,
      borderRight:`${sideW}px solid ${T.wood}`,
      borderTop:`${topH}px solid ${T.wood}`,
      borderBottom:`${botH}px solid ${T.wood}`,
      borderRadius: Math.round(4 * scale),
      boxShadow: `0 4px 20px rgba(0,0,0,.3)`,
      overflow:"hidden",
    }}>
      <div style={{ position:"absolute", left:-sideW, top:0, bottom:0, width:sideW, zIndex:2, pointerEvents:"none",
        background:`linear-gradient(90deg, ${T.woodDark}, ${T.woodLight} 50%, ${T.wood})` }}>
        <div style={{ position:"absolute", inset:0, opacity:.06,
          background:"repeating-linear-gradient(180deg, transparent, transparent 8px, rgba(255,255,255,.3) 8px, rgba(255,255,255,.3) 9px)" }}/>
      </div>
      <div style={{ position:"absolute", right:-sideW, top:0, bottom:0, width:sideW, zIndex:2, pointerEvents:"none",
        background:`linear-gradient(270deg, ${T.woodDark}, ${T.woodLight} 50%, ${T.wood})` }}>
        <div style={{ position:"absolute", inset:0, opacity:.06,
          background:"repeating-linear-gradient(180deg, transparent, transparent 8px, rgba(255,255,255,.3) 8px, rgba(255,255,255,.3) 9px)" }}/>
      </div>
      {children}
    </div>
  );
}

/* ── Manual Add Form ── */
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
            <img src={book.cover} alt="" style={{ width:85, height:128, objectFit:"cover", borderRadius:6, boxShadow:"0 4px 16px rgba(0,0,0,.4)", flexShrink:0, background:SPINE_COLORS[hash(book.title)%SPINE_COLORS.length] }}
              onError={e => { e.target.onerror=null; e.target.src=""; e.target.style.display="none"; e.target.nextSibling && (e.target.nextSibling.style.display="flex"); }}/>
          ) : null}
          <div style={{ width:85, height:128, borderRadius:6, flexShrink:0, background:SPINE_COLORS[hash(book.title)%SPINE_COLORS.length], display:book.cover?"none":"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 16px rgba(0,0,0,.4)" }}>
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

  const Card = ({ emoji, val, label, accent }) => (
    <div style={{ flex:1, background:T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:T.cardRadius, padding:"14px 8px", textAlign:"center" }}>
      <div style={{ fontSize:18, marginBottom:4 }}>{emoji}</div>
      <div style={{ fontSize:22, fontWeight:700, fontFamily:T.headingFont, color: accent || T.accentText }}>{val}</div>
      <div style={{ fontSize:10, color:T.textMuted, marginTop:2 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ padding:"4px 4px", maxWidth:600, margin:"0 auto" }}>
      {label && <div style={{ fontSize:11, color:T.textMuted, marginBottom:10, fontWeight:600, letterSpacing:".5px", textTransform:"uppercase", textAlign:"center" }}>{label} Stats</div>}
      <div style={{ display:"flex", gap:8, marginBottom:10 }}>
        <Card emoji="📚" val={total} label="Total"/>
        <Card emoji="✓" val={fin} label="Finished" accent={T.statusColors?.finished?.color || "#8a8ac4"}/>
        <Card emoji="📖" val={rdg} label="Reading" accent={T.statusColors?.reading?.color || "#6a9f5b"}/>
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:18 }}>
        <Card emoji="⭐" val={avg} label="Avg Rating"/>
        <Card emoji="📄" val={pgs>0?pgs.toLocaleString():"—"} label="Pages Read"/>
        <Card emoji="📋" val={wnt} label="Want to Read" accent={T.statusColors?.want?.color || "#c9a84c"}/>
      </div>
      {rated.length > 0 && (
        <div style={{ background:T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:T.cardRadius, padding:16 }}>
          <div style={{ fontSize:11, color:T.textMuted, marginBottom:12, fontWeight:600, letterSpacing:".5px", textTransform:"uppercase" }}>Rating Distribution</div>
          <div style={{ display:"flex", gap:8, alignItems:"flex-end", height:56 }}>
            {rDist.map((c,i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                {c > 0 && <div style={{ fontSize:10, color:T.textMuted, fontWeight:600 }}>{c}</div>}
                <div style={{ width:"100%", borderRadius:6, height: Math.max(6, (c/maxRD)*44), background:`${T.barBg}${.15+i*.12})`, transition:"height .4s cubic-bezier(.34,1.2,.64,1)" }}/>
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
   Main App
   ═══════════════════════════════════════════ */
export default function App() {
  const {
    books, setBooks, addBook: shelfAddBook, removeBook, updateBook,
    themeId, setThemeId: changeTheme, shelfName, setShelfName,
    loading: dataLoading, user, signIn, signOut, isCloud,
  } = useShelfData();
  const loaded = !dataLoading;
  const [showProfile, setShowProfile] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const nameInputRef = useRef(null);
  const T = THEMES[themeId] || THEMES.classic;
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
  const perShelf = isDesktop ? 14 : isTablet ? 9 : 8;
  const minShelves = isDesktop ? 2 : 3;
  const shelves = [];
  for (let i = 0; i < Math.max(minShelves, Math.ceil(fBooks.length / perShelf)); i++)
    shelves.push(fBooks.slice(i * perShelf, (i + 1) * perShelf));
  const openSearch = useCallback(() => {
    setAddYear(shelfYear === "all" ? currentYear : shelfYear);
    setShowSearch(true);
    setTimeout(() => inpRef.current?.focus(), 150);
  }, [shelfYear, currentYear]);

  const existKeys = new Set(books.map(b => b.olKey).filter(Boolean));
  const yearPgs = yearBooks.reduce((s, b) => s + (b.pages || 0), 0);

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
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Space+Grotesk:wght@300;400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0&display=swap" rel="stylesheet"/>
      <style suppressHydrationWarning>{`
        @keyframes spineUp { from { transform: translateY(20px) scaleY(.9); opacity:0; } to { transform: translateY(0) scaleY(1); opacity:1; } }
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
                fontFamily:T.headingFont, fontSize:24, fontWeight:700,
                color:T.accentText, letterSpacing:"-.3px", lineHeight:1.2,
                background:"none", border:"none", borderBottom:`2px solid ${T.accent}`,
                outline:"none", padding:"0 0 2px", margin:0, width:"100%", maxWidth:300,
              }}/>
          ) : (
            <h1 onClick={() => setEditingName(true)} title="Click to rename" style={{
              fontFamily:T.headingFont, fontSize:24, fontWeight:700,
              color:T.accentText, letterSpacing:"-.3px", lineHeight:1.2,
              cursor:"pointer", borderBottom:"2px solid transparent",
              transition:"border-color .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderBottomColor = T.accent + "40"}
            onMouseLeave={e => e.currentTarget.style.borderBottomColor = "transparent"}
            >{shelfName}</h1>
          )}
          <p style={{ fontSize:12, color:T.textMuted, marginTop:3 }}>
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
          <Bookcase>
            {shelves.map((sb,i) => <Shelf key={i} books={sb} si={i} onBookClick={setSelected} onAdd={openSearch}
              isFirst={i===0} isLast={i===shelves.length-1} totalShelves={shelves.length}/>)}
            {fBooks.length===0 && shelves.length === 0 && (
              <div onClick={openSearch} style={{ textAlign:"center", padding:"44px 20px", cursor:"pointer" }}>
                <div style={{ fontSize:40, marginBottom:10, opacity:.3 }}>+</div>
                <p style={{ fontSize:13, color:T.textFaint }}>Tap to add your first book</p>
              </div>
            )}
          </Bookcase>
        )}

        {tab==="list" && (
          <div style={{ padding:"4px 6px", display:isDesktop?"grid":"block", gridTemplateColumns:isDesktop?"1fr 1fr":"1fr", gap:isDesktop?"0 20px":"0" }}>
            {fBooks.length===0 ? <p style={{ textAlign:"center", padding:40, color:T.textMuted, fontSize:14 }}>No books</p>
            : fBooks.map((book,i) => {
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
          boxShadow:"0 4px 12px rgba(0,0,0,.28), 0 1px 4px rgba(0,0,0,.18)",
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
        boxShadow:"0 8px 32px rgba(0,0,0,.35), 0 2px 8px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.08)",
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
              display:"flex", flexDirection:"column", boxShadow:"0 16px 48px rgba(0,0,0,.3)" } : {}),
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
    </div>
    </ThemeCtx.Provider>
    </ScaleCtx.Provider>
  );
}
