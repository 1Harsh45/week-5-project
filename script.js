// Sample data for doctors
const doctors = [
    { id: 1, name: "Dr. Stephan Strange", totalSlots: 10, availableSlots: 10, bookedSlots: [] },
    { id: 2, name: "Dr. Jane Foster", totalSlots: 10, availableSlots: 10, bookedSlots: [] },
    { id: 3, name: "Dr. Bruce Banner", totalSlots: 10, availableSlots: 10, bookedSlots: [] },
];

// Array to store appointments
let appointments = [];

// Function to populate time dropdown with 15-minute intervals from 09:00 to 22:00
function populateTimeOptions() {
    const timeDropdown = document.getElementById("appointment-time");
    timeDropdown.innerHTML = ''; // Clear existing options

    const startTime = new Date();
    startTime.setHours(9, 0, 0, 0); // Start at 09:00 AM

    const endTime = new Date();
    endTime.setHours(22, 0, 0, 0); // End at 10:00 PM

    while (startTime < endTime) {
        const hours = startTime.getHours();
        const minutes = startTime.getMinutes();
        const timeOption = document.createElement("option");
        timeOption.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        timeOption.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        timeDropdown.appendChild(timeOption);

        startTime.setMinutes(startTime.getMinutes() + 15); // Increment by 15 minutes
    }
}


// Function to display doctor information
function displayDoctors() {
    const doctorSelection = document.getElementById("doctor-selection");
    const doctorCards = document.getElementById("doctor-cards");

    // Clear existing options and cards
    doctorSelection.innerHTML = '<option value="" disabled selected>Select Doctor</option>';
    doctorCards.innerHTML = '';

    doctors.forEach(doctor => {
        // Add option to doctor selection dropdown
        const option = document.createElement("option");
        option.value = doctor.id;
        option.textContent = doctor.name;
        doctorSelection.appendChild(option);

        // Create doctor card
        const card = document.createElement("div");
        card.classList.add("doctor-card");
        card.innerHTML = `
            <h3>${doctor.name}</h3>
            <p>Total Slots: ${doctor.totalSlots}</p>
            <p>Available Slots: ${doctor.availableSlots}</p>
            <p>Booked Slots: ${doctor.bookedSlots.length}</p>
        `;
        doctorCards.appendChild(card);
    });
}

// Function to parse time into a comparable format
function parseTime(time) {
    const [hour, minute] = time.split(':').map(Number);
    return { hour, minute };
}

// Function to generate all 15-minute intervals for a given time
function get15MinuteIntervals(date, time) {
    const { hour, minute } = parseTime(time);
    const intervals = [];

    // Previous interval
    if (minute >= 15) {
        intervals.push(`${date} ${String(hour).padStart(2, '0')}:${String(minute - 15).padStart(2, '0')}`);
    } else if (hour > 0) {
        intervals.push(`${date} ${String(hour - 1).padStart(2, '0')}:${String(minute + 45).padStart(2, '0')}`);
    }

    // Current interval
    intervals.push(`${date} ${time}`);

    // Next interval
    if (minute <= 45) {
        intervals.push(`${date} ${String(hour).padStart(2, '0')}:${String(minute + 15).padStart(2, '0')}`);
    } else {
        intervals.push(`${date} ${String(hour + 1).padStart(2, '0')}:00`);
    }

    return intervals;
}

// Function to handle booking an appointment
function bookAppointment(event) {
    event.preventDefault();

    const patientName = document.getElementById("patient-name").value;
    const doctorId = document.getElementById("doctor-selection").value;
    const appointmentDate = document.getElementById("appointment-date").value;
    const appointmentTime = document.getElementById("appointment-time").value;

    // Check if all fields are filled out
    if (!patientName || !doctorId || !appointmentDate || !appointmentTime) {
        alert("Please fill out all fields.");
        return;
    }

    // Check if the selected date is in the past
    const today = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
    if (appointmentDate < today) {
        alert("You cannot book an appointment in the past.");
        return;
    }

    // Check if the time slot is within the allowed range
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    if (hours < 9 || (hours === 22 && minutes > 0) || hours > 22) {
        alert("The selected time is out of the allowed booking hours (09:00 - 22:00).");
        return;
    }

    // Check if the time slot is available for the selected doctor
    const doctor = doctors.find(doc => doc.id == doctorId);
    const appointmentIntervals = get15MinuteIntervals(appointmentDate, appointmentTime);

    const isSlotUnavailable = appointmentIntervals.some(interval => doctor.bookedSlots.includes(interval));
    if (isSlotUnavailable) {
        alert("The slot you are trying to book is unavailable.");
        return;
    }

    // Create appointment ID
    const appointmentId = `APPT-${Date.now()}`;

    // Save appointment
    const appointment = {
        id: appointmentId,
        patientName,
        doctorName: doctor.name,
        date: appointmentDate,
        time: appointmentTime
    };
    appointments.push(appointment);

    // Update doctor's available and booked slots
    doctor.availableSlots--;
    doctor.bookedSlots.push(`${appointmentDate} ${appointmentTime}`);

    alert(`Appointment booked successfully! Your appointment ID is ${appointmentId}.`);
    document.getElementById("booking-form").reset();
    displayAppointments();
    displayDoctors();
}


// Function to cancel an appointment
function cancelAppointment() {
    const appointmentId = document.getElementById("appointment-id").value;

    const appointmentIndex = appointments.findIndex(appt => appt.id === appointmentId);
    if (appointmentIndex === -1) {
        alert("Invalid appointment ID.");
        return;
    }

    // Remove appointment from the list
    const [removedAppointment] = appointments.splice(appointmentIndex, 1);

    // Update doctor's available slots and remove the booked slot
    const doctor = doctors.find(doc => doc.name === removedAppointment.doctorName);
    if (doctor) {
        doctor.availableSlots++;
        const slot = `${removedAppointment.date} ${removedAppointment.time}`;
        const slotIndex = doctor.bookedSlots.indexOf(slot);
        if (slotIndex > -1) {
            doctor.bookedSlots.splice(slotIndex, 1);
        }
    }

    alert("Appointment canceled successfully.");
    displayAppointments();
    displayDoctors();
}

// Function to display all appointments
function displayAppointments() {
    const appointmentsList = document.getElementById("appointments-list");
    appointmentsList.innerHTML = ""; // Clear previous list

    appointments.forEach((appt, index) => {
        const div = document.createElement("div");
        div.classList.add("appointment-item");
        div.innerHTML = `
            <p><strong>${index + 1}.</strong></p>
            <div class="appointment-details">
                <p><strong>ID:</strong> ${appt.id}</p>
                <p><strong>Patient:</strong> ${appt.patientName}</p>
                <p><strong>Doctor:</strong> ${appt.doctorName}</p>
                <p><strong>Date:</strong> ${appt.date}</p>
                <p><strong>Time:</strong> ${appt.time}</p>
            </div>
        `;
        appointmentsList.appendChild(div);
    });
}


// Initialize the application
document.addEventListener("DOMContentLoaded", function() {
    populateTimeOptions();
    displayDoctors();
});

document.getElementById("booking-form").addEventListener("submit", bookAppointment);
document.getElementById("cancel-appointment").addEventListener("click", cancelAppointment);
document.getElementById("view-appointments").addEventListener("click", displayAppointments);
