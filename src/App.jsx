import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "parking_saved_spots";

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}시간 ${m}분 ${s}초`;
  if (m > 0) return `${m}분 ${s}초`;
  return `${s}초`;
}

function formatDate(ts) {
  return new Date(ts).toLocaleString("ko-KR", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function App() {
  const [screen, setScreen] = useState("home"); // home | parked | saved
  const [currentSpot, setCurrentSpot] = useState(null); // { photo, note, startTime }
  const [elapsed, setElapsed] = useState(0);
  const [savedSpots, setSavedSpots] = useState([]);
  const [memo, setMemo] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const fileRef = useRef();
  const timerRef = useRef();

  // Load saved spots
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSavedSpots(JSON.parse(raw));
    } catch {}
  }, []);

  // Timer
  useEffect(() => {
    if (currentSpot) {
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - currentSpot.startTime);
      }, 1000);
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
    const spot = { photo: previewPhoto, note: memo, startTime: Date.now() };
    setCurrentSpot(spot);
    setElapsed(0);
    setPreviewPhoto(null);
    setMemo("");
    setScreen("parked");
  }

  function exitParking() {
    setCurrentSpot(null);
    clearInterval(timerRef.current);
    setScreen("home");
  }

  function saveSpot() {
    if (!currentSpot) return;
    const newSpot = { ...currentSpot, id: Date.now(), label: `저장된 주차 ${formatDate(currentSpot.startTime)}` };
    const updated = [newSpot, ...savedSpots];
    setSavedSpots(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
    alert("주차 위치가 저장됐어요!");
  }

  function deleteSaved(id) {
    const updated = savedSpots.filter(s => s.id !== id);
    setSavedSpots(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  }

  // ─── STYLES ──────────────────────────────────────────────────
  const s = {
    app: {
      minHeight: "100vh",
      background: "#0f1117",
      color: "#f0f0f0",
      fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 0 40px",
      maxWidth: 430,
      margin: "0 auto",
    },
    header: {
      width: "100%",
      padding: "20px 20px 0",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    logo: {
      fontSize: 20,
      fontWeight: 700,
      letterSpacing: "-0.5px",
      color: "#fff",
    },
    logoAccent: { color: "#4ADE80" },
    tabRow: {
      display: "flex",
      gap: 8,
    },
    tab: (active) => ({
      padding: "6px 14px",
      borderRadius: 20,
      border: "none",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 600,
      background: active ? "#4ADE80" : "#1e2130",
      color: active ? "#0f1117" : "#888",
      transition: "all 0.15s",
    }),
    card: {
      width: "calc(100% - 40px)",
      background: "#1a1d2e",
      borderRadius: 20,
      padding: "24px 20px",
      marginTop: 20,
    },
    label: {
      fontSize: 12,
      color: "#666",
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: "0.8px",
      fontWeight: 600,
    },
    photoPicker: {
      width: "100%",
      aspectRatio: "4/3",
      borderRadius: 14,
      background: "#0f1117",
      border: "2px dashed #2a2d3e",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      overflow: "hidden",
      position: "relative",
    },
    photoImg: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: 12,
    },
    photoHint: { fontSize: 13, color: "#555", marginTop: 8 },
    cameraIcon: { fontSize: 36 },
    input: {
      width: "100%",
      background: "#0f1117",
      border: "1.5px solid #2a2d3e",
      borderRadius: 10,
      padding: "12px 14px",
      color: "#f0f0f0",
      fontSize: 15,
      outline: "none",
      boxSizing: "border-box",
      marginTop: 4,
    },
    btnPrimary: {
      width: "100%",
      padding: "16px",
      background: "#4ADE80",
      color: "#0f1117",
      border: "none",
      borderRadius: 14,
      fontSize: 16,
      fontWeight: 700,
      cursor: "pointer",
      marginTop: 16,
      letterSpacing: "-0.2px",
    },
    btnSecondary: {
      width: "100%",
      padding: "14px",
      background: "#1e2130",
      color: "#ccc",
      border: "none",
      borderRadius: 14,
      fontSize: 15,
      fontWeight: 600,
      cursor: "pointer",
      marginTop: 10,
    },
    btnDanger: {
      width: "100%",
      padding: "14px",
      background: "#2a1217",
      color: "#f87171",
      border: "none",
      borderRadius: 14,
      fontSize: 15,
      fontWeight: 600,
      cursor: "pointer",
      marginTop: 10,
    },
    timerBox: {
      background: "#0f1117",
      borderRadius: 16,
      padding: "20px",
      textAlign: "center",
      marginBottom: 16,
    },
    timerLabel: { fontSize: 12, color: "#555", letterSpacing: "1px", textTransform: "uppercase" },
    timerValue: { fontSize: 42, fontWeight: 800, color: "#4ADE80", letterSpacing: "-1px", lineHeight: 1.1, marginTop: 4 },
    parkedPhoto: {
      width: "100%",
      aspectRatio: "4/3",
      objectFit: "cover",
      borderRadius: 14,
      marginBottom: 14,
    },
    noteText: { fontSize: 15, color: "#bbb", marginTop: 4 },
    savedItem: {
      background: "#0f1117",
      borderRadius: 14,
      padding: 14,
      marginBottom: 12,
      display: "flex",
      gap: 12,
      alignItems: "flex-start",
    },
    savedThumb: {
      width: 70,
      height: 70,
      borderRadius: 10,
      objectFit: "cover",
      flexShrink: 0,
    },
    savedInfo: { flex: 1 },
    savedLabel: { fontSize: 13, color: "#888", marginBottom: 4 },
    savedNote: { fontSize: 15, color: "#f0f0f0", fontWeight: 600 },
    savedDate: { fontSize: 12, color: "#555", marginTop: 4 },
    deleteBtn: {
      background: "none",
      border: "none",
      color: "#f87171",
      cursor: "pointer",
      fontSize: 18,
      padding: 4,
    },
    empty: {
      textAlign: "center",
      color: "#444",
      fontSize: 15,
      padding: "40px 0",
    },
  };

  // ─── SCREENS ─────────────────────────────────────────────────

  const HomeScreen = (
    <div style={s.card}>
      <p style={s.label}>주차 기록 시작</p>
      <div style={s.photoPicker} onClick={() => fileRef.current.click()}>
        {previewPhoto
          ? <img src={previewPhoto} alt="preview" style={s.photoImg} />
          : <>
              <span style={s.cameraIcon}>📷</span>
              <span style={s.photoHint}>기둥 사진 촬영 / 업로드</span>
            </>
        }
      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment"
        style={{ display: "none" }} onChange={handlePhotoSelect} />

      <div style={{ marginTop: 16 }}>
        <p style={s.label}>메모 (선택)</p>
        <input
          style={s.input}
          placeholder="예: B2, 32번 기둥 옆"
          value={memo}
          onChange={e => setMemo(e.target.value)}
        />
      </div>

      <button
        style={{ ...s.btnPrimary, opacity: previewPhoto ? 1 : 0.4 }}
        onClick={startParking}
        disabled={!previewPhoto}
      >
        🅿️ 주차 시작
      </button>
    </div>
  );

  const ParkedScreen = currentSpot && (
    <div style={s.card}>
      <div style={s.timerBox}>
        <p style={s.timerLabel}>주차 경과 시간</p>
        <p style={s.timerValue}>{formatDuration(elapsed)}</p>
        <p style={{ fontSize: 12, color: "#444", marginTop: 6 }}>
          {formatDate(currentSpot.startTime)} 주차
        </p>
      </div>

      <img src={currentSpot.photo} alt="주차 기둥" style={s.parkedPhoto} />

      {currentSpot.note && (
        <p style={s.noteText}>📝 {currentSpot.note}</p>
      )}

      <button style={s.btnSecondary} onClick={saveSpot}>
        🔖 이 위치 저장해두기 (장기주차)
      </button>
      <button style={s.btnDanger} onClick={() => {
        if (confirm("출차 완료! 주차 기록을 삭제할까요?")) exitParking();
      }}>
        🚗 출차 완료 — 기록 삭제
      </button>
    </div>
  );

  const SavedScreen = (
    <div style={{ ...s.card }}>
      <p style={s.label}>저장된 주차 위치</p>
      {savedSpots.length === 0
        ? <p style={s.empty}>저장된 주차 위치가 없어요.<br />장기주차 시 저장해두세요!</p>
        : savedSpots.map(spot => (
          <div key={spot.id} style={s.savedItem}>
            <img src={spot.photo} alt="" style={s.savedThumb} />
            <div style={s.savedInfo}>
              <p style={s.savedLabel}>저장된 주차</p>
              <p style={s.savedNote}>{spot.note || "메모 없음"}</p>
              <p style={s.savedDate}>{formatDate(spot.startTime)}</p>
            </div>
            <button style={s.deleteBtn} onClick={() => {
              if (confirm("이 저장 위치를 삭제할까요?")) deleteSaved(spot.id);
            }}>✕</button>
          </div>
        ))
      }
    </div>
  );

  // ─── RENDER ──────────────────────────────────────────────────
  return (
    <div style={s.app}>
      <div style={s.header}>
        <span style={s.logo}>🅿 <span style={s.logoAccent}>주차</span>기록</span>
        <div style={s.tabRow}>
          {!currentSpot && (
            <button style={s.tab(screen === "home")} onClick={() => setScreen("home")}>기록</button>
          )}
          {currentSpot && (
            <button style={s.tab(screen === "parked")} onClick={() => setScreen("parked")}>주차중</button>
          )}
          <button style={s.tab(screen === "saved")} onClick={() => setScreen("saved")}>저장됨</button>
        </div>
      </div>

      {screen === "home" && !currentSpot && HomeScreen}
      {(screen === "parked" || currentSpot) && screen !== "saved" && ParkedScreen}
      {screen === "saved" && SavedScreen}
    </div>
  );
}
