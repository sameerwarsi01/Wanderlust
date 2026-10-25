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
  const bookingForm = document.getElementById("bookingForm");

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
      if (totalPriceInput) totalPriceInput.value = total;

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

  if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const checkIn = checkInInput.value;
      const checkOut = checkOutInput.value;

      if (!checkIn || !checkOut) {
        alert("Please select valid check-in and checkout dates.");
        return;
      }

      try {
        const res = await fetch(`/listings/${window.listingId}/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkIn, checkOut }),
        });

        const data = await res.json();
        if (!data.success) {
          alert(data.message || "Failed to create order");
          return;
        }

        const options = {
          key: data.keyId,
          amount: data.order.amount,
          currency: data.order.currency,
          name: data.appName,
          description: `Reservation for ${data.listingTitle}`,
          order_id: data.order.id,
          handler: async function (response) {
            const verifyRes = await fetch(`/listings/${window.listingId}/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                checkIn: checkIn,
                checkOut: checkOut,
                totalPrice: data.finalAmount,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.redirectUrl) {
              window.location.href = verifyData.redirectUrl;
            }
          },
          prefill: {
            name: data.user.name,
            email: data.user.email,
          },
          theme: {
            color: data.themeColor,
          },
        };

        const rzp = new Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error("Payment error:", err);
        alert("Payment initialization failed. Please try again.");
      }
    });
  }
});