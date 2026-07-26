"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <head>
        <title>Something went wrong — WealthPath</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          *{box-sizing:border-box;margin:0;padding:0}
          body{background:#0a0a0a;color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:2rem}
          .card{max-width:480px;width:100%;text-align:center}
          h1{font-size:1.5rem;font-weight:600;margin-bottom:.75rem;color:#fff}
          p{font-size:.95rem;color:#a1a1aa;line-height:1.6;margin-bottom:1.5rem}
          button{background:#9c1b1b;color:#fff;border:none;padding:.75rem 1.5rem;border-radius:.5rem;font-size:.95rem;font-weight:500;cursor:pointer}
          button:hover{background:#b91c1c}
        `}</style>
      </head>
      <body>
        <div className="card">
          <h1>Something went wrong</h1>
          <p>
            We ran into an unexpected error. Please try refreshing the page.
            {error.digest && (
              <span style={{ display: "block", marginTop: ".5rem", fontSize: ".8rem", color: "#71717a" }}>
                Error ID: {error.digest}
              </span>
            )}
          </p>
          <button onClick={reset}>Try again</button>
        </div>
      </body>
    </html>
  )
}
