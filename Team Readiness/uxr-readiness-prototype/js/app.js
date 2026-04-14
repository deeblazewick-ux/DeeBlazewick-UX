(function () {
  var D = window.UXR_DATA;
  var S = window.UXR_STORAGE;
  var state = null;

  function el(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  function getMember(id) {
    return state.members.find(function (m) {
      return m.id === id;
    });
  }

  function persist() {
    S.save(state);
    render();
  }

  function initState() {
    var loaded = S.load();
    if (loaded && loaded.version === 1) {
      state = loaded;
      state.members.forEach(function (m) {
        m.notes = m.notes || {};
        m.learning = m.learning || {};
        D.SKILLS.forEach(function (s) {
          if (m.ratings[s.id] === undefined) m.ratings[s.id] = null;
        });
      });
      state.focusTagIds = state.focusTagIds || [];
      return;
    }
    state = D.createDemoState();
    S.save(state);
  }

  function resetDemo() {
    S.clear();
    state = D.createDemoState();
    S.save(state);
    location.hash = "#home";
    render();
  }

  function gapFor(member, skill) {
    var exp = D.expectedLevel(member.roleId, skill);
    var r = member.ratings[skill.id];
    if (r == null) return null;
    return exp - r;
  }

  function skillEmphasized(skill) {
    if (!state.focusTagIds || !state.focusTagIds.length) return false;
    for (var i = 0; i < state.focusTagIds.length; i++) {
      var tag = D.FOCUS_TAGS.find(function (t) {
        return t.id === state.focusTagIds[i];
      });
      if (!tag) continue;
      if (tag.themeHints.indexOf(skill.theme) !== -1) return true;
    }
    return false;
  }

  function sortedSkills() {
    var skills = D.SKILLS.slice();
    skills.sort(function (a, b) {
      var ea = skillEmphasized(a) ? 0 : 1;
      var eb = skillEmphasized(b) ? 0 : 1;
      if (ea !== eb) return ea - eb;
      return a.theme.localeCompare(b.theme) || a.name.localeCompare(b.name);
    });
    return skills;
  }

  /** How many people meet or exceed expected level for this skill */
  function coverageCount(skill) {
    var ok = 0;
    state.members.forEach(function (m) {
      var r = m.ratings[skill.id];
      var exp = D.expectedLevel(m.roleId, skill);
      if (r != null && r >= exp) ok++;
    });
    return ok;
  }

  function nav() {
    var cur = getMember(state.currentUserId);
    return (
      '<header class="border-b border-slate-200 bg-white">' +
      '<div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">' +
      '<div class="flex items-center gap-3">' +
      '<a href="#home" class="text-lg font-semibold text-slate-900">UXR readiness</a>' +
      '<span class="hidden text-sm text-slate-500 sm:inline">Quarterly team coverage & growth</span>' +
      "</div>" +
      '<nav class="flex flex-wrap items-center gap-2 text-sm">' +
      '<a href="#home" class="rounded-md px-3 py-1.5 text-slate-700 hover:bg-slate-100">Home</a>' +
      '<a href="#team" class="rounded-md px-3 py-1.5 text-slate-700 hover:bg-slate-100">Team & quarter</a>' +
      '<a href="#coverage" class="rounded-md px-3 py-1.5 text-slate-700 hover:bg-slate-100">Coverage</a>' +
      '<a href="#assess" class="rounded-md px-3 py-1.5 text-slate-700 hover:bg-slate-100">My assessment</a>' +
      '<a href="#growth" class="rounded-md px-3 py-1.5 text-slate-700 hover:bg-slate-100">My growth</a>' +
      "</nav>" +
      '<div class="flex items-center gap-2">' +
      '<label class="text-xs text-slate-500">View as</label>' +
      '<select id="user-switch" class="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm">' +
      state.members
        .map(function (m) {
          return (
            '<option value="' +
            m.id +
            '"' +
            (m.id === state.currentUserId ? " selected" : "") +
            ">" +
            escapeHtml(m.name) +
            "</option>"
          );
        })
        .join("") +
      "</select>" +
      "</div>" +
      "</div>" +
      '<div class="mx-auto max-w-6xl px-4 pb-3 text-xs text-slate-500">Logged in as <strong class="text-slate-700">' +
      escapeHtml(cur.name) +
      "</strong> · Levels are <strong>visible to the research team</strong>; private notes only show in My assessment.</div>" +
      "</header>"
    );
  }

  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function pageHome() {
    return (
      '<main class="mx-auto max-w-6xl px-4 py-10">' +
      '<div class="max-w-2xl">' +
      '<p class="text-sm font-medium uppercase tracking-wide text-indigo-600">Prototype</p>' +
      "<h1 class=\"mt-2 text-3xl font-bold text-slate-900\">See whether your team can cover this quarter’s research needs</h1>" +
      '<p class="mt-4 text-lg text-slate-600">Set quarter focus, align on role expectations, self-assess once, then use <strong>Coverage</strong> for staffing and <strong>My growth</strong> for development items tied to gaps.</p>' +
      '<div class="mt-8 flex flex-wrap gap-3">' +
      '<a href="#team" class="inline-flex rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow hover:bg-indigo-700">Team & quarter</a>' +
      '<a href="#coverage" class="inline-flex rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50">View coverage</a>' +
      "</div>" +
      '<div class="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6">' +
      '<p class="text-sm font-medium text-slate-800">Demo data</p>' +
      '<p class="mt-1 text-sm text-slate-600">Three sample researchers with partial ratings. Switch user in the header to see peer-visible levels.</p>' +
      '<button type="button" id="btn-reset" class="mt-4 rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm text-red-700 hover:bg-red-50">Reset demo data</button>' +
      "</div>" +
      "</div>" +
      "</main>"
    );
  }

  function pageTeam() {
    var focusChecks = D.FOCUS_TAGS.map(function (t) {
      var on = state.focusTagIds.indexOf(t.id) !== -1;
      return (
        '<label class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 ' +
        (on ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white") +
        '">' +
        '<input type="checkbox" data-focus-id="' +
        t.id +
        '" class="focus-tag h-4 w-4 rounded border-slate-300"' +
        (on ? " checked" : "") +
        " />" +
        '<span class="text-sm text-slate-800">' +
        escapeHtml(t.label) +
        "</span>" +
        "</label>"
      );
    }).join("");

    var memberRows = state.members
      .map(function (m, idx) {
        var opts = D.ROLE_TEMPLATES.map(function (rt) {
          return (
            '<option value="' +
            rt.id +
            '"' +
            (m.roleId === rt.id ? " selected" : "") +
            ">" +
            escapeHtml(rt.name) +
            "</option>"
          );
        }).join("");
        return (
          '<div class="flex flex-wrap items-end gap-3 border-b border-slate-100 py-3" data-member-id="' +
          m.id +
          '">' +
          '<div class="min-w-[140px] flex-1">' +
          '<label class="text-xs text-slate-500">Name</label>' +
          '<input type="text" class="member-name mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm" value="' +
          escapeHtml(m.name) +
          '" />' +
          "</div>" +
          '<div class="w-44">' +
          '<label class="text-xs text-slate-500">Role template</label>' +
          '<select class="member-role mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm">' +
          opts +
          "</select>" +
          "</div>" +
          (state.members.length > 1
            ? '<button type="button" class="remove-member rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50">Remove</button>'
            : "") +
          "</div>"
        );
      })
      .join("");

    return (
      '<main class="mx-auto max-w-6xl px-4 py-8">' +
      "<h1 class=\"text-2xl font-bold text-slate-900\">Team & quarter</h1>" +
      '<p class="mt-2 text-slate-600">Quarter focus tags weight which skills appear first on the Coverage page.</p>' +
      '<div class="mt-8 grid gap-8 lg:grid-cols-2">' +
      '<section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">' +
      '<h2 class="font-semibold text-slate-900">Team</h2>' +
      '<label class="mt-4 block text-xs text-slate-500">Team name</label>' +
      '<input type="text" id="team-name" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value="' +
      escapeHtml(state.teamName) +
      '" />' +
      '<label class="mt-4 block text-xs text-slate-500">Quarter label</label>' +
      '<input type="text" id="quarter-label" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value="' +
      escapeHtml(state.quarterLabel) +
      '" />' +
      '<div id="member-list" class="mt-4">' +
      memberRows +
      "</div>" +
      '<button type="button" id="add-member" class="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800">+ Add member</button>' +
      "</section>" +
      '<section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">' +
      '<h2 class="font-semibold text-slate-900">Quarter focus</h2>' +
      '<p class="mt-1 text-sm text-slate-600">Select what this quarter optimizes for (staffing emphasis).</p>' +
      '<div class="mt-4 flex flex-col gap-2">' +
      focusChecks +
      "</div>" +
      "</section>" +
      "</div>" +
      '<p class="mt-6 text-sm text-slate-500">' +
      D.SKILLS.length +
      " skills in the Core UXR model. Role templates set expected levels per skill." +
      "</p>" +
      "</main>"
    );
  }

  function levelButtons(skillId, current) {
    var out = [];
    for (var lv = 1; lv <= 4; lv++) {
      var sel = current === lv;
      out.push(
        '<button type="button" data-skill="' +
          skillId +
          '" data-level="' +
          lv +
          '" class="rate-btn rounded-md border px-2 py-1 text-xs font-medium ' +
          (sel ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300") +
          '">' +
          D.LEVEL_LABELS[lv] +
          "</button>"
      );
    }
    return out.join("");
  }

  function pageAssess() {
    var me = getMember(state.currentUserId);
    if (!me) return "<main class=\"p-8\">No user.</main>";

    var rows = D.SKILLS.map(function (skill) {
      var exp = D.expectedLevel(me.roleId, skill);
      var r = me.ratings[skill.id];
      var gap = gapFor(me, skill);
      return (
        '<div class="border-b border-slate-100 py-4">' +
        '<div class="flex flex-wrap items-start justify-between gap-4">' +
        '<div class="min-w-0 flex-1">' +
        '<p class="font-medium text-slate-900">' +
        escapeHtml(skill.name) +
        "</p>" +
        '<p class="mt-1 text-sm text-slate-500">' +
        escapeHtml(skill.description) +
        "</p>" +
        '<p class="mt-1 text-xs text-slate-400">' +
        escapeHtml(skill.theme) +
        " · Expected for your role: <strong>" +
        D.LEVEL_LABELS[exp] +
        "</strong> (" +
        exp +
        ")</p>" +
        "</div>" +
        '<div class="flex flex-shrink-0 flex-col items-end gap-2">' +
        '<div class="flex flex-wrap justify-end gap-1">' +
        levelButtons(skill.id, r) +
        "</div>" +
        (gap != null && gap > 0
          ? '<span class="text-xs font-medium text-amber-700">Gap: ' + gap + " below bar</span>"
          : gap != null && gap <= 0
            ? '<span class="text-xs text-emerald-700">At or above bar</span>'
            : '<span class="text-xs text-slate-400">Not rated</span>') +
        "</div>" +
        "</div>" +
        '<label class="mt-3 block text-xs font-medium text-slate-500">Private note <span class="font-normal">(only you see this)</span></label>' +
        '<textarea data-note-skill="' +
        skill.id +
        '" class="mt-1 w-full rounded-md border border-slate-200 bg-amber-50/50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400" rows="2" placeholder="Context for your future self…">' +
        escapeHtml(me.notes[skill.id] || "") +
        "</textarea>" +
        "</div>"
      );
    }).join("");

    return (
      '<main class="mx-auto max-w-6xl px-4 py-8">' +
      "<h1 class=\"text-2xl font-bold text-slate-900\">My assessment</h1>" +
      '<p class="mt-2 text-slate-600">Self-rate each skill (1–4). Teammates see your <strong>levels</strong>, not these notes.</p>' +
      '<p class="mt-1 text-sm text-slate-500">Role: <strong>' +
      escapeHtml(D.ROLE_TEMPLATES.find(function (x) {
        return x.id === me.roleId;
      }).name) +
      "</strong></p>" +
      '<div class="mt-6 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">' +
      rows +
      "</div>" +
      "</main>"
    );
  }

  function gapCellClass(gap) {
    if (gap == null) return "bg-slate-50 text-slate-400";
    if (gap >= 2) return "bg-red-100 text-red-900 font-medium";
    if (gap === 1) return "bg-amber-100 text-amber-900";
    return "bg-emerald-50 text-emerald-800";
  }

  function pageCoverage() {
    var skills = sortedSkills();
    var head =
      "<tr><th class=\"sticky left-0 z-10 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-600\">Skill</th>" +
      state.members
        .map(function (m) {
          return (
            '<th class="min-w-[100px] px-2 py-2 text-center text-xs font-semibold text-slate-700">' +
            escapeHtml(m.name.split(" ")[0]) +
            '<div class="font-normal text-slate-500">' +
            escapeHtml(D.ROLE_TEMPLATES.find(function (r) {
              return r.id === m.roleId;
            }).name) +
            "</div></th>"
          );
        })
        .join("") +
      '<th class="px-2 py-2 text-center text-xs font-semibold text-slate-600">Meet bar</th></tr>';

    var body = skills
      .map(function (skill) {
        var emph = skillEmphasized(skill);
        var cc = coverageCount(skill);
        var cells = state.members
          .map(function (m) {
            var exp = D.expectedLevel(m.roleId, skill);
            var r = m.ratings[skill.id];
            var gap = gapFor(m, skill);
            var show = r == null ? "—" : r + "/" + exp;
            return (
              '<td class="border-l border-slate-100 px-1 py-1 text-center text-xs ' +
              gapCellClass(gap) +
              '">' +
              show +
              "</td>"
            );
          })
          .join("");
        return (
          '<tr class="' +
          (emph ? "bg-indigo-50/40" : "") +
          '">' +
          '<td class="sticky left-0 z-10 max-w-xs bg-white px-3 py-2 text-sm text-slate-800">' +
          (emph ? '<span class="mr-1 text-indigo-600">●</span>' : "") +
          escapeHtml(skill.name) +
          '<div class="text-xs text-slate-400">' +
          escapeHtml(skill.theme) +
          "</div></td>" +
          cells +
          '<td class="border-l border-slate-200 px-2 text-center text-xs font-medium text-slate-700">' +
          cc +
          "/" +
          state.members.length +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    var tags = state.focusTagIds
      .map(function (id) {
        var t = D.FOCUS_TAGS.find(function (x) {
          return x.id === id;
        });
        return t ? t.label : id;
      })
      .join(", ");

    return (
      '<main class="mx-auto max-w-6xl px-4 py-8">' +
      "<h1 class=\"text-2xl font-bold text-slate-900\">Coverage</h1>" +
      '<p class="mt-2 max-w-3xl text-slate-600">Staffing view: self-rated level vs expected for role. Cells show <strong>rated / expected</strong>. Highlighted rows match this quarter’s focus. <strong>Meet bar</strong> = count at or above expected.</p>' +
      '<p class="mt-2 text-sm text-slate-500">Focus: ' +
      escapeHtml(tags || "(none selected)") +
      " · " +
      escapeHtml(state.quarterLabel) +
      "</p>" +
      '<div class="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">' +
      '<table class="min-w-full border-collapse text-left">' +
      "<thead>" +
      head +
      "</thead><tbody>" +
      body +
      "</tbody></table></div>" +
      '<p class="mt-4 text-xs text-slate-500">Legend: empty / gray = not rated; amber/red = below expected.</p>' +
      "</main>"
    );
  }

  function pageGrowth() {
    var me = getMember(state.currentUserId);
    if (!me) return "<main class=\"p-8\">No user.</main>";

    var blocks = D.SKILLS.map(function (skill) {
      var g = gapFor(me, skill);
      if (g == null || g <= 0) return "";
      var items = me.learning[skill.id] || [];
      var itemHtml = items
        .map(function (it) {
          return (
            '<li class="flex items-center gap-2 text-sm">' +
            '<input type="checkbox" class="learn-check h-4 w-4 rounded border-slate-300" data-skill="' +
            skill.id +
            '" data-item-id="' +
            it.id +
            '"' +
            (it.done ? " checked" : "") +
            " />" +
            '<span class="' +
            (it.done ? "text-slate-400 line-through" : "text-slate-800") +
            '">' +
            escapeHtml(it.title) +
            "</span></li>"
          );
        })
        .join("");

      return (
        '<div class="rounded-lg border border-amber-200 bg-amber-50/30 p-4">' +
        '<p class="font-medium text-slate-900">' +
        escapeHtml(skill.name) +
        "</p>" +
        '<p class="text-xs text-amber-800">Gap: ' +
        g +
        " step(s) below expected · " +
        escapeHtml(skill.theme) +
        "</p>" +
        '<ul class="mt-3 space-y-1">' +
        (itemHtml || '<li class="text-sm text-slate-500">No actions yet — add one below.</li>') +
        "</ul>" +
        '<div class="mt-3 flex gap-2">' +
        '<input type="text" class="learn-input flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm" placeholder="e.g. Pair on 2 usability studies" data-skill="' +
        skill.id +
        '" />' +
        '<button type="button" class="learn-add rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700" data-skill="' +
        skill.id +
        '">Add</button>' +
        "</div>" +
        "</div>"
      );
    }).join("");

    if (!blocks)
      blocks =
        '<p class="text-slate-600">No gaps below the bar with current ratings. Adjust assessment or role template to see growth items.</p>';

    return (
      '<main class="mx-auto max-w-6xl px-4 py-8">' +
      "<h1 class=\"text-2xl font-bold text-slate-900\">My growth</h1>" +
      '<p class="mt-2 text-slate-600">Development actions tied to skills where you’re below expected. Visible to you; team sees skill levels on Coverage.</p>' +
      '<div class="mt-6 space-y-4">' +
      blocks +
      "</div>" +
      "</main>"
    );
  }

  function route() {
    var h = (location.hash || "#home").slice(1) || "home";
    if (h === "team") return pageTeam();
    if (h === "assess") return pageAssess();
    if (h === "coverage") return pageCoverage();
    if (h === "growth") return pageGrowth();
    return pageHome();
  }

  function render() {
    var root = document.getElementById("app");
    if (!root) return;
    root.innerHTML = nav() + route();
    wire();
  }

  function wire() {
    var us = document.getElementById("user-switch");
    if (us) {
      us.addEventListener("change", function () {
        state.currentUserId = us.value;
        persist();
      });
    }

    var br = document.getElementById("btn-reset");
    if (br) br.addEventListener("click", resetDemo);

    document.querySelectorAll(".rate-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var me = getMember(state.currentUserId);
        var sid = btn.getAttribute("data-skill");
        var lv = parseInt(btn.getAttribute("data-level"), 10);
        me.ratings[sid] = lv;
        persist();
      });
    });

    document.querySelectorAll("textarea[data-note-skill]").forEach(function (ta) {
      ta.addEventListener("change", function () {
        var me = getMember(state.currentUserId);
        var sid = ta.getAttribute("data-note-skill");
        me.notes[sid] = ta.value;
        persist();
      });
    });

    var tn = document.getElementById("team-name");
    if (tn) {
      tn.addEventListener("change", function () {
        state.teamName = tn.value;
        persist();
      });
    }
    var ql = document.getElementById("quarter-label");
    if (ql) {
      ql.addEventListener("change", function () {
        state.quarterLabel = ql.value;
        persist();
      });
    }

    document.querySelectorAll(".focus-tag").forEach(function (cb) {
      cb.addEventListener("change", function () {
        var id = cb.getAttribute("data-focus-id");
        if (cb.checked) {
          if (state.focusTagIds.indexOf(id) === -1) state.focusTagIds.push(id);
        } else {
          state.focusTagIds = state.focusTagIds.filter(function (x) {
            return x !== id;
          });
        }
        persist();
      });
    });

    document.querySelectorAll("#member-list [data-member-id]").forEach(function (row) {
      var mid = row.getAttribute("data-member-id");
      var nameInput = row.querySelector(".member-name");
      var roleSelect = row.querySelector(".member-role");
      var rm = row.querySelector(".remove-member");
      if (nameInput)
        nameInput.addEventListener("change", function () {
          getMember(mid).name = nameInput.value;
          persist();
        });
      if (roleSelect)
        roleSelect.addEventListener("change", function () {
          getMember(mid).roleId = roleSelect.value;
          persist();
        });
      if (rm)
        rm.addEventListener("click", function () {
          state.members = state.members.filter(function (m) {
            return m.id !== mid;
          });
          if (state.members.length && state.currentUserId === mid) state.currentUserId = state.members[0].id;
          persist();
        });
    });

    var am = document.getElementById("add-member");
    if (am) {
      am.addEventListener("click", function () {
        var id = "m" + Date.now();
        var m = { id: id, name: "New researcher", roleId: "mid", ratings: {}, notes: {}, learning: {} };
        D.SKILLS.forEach(function (s) {
          m.ratings[s.id] = null;
        });
        state.members.push(m);
        state.currentUserId = id;
        persist();
      });
    }

    document.querySelectorAll(".learn-add").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var sid = btn.getAttribute("data-skill");
        var wrap = btn.parentElement;
        var inp = wrap && wrap.querySelector(".learn-input");
        var title = (inp && inp.value.trim()) || "";
        if (!title) return;
        var me = getMember(state.currentUserId);
        if (!me.learning[sid]) me.learning[sid] = [];
        me.learning[sid].push({ id: "i" + Date.now(), title: title, done: false });
        inp.value = "";
        persist();
      });
    });

    document.querySelectorAll(".learn-check").forEach(function (cb) {
      cb.addEventListener("change", function () {
        var sid = cb.getAttribute("data-skill");
        var iid = cb.getAttribute("data-item-id");
        var me = getMember(state.currentUserId);
        var list = me.learning[sid] || [];
        var it = list.find(function (x) {
          return x.id === iid;
        });
        if (it) it.done = cb.checked;
        persist();
      });
    });
  }

  window.addEventListener("hashchange", render);

  initState();
  if (!location.hash) location.hash = "#home";

  function boot() {
    render();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
