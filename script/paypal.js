const KEY = "paypal", GROUP = "Paypal";
async function request(params) {
  return new Promise((resolve) => {
    $httpClient.get(params, (error, response, data) => {
      resolve({ error, response, data });
    });
  });
}
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
const UA = { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1" };
const get = (url, t) => request({ url, headers: Object.assign({}, UA, hdr), timeout: t || 8 });
const flag = (cc) => cc && cc.length === 2 ? String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 127397 + c.charCodeAt(0))) : "";

(async () => {
  const svc = S[KEY];
  if (!svc) return $done({ content: "Unknown service: " + KEY });
  const [r, g] = await Promise.all([get(svc.url), get("http://ip-api.com/json/?fields=status,countryCode,city,isp&lang=zh-CN", 6)]);
  let exit = "exit unknown";
  try {
    const j = JSON.parse(g.data || "");
    if (j.status === "success") exit = `${flag(j.countryCode)} ${j.countryCode} ${j.city || ""} · ${(j.isp || "").slice(0, 18)}`.trim();
  } catch (_) {}
  const route = GROUP || "current";
  const s = r.response ? r.response.status || r.response.statusCode : 0;
  const body = r.data || "";
  let state, color;
  if (r.error || !s) { state = "Network Error"; color = "#8E8E93"; }
  else if (svc.ok(s, body)) { state = "Available"; color = "#34C759"; }
  else { state = "Not Available (" + s + ")"; color = "#FF3B30"; }
  $done({ content: state + "\n" + route + " → " + exit, backgroundColor: color });
})().catch((e) => $done({ content: "Script error: " + e }));
