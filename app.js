"use strict";

const STORAGE_KEY = "req-assessment-v1";

const subscales = {
  detachment: {
    title: "Psychological detachment",
    description: "Mentally disengaging from work during off-job time."
  },
  relaxation: {
    title: "Relaxation",
    description: "Experiencing low activation and making time to unwind."
  },
  mastery: {
    title: "Mastery",
    description: "Learning, growing, and engaging in constructive challenges."
  },
  control: {
    title: "Control",
    description: "Having autonomy over how off-job time is spent."
  }
};

const questions = [
  { text: "I forget about work.", scale: "detachment" },
  { text: "I don't think about work at all.", scale: "detachment" },
  { text: "I distance myself from my work.", scale: "detachment" },
  { text: "I get a break from the demands of work.", scale: "detachment" },
  { text: "I kick back and relax.", scale: "relaxation" },
  { text: "I do relaxing things.", scale: "relaxation" },
  { text: "I use the time to relax.", scale: "relaxation" },
  { text: "I take time for leisure.", scale: "relaxation" },
  { text: "I learn new things.", scale: "mastery" },
  { text: "I seek out intellectual challenges.", scale: "mastery" },
  { text: "I do things that challenge me.", scale: "mastery" },
  { text: "I do something to broaden my horizons.", scale: "mastery" },
  { text: "I feel like I can decide for myself what to do.", scale: "control" },
  { text: "I decide my own schedule.", scale: "control" },
  { text: "I determine for myself how I will spend my time.", scale: "control" },
  { text: "I take care of things the way that I want them done.", scale: "control" }
];

const questionsRoot = document.querySelector("#questions");
const form = document.querySelector("#assessment");
const message = document.querySelector("#form-message");
const results = document.querySelector("#results");
const scoreCards = document.querySelector("#score-cards");
const completedDateEl = document.querySelector("#completed-date");

function renderQuestions() {
  // No category headings (per your request)
  questions.forEach((question, index) => {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "question-card";
    fieldset.dataset.question = String(index + 1);

    const legend = document.createElement("legend");
    legend.className = "question-text";
    legend.innerHTML = `<span class="question-number">${index + 1}.</span> ${question.text}`;
    fieldset.appendChild(legend);

    const options = document.createElement("div");
    options.className = "options";
    options.setAttribute("aria-label", "Select a response from 1 to 5");

    for (let value = 1; value <= 5; value += 1) {
      const option = document.createElement("div");
      option.className = "option";
      option.innerHTML = `
        <input type="radio" id="q${index + 1}-${value}" name="q${index + 1}" value="${value}">
        <label for="q${index + 1}-${value}" title="${responseLabel(value)}">${value}</label>`;
      options.appendChild(option);
    }

    fieldset.appendChild(options);
    questionsRoot.appendChild(fieldset);
  });
}

function responseLabel(value) {
  return [
    "",
    "I do not agree at all",
    "I somewhat disagree",
    "Neither agree nor disagree",
    "I somewhat agree",
    "I fully agree"
  ][value];
}

function collectResponses() {
  const responses = {};
  questions.forEach((_, index) => {
    const selected = form.querySelector(`input[name="q${index + 1}"]:checked`);
    if (selected) responses[`q${index + 1}`] = Number(selected.value);
  });
  return responses;
}

function saveState(includeResults = false) {
  const existing = readState();
  const resp = collectResponses();
  const state = {
    responses: resp,
    updatedAt: new Date().toISOString(),
    results: includeResults ? calculateScores(resp) : existing.results || null,
    completedAt: includeResults ? new Date().toISOString() : existing.completedAt || null
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

function readState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function restoreState() {
  const state = readState();
  Object.entries(state.responses || {}).forEach(([name, value]) => {
    const input = form.querySelector(`input[name="${name}"][value="${value}"]`);
    if (input) input.checked = true;
  });
  if (state.results && state.completedAt) renderResults(state.results, state.completedAt, false);
}

function calculateScores(responses) {
  const grouped = { detachment: [], relaxation: [], mastery: [], control: [] };
  questions.forEach((question, index) => {
    grouped[question.scale].push(responses[`q${index + 1}`]);
  });

  const scores = {};
  Object.entries(grouped).forEach(([key, values]) => {
    scores[key] = values.reduce((sum, value) => sum + value, 0) / values.length;
  });

  // No overall average (removed per your request)
  return scores;
}

// Group definitions for display only (no combined values)
const DISPLAY_GROUPS = [
  { title: "Buffer Oriented", keys: ["detachment", "relaxation"] },
  { title: "Resource Supplying", keys: ["mastery", "control"] }
];

function renderResults(scores, completedAt, moveFocus = true) {
  // Replace the container with grouped boxes
  scoreCards.innerHTML = "";
  scoreCards.classList.remove("score-grid");
  scoreCards.classList.add("group-grid");

  DISPLAY_GROUPS.forEach(group => {
    makeGroupCard(group, scores);
  });

  completedDateEl.textContent = `Completed ${new Date(completedAt).toLocaleString()}`;
  results.hidden = false;
  if (moveFocus) {
    results.scrollIntoView({ behavior: "smooth", block: "start" });
    results.focus({ preventScroll: true });
  }
}

function makeGroupCard(group, scores) {
  const card = document.createElement("article");
  card.className = "group-card";

  const header = document.createElement("h3");
  header.textContent = group.title;
  card.appendChild(header);

  // Render each subscale separately with its own meter/value
  const list = document.createElement("ul");
  list.className = "details";
  list.setAttribute("aria-label", `${group.title} subscale scores`);

  group.keys.forEach(key => {
    const value = scores[key];
    const pct = ((value - 1) / 4) * 100;

    const li = document.createElement("li");
    li.innerHTML = `
      <div class="subscale-block">
        <span class="label">${subscales[key].title}</span>
        <span class="value">${value.toFixed(2)} / 5</span>
        <div class="meter" aria-label="${subscales[key].title} score ${value.toFixed(2)} out of 5">
          <span style="width: ${pct}%"></span>
        </div>
        <p class="sub-desc">${subscales[key].description}</p>
      </div>
    `;
    list.appendChild(li);
  });

  card.appendChild(list);
  scoreCards.appendChild(card);
}

function showMessage(text) {
  message.textContent = text;
  message.hidden = false;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const responses = collectResponses();
  const missing = questions.length - Object.keys(responses).length;

  if (missing > 0) {
    showMessage(`Please answer all 16 statements. ${missing} ${missing === 1 ? "response is" : "responses are"} still missing.`);
    const firstMissing = questions.findIndex((_, index) => !responses[`q${index + 1}`]);
    form.querySelector(`[data-question="${firstMissing + 1}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  message.hidden = true;
  const state = saveState(true);
  renderResults(state.results, state.completedAt);
});

document.querySelector("#save-progress").addEventListener("click", () => {
  const state = saveState(false);
  const count = Object.keys(state.responses).length;
  showMessage(`Progress saved locally in this browser: ${count} of 16 responses.`);
  message.classList.remove("error");
  window.setTimeout(() => {
    message.hidden = true;
    message.classList.add("error");
  }, 3000);
});

document.querySelector("#clear-data").addEventListener("click", () => {
  if (!window.confirm("Clear all saved responses and results from this browser?")) return;
  localStorage.removeItem(STORAGE_KEY);
  form.reset();
  results.hidden = true;
  message.hidden = true;
});

document.querySelector("#retake").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  form.reset();
  results.hidden = true;
  form.scrollIntoView({ behavior: "smooth" });
});

document.querySelector("#print-results").addEventListener("click", () => window.print());

renderQuestions();
restoreState();