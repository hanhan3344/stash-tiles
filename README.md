# stash-tiles

Stash（iOS）折叠面板，放在「第三方服务」里。每个服务显示两项：
- 能不能用：✅ 可用 / ❌ 不可用(状态码) / ⚠️ 连接失败
- 走哪个策略组，以及出口在哪：例如 `AI-专线 → 🇺🇸 US Los Angeles · 运营商`

安装：Stash → 覆写 → 从 URL 安装
https://fastly.jsdelivr.net/gh/hanhan3344/stash-tiles@main/han-route.stoverride

## 限制
- Stash 脚本接口读不到策略组当前选中的是哪个节点，所以面板显示的是策略组名加出口的国家、城市和运营商，不是节点名。
- 服务和策略组的对应关系写在 `script/<服务>.js` 第一行，改了规则要同步改。
- 请求通过 `X-Stash-Selected-Proxy` 指定走哪个策略组；出口信息由 ip-api.com 查询。
