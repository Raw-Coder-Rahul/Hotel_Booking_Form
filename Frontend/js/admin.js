let allBookings = [];

const API_BASE = "http://localhost:5000";

// Load Bookings from Backend
async function loadBookings() {
  const status = document.getElementById("statusMessage");
  try {
    const res = await fetch(`${API_BASE}/api/bookings`);
    if (!res.ok) throw new Error("Failed to fetch bookings");
    allBookings = await res.json();

    if (!allBookings.length) {
      renderNoBookings();
      if (status) status.textContent = "No bookings available.";
    } else {
      renderBookings(allBookings);
      if (status) status.textContent = `Loaded ${allBookings.length} bookings.`;
    }
  } catch (err) {
    console.error("Error loading bookings:", err);
    const tbody = document.querySelector("#bookingsTable tbody");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="8">Error loading bookings</td></tr>`;
    }
    if (status) status.textContent = "Could not load bookings. Check backend.";
  }
}

// Render Bookings
function renderBookings(bookings) {
  const tbody = document.querySelector("#bookingsTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "";
  bookings.forEach(b => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${b.fullname}</td>
      <td>${b.email}</td>
      <td>${b.phone}</td>
      <td>${b.room}</td>
      <td>${b.guests}</td>
      <td>${new Date(b.checkin).toLocaleDateString()}</td>
      <td>${new Date(b.checkout).toLocaleDateString()}</td>
      <td>${b.paymentId || "N/A"}</td>
    `;
    tbody.appendChild(row);
  });
}

// Render No Bookings Message
function renderNoBookings() {
  const tbody = document.querySelector("#bookingsTable tbody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="8">No bookings found</td></tr>`;
}

// Apply Filters
function applyFilters() {
  const roomFilter = document.getElementById("roomFilter")?.value;
  const checkinFilter = document.getElementById("checkinFilter")?.value;
  const status = document.getElementById("statusMessage");

  let filtered = [...allBookings];

  if (roomFilter) {
    filtered = filtered.filter(b => b.room === roomFilter);
  }

  if (checkinFilter) {
    const filterDate = new Date(checkinFilter);
    filtered = filtered.filter(b => new Date(b.checkin) >= filterDate);
  }

  if (!filtered.length) {
    renderNoBookings();
    if (status) status.textContent = "No bookings match the filters.";
  } else {
    renderBookings(filtered);
    if (status) status.textContent = `Showing ${filtered.length} filtered bookings.`;
  }
}

// Reset Filters
function resetFilters() {
  if (document.getElementById("roomFilter")) document.getElementById("roomFilter").value = "";
  if (document.getElementById("checkinFilter")) document.getElementById("checkinFilter").value = "";
  renderBookings(allBookings);
  const status = document.getElementById("statusMessage");
  if (status) status.textContent = "Filters reset. Showing all bookings.";
}

// Export to CSV
function exportToCSV() {
  if (!allBookings.length) {
    alert("No bookings to export!");
    return;
  }

  const headers = ["Full Name","Email","Phone","Room","Guests","Check-in","Check-out","Payment ID"];
  const rows = allBookings.map(b => [
    b.fullname,
    b.email,
    b.phone,
    b.room,
    b.guests,
    new Date(b.checkin).toLocaleDateString(),
    new Date(b.checkout).toLocaleDateString(),
    b.paymentId || "N/A"
  ]);

  const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "bookings.csv";
  link.click();

  const status = document.getElementById("statusMessage");
  if (status) status.textContent = "Bookings exported to CSV.";
}

// Event Listeners
document.getElementById("applyFilters")?.addEventListener("click", applyFilters);
document.getElementById("resetFilters")?.addEventListener("click", resetFilters);
document.getElementById("exportCSV")?.addEventListener("click", exportToCSV);

// Initialize on Page Load
window.addEventListener("DOMContentLoaded", loadBookings);
