const KEY = "paypal", GROUP = "Paypal";
// Han's Stash route tiles. argument: "<service-key>|<policy-group>"

const S = {
  chatgpt: { url: "https://chatgpt.com/cdn-cgi/trace", ok: (s, b) => !/loc=(CN|HK|RU|IR|KP|MO)\b/.test(b) && s === 200 },
  codex:   { url: "https://chatgpt.com/codex", ok: (s, b) => s < 400 && !/unsupported_country/i.test(b) },
  claude:  { url: "https://claude.ai/login", ok: (s, b) => s < 400 && !/unavailable in your region|not available in your country/i.test(b) },
  grok:    { url: "https://grok.com", ok: (s, b) => s < 400 && !/not available in your (country|region)/i.test(b) },
  gemini:  { url: "https://gemini.google.com", ok: (s, b) => s < 400 && !/not (yet )?available in your country|45631641/i.test(b) },
  copilot: { url: "https://copilot.microsoft.com", ok: (s, b) => s < 400 && !/not available in your region/i.test(b) },
  cursor:  { url: "https://cursor.com", ok: (s) => s < 400 },
  youtube: { url: "https://www.youtube.com/premium", ok: (s, b) => s === 200 && !/Premium is not available in your country/i.test(b) },
  netflix: { url: "https://www.netflix.com/title/81280792", ok: (s) => s === 200 },
  disney:  { url: "https://www.disneyplus.com", ok: (s, b) => s < 400 && !/not available in your region|unavailable/i.test(b) },
  spotify: { url: "https://www.spotify.com/us/signup", ok: (s) => s < 400 },
  telegram:{ url: "https://web.telegram.org", ok: (s) => s < 400 },
  instagram:{ url: "https://www.instagram.com", ok: (s) => s < 400 },
  steam:   { url: "https://store.steampowered.com", ok: (s) => s < 400 },
  paypal:  { url: "https://www.paypal.com", ok: (s) => s < 400 },
  linuxdo: { url: "https://linux.do", ok: (s) => s < 500 },
};
const hdr = GROUP ? { "X-Stash-Selected-Proxy": encodeURIComponent(GROUP) } : {};
const get = (url, t) => new Promise((r) =>
  $httpClient.get({ url, headers: Object.assign({ "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1" }, hdr), timeout: t || 8 },
    (e, res, d) => r({ e, s: res ? res.status || res.statusCode : 0, d: d || "" })));
const flag = (cc) => cc && cc.length === 2 ? String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 127397 + c.charCodeAt(0))) : "🌐";

(async () => {
  const svc = S[KEY];
  if (!svc) return $done({ content: "未知服务: " + KEY });
  const [r, g] = await Promise.all([get(svc.url), get("http://ip-api.com/json/?fields=status,countryCode,city,isp&lang=zh-CN", 6)]);
  let exit = "出口未知";
  try { const j = JSON.parse(g.d); if (j.status === "success") exit = `${flag(j.countryCode)} ${j.countryCode} ${j.city || ""} · ${(j.isp || "").slice(0, 18)}`.trim(); } catch (_) {}
  const route = GROUP || "当前节点";
  let state, color;
  if (r.e || !r.s) { state = "⚠️ 连接失败"; color = "#8E8E93"; }
  else if (svc.ok(r.s, r.d)) { state = "✅ 可用"; color = "#34C759"; }
  else { state = `❌ 不可用(${r.s})`; color = "#FF3B30"; }
  $done({ content: `${state}\n${route} → ${exit}`, backgroundColor: color });
})().catch((e) => $done({ content: "脚本异常: " + e }));
