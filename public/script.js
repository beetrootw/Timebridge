document.addEventListener('DOMContentLoaded', () => {
    const datesGrid = document.querySelector('.dates-grid');
    const currentMonthElement = document.getElementById('current-month');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const countdownElement = document.getElementById('countdown');
    
    let encounterDate = null;  // Event date
    let countdownInterval = null;  // Countdown interval
    let eventMessage = "encounter";  // Default message if not customized

    // Modal elements
    const eventModal = document.getElementById('eventModal');
    const closeModal = document.querySelector('.close');
    const saveEventButton = document.getElementById('saveEvent');
    const eventInput = document.getElementById('eventInput');
    const emailSection = document.getElementById('emailSection');
    const sendEmailsButton = document.getElementById('sendEmails');
    
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();
    const today = new Date();

    function generateCalendar(year, month) {
        datesGrid.innerHTML = '';  // Clear previous dates
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let firstDay = new Date(year, month, 1).getDay();
        firstDay = (firstDay === 0) ? 6 : firstDay - 1;  // Adjust to make Monday the first day
        const daysInPreviousMonth = new Date(year, month, 0).getDate();

        for (let i = firstDay; i > 0; i--) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'date past-month';
            emptyDiv.textContent = daysInPreviousMonth - (i - 1);
            emptyDiv.style.pointerEvents = 'none';
            datesGrid.appendChild(emptyDiv);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dateDiv = document.createElement('div');
            dateDiv.className = 'date';
            dateDiv.textContent = i;

            const currentDate = new Date(year, month, i);

            if (currentDate.toDateString() === today.toDateString()) {
                dateDiv.classList.add('today');
            } else if (currentDate < today && (year === today.getFullYear() && month === today.getMonth())) {
                dateDiv.classList.add('past-date');
                dateDiv.style.pointerEvents = 'none';
            }

            if (encounterDate && year === encounterDate.year && month === encounterDate.month && i === encounterDate.day) {
                dateDiv.classList.add('event-day');
            }

            dateDiv.addEventListener('click', function () {
                const selectedDate = new Date(year, month, i);
                encounterDate = {
                    year: selectedDate.getFullYear(),
                    month: selectedDate.getMonth(),
                    day: selectedDate.getDate()
                };

                if (countdownInterval) {
                    clearInterval(countdownInterval);
                }

                eventModal.style.display = "block";
            });

            datesGrid.appendChild(dateDiv);
        }

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        currentMonthElement.textContent = `${monthNames[month]} ${year}`;
    }

    generateCalendar(currentYear, currentMonth);

    prevMonthButton.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar(currentYear, currentMonth);
    });

    nextMonthButton.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar(currentYear, currentMonth);
    });

    function startCountdown(encounterDate, eventMessage) {
        function updateCountdown() {
            const now = new Date();
            const encounterDay = new Date(encounterDate.year, encounterDate.month, encounterDate.day);
            const timeDifference = encounterDay - now;

            if (timeDifference <= 0) {
                countdownElement.textContent = `Today is your ${eventMessage}!`;
                clearInterval(countdownInterval);
                return;
            }

            const daysLeft = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
            const hoursLeft = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutesLeft = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

            countdownElement.textContent = `${daysLeft} days, ${hoursLeft} hours, ${minutesLeft} minutes left until your ${eventMessage}.`;
        }

        countdownInterval = setInterval(updateCountdown, 1000);
        updateCountdown();
    }

    saveEventButton.addEventListener('click', () => {
        eventMessage = eventInput.value || "encounter";
        startCountdown(encounterDate, eventMessage);
        emailSection.style.display = "block";
    });

    sendEmailsButton.addEventListener('click', () => {
        const email1 = document.getElementById('emailInput1').value;
        const email2 = document.getElementById('emailInput2').value;

        if (!validateEmail(email1) || !validateEmail(email2)) {
            alert('Please enter valid email addresses.');
            return;
        }

        fetch('https://your-server-url/send-email', {  // Update with your server URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email1: email1,
                email2: email2,
                message: `You have an event: ${eventMessage}`
            })
        })
        .then(response => {
            if (response.ok) {
                alert('Emails sent successfully');
            } else {
                alert('Error sending emails');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error sending emails');
        });

        eventModal.style.display = "none";
    });

    function validateEmail(email) {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    closeModal.addEventListener('click', () => {
        eventModal.style.display = "none";
    });

    window.addEventListener('click', (event) => {
        if (event.target === eventModal) {
            eventModal.style.display = "none";
        }
    });
});