import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "parking_saved_spots";

// Inject fonts + base styles
const style = document.createElement("style");
style.textContent = `
  @font-face {
    font-family: 'HaemaeumFont';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/2410-2@1.0/SDGiyomi.woff2') format('woff2');
    font-weight: normal;
  }
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #fff; }

  .hand { font-family: 'HaemaeumFont', 'Caveat', cursive; }

  .card {
    border: 2.5px solid #1a1a1a;
    border-radius: 26px 14px 22px 16px / 16px 24px 13px 28px;
    padding: 28px 24px;
    background: #fff;
    position: relative;
  }

  .photo-box {
    border: 2px dashed #ccc;
    border-radius: 14px;
    width: 100%;
    aspect-ratio: 1.05/1;
    margin-top: 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
    background: #fff;
  }
  .photo-box:active { background: #fafafa; }

  .checkbox-box {
    width: 22px;
    height: 22px;
    border: 2px solid #1a1a1a;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    font-size: 14px;
    color: #2ecc71;
    font-weight: 700;
  }
  .floor-input {
    font-family: 'HaemaeumFont', 'Caveat', cursive;
    font-size: 20px;
    border: none;
    border-bottom: 2px solid #1a1a1a;
    width: 46px;
    text-align: center;
    outline: none;
    background: transparent;
    color: #1a1a1a;
  }
  .floor-input:disabled { border-bottom-color: #ddd; color: #ccc; }
  .floor-input::placeholder { color: #ccc; }

  .underline-input {
    font-family: 'HaemaeumFont', 'Caveat', cursive;
    font-size: 18px;
    border: none;
    outline: none;
    background: transparent;
    color: #1a1a1a;
    width: 100%;
    padding-bottom: 6px;
    border-bottom: 1.5px solid #1a1a1a;
  }
  .underline-input::placeholder { color: #ccc; }

  .speech-bubble {
    border: 2.2px solid #1a1a1a;
    border-radius: 50% 50% 50% 50% / 38% 38% 62% 62%;
    padding: 22px 32px;
    text-align: center;
    position: relative;
    background: #fff;
  }

  .tag-bubble {
    position: absolute;
    top: -18px;
    left: 18px;
    background: #1a1a1a;
    color: #fff;
    border-radius: 50px 50px 50px 4px;
    padding: 6px 16px;
    font-size: 14px;
    transform: rotate(-2deg);
  }

  .tab-btn {
    font-family: 'Pretendard', sans-serif;
    font-size: 13px;
    font-weight: 600;
    background: none;
    border: 2px solid #1a1a1a;
    padding: 6px 14px;
    cursor: pointer;
  }
  .tab-btn.active { background: #1a1a1a; color: #fff; }
  .tab-btn:first-child { border-radius: 20px 4px 4px 20px; }
  .tab-btn:last-child { border-radius: 4px 20px 20px 4px; border-left: none; }

  .pretendard { font-family: 'Pretendard', sans-serif; }

  .action-pill {
    border-radius: 999px;
    text-align: center;
    padding: 16px;
    cursor: pointer;
    width: 100%;
  }
  .action-pill.dark { background: #1a1a1a; color: #fff; border: none; }
  .action-pill.outline { background: #fff; color: #1a1a1a; border: 2.2px solid #1a1a1a; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .anim { animation: fadeIn 0.25s ease; }
`;
document.head.appendChild(style);

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}시간 ${m}분`;
  if (m > 0) return `${m}분 ${s}초`;
  return `${s}초`;
}

function formatDate(ts) {
  const d = new Date(ts);
  const ampm = d.getHours() < 12 ? "오전" : "오후";
  const hour12 = d.getHours() % 12 || 12;
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${ampm} ${String(hour12).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Hand-drawn SVG icons matching the reference exactly
const ParkingHero = () => (
  <svg width="92" height="52" viewBox="0 0 92 52" fill="none">
    <rect x="2" y="2" width="30" height="26" rx="5" stroke="#1a1a1a" strokeWidth="2.3" fill="#fff"/>
    <text x="17" y="21" textAnchor="middle" fontFamily="HaemaeumFont, Caveat, cursive" fontWeight="700" fontSize="19" fill="#2ecc71">P</text>
    <line x1="17" y1="28" x2="17" y2="50" stroke="#1a1a1a" strokeWidth="2.3"/>
    <path d="M40 36 C40 36 42 26 49 25 L62 24 L74 25 C81 26 83 36 83 36 L87 38 L87 42 L36 42 L36 38 Z" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="47" cy="43" r="4.3" stroke="#1a1a1a" strokeWidth="2" fill="none"/>
    <circle cx="76" cy="43" r="4.3" stroke="#1a1a1a" strokeWidth="2" fill="none"/>
    <path d="M51 30 L53.5 25.7 L70 25.7 L74 30 Z" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
    <line x1="61.5" y1="25.7" x2="61.5" y2="30" stroke="#1a1a1a" strokeWidth="1.3"/>
  </svg>
);

const PIcon = ({ color = "#2ecc71" }) => (
  <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
    <rect x="3" y="3" width="26" height="22" rx="4" stroke="#1a1a1a" strokeWidth="2.3" fill="#fff"/>
    <text x="16" y="19" textAnchor="middle" fontFamily="HaemaeumFont, Caveat, cursive" fontWeight="700" fontSize="16" fill={color}>P</text>
  </svg>
);

const CameraIcon = () => (
  <svg width="42" height="34" viewBox="0 0 42 34" fill="none">
    <path d="M4 9 C4 9 6 7 10 7 L13 7 L15 4 L27 4 L29 7 L32 7 C36 7 38 9 38 9 L38 28 C38 30 36 32 34 32 L8 32 C6 32 4 30 4 28 Z" stroke="#ccc" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
    <circle cx="21" cy="19" r="6.5" stroke="#ccc" strokeWidth="1.8" fill="none"/>
    <circle cx="21" cy="19" r="2.6" stroke="#ddd" strokeWidth="1.3" fill="none"/>
    <rect x="29" y="9" width="5" height="3" rx="0.5" stroke="#ccc" strokeWidth="1.3" fill="none"/>
  </svg>
);

const PencilIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M3 19 L4 14 L14 4 L18 8 L8 18 Z" stroke="#1a1a1a" strokeWidth="1.8" strokeLinejoin="round" fill="none"/>
    <line x1="11" y1="7" x2="15" y2="11" stroke="#1a1a1a" strokeWidth="1.5"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="24" height="30" viewBox="0 0 24 30" fill="none">
    <rect x="2.5" y="2" width="19" height="26" rx="3.2" stroke="#1a1a1a" strokeWidth="2" fill="none"/>
    <line x1="8" y1="5.5" x2="16" y2="5.5" stroke="#1a1a1a" strokeWidth="1.4"/>
  </svg>
);

export default function App() {
  const [screen, setScreen] = useState("home"); // home | parked | saved
  const [currentSpot, setCurrentSpot] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [savedSpots, setSavedSpots] = useState([]);
  const [memoText, setMemoText] = useState("");
  const [floorType, setFloorType] = useState("ground");
  const [floorNum, setFloorNum] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const fileRef = useRef();
  const timerRef = useRef();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSavedSpots(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (currentSpot) {
      timerRef.current = setInterval(() => setElapsed(Date.now() - currentSpot.startTime), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [currentSpot]);

  function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewPhoto(ev.target.result);
    reader.readAsDataURL(file);
  }

  function startParking() {
    if (!previewPhoto) return;
    setCurrentSpot({ photo: previewPhoto, note: memoText, floorType, floorNum, startTime: Date.now() });
    setElapsed(0);
    setPreviewPhoto(null);
    setMemoText("");
    setFloorType("ground");
    setFloorNum("");
    setScreen("parked");
  }

  function exitParking() {
    setCurrentSpot(null);
    clearInterval(timerRef.current);
    setScreen("home");
  }

  function saveSpot() {
    if (!currentSpot) return;
    const newSpot = { ...currentSpot, id: Date.now() };
    const updated = [newSpot, ...savedSpots];
    setSavedSpots(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
    alert("저장했어요!");
  }

  function deleteSaved(id) {
    const updated = savedSpots.filter(s => s.id !== id);
    setSavedSpots(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  }

  const wrap = {
    minHeight: "100vh",
    background: "#fff",
    color: "#1a1a1a",
    maxWidth: 390,
    margin: "0 auto",
    padding: "24px 22px 60px",
  };

  // ── HOME (matches reference image 1 exactly) ──
  const HomeScreen = (
    <div className="anim">
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <ParkingHero />
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <PIcon />
          <span className="hand" style={{ fontSize: 22 }}>기둥사진 찍기</span>
        </div>

        <div className="photo-box" onClick={() => fileRef.current.click()}>
          {previewPhoto
            ? <img src={previewPhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <>
                <CameraIcon />
                <div className="hand" style={{ fontSize: 17, color: "#ccc", marginTop: 10 }}>탭해서 사진 찍기</div>
              </>
          }
        </div>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handlePhotoSelect} />

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 22 }}>
          <PencilIcon />
          <span className="hand" style={{ fontSize: 21 }}>위치 메모메모</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setFloorType("ground")}>
            <div className="checkbox-box">{floorType === "ground" ? "✓" : ""}</div>
            <span className="hand" style={{ fontSize: 19 }}>지상</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setFloorType("underground")}>
            <div className="checkbox-box">{floorType === "underground" ? "✓" : ""}</div>
            <span className="hand" style={{ fontSize: 19 }}>지하</span>
          </div>
          <input
            className="floor-input"
            placeholder="__"
            disabled={floorType !== "underground"}
            value={floorNum}
            onChange={e => setFloorNum(e.target.value.replace(/[^0-9]/g, ""))}
          />
          <span className="hand" style={{ fontSize: 19 }}>층</span>
        </div>

        <input
          className="underline-input"
          style={{ marginTop: 22 }}
          placeholder="추가 메모 (예: 32번 기둥 옆)"
          value={memoText}
          onChange={e => setMemoText(e.target.value)}
        />
      </div>

      <button
        className="action-pill dark hand"
        style={{ marginTop: 18, fontSize: 19, border: "none", opacity: previewPhoto ? 1 : 0.35 }}
        onClick={startParking}
        disabled={!previewPhoto}
      >
        주차 시작!
      </button>
    </div>
  );

  // ── PARKED (matches reference image 2) ──
  const ParkedScreen = currentSpot && (
    <div className="anim">
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <ParkingHero />
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <PIcon color="#e74c3c" />
            <span className="hand" style={{ fontSize: 22 }}>주차중</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="pretendard" style={{ fontSize: 22, fontWeight: 800 }}>{formatDuration(elapsed)}</div>
            <div className="pretendard" style={{ fontSize: 11, color: "#aaa" }}>{formatDate(currentSpot.startTime)} 주차</div>
          </div>
        </div>

        <div className="photo-box" style={{ marginTop: 18, cursor: "default", borderStyle: "solid", borderColor: "#eee" }}>
          <img src={currentSpot.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 22 }}>
          <PencilIcon />
          <span className="hand" style={{ fontSize: 21 }}>위치 메모메모</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="checkbox-box">{currentSpot.floorType === "ground" ? "✓" : ""}</div>
            <span className="hand" style={{ fontSize: 19 }}>지상</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="checkbox-box">{currentSpot.floorType === "underground" ? "✓" : ""}</div>
            <span className="hand" style={{ fontSize: 19 }}>지하</span>
          </div>
          <span className="hand" style={{ fontSize: 19, borderBottom: "2px solid #1a1a1a", minWidth: 30, textAlign: "center" }}>
            {currentSpot.floorNum || "__"}
          </span>
          <span className="hand" style={{ fontSize: 19 }}>층</span>
        </div>

        {currentSpot.note && (
          <div className="hand" style={{ fontSize: 18, marginTop: 18, paddingTop: 14, borderTop: "1.5px solid #1a1a1a" }}>
            {currentSpot.note}
          </div>
        )}
      </div>

      <button
        className="action-pill dark"
        style={{ marginTop: 18, fontFamily: "Pretendard, sans-serif", fontWeight: 600, fontSize: 15 }}
        onClick={() => { if (confirm("출차 완료! 기록 지울까요?")) exitParking(); }}
      >
        출차 완료 &amp; 기록 삭제
      </button>
      <div className="speech-bubble" style={{ marginTop: 14, cursor: "pointer" }} onClick={saveSpot}>
        <span className="hand" style={{ fontSize: 18 }}>돌아올때까지 이 위치 기억해두기</span>
      </div>

      <div className="pretendard" style={{ textAlign: "center", marginTop: 16 }}>
        <span
          style={{ fontSize: 14, color: "#888", borderBottom: "1.5px solid #888", paddingBottom: 2, cursor: "pointer" }}
          onClick={() => setScreen("saved")}
        >
          저장됨
        </span>
      </div>
    </div>
  );

  // ── SAVED (matches reference image 3) ──
  const SavedScreen = (
    <div className="anim">
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <ParkingHero />
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <PhoneIcon />
          <span className="hand" style={{ fontSize: 22 }}>저장된 주차 위치</span>
        </div>

        {savedSpots.length === 0 ? (
          <div className="pretendard" style={{ textAlign: "center", padding: "40px 0", color: "#ccc", fontSize: 15, lineHeight: 1.8 }}>
            저장된 위치가 없어요<br />장기주차 시 저장해두세요!
          </div>
        ) : (
          savedSpots.map(spot => (
            <div key={spot.id} style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 22, paddingBottom: 18, borderBottom: "1.5px solid #eee" }}>
              <img src={spot.photo} alt="" style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: "1.5px solid #eee" }} />
              <div style={{ flex: 1 }}>
                <div className="pretendard" style={{ fontSize: 12, color: "#aaa" }}>{formatDate(spot.startTime)} 주차</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div className="checkbox-box" style={{ width: 17, height: 17, fontSize: 11 }}>{spot.floorType === "ground" ? "✓" : ""}</div>
                    <span className="hand" style={{ fontSize: 15 }}>지상</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div className="checkbox-box" style={{ width: 17, height: 17, fontSize: 11 }}>{spot.floorType === "underground" ? "✓" : ""}</div>
                    <span className="hand" style={{ fontSize: 15 }}>지하 {spot.floorNum || "__"}층</span>
                  </div>
                </div>
                {spot.note && <div className="hand" style={{ fontSize: 14, color: "#888", marginTop: 4 }}>{spot.note}</div>}
              </div>
              <button onClick={() => { if (confirm("삭제할까요?")) deleteSaved(spot.id); }}
                style={{ background: "none", border: "none", color: "#e74c3c", fontSize: 18, fontWeight: 700, cursor: "pointer" }}>✕</button>
            </div>
          ))
        )}
      </div>

      <button
        className="action-pill outline pretendard"
        style={{ marginTop: 18, fontSize: 15, fontWeight: 600 }}
        onClick={() => setScreen(currentSpot ? "parked" : "home")}
      >
        {currentSpot ? "주차중 화면으로" : "새로 주차하기"}
      </button>
    </div>
  );

  return (
    <div style={wrap}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginBottom: 8 }}>
        {!currentSpot && (
          <button className="tab-btn" style={screen === "home" ? { background: "#1a1a1a", color: "#fff" } : {}} onClick={() => setScreen("home")}>기록</button>
        )}
        {currentSpot && (
          <button className="tab-btn" style={screen === "parked" ? { background: "#1a1a1a", color: "#fff" } : {}} onClick={() => setScreen("parked")}>주차중</button>
        )}
        <button className="tab-btn" style={screen === "saved" ? { background: "#1a1a1a", color: "#fff" } : {}} onClick={() => setScreen("saved")}>저장됨</button>
      </div>

      {screen === "home" && !currentSpot && HomeScreen}
      {currentSpot && screen === "parked" && ParkedScreen}
      {screen === "saved" && SavedScreen}
    </div>
  );
}
