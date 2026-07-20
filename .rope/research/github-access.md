# GitHub Access (this machine)

## Question

How should agents reach GitHub for this Rope repository and related fetches?

## Verified Facts

### Origin remote

Fact: Primary git remote `origin` is `git@github.com:WufeiHalf/rope.git`.
Former haizhi remote kept as `haizhi`
(`ssh://git@git.haizhi.com:10022/wufei/rope-skill.git`).
Source: local `git remote -v` after maintainer request
Verified by: shell
Stability: medium
Implication: commits/pushes for this private tool target GitHub `WufeiHalf/rope`.

### Proxy

Fact: GitHub HTTPS and SSH from this environment go through
`http://127.0.0.1:8118`.
- HTTPS: `git config --global http.https://github.com.proxy http://127.0.0.1:8118`
- SSH: `~/.ssh/config` Host `github.com` uses
  `ProxyCommand nc -X connect -x 127.0.0.1:8118 %h %p`
Source: maintainer instruction + live curl/ssh config
Verified by: `curl -x http://127.0.0.1:8118 https://github.com/` → 200;
ssh reaches github.com auth stage via proxy
Stability: medium (local proxy must be running)
Implication: any clone/fetch of GitHub (including mattpocock/skills harvest and
`origin` push) needs the proxy up; do not assume direct GitHub network.

### Auth note

Fact: As of setup, `ssh -T git@github.com` returned `Permission denied (publickey)`
with `~/.ssh/id_ed25519` offered. Proxy path works; GitHub account must authorize
this key (or another configured IdentityFile) before push works.
Source: local ssh test
Verified by: shell
Stability: low until key is added
Implication: first push may need human to add deploy/user SSH key on GitHub.

## Open Questions

- Whether HTTPS git + token is preferred over SSH once key is fixed
