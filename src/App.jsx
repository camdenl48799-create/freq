import { useEffect, useMemo, useState } from "react";

const songs = [
  { id: 1, title: "Midnight Drive", artist: "Nova Lane", album: "After Hours", genre: "Electronic", length: 213, mood: "night", playlist: "Late Night" },
  { id: 2, title: "Neon Skies", artist: "Static Bloom", album: "City Lights", genre: "Indie", length: 188, mood: "blue", playlist: "Daily Mix" },
  { id: 3, title: "Falling Forward", artist: "Echo Park", album: "Momentum", genre: "Alternative", length: 204, mood: "violet", playlist: "Energy" },
  { id: 4, title: "Slow Motion", artist: "June Wilder", album: "Soft Focus", genre: "Chill", length: 231, mood: "green", playlist: "Chill" },
  { id: 5, title: "Red Horizon", artist: "Vanta", album: "Horizons", genre: "Electronic", length: 196, mood: "red", playlist: "Energy" },
  { id: 6, title: "Nothing Left", artist: "Silverline", album: "Nothing Left", genre: "Rock", length: 245, mood: "gray", playlist: "Daily Mix" },
  { id: 7, title: "Dream State", artist: "Mira Sol", album: "Dream State", genre: "Chill", length: 220, mood: "green", playlist: "Chill" },
  { id: 8, title: "Runaway Lights", artist: "The Signals", album: "Motion", genre: "Pop", length: 177, mood: "orange", playlist: "Energy" },
  { id: 9, title: "Blue Hour", artist: "Aster", album: "Blue Hour", genre: "Indie", length: 202, mood: "blue", playlist: "Late Night" },
  { id: 10, title: "Afterglow", artist: "Kairo", album: "Afterglow", genre: "Electronic", length: 191, mood: "violet", playlist: "Daily Mix" },
];
const playlists = [
  { name: "Daily Mix", detail: "A little bit of everything", icon: "◈", mood: "red" },
  { name: "Late Night", detail: "For the after-hours", icon: "☾", mood: "night" },
  { name: "Energy", detail: "Turn it up", icon: "ϟ", mood: "violet" },
  { name: "Chill", detail: "Take it easy", icon: "❄", mood: "green" },
];
const navItems = [
  ["Home", "⌂"], ["Search", "⌕"], ["Discover", "✦"], ["Radio", "◉"],
  ["Your Library", "▤"], ["Liked Songs", "♥"],
];
const fmt = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

function Cover({ mood = "red", mark = "F", small = false }) {
  return <div className={`cover ${mood} ${small ? "cover-small" : ""}`} aria-hidden="true"><span>{mark}</span></div>;
}

function App() {
  const [page, setPage] = useState("Home");
  const [playlist, setPlaylist] = useState(null);
  const [search, setSearch] = useState("");
  const [current, setCurrent] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [volume, setVolume] = useState(70);
  const [liked, setLiked] = useState(() => {
    try { return JSON.parse(localStorage.getItem("freq-liked") || "[]"); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem("freq-liked", JSON.stringify(liked)); }, [liked]);
  useEffect(() => {
    if (!playing || !current) return;
    const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [playing, current]);
  useEffect(() => {
    if (!current || seconds < current.length) return;
    if (repeat) setSeconds(0);
    else next();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, current, repeat]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (term) return songs.filter((song) => [song.title, song.artist, song.album, song.genre].some((v) => v.toLowerCase().includes(term)));
    if (page === "Liked Songs") return songs.filter((s) => liked.includes(s.id));
    if (playlist) return songs.filter((s) => s.playlist === playlist);
    if (page === "Radio") return songs;
    if (page === "Discover") return [...songs].sort((a, b) => a.title.localeCompare(b.title));
    return songs;
  }, [search, page, liked, playlist]);

  const go = (target) => { setPage(target); setPlaylist(null); setSearch(""); };
  const selectPlaylist = (name) => { setPlaylist(name); setPage(name); setSearch(""); };
  const start = (song) => { setCurrent(song); setSeconds(0); setPlaying(true); };
  function next() {
    if (!current) { start(songs[0]); return; }
    const idx = songs.findIndex((s) => s.id === current.id);
    start(songs[shuffle ? Math.floor(Math.random() * songs.length) : (idx + 1) % songs.length]);
  }
  const previous = () => {
    if (!current) return start(songs[0]);
    if (seconds > 3) { setSeconds(0); return; }
    const idx = songs.findIndex((s) => s.id === current.id);
    start(songs[(idx - 1 + songs.length) % songs.length]);
  };
  const toggleLike = (id) => setLiked((old) => old.includes(id) ? old.filter((x) => x !== id) : [...old, id]);
  const togglePlay = () => {
    if (!current) { start(songs[0]); return; }
    setPlaying((p) => !p);
  };
  const title = search ? `Search: ${search}` : playlist || ({
    Home: "Made for you", Search: "Find your sound", Discover: "Discover music",
    Radio: "Radio stations", "Your Library": "Your library", "Liked Songs": "Liked songs",
  }[page] || page);
  const shown = search ? filtered : page === "Home" ? songs.slice(0, 5) : filtered;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={(e) => { e.preventDefault(); go("Home"); }}>F<span>REQ</span><i className="brand-dot" /></a>
        <div className="nav-group"><div className="nav-label">MENU</div>
          {navItems.slice(0, 4).map(([label, icon]) => <button key={label} className={page === label ? "nav-item active" : "nav-item"} onClick={() => go(label)}><span className="nav-icon">{icon}</span>{label}</button>)}
        </div>
        <div className="nav-group"><div className="nav-label">YOUR MUSIC</div>
          {navItems.slice(4).map(([label, icon]) => <button key={label} className={page === label ? "nav-item active" : "nav-item"} onClick={() => go(label)}><span className="nav-icon">{icon}</span>{label}</button>)}
        </div>
        <div className="nav-group playlists"><div className="nav-label">PLAYLISTS</div>
          {playlists.map((p) => <button key={p.name} className={playlist === p.name ? "nav-item active" : "nav-item"} onClick={() => selectPlaylist(p.name)}><span className="nav-icon">{p.icon}</span>{p.name}</button>)}
        </div>
        <div className="sidebar-foot"><div className="tiny-wave">▂▅▇▅▂</div><span>Music tuned to you.</span></div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="history-buttons"><button aria-label="Back" onClick={() => go("Home")}>‹</button><button aria-label="Forward" onClick={() => go("Discover")}>›</button></div>
          <div className="searchbox"><span>⌕</span><input value={search} onChange={(e) => { setSearch(e.target.value); setPage("Search"); setPlaylist(null); }} placeholder="Songs, artists, albums..." /></div>
          <div className="user-chip"><div className="user-avatar">F</div><span>Listener</span></div>
        </header>

        {!search && page === "Home" && <section className="hero">
          <div className="hero-content"><div className="eyebrow">YOUR SOUND. YOUR FREQUENCY.</div><h1>Find your<br/>frequency.</h1><p>Discover something that sounds like you.</p><button className="primary-button" onClick={() => go("Discover")}>Explore music <span>↗</span></button></div>
          <div className="hero-visual"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-disc"><div className="disc-center">FREQ</div></div><div className="visual-bars"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div>
        </section>}

        {!search && page === "Home" && <section className="section-block"><div className="section-heading"><h2>Jump back in</h2></div><div className="quick-grid">{playlists.map((p) => <button className="quick-tile" key={p.name} onClick={() => selectPlaylist(p.name)}><Cover mood={p.mood} mark={p.icon}/><span>{p.name}</span><b>▶</b></button>)}</div></section>}

        <section className="section-block"><div className="section-heading"><h2>{title}</h2>{page === "Home" && <button className="subtle-button" onClick={() => go("Your Library")}>See library →</button>}</div>
          {shown.length ? <div className="album-grid">{shown.map((s) => <button className="album-card" key={s.id} onClick={() => start(s)}><Cover mood={s.mood} mark={s.album.slice(0, 2).toUpperCase()}/><span className="album-name">{s.album}</span><span className="album-artist">{s.artist}</span><span className="card-play">▶</span></button>)}</div> : <div className="empty-state">No results yet. Try another search.</div>}
        </section>

        <section className="section-block"><div className="section-heading"><h2>Tracks</h2><span className="subtle-label">DEMO LIBRARY</span></div>
          <div className="track-table">{filtered.map((s, idx) => <div key={s.id} className={current?.id === s.id ? "track-row selected" : "track-row"} onClick={() => start(s)}>
            <span className="track-index">{current?.id === s.id && playing ? "♫" : String(idx + 1).padStart(2, "0")}</span><Cover mood={s.mood} mark={s.album.slice(0,1)} small/><div className="track-meta"><strong>{s.title}</strong><span>{s.artist}</span></div><span className="track-genre">{s.genre}</span><span className="track-length">{fmt(s.length)}</span><button className={liked.includes(s.id) ? "like-button liked" : "like-button"} aria-label="Toggle like" onClick={(e) => { e.stopPropagation(); toggleLike(s.id); }}>{liked.includes(s.id) ? "♥" : "♡"}</button>
          </div>)}</div>
        </section>
        <footer className="page-footer">FREQ <span>•</span> A NOT USED Inc. concept <span>•</span> Demo catalog</footer>
      </main>

      <footer className="player-bar">
        <div className="playing-info">{current ? <><Cover mood={current.mood} mark={current.album.slice(0, 1)} small/><div className="playing-text"><strong>{current.title}</strong><span>{current.artist}</span></div><button className={liked.includes(current.id) ? "like-button liked" : "like-button"} onClick={() => toggleLike(current.id)}>{liked.includes(current.id) ? "♥" : "♡"}</button></> : <><Cover mood="red" mark="F" small/><div className="playing-text"><strong>Select a track</strong><span>FREQ demo catalog</span></div></>}</div>
        <div className="player-controls"><div className="control-row"><button className={shuffle ? "control active" : "control"} aria-label="Shuffle" onClick={() => setShuffle(!shuffle)}>⤨</button><button className="control" aria-label="Previous" onClick={previous}>◀</button><button className="play-control" aria-label="Play or pause" onClick={togglePlay}>{playing ? "Ⅱ" : "▶"}</button><button className="control" aria-label="Next" onClick={next}>▶|</button><button className={repeat ? "control active" : "control"} aria-label="Repeat" onClick={() => setRepeat(!repeat)}>↻</button></div><div className="timeline"><span>{fmt(seconds)}</span><input type="range" min="0" max={current?.length || 1} value={Math.min(seconds, current?.length || 1)} onChange={(e) => setSeconds(Number(e.target.value))} /><span>{fmt(current?.length || 0)}</span></div></div>
        <div className="volume-control"><span>◖</span><input aria-label="Volume" type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))}/></div>
      </footer>
    </div>
  );
}

export default App;
