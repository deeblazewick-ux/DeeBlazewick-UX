/**
 * Default skill model: embedded product UXR.
 * Levels 1–4: Learning → Practicing → Solid → Role-model
 */
(function (global) {
  global.UXR_DATA = {
    LEVEL_LABELS: ["", "Learning", "Practicing", "Solid", "Role-model"],

    FOCUS_TAGS: [
      { id: "evaluative", label: "Evaluative & usability", themeHints: ["Evaluative", "Qualitative craft"] },
      { id: "discovery", label: "Foundational discovery", themeHints: ["Planning & alignment", "Qualitative craft"] },
      { id: "strategic", label: "Strategic / roadmap", themeHints: ["Influence & partnership"] },
      {
        id: "stakeholders",
        label: "Stakeholder-heavy quarter",
        themeHints: ["Communication & impact", "Influence & partnership"],
      },
      { id: "ops", label: "Research ops & scale", themeHints: ["Ops & rigor"] },
    ],

    ROLE_TEMPLATES: [
      { id: "junior", name: "Junior UXR" },
      { id: "mid", name: "UX Researcher" },
      { id: "senior", name: "Senior UXR" },
    ],

    SKILLS: [
      {
        id: "rq-framing",
        name: "Research question → decisions",
        theme: "Planning & alignment",
        description: "Frames questions that tie to product decisions and non-goals.",
        expected: { junior: 2, mid: 3, senior: 4 },
      },
      {
        id: "study-design",
        name: "Study design & method fit",
        theme: "Planning & alignment",
        description: "Chooses methods appropriate to risk, timeline, and learning goals.",
        expected: { junior: 2, mid: 3, senior: 4 },
      },
      {
        id: "ethics",
        name: "Ethics, consent, privacy",
        theme: "Planning & alignment",
        description: "Applies consent, PII, and ethical basics appropriate to context.",
        expected: { junior: 2, mid: 3, senior: 4 },
      },
      {
        id: "moderation",
        name: "Interview moderation",
        theme: "Qualitative craft",
        description: "Runs sessions that balance rapport, neutrality, and depth.",
        expected: { junior: 2, mid: 3, senior: 4 },
      },
      {
        id: "evaluative",
        name: "Evaluative research (e.g. usability)",
        theme: "Evaluative",
        description: "Plans and runs evaluative studies that reduce build risk.",
        expected: { junior: 2, mid: 3, senior: 4 },
      },
      {
        id: "contextual",
        name: "Contextual / formative inquiry",
        theme: "Qualitative craft",
        description: "Uses contextual methods to understand behavior in environment.",
        expected: { junior: 1, mid: 3, senior: 4 },
      },
      {
        id: "survey",
        name: "Survey design (basics)",
        theme: "Mixed & light quant",
        description: "Designs sound surveys; knows when quant is / isn’t appropriate.",
        expected: { junior: 1, mid: 2, senior: 3 },
      },
      {
        id: "mixed",
        name: "Mixed methods integration",
        theme: "Mixed & light quant",
        description: "Combines qual + light quant to strengthen conclusions.",
        expected: { junior: 1, mid: 3, senior: 4 },
      },
      {
        id: "synthesis",
        name: "Synthesis & theming",
        theme: "Synthesis",
        description: "Turns raw data into defensible themes and insight statements.",
        expected: { junior: 2, mid: 3, senior: 4 },
      },
      {
        id: "actionable",
        name: "Insight → actionable recommendations",
        theme: "Synthesis",
        description: "Produces recommendations tied to decisions and tradeoffs.",
        expected: { junior: 1, mid: 3, senior: 4 },
      },
      {
        id: "story",
        name: "Storytelling for product impact",
        theme: "Communication & impact",
        description: "Communicates findings so teams align and act.",
        expected: { junior: 2, mid: 3, senior: 4 },
      },
      {
        id: "xfn",
        name: "XFN alignment (PM / Design / Eng)",
        theme: "Communication & impact",
        description: "Partners across disciplines through the research lifecycle.",
        expected: { junior: 2, mid: 3, senior: 4 },
      },
      {
        id: "influence",
        name: "Influence without authority",
        theme: "Communication & impact",
        description: "Navigates conflict and prioritization with evidence and empathy.",
        expected: { junior: 1, mid: 3, senior: 4 },
      },
      {
        id: "repo",
        name: "Repository & insight hygiene",
        theme: "Ops & rigor",
        description: "Maintains findable, reusable evidence for the org.",
        expected: { junior: 1, mid: 2, senior: 3 },
      },
      {
        id: "recruit",
        name: "Recruiting & panel management",
        theme: "Ops & rigor",
        description: "Runs recruitment pipelines appropriate to study needs.",
        expected: { junior: 2, mid: 3, senior: 4 },
      },
      {
        id: "democrat",
        name: "Democratization guardrails",
        theme: "Ops & rigor",
        description: "Balances speed with quality when others run research.",
        expected: { junior: 1, mid: 2, senior: 4 },
      },
      {
        id: "roadmap",
        name: "Roadmap & prioritization partnership",
        theme: "Influence & partnership",
        description: "Connects learning to roadmap bets and sequencing.",
        expected: { junior: 1, mid: 2, senior: 4 },
      },
      {
        id: "mentor",
        name: "Mentoring & craft lift",
        theme: "Influence & partnership",
        description: "Uplevels others through critique, pairing, and frameworks.",
        expected: { junior: 1, mid: 2, senior: 4 },
      },
    ],

    expectedLevel: function (roleId, skill) {
      var k = roleId === "junior" ? "junior" : roleId === "mid" ? "mid" : "senior";
      return skill.expected[k];
    },

    createDemoState: function () {
      var members = [
        { id: "m1", name: "Alex Chen", roleId: "senior", ratings: {}, notes: {}, learning: {} },
        { id: "m2", name: "Jordan Smith", roleId: "mid", ratings: {}, notes: {}, learning: {} },
        { id: "m3", name: "Sam Rivera", roleId: "junior", ratings: {}, notes: {}, learning: {} },
      ];
      var seed = {
        m1: { synthesis: 4, moderation: 4, story: 4, evaluative: 3 },
        m2: { evaluative: 4, survey: 3, roadmap: 2, influence: 2 },
        m3: { moderation: 2, synthesis: 2, recruit: 2, ethics: 2 },
      };
      for (var i = 0; i < members.length; i++) {
        var m = members[i];
        for (var j = 0; j < this.SKILLS.length; j++) {
          var s = this.SKILLS[j];
          m.ratings[s.id] = seed[m.id] && seed[m.id][s.id] != null ? seed[m.id][s.id] : null;
        }
      }
      return {
        version: 1,
        teamName: "Product Insights",
        quarterLabel: "2026 Q2",
        focusTagIds: ["evaluative", "stakeholders"],
        members: members,
        currentUserId: "m2",
      };
    },
  };
})(typeof window !== "undefined" ? window : globalThis);
