document.addEventListener("DOMContentLoaded", () => {
  const checkInInput = document.getElementById("checkIn");
  const checkOutInput = document.getElementById("checkOut");
  const priceBox = document.getElementById("priceCalculation");
  const nightsCount = document.getElementById("nightsCount");
  const basePriceSpan = document.getElementById("basePrice");
  const taxPriceSpan = document.getElementById("taxPrice");
  const totalPriceDisplay = document.getElementById("totalPriceDisplay");
  const totalPriceInput = document.getElementById("totalPriceInput");
  const reserveBtn = document.getElementById("reserveBtn");

  if (!checkInInput || !checkOutInput) return;

  const pricePerNight = window.listingPrice || 0;
  const today = new Date().toISOString().split("T")[0];
  checkInInput.min = today;

  function calculateBill() {
    const checkIn = new Date(checkInInput.value);
    const checkOut = new Date(checkOutInput.value);

    if (checkInInput.value && checkOutInput.value && checkOut > checkIn) {
      const diffTime = Math.abs(checkOut - checkIn);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const base = diffDays * pricePerNight;
      const tax = Math.round(base * 0.18);
      const total = base + tax;

      nightsCount.innerText = diffDays;
      basePriceSpan.innerText = base.toLocaleString("en-IN");
      taxPriceSpan.innerText = tax.toLocaleString("en-IN");
      totalPriceDisplay.innerText = total.toLocaleString("en-IN");
      totalPriceInput.value = total;

      priceBox.classList.remove("d-none");
      if (reserveBtn) reserveBtn.disabled = false;
    } else {
      priceBox.classList.add("d-none");
      if (reserveBtn) reserveBtn.disabled = true;
    }
  }

  checkInInput.addEventListener("change", () => {
    checkOutInput.min = checkInInput.value;
    calculateBill();
  });
  checkOutInput.addEventListener("change", calculateBill);
});