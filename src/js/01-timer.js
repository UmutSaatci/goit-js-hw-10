import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const datetimePicker = document.querySelector('#datetime-picker');
const startBtn = document.querySelector('[data-start]');
const daysSpan = document.querySelector('[data-days]');
const hoursSpan = document.querySelector('[data-hours]');
const minutesSpan = document.querySelector('[data-minutes]');
const secondsSpan = document.querySelector('[data-seconds]');

let userSelectedDate = null;
let isTimerRunning = false;

startBtn.disabled = true;

const options = {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,
  onClose(selectedDates) {
    if (isTimerRunning) return;

    const selectedDate = selectedDates[0];
    const currentDate = new Date();

    if (selectedDate <= currentDate) {
      iziToast.error({
        title: 'Error',
        message: 'Please choose a date in the future',
        position: 'topRight',
      });
      startBtn.disabled = true;
      userSelectedDate = null;
    } else {
      startBtn.disabled = false;
      userSelectedDate = selectedDate;
    }
  },
};

flatpickr(datetimePicker, options);

function waitOneSecond() {
  return new Promise(resolve => {
    setTimeout(resolve, 1000);
  });
}

function runTimerTick() {
  const currentTime = new Date();
  const timeDifference = userSelectedDate - currentTime;

  if (timeDifference <= 0 || !isTimerRunning) {
    isTimerRunning = false;
    updateTimerInterface({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    iziToast.success({
      title: 'Finished',
      message: 'Countdown has ended!',
      position: 'topRight',
    });
    return;
  }

  const timeComponents = convertMs(timeDifference);
  updateTimerInterface(timeComponents);

  waitOneSecond()
    .then(() => {
      runTimerTick();
    })
    .catch(error => {
      console.error('Zamanlayıcı hatası:', error);
    });
}

startBtn.addEventListener('click', () => {
  isTimerRunning = true;
  startBtn.disabled = true;
  datetimePicker.disabled = true;

  runTimerTick();
});

function updateTimerInterface({ days, hours, minutes, seconds }) {
  daysSpan.textContent = addLeadingZero(days);
  hoursSpan.textContent = addLeadingZero(hours);
  minutesSpan.textContent = addLeadingZero(minutes);
  secondsSpan.textContent = addLeadingZero(seconds);
}

function addLeadingZero(value) {
  return String(value).padStart(2, '0');
}

function convertMs(ms) {
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  const days = Math.floor(ms / day);
  const hours = Math.floor((ms % day) / hour);
  const minutes = Math.floor(((ms % day) % hour) / minute);
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);

  return { days, hours, minutes, seconds };
}
