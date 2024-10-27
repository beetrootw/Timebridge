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
    const emailSection = document.getElementById('emailSection');  // Email section hidden
    const sendEmailsButton = document.getElementById('sendEmails');
    
    // Get the current month and year when the page loads
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth(); // Current month (0 = January, 1 = February, etc.)
    const today = new Date(); // Save the current date for comparison later

    // Function to generate the calendar
    function generateCalendar(year, month) {
        datesGrid.innerHTML = '';  // Clear previous dates

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let firstDay = new Date(year, month, 1).getDay();
        firstDay = (firstDay === 0) ? 6 : firstDay - 1;  // Adjust to make Monday the first day

        // Get the number of days in the previous month to disable visible ones
        const daysInPreviousMonth = new Date(year, month, 0).getDate();

        // Add previous month's days that appear at the beginning
        for (let i = firstDay; i > 0; i--) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'date past-month';
            emptyDiv.textContent = daysInPreviousMonth - (i - 1);  // Show the day number from the previous month
            emptyDiv.style.pointerEvents = 'none';  // Disable clicks
            datesGrid.appendChild(emptyDiv);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dateDiv = document.createElement('div');
            dateDiv.className = 'date';
            dateDiv.textContent = i;

            const currentDate = new Date(year, month, i);

            // If it's the current day, highlight it as selectable
            if (currentDate.toDateString() === today.toDateString()) {
                dateDiv.classList.add('today');
            }
            // Disable past days except for the current day
            else if (currentDate < today && (year === today.getFullYear() && month === today.getMonth())) {
                dateDiv.classList.add('past-date');
                dateDiv.style.pointerEvents = 'none';  // Disable clicks
            }

            // Highlight the selected date for the event
            if (encounterDate && year === encounterDate.year && month === encounterDate.month && i === encounterDate.day) {
                dateDiv.classList.add('event-day');
            }

            // Click event to select dates
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

                // Open the modal to enter the event
                eventModal.style.display = "block";
            });

            datesGrid.appendChild(dateDiv);
        }

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        currentMonthElement.textContent = `${monthNames[month]} ${year}`;
    }

    // Initialize the calendar for the current month
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

    // Function to start the countdown
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

    // Save the event and display the email inputs
    saveEventButton.addEventListener('click', () => {
        eventMessage = eventInput.value || "encounter";  // Use custom or default message

        // Show the email input section after saving the event
        emailSection.style.display = "block";  // Show the email section
    });

    // Send emails
    sendEmailsButton.addEventListener('click', () => {
        const email1 = document.getElementById('emailInput1').value;
        const email2 = document.getElementById('emailInput2').value;

        if (!validateEmail(email1) || !validateEmail(email2)) {
            alert('Please enter valid email addresses.');
            return;
        }

        console.log(`Sending notification emails to ${email1} and ${email2} about the event: ${eventMessage}`);

        // Send POST request to server with CORS headers
        fetch('https://timebridge.onrender.com/send-email', {
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

        eventModal.style.display = "none";  // Close the modal
    });

    // Simple function to validate emails
    function validateEmail(email) {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    // Close the modal by clicking on the "X"
    closeModal.addEventListener('click', () => {
        eventModal.style.display = "none";
    });

    // Close the modal if the user clicks outside the modal
    window.addEventListener('click', (event) => {
        if (event.target === eventModal) {
            eventModal.style.display = "none";
        }
    });
});