const KEY = "copilot", GROUP = "Available";
// Route: X-Stash-Selected-Proxy (stash.wiki/script/syntax-and-interface). Detection follows pengyanai/misc.
const SHORT = { "AI-专线": "AI专线", "Available": "Avail" };
const H = GROUP ? { "X-Stash-Selected-Proxy": encodeURIComponent(GROUP) } : {};
const req = (o) => new Promise((r) => $httpClient.get(Object.assign({ timeout: 8 }, o, { headers: Object.assign({}, o.headers || {}, o.raw ? {} : H) }), (e, res, d) => r({ e, s: res ? res.status || res.statusCode || 0 : 0, h: (res && res.headers) || {}, d: d || "" })));
const lc = (x) => (x || "").toLowerCase();
const GEO = /not available in your country|unsupported country|unavailable in your region|not yet available/;
const page = (url, word) => async () => { const r = await req({ url }); if (r.e) return null; const b = lc(r.d); if (GEO.test(b)) return false; return b.includes(word) ? true : undefined; };
const nf = async (id) => { const r = await req({ url: "https://www.netflix.com/title/" + id }); const u = r.h["X-Originating-Url"] || r.h["x-originating-url"]; return u ? true : false; };
const C = {
  chatgpt: async () => { const r = await req({ url: "https://api.openai.com/compliance/cookie_requirements", headers: { Origin: "https://platform.openai.com", Referer: "https://platform.openai.com/" } }); if (r.e) return null; return !lc(r.d).includes("unsupported_country") && r.s >= 200 && r.s < 300; },
  codex: async () => { const r = await req({ url: "https://api.openai.com/compliance/cookie_requirements" }); if (r.e) return null; return !lc(r.d).includes("unsupported_country"); },
  claude: page("https://claude.ai", "claude"),
  grok: async () => { const r = await req({ url: "https://grok.com" }); if (r.e) return null; const b = lc(r.d); if (GEO.test(b)) return false; return b.includes("grok") || b.includes("xai") ? true : undefined; },
  gemini: page("https://gemini.google.com", "gemini"),
  copilot: page("https://copilot.microsoft.com", "copilot"),
  disney: async () => { const r = await req({ url: "https://www.disneyplus.com" }); if (r.e) return null; const b = lc(r.d); if (/not available in your (region|country)|service is unavailable/.test(b)) return false; return b.includes("disney") ? true : undefined; },
  netflix: async () => (await nf(70143836)) || (await nf(80197526)),
  youtube: async () => { const r = await req({ url: "https://www.youtube.com/", headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36", "Accept-Language": "en-US,en;q=0.9" } }); if (r.e) return null; if (r.s === 403 || r.s === 451) return false; return r.s < 400; },
  spotify: async () => { const r = await req({ url: "https://spclient.wg.spotify.com/signup/public/v1/account?validate=1&email=test%40test.com" }); if (r.e) return null; try { return JSON.parse(r.d).is_country_launched !== false; } catch (_) { return undefined; } },
  cursor: async () => { const r = await req({ url: "https://cursor.com" }); return r.e ? null : r.s < 500; },
  telegram: async () => { const r = await req({ url: "https://web.telegram.org" }); return r.e ? null : r.s < 500; },
  instagram: async () => { const r = await req({ url: "https://www.instagram.com" }); return r.e ? null : r.s < 500; },
  steam: async () => { const r = await req({ url: "https://store.steampowered.com" }); return r.e ? null : r.s < 500; },
  paypal: async () => { const r = await req({ url: "https://www.paypal.com" }); return r.e ? null : r.s < 500; },
  linuxdo: async () => { const r = await req({ url: "https://linux.do" }); return r.e ? null : r.s < 500; },
};
const cc = async (raw) => { const r = await req({ url: "http://ip-api.com/json/?fields=countryCode", timeout: 5, raw }); try { return JSON.parse(r.d).countryCode || "?"; } catch (_) { return "?"; } };
(async () => {
  const [ok, exit, dflt] = await Promise.all([C[KEY](), cc(false), GROUP && GROUP !== "Available" ? cc(true) : Promise.resolve("")]);
  const warn = dflt && dflt === exit && dflt !== "?" ? "⚠" : "";
  const g = SHORT[GROUP] || GROUP;
  const mark = ok === true ? "✓" : ok === false ? "✗" : ok === null ? "⚠ Err" : "?";
  $done({ content: `${mark} ${exit} · ${g}${warn}`, backgroundColor: ok === true ? "#34C759" : ok === false ? "#FF3B30" : "" });
})().catch((e) => $done({ content: "Err" }));
