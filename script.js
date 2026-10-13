/*
  НАСТРОЙКИ ИГРЫ: отредактируй значения в этом блоке.
  Пароль — дата в формате ДД.ММ.ГГГГ. Это простая игровая проверка,
  а не настоящая защита: пароль можно найти в исходном коде.
*/
const CONFIG = {
  passwordDate: "02.02.2026", // ЗАМЕНИ на вашу дату
  gifts: [
    "Твой подарок №1: пару кейсиков в доте). ♡",
    "Твой подарок №2: одно крепкое объятие и поцелуй — при встрече. ♥",
    "Твой подарок №3: выполняю любое твое желание. ✨"
  ],
  quiz: [
    {
      question: "где и как мы познакомились?",
      options: ["случайно на улице", "медведь пошел нахуй", "не зная друг друга лайкнули в давинчике"],
      answer: 1,
      feedback: "Наши счастливые моменты — мои любимые. ♡"
    },
    {
      question: "что я люблю в тебе больше всего?",
      options: ["глаза", "руки", "волосы"],
      answer: 0,
      feedback: "Правильно: а вообще я люблю тебя всего! ✨"
    },
    {
      question: "Какое место ты занимаешь в моей истории?",
      options: ["Случайный персонаж", "Мой любимый человек", "NPC на заднем плане"],
      answer: 1,
      feedback: "Ты не NPC. Ты мой любимый человек. ♥"
    }
  ]
};

const screens = [...document.querySelectorAll(".screen")];
const collected = new Set();
const openedGifts = new Set();
let quizIndex = 0;
let quizAnswered = false;
const $ = (id) => document.getElementById(id);

function showScreen(id) {
  screens.forEach((screen) => screen.classList.toggle("hidden", screen.id !== id));
  window.scrollTo({ top: 0, behavior: "smooth" });
}
$("begin-btn").addEventListener("click", () => showScreen("screen-password"));
document.querySelectorAll("[data-open]").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.open;
    if (id === "screen-quiz") renderQuestion();
    showScreen(id);
  });
});
document.querySelectorAll("[data-back]").forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.back));
});

$("password-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const entered = $("password-input").value.trim();
  if (entered === CONFIG.passwordDate) {
    $("password-error").textContent = "";
    $("password-input").value = "";
    showScreen("screen-hub");
  } else {
    $("password-error").textContent = "Хм… попробуй ещё раз. Подсказка: вспомни нашу особенную дату ♡";
    $("password-input").focus();
  }
});

function updateProgress() {
  $("progress-text").textContent = `${collected.size} / 4`;
  $("progress-bar").style.width = `${collected.size / 4 * 100}%`;
}
document.querySelectorAll("[data-collect]").forEach((button) => {
  button.addEventListener("click", () => {
    collected.add(button.dataset.collect);
    updateProgress();
    if (collected.size >= 4) showScreen("screen-finish");
    else {
      button.textContent = "СЕРДЕЧКО СОХРАНЕНО ✓";
      button.disabled = true;
    }
  });
});

function renderQuestion() {
  quizAnswered = false;
  const item = CONFIG.quiz[quizIndex];
  $("quiz-counter").textContent = `Вопрос ${quizIndex + 1} из ${CONFIG.quiz.length}`;
  $("quiz-question").textContent = item.question;
  $("quiz-feedback").textContent = "";
  $("quiz-next").disabled = true;
  $("quiz-next").textContent = quizIndex === CONFIG.quiz.length - 1 ? "ЗАВЕРШИТЬ ВИКТОРИНУ ♥" : "СЛЕДУЮЩИЙ ВОПРОС →";
  const options = $("quiz-options");
  options.replaceChildren();
  item.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiz-option";
    button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
    button.addEventListener("click", () => {
      if (quizAnswered) return;
      quizAnswered = true;
      [...options.children].forEach((child) => child.disabled = true);
      button.classList.add("selected");
      $("quiz-feedback").textContent = index === item.answer ? item.feedback : "Не страшно! Главное — наша история, а не идеальные ответы. ♡";
      $("quiz-next").disabled = false;
    });
    options.appendChild(button);
  });
}
$("quiz-next").addEventListener("click", () => {
  if (!quizAnswered) return;
  if (quizIndex < CONFIG.quiz.length - 1) {
    quizIndex++;
    renderQuestion();
  } else {
    collected.add("quiz");
    // Викторина — приятный бонус; прогресс засчитывается как её часть, без дополнительного сердечка.
    showScreen("screen-hub");
    updateProgress();
    $("quiz-counter").textContent = "Викторина пройдена!";
  }
});

document.querySelectorAll("[data-gift]").forEach((button) => {
  button.addEventListener("click", () => {
    const index = Number(button.dataset.gift);
    $("gift-reveal").textContent = CONFIG.gifts[index] || "Ещё один сюрприз — придумай его сама. ♡";
    $("gift-reveal").classList.remove("hidden");
    button.classList.add("opened");
    button.querySelector("small").textContent = "Открыто ✓";
    openedGifts.add(index);
  });
});

const audio = $("background-music");
const musicToggle = $("music-toggle");
musicToggle.addEventListener("click", async () => {
  try {
    if (audio.paused) {
      await audio.play();
      musicToggle.textContent = "♫ Выключить музыку";
      musicToggle.setAttribute("aria-pressed", "true");
    } else {
      audio.pause();
      musicToggle.textContent = "♫ Включить музыку";
      musicToggle.setAttribute("aria-pressed", "false");
    }
  } catch (error) {
    alert("Добавь свою песню в папку audio и назови файл our-song.mp3. Затем нажми кнопку музыки ещё раз.");
  }
});

$("replay-btn").addEventListener("click", () => {
  collected.clear();
  openedGifts.clear();
  document.querySelectorAll("[data-collect]").forEach((button) => {
    button.disabled = false;
    button.textContent = "ЗАБРАТЬ СЕРДЕЧКО ♥";
  });
  document.querySelectorAll(".gift").forEach((button) => {
    button.classList.remove("opened");
    button.querySelector("small").textContent = "Не открыто";
  });
  $("gift-reveal").classList.add("hidden");
  quizIndex = 0;
  updateProgress();
  showScreen("screen-start");
});
$("hub-btn").addEventListener("click", () => showScreen("screen-hub"));
updateProgress();
