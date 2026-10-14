(() => {
  "use strict";
  const STORAGE_KEY = "briefly_clat_planner_v1";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const daySubjects = {1:"Logical Reasoning",2:"Legal Reasoning",3:"English Language",4:"Logical Reasoning",5:"Legal Reasoning",6:"English Language",0:"Mixed Practice + Mock"};
  const affirmations = [
    "I am becoming focused, disciplined, and capable of achieving my goals.",
    "I can improve through practice, honest review, and consistent effort.",
    "I do not need perfection. I need progress and the courage to keep going.",
    "Every passage I analyse teaches me how to think more clearly.",
    "My future is shaped by the small, intentional actions I take today.",
    "I can face difficult questions calmly and work through them step by step."
  ];
  const taskTemplates = [
    {id:"main",group:"morning",time:"9:00–10:20",title:"Main subject — 3 passages",desc:"Rotate Logical, Legal and English by day."},
    {id:"quantAM",group:"morning",time:"10:30–11:10",title:"Quant — 2 sets",desc:"Solve carefully; record calculation or concept errors."},
    {id:"ca",group:"morning",time:"11:10–12:00",title:"Current Affairs class",desc:"Make concise notes and mark important events."},
    {id:"quantPM",group:"afternoon",time:"2:00–3:00",title:"Quant — 4 sets",desc:"Focus on concepts, accuracy and timed practice."},
    {id:"gk",group:"afternoon",time:"3:10–4:00",title:"GK marathon",desc:"Capture key facts; revise them later from memory."},
    {id:"revision",group:"evening",time:"Night",title:"One subject revision class",desc:"Rotate subjects and revise the class afterwards."},
    {id:"reading",group:"evening",time:"30 min",title:"Book / editorial reading",desc:"Read actively; note the central argument and 3 words."},
    {id:"analysis",group:"evening",time:"15–20 min",title:"Mistake analysis + active recall",desc:"Review errors and recall today's GK without notes."}
  ];
  const sundayTasks = [
    {id:"mock",group:"sunday",time:"Morning",title:"Full-length CLAT mock",desc:"Simulate exam conditions and follow the official time limit."},
    {id:"mockAnalysis",group:"sunday",time:"After mock",title:"Detailed mock analysis",desc:"Classify errors: knowledge, comprehension, logic, calculation or time."},
    {id:"weakTopics",group:"sunday",time:"Evening",title:"Repair 2 weak topics",desc:"Revise the two highest-impact gaps revealed by the mock."}
  ];
  let state = loadState();
  let selectedDay = new Date().getDay();
  let toastTimer;

  function loadState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  }
  function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function dateKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  }
  function getDayState(key = dateKey()) {
    state.days ||= {};
    state.days[key] ||= {checks:{}, intention:"", notes:""};
    return state.days[key];
  }
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  }
  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }
  function formatLong(date) {
    return new Intl.DateTimeFormat("en-IN", {weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(date);
  }
  function updateDateLabels() {
    const now = new Date();
    $("#sidebarDate").textContent = formatLong(now).toUpperCase();
    $("#todayLabel").textContent = now.toLocaleDateString("en-IN",{day:"2-digit",month:"short"}).toUpperCase();
    $("#dayName").textContent = now.getDay() === 0 ? "SUNDAY RESET" : `${dayNames[now.getDay()].toUpperCase()} FOCUS`;
    $("#shortDate").textContent = now.toLocaleDateString("en-IN",{day:"numeric",month:"short"});
    const hour = now.getHours();
    $("#greeting").textContent = hour < 12 ? "Good morning." : hour < 17 ? "Good afternoon." : "Good evening.";
  }
  function tasksForDay(day) {
    const isSunday = Number(day) === 0;
    return isSunday
      ? [...taskTemplates.filter(t => t.id === "ca" || t.id === "reading"), ...sundayTasks, ...taskTemplates.filter(t => t.id === "gk" || t.id === "revision")]
      : taskTemplates;
  }
  function taskMarkup(task, key) {
    const checks = getDayState(key).checks || {};
    const checked = !!checks[task.id];
    return `<label class="task-row ${checked?"done":""}">
      <input class="custom-check" type="checkbox" data-task="${escapeHTML(task.id)}" data-date="${escapeHTML(key)}" ${checked?"checked":""} aria-label="Mark ${escapeHTML(task.title)} complete">
      <span class="task-copy"><span class="task-title">${escapeHTML(task.title)}</span><span class="task-desc">${escapeHTML(task.desc)}</span></span>
      <span class="task-time">${escapeHTML(task.time)}</span>
    </label>`;
  }
  function bindTaskInputs(root = document) {
    $$("input[data-task]", root).forEach(input => input.addEventListener("change", () => {
      const dayState = getDayState(input.dataset.date);
      dayState.checks ||= {};
      dayState.checks[input.dataset.task] = input.checked;
      persist();
      renderAll();
    }));
  }
  function renderDashboardTasks() {
    const today = new Date().getDay();
    const tasks = today === 0
      ? [sundayTasks[0], sundayTasks[1], taskTemplates[0], taskTemplates[1], taskTemplates[2], taskTemplates[6]]
      : taskTemplates;
    $("#mainSubjectPill").textContent = `${daySubjects[today].toUpperCase()} DAY`;
    $("#dashboardTasks").innerHTML = tasks.map(t => taskMarkup(t, dateKey())).join("");
    bindTaskInputs($("#dashboardTasks"));
  }
  function renderRoutine() {
    $$("#daySelector button").forEach(button => button.classList.toggle("active", Number(button.dataset.day) === selectedDay));
    const key = dateKeyForWeekday(selectedDay);
    const dayTasks = tasksForDay(selectedDay);
    const groups = {morning:[],afternoon:[],evening:[],sunday:[]};
    dayTasks.forEach(task => (groups[task.group] || groups.evening).push(task));
    $("#morningTasks").innerHTML = groups.morning.map(t=>taskMarkup(t,key)).join("");
    $("#afternoonTasks").innerHTML = groups.afternoon.map(t=>taskMarkup(t,key)).join("");
    $("#eveningTasks").innerHTML = groups.evening.map(t=>taskMarkup(t,key)).join("");
    $("#sundayTasks").innerHTML = groups.sunday.map(t=>taskMarkup(t,key)).join("");
    $("#sundayMockBlock").classList.toggle("show", selectedDay === 0);
    $("#routineNotes").value = getDayState(key).notes || "";
    bindTaskInputs($("#view-routine"));
    const checks = getDayState(key).checks || {};
    const completed = dayTasks.filter(t => checks[t.id]).length;
    const percent = Math.round(completed / dayTasks.length * 100);
    $("#routineProgressText").textContent = `${completed} / ${dayTasks.length} complete`;
    $("#routineProgressBar").style.width = `${percent}%`;
  }
  function dateKeyForWeekday(day) {
    const now = new Date();
    const diff = Number(day) - now.getDay();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
    return dateKey(date);
  }
  function renderStats() {
    const todayState = getDayState();
    const todayTasks = tasksForDay(new Date().getDay());
    const completed = todayTasks.filter(t => todayState.checks?.[t.id]).length;
    const percent = Math.round(completed / todayTasks.length * 100);
    $("#completionPercent").textContent = percent;
    $("#completionBar").style.width = `${percent}%`;
    $("#completionCount").textContent = `${completed} of ${todayTasks.length} tasks complete`;
    const mocks = [...(state.mocks || [])].sort((a,b)=>b.date.localeCompare(a.date));
    $("#mockCount").textContent = mocks.length;
    $("#mockTotalLarge").textContent = mocks.length;
    $("#bestScore").textContent = mocks.length ? Math.max(...mocks.map(m=>Number(m.score))).toString() : "—";
    $("#latestScore").textContent = mocks.length ? Number(mocks[0].score).toString() : "—";
    let minutes = 0;
    const now = new Date();
    for (let i=0;i<7;i++) {
      const date = new Date(now.getFullYear(),now.getMonth(),now.getDate()-i);
      const d = state.days?.[dateKey(date)];
      if (d) {
        const tasks = tasksForDay(date.getDay());
        const count = tasks.filter(t=>d.checks?.[t.id]).length;
        minutes += count * 30;
      }
    }
    $("#focusHours").textContent = (minutes/60).toFixed(1).replace(/\.0$/,"");
  }
  function renderMockHistory() {
    const mocks = [...(state.mocks || [])].sort((a,b)=>b.date.localeCompare(a.date));
    if (!mocks.length) {
      $("#mockHistory").innerHTML = `<div class="empty-state"><span>↗</span><h4>Your first mock starts here.</h4><p>Log a test to see your progress over time.</p></div>`;
      return;
    }
    $("#mockHistory").innerHTML = mocks.map(mock => `<article class="mock-entry">
      <div class="mock-entry-head"><div><h4>${escapeHTML(mock.name)}</h4><time>${escapeHTML(mock.date)}</time></div><div class="score-bubble">${escapeHTML(mock.score)}<small> / 120</small></div></div>
      <div class="mock-entry-meta"><span>${escapeHTML(mock.attempted || "—")} attempted</span><span>${escapeHTML(mock.duration || "—")} min</span><span>${escapeHTML(mock.weak || "Not identified")}</span></div>
      ${mock.review ? `<p class="mock-entry-review">${escapeHTML(mock.review)}</p>` : ""}
      <button class="delete-mock" data-delete-mock="${escapeHTML(mock.id)}">Remove entry</button>
    </article>`).join("");
    $$("[data-delete-mock]").forEach(button => button.addEventListener("click", () => {
      state.mocks = (state.mocks || []).filter(m => m.id !== button.dataset.deleteMock);
      persist(); renderAll(); showToast("Mock entry removed.");
    }));
  }
  function renderJournal() {
    const key = dateKey();
    const journal = state.journals?.[key] || {};
    $("#journalWin").value = journal.win || "";
    $("#journalLearn").value = journal.learn || "";
    $("#journalNext").value = journal.next || "";
    $("#northStar").value = state.northStar || "";
    $("#dailyIntention").value = getDayState().intention || "";
  }
  function updateCountdown() {
    // Exam date supplied by the user: 6 December 2026.
    // Countdown uses India local time (IST) and targets midnight at the start of exam day.
    const examDate = new Date("2026-12-06T00:00:00+05:30");
    const remaining = examDate.getTime() - Date.now();
    if (remaining <= 0) {
      $("#countDays").textContent = "00";
      $("#countHours").textContent = "00";
      $("#countMinutes").textContent = "00";
      $("#countSeconds").textContent = "00";
      const heading = $(".countdown-copy h3");
      if (heading) heading.textContent = "CLAT exam day is here.";
      return;
    }
    const seconds = Math.floor(remaining / 1000);
    $("#countDays").textContent = String(Math.floor(seconds / 86400)).padStart(2, "0");
    $("#countHours").textContent = String(Math.floor((seconds % 86400) / 3600)).padStart(2, "0");
    $("#countMinutes").textContent = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    $("#countSeconds").textContent = String(seconds % 60).padStart(2, "0");
  }
  function renderAll() {
    updateDateLabels();
    updateCountdown();
    renderDashboardTasks();
    renderRoutine();
    renderStats();
    renderMockHistory();
    renderJournal();
  }
  function setView(view) {
    $$(".view").forEach(section => section.classList.toggle("active", section.id === `view-${view}`));
    $$(".nav-item").forEach(button => button.classList.toggle("active", button.dataset.view === view));
    const labels = {dashboard:"OVERVIEW",routine:"DAILY ROUTINE",mock:"MOCK TRACKER",journal:"REFLECTION JOURNAL"};
    $("#topSection").textContent = labels[view] || "OVERVIEW";
    window.scrollTo({top:0,behavior:"smooth"});
  }
  $$(".nav-item").forEach(button => button.addEventListener("click", () => setView(button.dataset.view)));
  $$("[data-goto]").forEach(button => button.addEventListener("click", () => setView(button.dataset.goto)));
  $("#startDayBtn").addEventListener("click", () => { setView("routine"); showToast("Your plan is ready. Start with the next task."); });
  $("#daySelector").addEventListener("click", event => {
    const button = event.target.closest("button[data-day]");
    if (!button) return;
    selectedDay = Number(button.dataset.day);
    renderRoutine();
  });
  $("#resetDayBtn").addEventListener("click", () => {
    if (!confirm("Reset today's checklist? Your notes and mock records will stay saved.")) return;
    getDayState().checks = {};
    persist(); renderAll(); showToast("Today's checklist has been reset.");
  });
  $("#newAffirmation").addEventListener("click", () => {
    let next = Math.floor(Math.random()*affirmations.length);
    $("#affirmationText").textContent = affirmations[next];
  });
  $("#saveIntention").addEventListener("click", () => {
    getDayState().intention = $("#dailyIntention").value.trim();
    persist(); showToast("Today's intention saved.");
  });
  $("#saveRoutineNotes").addEventListener("click", () => {
    getDayState(dateKeyForWeekday(selectedDay)).notes = $("#routineNotes").value;
    persist(); showToast("Routine notes saved.");
  });
  $("#mockDate").value = dateKey();
  $("#mockForm").addEventListener("submit", event => {
    event.preventDefault();
    const score = Number($("#mockScore").value);
    if (!Number.isFinite(score) || score < 0 || score > 120) { showToast("Enter a score between 0 and 120."); return; }
    state.mocks ||= [];
    state.mocks.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      name: $("#mockName").value.trim(), date: $("#mockDate").value,
      score, attempted: $("#mockAttempted").value, duration: $("#mockDuration").value,
      weak: $("#mockWeak").value, review: $("#mockReview").value.trim()
    });
    persist(); $("#mockForm").reset(); $("#mockDate").value = dateKey(); $("#mockDuration").value = "120";
    renderAll(); showToast("Mock saved. Review your mistakes and keep improving.");
  });
  $("#journalForm").addEventListener("submit", event => {
    event.preventDefault();
    state.journals ||= {};
    state.journals[dateKey()] = {win:$("#journalWin").value.trim(),learn:$("#journalLearn").value.trim(),next:$("#journalNext").value.trim()};
    persist(); $("#journalSaved").textContent = "Reflection saved for today."; showToast("Your reflection is saved.");
  });
  $("#saveNorthStar").addEventListener("click", () => {
    state.northStar = $("#northStar").value.trim(); persist(); showToast("Your reason has been saved.");
  });
  renderAll();
  setInterval(updateCountdown, 1000);
})();