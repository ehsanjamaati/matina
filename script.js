const screens = [...document.querySelectorAll('.screen')];
const backButton = document.getElementById('backButton');
const progressBar = document.getElementById('progressBar');
const progressLabel = document.getElementById('progressLabel');
const toast = document.getElementById('toast');
const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶'];

const answers = { apple: '', day: 'همین امروز', time: '', food: '', phone: '' };
let currentScreen = 0;
let teaseCount = 0;
let toastTimer;

function showScreen(nextIndex) {
  if (nextIndex < 0 || nextIndex >= screens.length || nextIndex === currentScreen) return;
  const previous = screens[currentScreen];
  previous.classList.add('is-leaving');
  previous.classList.remove('is-active');

  window.setTimeout(() => previous.classList.remove('is-leaving'), 360);
  currentScreen = nextIndex;
  screens[currentScreen].scrollTop = 0;
  screens[currentScreen].classList.add('is-active');
  updateProgress();
}

function updateProgress() {
  const progress = (currentScreen / (screens.length - 1)) * 100;
  progressBar.style.width = `${progress}%`;
  progressLabel.textContent = `${persianDigits[currentScreen]} از ${persianDigits[6]}`;
  backButton.classList.toggle('is-hidden', currentScreen === 0 || currentScreen === 6);
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2700);
}

function selectAndContinue(button, key, value) {
  answers[key] = value;
  button.classList.add('is-selected');
  window.setTimeout(() => showScreen(currentScreen + 1), 220);
}

document.querySelector('[data-next]').addEventListener('click', () => showScreen(1));
backButton.addEventListener('click', () => showScreen(currentScreen - 1));

document.querySelectorAll('[data-apple]').forEach((button) => {
  button.addEventListener('click', () => {
    if (button.dataset.apple === 'سیب گاز زده') {
      showToast('سیب درست رو انتخاب کن خانم اع');
      return;
    }
    selectAndContinue(button, 'apple', button.dataset.apple);
  });
});

document.querySelector('[data-today]').addEventListener('click', () => showScreen(3));

const timeGrid = document.getElementById('timeGrid');
for (let hour = 12; hour <= 20; hour += 1) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'time-button';
  button.textContent = `${String(hour).padStart(2, '0')}:00`;
  button.addEventListener('click', () => selectAndContinue(button, 'time', button.textContent));
  timeGrid.appendChild(button);
}

document.querySelectorAll('[data-food]').forEach((button) => {
  button.addEventListener('click', () => selectAndContinue(button, 'food', button.dataset.food));
});

const runawayArena = document.getElementById('runawayArena');
const runawayButton = document.getElementById('runawayButton');
let runawayMoves = 0;

function moveRunaway(event) {
  if (event) event.preventDefault();
  const arenaRect = runawayArena.getBoundingClientRect();
  const buttonRect = runawayButton.getBoundingClientRect();
  const padding = 10;
  const maxX = Math.max(padding, arenaRect.width - buttonRect.width - padding);
  const maxY = Math.max(padding, arenaRect.height - buttonRect.height - padding);
  let x = padding + Math.random() * (maxX - padding);
  let y = padding + Math.random() * (maxY - padding);

  if (runawayMoves === 0) { x = padding; y = maxY; }
  runawayMoves += 1;
  runawayButton.style.left = `${x}px`;
  runawayButton.style.top = `${y}px`;
  if (runawayMoves === 2) showToast('این دکمه امروز مرخصیه 😌');
}

runawayButton.addEventListener('pointerenter', moveRunaway);
runawayButton.addEventListener('pointerdown', moveRunaway);
runawayButton.addEventListener('focus', moveRunaway);
runawayButton.addEventListener('click', moveRunaway);

const phoneForm = document.getElementById('phoneForm');
const phoneInput = document.getElementById('phone');
const phoneError = document.getElementById('phoneError');
const teaseButton = document.getElementById('teaseButton');
const skipPhone = document.getElementById('skipPhone');

function normalizePhone(value) {
  return value.replace(/[\s()-]/g, '').replace(/^\+98/, '0').replace(/^0098/, '0');
}

async function sendAnswers() {
  const payload = new FormData();
  payload.append('سیب انتخابی', answers.apple);
  payload.append('روز قرار', answers.day);
  payload.append('ساعت قرار', answers.time);
  payload.append('غذا یا کافه', answers.food);
  payload.append('شماره موبایل', answers.phone);
  payload.append('_subject', 'جواب جدید فرم Matina 💗');

  const response = await fetch('https://formspree.io/f/xrpzbaqb', {
    method: 'POST',
    body: payload,
    headers: { Accept: 'application/json' }
  });

  if (!response.ok) throw new Error('Submission failed');
}

phoneForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = phoneForm.querySelector('[type="submit"]');
  const phone = normalizePhone(phoneInput.value);
  if (!/^09\d{9}$/.test(phone)) {
    phoneError.textContent = 'شماره رو کامل و به شکل 09xxxxxxxxx بنویس';
    phoneInput.focus();
    return;
  }
  phoneError.textContent = '';
  answers.phone = phone;
  submitButton.disabled = true;
  submitButton.textContent = 'دارم می‌فرستم...';

  try {
    await sendAnswers();
    showScreen(6);
  } catch (error) {
    showToast('ارسال نشد؛ اینترنتت رو چک کن و دوباره بزن');
    submitButton.disabled = false;
    submitButton.textContent = 'شمارمو نوشتم برات 💌';
  }
});

const teaseMessages = [
  'اذیت نکن دیگه شمارتو بده 😐',
  'واقعاً این‌قدر می‌خوای اذیت کنی؟ 😐',
  'خیلی اذیت می‌کنی، چیکار کنم دیگه؛ باشه دیدمت شمارتو می‌گیرم 😒'
];

teaseButton.addEventListener('click', () => {
  const index = Math.min(teaseCount, teaseMessages.length - 1);
  showToast(teaseMessages[index]);
  teaseCount += 1;
  if (teaseCount >= 3) skipPhone.classList.remove('hidden');
});

skipPhone.addEventListener('click', async () => {
  answers.phone = 'شماره نداد 😒';
  skipPhone.disabled = true;
  skipPhone.textContent = 'دارم جواب‌ها رو می‌فرستم...';

  try {
    await sendAnswers();
    showScreen(6);
  } catch (error) {
    showToast('ارسال نشد؛ اینترنتت رو چک کن و دوباره بزن');
    skipPhone.disabled = false;
    skipPhone.textContent = 'باشه، این قسمت رو رد می‌کنم';
  }
});
phoneInput.addEventListener('input', () => { phoneError.textContent = ''; });

updateProgress();
