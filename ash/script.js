const days = document.getElementById("days");
const hours = document.getElementById("hours");
const minutes = document.getElementById("minutes");
const seconds = document.getElementById("seconds");
const countdown = document.getElementById("countdown");
const year = document.getElementById("year");
const loading = document.getElementById("loading");

const currentYear = new Date().getFullYear();

const birthdayTime = new Date(`September 20 ${currentYear} 00:00:00`);

const today = new Date();
const currentDateTime = new Date(
  `${today.getMonth()} ${today.getDate()} ${currentYear}`
);

const age =
  currentDateTime < birthdayTime ? currentYear - 1994 - 1 : currentYear - 1994;

// Set background year
// year.innerText = `${age + 1}y`;

// Update countdown time
function updateCountdown() {
  const currentTime = new Date();
  const newYearBirthday = new Date(`September 20 ${currentYear} 00:00:00`);
  const diff =
    birthdayTime < currentTime
      ? newYearBirthday - currentTime
      : birthdayTime - currentTime;

  const d = Math.floor(diff / 1000 / 60 / 60 / 24);
  const h = Math.floor(diff / 1000 / 60 / 60) % 24;
  const m = Math.floor(diff / 1000 / 60) % 60;
  const s = Math.floor(diff / 1000) % 60;

  if(d>0)
  {
    days.innerHTML = d + "<small> days. </small>";
  hours.innerHTML = h+ "<small> hrs. </small>";
  minutes.innerHTML = m + "<small> min. </small>";
  seconds.innerHTML = s + "<small> sec. </small>";

  }
  else
  {
    days.innerHTML = "";
    hours.innerHTML = "";
    minutes.innerHTML = "";
    seconds.innerHTML = "";
    wishes.innerHTML = "Happy Birthday Ash 💖🔥!! <br><a href='https://drive.google.com/file/d/1rRnyYt5SUxLWKTvY3wD1dyV5przww2H-/view?usp=sharing'><small>(Click here)<small></a>";
  }
  
  
}

// Show spinner before countdown
setTimeout(() => {
  loading.remove();
  countdown.style.display = "flex";
}, 1000);

// Run every second
setInterval(updateCountdown, 1000);
