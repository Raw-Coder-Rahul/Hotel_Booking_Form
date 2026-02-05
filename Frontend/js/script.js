// Dummy Data
const dummyCalendarData = [
  { date: "2026-02-10", status: "Booked" },
  { date: "2026-02-12", status: "Available" },
  { date: "2026-02-15", status: "Booked" },
];

const dummyRooms = [
  { name: "Single Room", price: 1, img: "assets/images/single.jpg", desc: "Cozy room for solo travelers." },
  { name: "Double Room", price: 8000, img: "assets/images/double.jpg", desc: "Perfect for couples with elegant interiors." },
  { name: "Royal Suite", price: 15000, img: "assets/images/suite.jpg", desc: "Luxury suite with premium amenities." },
  { name: "Penthouse", price: 25000, img: "assets/images/penthouse.jpg", desc: "Top-floor penthouse with panoramic views." }
];

// Calendar
function renderCalendar() {
  const calendarDiv = document.getElementById("calendar");
  if (!calendarDiv) return;
  calendarDiv.innerHTML = "";
  dummyCalendarData.forEach(item => {
    const day = document.createElement("div");
    day.classList.add("calendar-day", "fade-in");
    day.textContent = `${item.date} - ${item.status}`;
    day.classList.add(item.status === "Booked" ? "booked" : "available");
    calendarDiv.appendChild(day);
  });
}

// Room Cards
function renderRoomCards() {
  const cardsDiv = document.getElementById("roomCards");
  if (!cardsDiv) return;
  cardsDiv.innerHTML = "";
  dummyRooms.forEach(room => {
    const card = document.createElement("div");
    card.classList.add("room-card", "fade-in");
    card.innerHTML = `
      <img src="${room.img}" alt="${room.name}">
      <h3>${room.name}</h3>
      <p>${room.desc}</p>
      <span class="price">₹${room.price}</span>
    `;
    cardsDiv.appendChild(card);
  });
}

// Price
function updatePriceEstimate() {
  const checkin = new Date(document.getElementById("checkin").value);
  const checkout = new Date(document.getElementById("checkout").value);
  const roomType = document.getElementById("room").value;
  const priceDiv = document.getElementById("priceEstimate");

  if (!checkin || !checkout || !roomType) {
    priceDiv.textContent = "₹0";
    return;
  }

  const nights = (checkout - checkin) / (1000 * 60 * 60 * 24);
  if (nights <= 0) {
    priceDiv.textContent = "₹0";
    return;
  }

  const room = dummyRooms.find(r => r.name.toLowerCase().includes(roomType));
  if (room) {
    const total = room.price * nights;
    priceDiv.textContent = `₹${total}`;
  }
}

// Booking Form Validation + Razorpay 
document.getElementById("bookingForm")?.addEventListener("submit", async function(e) {
  e.preventDefault();

  const fullname = document.getElementById("fullname").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const checkin = new Date(document.getElementById("checkin").value);
  const checkout = new Date(document.getElementById("checkout").value);
  const room = document.getElementById("room").value;
  const guests = document.getElementById("guests").value;

  if (!fullname || !email || !phone || !checkin || !checkout || !room || !guests) {
    Toastify({ text: "Please fill in all required fields.", backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)", duration: 3000 }).showToast();
    return;
  }

  if (checkout <= checkin) {
    Toastify({ text: "Check-out date must be later than check-in date.", backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)", duration: 3000 }).showToast();
    return;
  }

  // Calculate total amount
  const roomData = dummyRooms.find(r => r.name.toLowerCase().includes(room));
  const nights = (checkout - checkin) / (1000 * 60 * 60 * 24);
  const totalAmount = roomData ? roomData.price * nights * 100 : 0; // Razorpay expects paise

  // Fetch Razorpay key from backend
  const keyRes = await fetch("http://localhost:5000/api/get-key");
  const { key } = await keyRes.json();

  // Create order via backend
  const order = await fetch("http://localhost:5000/api/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: totalAmount })
  }).then(res => res.json());

  const options = {
    key: key,
    amount: totalAmount,
    currency: "INR",
    name: "Royal Luxe Hotel",
    description: `Booking for ${room}`,
    order_id: order.id,
    handler: async function (response) {
      console.log("Payment ID:", response.razorpay_payment_id);

      // Save booking to backend (MongoDB)
      await fetch("http://localhost:5000/api/save-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname,
          email,
          phone,
          checkin,
          checkout,
          room,
          guests,
          paymentId: response.razorpay_payment_id
        })
      });

      Toastify({ text: "Payment successful & booking saved!", backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)", duration: 3000 }).showToast();
    },
    prefill: {
      name: fullname,
      email: email,
      contact: phone
    },
    theme: {
      color: "#d4af37"
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();

  document.getElementById("bookingForm").reset();
  document.getElementById("priceEstimate").textContent = "₹0";
});

// Newsletter Subscription
document.getElementById("newsletterForm")?.addEventListener("submit", function(e) {
  e.preventDefault();
  const email = document.getElementById("newsletterEmail").value;

  if (!email.includes("@")) {
    Toastify({ text: "Please enter a valid email address.", backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)", duration: 3000 }).showToast();
    return;
  }

  Toastify({ text: "Subscribed successfully!", backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)", duration: 3000 }).showToast();
  document.getElementById("newsletterForm").reset();
});

// Theme Toggle
function setTheme(mode) {
  document.body.className = mode;
  Toastify({ text: `Theme switched to ${mode.replace("-mode","")} 🌟`, backgroundColor: "linear-gradient(to right, #1a1a40, #d4af37)", duration: 2000 }).showToast();
}

document.getElementById("lightBtn")?.addEventListener("click", () => setTheme("light-mode"));
document.getElementById("darkBtn")?.addEventListener("click", () => setTheme("dark-mode"));
document.getElementById("royalBtn")?.addEventListener("click", () => setTheme("royal-mode"));

// Responsive Navbar
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.querySelector(".navLink");

menuBtn?.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});

// Initialize on Page Load
window.addEventListener("DOMContentLoaded", () => {
  renderCalendar();
  renderRoomCards();

  // Prevent past dates for check-in
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("checkin").setAttribute("min", today);
  document.getElementById("checkout").setAttribute("min", today);

  // Attach dynamic price estimator
  document.getElementById("checkin")?.addEventListener("change", updatePriceEstimate);
  document.getElementById("checkout")?.addEventListener("change", updatePriceEstimate);
  document.getElementById("room")?.addEventListener("change", updatePriceEstimate);

  // Initialize phone input with intl-tel-input if available
  if (window.intlTelInput) {
    const phoneInput = document.getElementById("phone");
    window.intlTelInput(phoneInput, {
      initialCountry: "in",
      preferredCountries: ["in", "pk", "us", "gb"],
      separateDialCode: true,
      utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input/build/js/utils.js"
    });
  }

  console.log("Frontend initialized successfully");
});
