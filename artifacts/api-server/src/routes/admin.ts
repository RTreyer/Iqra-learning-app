import { Router, type IRouter, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import { db, usersTable, lessonProgressTable } from "@workspace/db";
import { count, avg, gte, countDistinct, desc } from "drizzle-orm";

const router: IRouter = Router();

// ─── Rate limit: 10 requests per IP per minute, 60-second block on excess ────
const adminRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — try again in 60 seconds" },
});

router.use(adminRateLimit);

// ─── Admin token auth ─────────────────────────────────────────────────────────

function isAdminAuthorized(req: Request): boolean {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return false;

  // Accept token via Authorization: Bearer header only
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7) === adminToken;
  }
  return false;
}

// ─── GET /stats — data endpoint (mounted as /api/admin in routes/index.ts)
//     Full path: /api/admin/stats

router.get("/stats", async (req: Request, res: Response) => {
  if (!isAdminAuthorized(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const now = Date.now();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [totalUsersResult, activeUsers7dResult, activeUsers30dResult, topLessonsResult] =
      await Promise.all([
        // Total registered users
        db.select({ count: count() }).from(usersTable),

        // Active users last 7 days (≥1 lesson completed)
        db
          .select({ count: countDistinct(lessonProgressTable.userId) })
          .from(lessonProgressTable)
          .where(gte(lessonProgressTable.updatedAt, sevenDaysAgo)),

        // Active users last 30 days
        db
          .select({ count: countDistinct(lessonProgressTable.userId) })
          .from(lessonProgressTable)
          .where(gte(lessonProgressTable.updatedAt, thirtyDaysAgo)),

        // Top 10 most-played lessons with avg stars
        db
          .select({
            lessonId: lessonProgressTable.lessonId,
            completions: count(),
            avgStars: avg(lessonProgressTable.stars),
          })
          .from(lessonProgressTable)
          .groupBy(lessonProgressTable.lessonId)
          .orderBy(desc(count()))
          .limit(10),
      ]);

    res.json({
      totalUsers: totalUsersResult[0]?.count ?? 0,
      activeUsers7d: activeUsers7dResult[0]?.count ?? 0,
      activeUsers30d: activeUsers30dResult[0]?.count ?? 0,
      topLessons: topLessonsResult.map((r) => ({
        lessonId: r.lessonId,
        completions: Number(r.completions),
        avgStars: r.avgStars !== null ? parseFloat(Number(r.avgStars).toFixed(2)) : null,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to load admin stats");
    res.status(500).json({ error: "Failed to load stats" });
  }
});

// ─── GET / — HTML dashboard (mounted at /admin in app.ts) ────────────────────

router.get("/", (req: Request, res: Response) => {
  const html = /* html */ `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>إحصائيات أَقْرَأُ — لوحة الإدارة</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      min-height: 100vh;
      padding: 2rem 1rem;
    }
    h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem; color: #f8fafc; }
    .subtitle { font-size: 0.875rem; color: #94a3b8; margin-bottom: 2rem; }
    .auth-box {
      max-width: 400px;
      margin: 4rem auto;
      background: #1e293b;
      border-radius: 12px;
      padding: 2rem;
      border: 1px solid #334155;
    }
    .auth-box h2 { margin-bottom: 1rem; font-size: 1.1rem; }
    .auth-box input {
      width: 100%;
      padding: 0.6rem 1rem;
      border-radius: 8px;
      border: 1px solid #475569;
      background: #0f172a;
      color: #e2e8f0;
      font-size: 1rem;
      margin-bottom: 0.75rem;
    }
    .auth-box button {
      width: 100%;
      padding: 0.6rem 1rem;
      border-radius: 8px;
      border: none;
      background: #3b82f6;
      color: white;
      font-size: 1rem;
      cursor: pointer;
      font-weight: 600;
    }
    .auth-box button:hover { background: #2563eb; }
    .error-msg { color: #f87171; font-size: 0.85rem; margin-top: 0.5rem; display: none; }
    .dashboard { display: none; max-width: 900px; margin: 0 auto; }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .kpi {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 1.25rem;
    }
    .kpi-label { font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.35rem; }
    .kpi-value { font-size: 2rem; font-weight: 700; color: #38bdf8; }
    .section { background: #1e293b; border: 1px solid #334155; border-radius: 12px; overflow: hidden; }
    .section-title {
      padding: 1rem 1.25rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: #94a3b8;
      border-bottom: 1px solid #334155;
      background: #1a2744;
    }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem 1.25rem; font-size: 0.875rem; text-align: right; }
    th { color: #94a3b8; font-weight: 600; background: #162032; }
    tr:not(:last-child) td { border-bottom: 1px solid #1e293b; }
    td:last-child, th:last-child { text-align: left; }
    .stars { color: #fbbf24; }
    .rank { color: #64748b; font-size: 0.75rem; }
    .loading { text-align: center; padding: 3rem; color: #475569; }
    .refresh-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
    .refresh-btn {
      padding: 0.4rem 1rem;
      border-radius: 6px;
      border: 1px solid #334155;
      background: transparent;
      color: #94a3b8;
      font-size: 0.8rem;
      cursor: pointer;
    }
    .refresh-btn:hover { background: #1e293b; color: #e2e8f0; }
    .ts { font-size: 0.75rem; color: #64748b; }
  </style>
</head>
<body>

<!-- Auth gate -->
<div class="auth-box" id="authBox">
  <h2>🔐 الدخول إلى لوحة الإدارة</h2>
  <input type="password" id="tokenInput" placeholder="Admin-Token" autocomplete="current-password" />
  <button onclick="doLogin()">دخول</button>
  <p class="error-msg" id="authError">كلمة المرور غير صحيحة</p>
</div>

<!-- Dashboard -->
<div class="dashboard" id="dashboard">
  <h1>📊 إحصائيات أَقْرَأُ</h1>
  <p class="subtitle" id="lastUpdated">جاري التحميل…</p>

  <div class="refresh-row">
    <span></span>
    <button class="refresh-btn" onclick="loadStats()">↻ تحديث</button>
  </div>

  <div class="kpi-grid">
    <div class="kpi"><div class="kpi-label">إجمالي المستخدمين</div><div class="kpi-value" id="kpiTotal">—</div></div>
    <div class="kpi"><div class="kpi-label">نشطون (آخر 7 أيام)</div><div class="kpi-value" id="kpi7d">—</div></div>
    <div class="kpi"><div class="kpi-label">نشطون (آخر 30 يومًا)</div><div class="kpi-value" id="kpi30d">—</div></div>
  </div>

  <div class="section">
    <div class="section-title">أكثر 10 دروس اكتمالًا</div>
    <div id="tableWrap"><div class="loading">جاري تحميل البيانات…</div></div>
  </div>
</div>

<script>
  let savedToken = sessionStorage.getItem('admin_token') || '';

  if (savedToken) {
    loadStats();
  }

  document.getElementById('tokenInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin();
  });

  function doLogin() {
    savedToken = document.getElementById('tokenInput').value.trim();
    if (!savedToken) return;
    sessionStorage.setItem('admin_token', savedToken);
    loadStats();
  }

  async function loadStats() {
    const url = '/api/admin/stats';
    let data;
    try {
      const res = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + savedToken }
      });
      if (res.status === 401) {
        document.getElementById('authError').style.display = 'block';
        sessionStorage.removeItem('admin_token');
        savedToken = '';
        return;
      }
      data = await res.json();
    } catch {
      document.getElementById('lastUpdated').textContent = 'خطأ في الاتصال بالخادم';
      return;
    }

    document.getElementById('authBox').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('authError').style.display = 'none';

    document.getElementById('kpiTotal').textContent = data.totalUsers.toLocaleString();
    document.getElementById('kpi7d').textContent = data.activeUsers7d.toLocaleString();
    document.getElementById('kpi30d').textContent = data.activeUsers30d.toLocaleString();
    document.getElementById('lastUpdated').textContent = 'آخر تحديث: ' + new Date().toLocaleTimeString('ar-YE');

    if (!data.topLessons || data.topLessons.length === 0) {
      document.getElementById('tableWrap').innerHTML = '<div class="loading">لا توجد بيانات بعد</div>';
      return;
    }

    const rows = data.topLessons.map((l, i) => {
      const starsStr = l.avgStars !== null
        ? '⭐ ' + Number(l.avgStars).toFixed(2)
        : '—';
      return \`<tr>
        <td><span class="rank">#\${i + 1}</span>&nbsp; \${escHtml(l.lessonId)}</td>
        <td>\${Number(l.completions).toLocaleString()}</td>
        <td class="stars">\${starsStr}</td>
      </tr>\`;
    }).join('');

    document.getElementById('tableWrap').innerHTML = \`
      <table>
        <thead><tr><th>معرّف الدرس</th><th>عدد الإتمامات</th><th>متوسط النجوم</th></tr></thead>
        <tbody>\${rows}</tbody>
      </table>\`;
  }

  function escHtml(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
</script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.send(html);
});

export default router;
