(() => {
  const $ = id => document.getElementById(id);
  const KEY = "carMemoryStudySessions_v2";
  const data = {
    session_id: (crypto.randomUUID ? crypto.randomUUID() : "session-" + Date.now()),
    question_condition: Math.random() < .5 ? "misleading" : "accurate",
    feedback_condition: Math.random() < .5 ? "confirming" : "neutral",
    option_order: Math.random() < .5 ? ["stop","yield"] : ["yield","stop"]
  };
  let questionStart = 0, recognitionStart = 0, currentSession = null;

  function stage(name) {
    document.querySelectorAll(".stage").forEach(el => el.classList.toggle("active", el.id === "stage-" + name));
    const order = ["video","question","recognition","feedback","confidence","complete"];
    const idx = order.indexOf(name);
    const step = Math.min(idx + 1, 4);
    $("step-label").textContent = name === "complete" ? "COMPLETE" : `STEP ${step} OF 4`;
    $("step-percent").textContent = name === "complete" ? "100%" : `${step * 25}%`;
    $("bar").style.width = name === "complete" ? "100%" : `${step * 25}%`;
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function csv(rows, filename) {
    if (!rows || !rows.length) return;
    const keys = Object.keys(rows[0]);
    const quote = v => '"' + String(v ?? "").replace(/"/g,'""') + '"';
    const content = [keys.map(quote).join(","), ...rows.map(r => keys.map(k => quote(r[k])).join(","))].join("\r\n");
    const blob = new Blob(["\ufeff" + content], {type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
  }
  function allSessions() { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } }

  $("consent").addEventListener("change", e => $("start").disabled = !e.target.checked);
  $("start").addEventListener("click", () => {
    $("welcome").classList.remove("active"); $("study").classList.add("active"); stage("video");
    const v = $("stimulus");
    v.addEventListener("ended", () => { $("video-status").textContent = "Video complete"; $("video-status").classList.add("playing"); $("video-next").disabled = false; }, {once:true});
    v.addEventListener("error", () => {
      v.classList.add("hidden"); $("stimulus-gif").classList.remove("hidden");
      $("video-status").textContent = "Scene animation"; $("video-status").classList.add("playing"); $("video-next").disabled = false;
    }, {once:true});
    v.play().then(() => { $("video-status").textContent = "Please watch the scene"; $("video-status").classList.add("playing"); })
      .catch(() => { v.controls = true; $("video-status").textContent = "Press play to view the scene"; $("video-next").disabled = false; });
  });
  $("video-next").addEventListener("click", () => {
    $("question-text").textContent = data.question_condition === "misleading"
      ? "How fast was the car traveling when it passed the yield sign?"
      : "How fast was the car traveling when it passed the stop sign?";
    questionStart = performance.now(); stage("question");
  });
  $("question-next").addEventListener("click", () => {
    const n = $("speed").value.trim();
    if (n === "" || Number(n) < 0 || Number(n) > 200) {
      $("speed").setCustomValidity("Please enter an estimate between 0 and 200 mph.");
      $("speed").reportValidity(); return;
    }
    $("speed").setCustomValidity("");
    data.speed_estimate_mph = Number(n);
    data.speed_response_time_ms = Math.round(performance.now() - questionStart);
    const choices = $("choices");
    data.option_order.forEach((sign, i) => {
      const btn = choices.querySelector(`[data-sign="${sign}"]`);
      choices.appendChild(btn);
      btn.querySelector("span").textContent = "Image " + (i === 0 ? "A" : "B");
    });
    recognitionStart = performance.now(); stage("recognition");
  });
  $("choices").addEventListener("click", e => {
    const b = e.target.closest(".choice"); if (!b) return;
    data.selected_sign = b.dataset.sign;
    document.querySelectorAll(".choice").forEach(el => {
      const on = el === b; el.classList.toggle("selected", on); el.setAttribute("aria-pressed", String(on));
    });
    $("recognition-next").disabled = false;
  });
  $("recognition-next").addEventListener("click", () => {
    data.recognition_response_time_ms = Math.round(performance.now() - recognitionStart);
    data.selected_image = data.option_order.indexOf(data.selected_sign) === 0 ? "A" : "B";
    data.accuracy = data.selected_sign === "stop" ? 1 : 0;
    data.feedback_text = data.feedback_condition === "confirming" ? "Correct!" : "Okay.";
    $("feedback-text").textContent = data.feedback_text;
    stage("feedback");
  });
  $("feedback-next").addEventListener("click", () => stage("confidence"));
  $("confidence").addEventListener("input", e => $("confidence-value").textContent = e.target.value);
  $("submit").addEventListener("click", () => {
    data.confidence_1_to_10 = Number($("confidence").value);
    data.completed_at_utc = new Date().toISOString();
    data.question_text = data.question_condition === "misleading"
      ? "How fast was the car traveling when it passed the yield sign?"
      : "How fast was the car traveling when it passed the stop sign?";
    data.feedback_condition = data.feedback_condition;
    currentSession = {
      ...data,
      stimulus_shown: "stop_sign",
      correct_image: "stop",
      option_a_sign: data.option_order[0],
      option_b_sign: data.option_order[1],
      selected_image_sign: data.selected_sign
    };
    const sessions = allSessions(); sessions.push(currentSession);
    localStorage.setItem(KEY, JSON.stringify(sessions));
    stage("complete");
  });
  $("download-summary").addEventListener("click", () => {
    if (!currentSession) return;
    const {session_id,completed_at_utc,question_condition,feedback_condition,speed_estimate_mph,
      selected_image,selected_sign,accuracy,confidence_1_to_10,speed_response_time_ms,
      recognition_response_time_ms} = currentSession;
    csv([{session_id,completed_at_utc,question_condition,feedback_condition,speed_estimate_mph,
      selected_image,selected_sign,accuracy,confidence_1_to_10,speed_response_time_ms,
      recognition_response_time_ms}], "car-memory-summary.csv");
  });
  $("download-trials").addEventListener("click", () => {
    if (!currentSession) return;
    csv([{
      session_id:currentSession.session_id,trial_number:1,stimulus_video:"stop_sign_scene",
      question_condition:currentSession.question_condition,question_text:currentSession.question_text,
      speed_estimate_mph:currentSession.speed_estimate_mph,feedback_condition:currentSession.feedback_condition,
      feedback_text:currentSession.feedback_text,option_a_sign:currentSession.option_a_sign,
      option_b_sign:currentSession.option_b_sign,selected_image:currentSession.selected_image,
      selected_sign:currentSession.selected_sign,correct_sign:"stop",accuracy:currentSession.accuracy,
      confidence_1_to_10:currentSession.confidence_1_to_10,
      speed_response_time_ms:currentSession.speed_response_time_ms,
      recognition_response_time_ms:currentSession.recognition_response_time_ms,
      completed_at_utc:currentSession.completed_at_utc
    }], "car-memory-trial-level.csv");
  });
  $("download-all").addEventListener("click", () => {
    const sessions = allSessions();
    if (!sessions.length) { alert("No completed sessions are stored in this browser yet."); return; }
    csv(sessions, "car-memory-all-sessions.csv");
  });
})();