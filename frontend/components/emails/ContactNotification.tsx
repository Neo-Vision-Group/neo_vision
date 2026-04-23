/**
 * Email template sent to hello@1210.ai on each contact form submission.
 * Rendered by Resend on the server. Plain JSX — no Tailwind / CSS-in-JS
 * since email clients render ~2002-era HTML.
 */
export function ContactNotification({
  name,
  email,
  company,
  phone,
  projectType,
  budget,
  message,
  source,
  receivedAt,
}: {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  projectType?: string;
  budget?: string;
  message: string;
  source?: string;
  receivedAt: string;
}) {
  const rows: Array<[string, string | undefined]> = [
    ["Name", name],
    ["Email", email],
    ["Company", company || "—"],
    ["Phone", phone || "—"],
    ["Project type", projectType || "—"],
    ["Budget", budget || "—"],
    ["Source", source || "/contact"],
    ["Received", receivedAt],
  ];

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif",
        color: "#111",
        background: "#f7f7f5",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          background: "#fff",
          padding: "32px",
          border: "1px solid #e5e5e5",
        }}
      >
        <h1 style={{ fontSize: 20, margin: "0 0 16px 0" }}>
          New contact form submission
        </h1>

        <table
          cellPadding={8}
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
            margin: "16px 0",
          }}
        >
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label}>
                <td
                  style={{
                    width: 140,
                    color: "#666",
                    verticalAlign: "top",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  {label}
                </td>
                <td
                  style={{
                    fontWeight: 500,
                    verticalAlign: "top",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 style={{ fontSize: 16, marginTop: 24 }}>Message</h2>
        <p style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.5 }}>
          {message}
        </p>

        <p style={{ marginTop: 24, color: "#999", fontSize: 12 }}>
          Reply directly to this email to respond to the sender.
        </p>
      </div>
    </div>
  );
}

