import Icon from "./Icon";

const categoryIcon = (cat) => ({
  wifi: "wifi", vpn: "network", password: "lock",
  access: "lock", hardware: "zap", email: "send",
}[cat] || "ticket");

export default function Sidebar({ activeScreen, setScreen, tickets, onNewTicket }) {
  return (
    <aside style={{
      width: 260,
      minWidth: 260,
      background: "var(--sidebar-bg)",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid oklch(0.22 0.02 255)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icon name="zap" size={16} color="white" />
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>IT Support</div>
            <div style={{ color: "var(--sidebar-muted)", fontSize: 11, fontWeight: 500 }}>Agentic Desk · Team 3</div>
          </div>
        </div>
      </div>

      {/* New Ticket */}
      <div style={{ padding: "16px 14px 8px" }}>
        <button
          onClick={onNewTicket}
          style={{
            width: "100%", padding: "10px 0",
            background: "var(--accent)", color: "white",
            border: "none", borderRadius: 8, cursor: "pointer",
            fontFamily: "inherit", fontSize: 13, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            transition: "opacity 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          <Icon name="plus" size={14} color="white" />
          New Ticket
        </button>
      </div>

      {/* Nav */}
      <nav style={{ padding: "4px 14px" }}>
        {[
          { id: "dashboard", label: "Dashboard",      icon: "home" },
          { id: "history",   label: "Ticket History", icon: "history" },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setScreen(item.id)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "9px 10px", borderRadius: 7, border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: 13, fontWeight: 500,
              background: activeScreen === item.id ? "var(--sidebar-active)" : "transparent",
              color: activeScreen === item.id ? "white" : "var(--sidebar-text)",
              marginBottom: 2, transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={e => { if (activeScreen !== item.id) e.currentTarget.style.background = "var(--sidebar-hover)"; }}
            onMouseLeave={e => { if (activeScreen !== item.id) e.currentTarget.style.background = "transparent"; }}
          >
            <Icon
              name={item.icon}
              size={15}
              color={activeScreen === item.id ? "white" : "var(--sidebar-text)"}
            />
            {item.label}
          </button>
        ))}

        {/* Agent Pipeline — visible only while ticket is processing */}
        {activeScreen === "processing" && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 10px", borderRadius: 7,
            background: "var(--sidebar-active)", marginBottom: 2,
          }}>
            <Icon name="zap" size={15} color="white" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>Agent Pipeline</span>
            <div style={{
              marginLeft: "auto", width: 6, height: 6, borderRadius: "50%",
              background: "var(--accent-light)", animation: "pulse-ring 1.4s ease-out infinite",
            }} />
          </div>
        )}

        {/* Resolution — visible only after a ticket completes */}
        {activeScreen === "resolution" && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 10px", borderRadius: 7,
            background: "var(--sidebar-active)", marginBottom: 2,
          }}>
            <Icon name="check" size={15} color="white" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>Resolution</span>
          </div>
        )}
      </nav>

      <div style={{ margin: "8px 14px", borderTop: "1px solid oklch(0.22 0.02 255)" }} />

      {/* Recent Tickets */}
      <div style={{ padding: "0 14px 6px" }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: "var(--sidebar-muted)",
          letterSpacing: "0.08em", textTransform: "uppercase",
          marginBottom: 6, padding: "0 10px",
        }}>
          Recent Tickets
        </div>
        <div style={{ overflowY: "auto", maxHeight: 340 }}>
          {tickets.map((t) => (
            <div
              key={t.id}
              style={{ padding: "8px 10px", borderRadius: 7, marginBottom: 2, cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--sidebar-hover)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                <Icon name={categoryIcon(t.category)} size={11} color="var(--sidebar-muted)" />
                <span style={{ fontSize: 11, color: "var(--sidebar-muted)", fontFamily: "DM Mono, monospace" }}>{t.id}</span>
                <span style={{ marginLeft: "auto" }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: t.status === "resolved" ? "var(--success)" : "var(--warning)",
                  }} />
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--sidebar-text)", fontWeight: 500, lineHeight: 1.3 }}>
                {t.subject}
              </div>
              <div style={{ fontSize: 11, color: "var(--sidebar-muted)", marginTop: 2 }}>{t.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* User */}
      <div style={{ marginTop: "auto", padding: "14px 14px", borderTop: "1px solid oklch(0.22 0.02 255)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "oklch(0.40 0.12 250)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "white",
          }}>A</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "white" }}>Ali Almathkur</div>
            <div style={{ fontSize: 11, color: "var(--sidebar-muted)" }}>UI/UX Lead</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
