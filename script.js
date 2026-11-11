const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
}));

document.getElementById("year").textContent = new Date().getFullYear();

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

const launchButton = document.getElementById("launch-button");
const countdownNumber = document.getElementById("countdown-number");
const countdownLabel = document.getElementById("countdown-label");
const launchMessage = document.getElementById("launch-message");
const countdownSection = document.getElementById("cuenta-regresiva");
let running = false;
let audioContext;

function playTone(frequency, duration = 0.18, type = "sine", volume = 0.12) {
  if (!audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  gain.gain.setValueAtTime(volume, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

launchButton.addEventListener("click", async () => {
  if (running) return;
  running = true;
  launchButton.disabled = true;
  launchButton.innerHTML = '<span class="button-icon">◌</span> Cuenta regresiva en curso';
  launchMessage.textContent = "";
  countdownSection.classList.remove("launched");

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioContext = audioContext || new AudioContextClass();
      if (audioContext.state === "suspended") await audioContext.resume();
    }
  } catch (error) {
    audioContext = null;
  }

  for (let number = 5; number >= 1; number--) {
    countdownNumber.textContent = String(number).padStart(2, "0");
    countdownLabel.textContent = "SEGUNDOS PARA EL DESPEGUE";
    playTone(number === 1 ? 740 : 520, 0.2, "sine", 0.14);
    await wait(1000);
  }

  countdownNumber.textContent = "✦";
  countdownLabel.textContent = "¡DESPEGUE!";
  playTone(440, 0.25, "triangle", 0.13);
  await wait(160);
  playTone(660, 0.35, "triangle", 0.12);
  await wait(160);
  playTone(880, 0.6, "sawtooth", 0.07);
  countdownSection.classList.add("launched");
  launchMessage.textContent = "BLUE LAUNCH — ¡EL FUTURO COMIENZA AHORA!";
  await wait(2600);

  countdownSection.classList.remove("launched");
  countdownNumber.textContent = "05";
  countdownLabel.textContent = "SEGUNDOS PARA EL DESPEGUE";
  launchButton.disabled = false;
  launchButton.innerHTML = '<span class="button-icon">↻</span> Repetir cuenta regresiva';
  running = false;
});
