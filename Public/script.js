document.addEventListener('DOMContentLoaded', () => {
    const datesGrid = document.querySelector('.dates-grid');
    const currentMonthElement = document.getElementById('current-month');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const countdownElement = document.getElementById('countdown');
    
    let encounterDate = null;  // Fecha del evento
    let countdownInterval = null;  // Intervalo del contador
    let eventMessage = "encounter";  // Mensaje por defecto si no se personaliza

    // Modal elements
    const eventModal = document.getElementById('eventModal');
    const closeModal = document.querySelector('.close');
    const saveEventButton = document.getElementById('saveEvent');
    const eventInput = document.getElementById('eventInput');
    const emailSection = document.getElementById('emailSection');  // Sección de emails oculta
    const sendEmailsButton = document.getElementById('sendEmails');
    
    // Obtener el mes y año actual al cargar la página
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth(); // Mes actual (0 = Enero, 1 = Febrero, etc.)
    const today = new Date(); // Guardar la fecha actual para comparar más adelante

    // Función para generar el calendario
    function generateCalendar(year, month) {
        datesGrid.innerHTML = '';  // Limpiar fechas anteriores

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let firstDay = new Date(year, month, 1).getDay();
        firstDay = (firstDay === 0) ? 6 : firstDay - 1;  // Ajustar para que lunes sea el primer día

        // Obtener el número de días del mes anterior para deshabilitar los visibles
        const daysInPreviousMonth = new Date(year, month, 0).getDate();

        // Agregar los días del mes anterior que aparecen al inicio
        for (let i = firstDay; i > 0; i--) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'date past-month';
            emptyDiv.textContent = daysInPreviousMonth - (i - 1);  // Mostrar el número del día del mes anterior
            emptyDiv.style.pointerEvents = 'none';  // Desactivar clics
            datesGrid.appendChild(emptyDiv);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dateDiv = document.createElement('div');
            dateDiv.className = 'date';
            dateDiv.textContent = i;

            const currentDate = new Date(year, month, i);

            // Si es el día actual, resáltalo como seleccionable
            if (currentDate.toDateString() === today.toDateString()) {
                dateDiv.classList.add('today');
            }
            // Desactivar los días pasados, excepto el día actual
            else if (currentDate < today && (year === today.getFullYear() && month === today.getMonth())) {
                dateDiv.classList.add('past-date');
                dateDiv.style.pointerEvents = 'none';  // Desactivar clics
            }

            // Resaltar la fecha seleccionada para el evento
            if (encounterDate && year === encounterDate.year && month === encounterDate.month && i === encounterDate.day) {
                dateDiv.classList.add('event-day');
            }

            // Evento de clic para seleccionar fechas
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

                // Abrir el modal para ingresar el evento
                eventModal.style.display = "block";
            });

            datesGrid.appendChild(dateDiv);
        }

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        currentMonthElement.textContent = `${monthNames[month]} ${year}`;
    }

    // Inicializar el calendario para el mes actual
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

    // Función para comenzar el conteo regresivo
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

    // Guardar el evento y mostrar los inputs de correos
    saveEventButton.addEventListener('click', () => {
        eventMessage = eventInput.value || "encounter";  // Usar mensaje personalizado o default

        // Mostrar los inputs de correo electrónico después de guardar el evento
        emailSection.style.display = "block";  // Mostrar la sección de correos
    });

    // Enviar correos electrónicos
    sendEmailsButton.addEventListener('click', () => {
        const email1 = document.getElementById('emailInput1').value;
        const email2 = document.getElementById('emailInput2').value;

        if (!validateEmail(email1) || !validateEmail(email2)) {
            alert('Please enter valid email addresses.');
            return;
        }

        console.log(`Sending notification emails to ${email1} and ${email2} about the event: ${eventMessage}`);

        eventModal.style.display = "none";  // Cerrar el modal
    });

    // Función simple para validar correos electrónicos
    function validateEmail(email) {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    }

    // Cerrar el modal al hacer clic en la "X"
    closeModal.addEventListener('click', () => {
        eventModal.style.display = "none";
    });

    // Cerrar el modal si el usuario hace clic fuera del modal
    window.addEventListener('click', (event) => {
        if (event.target === eventModal) {
            eventModal.style.display = "none";
        }
    });

    // Enviar correos electrónicos
sendEmailsButton.addEventListener('click', () => {
    const email1 = document.getElementById('emailInput1').value;
    const email2 = document.getElementById('emailInput2').value;
    
    if (!validateEmail(email1) || !validateEmail(email2)) {
        alert('Please enter valid email addresses.');
        return;
    }
    
    // Enviar la solicitud POST al servidor
    fetch('http://localhost:3000/send-email', {
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
    
    eventModal.style.display = "none";  // Cerrar el modal
});

});