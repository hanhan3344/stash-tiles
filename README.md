# stash-tiles

Stash collapsed tiles (third-party services). Each tile shows:
- Availability: Available / Not available / Network error
- Policy group + exit region (country/city/ISP)

Install (stable, GitHub raw, ~5 min cache):

```
https://raw.githubusercontent.com/hanhan3344/stash-tiles/main/han-route.stoverride
```

## Limits
- Stash scripts cannot read which proxy a policy group currently selects; tiles show group name plus egress geo via ip-api.com.
- Service → group mapping is hardcoded in `script/<service>.js` (first line).
- Requests use `X-Stash-Selected-Proxy` set to the policy group name.

`clone-test.stoverride` is an English clone of pengyanai's pack (scripts still from pengyanai) for hosting diagnostics.
