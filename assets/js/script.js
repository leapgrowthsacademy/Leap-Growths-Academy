document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // ORIENTATION MODAL OPEN
    // =========================
    const orientationBtn = document.getElementById("openOrientation");
    const orientationModalEl = document.getElementById("orientationModal");

    let orientationModal = null;
    if (orientationModalEl) {
        orientationModal = new bootstrap.Modal(orientationModalEl);
    }

    if (orientationBtn && orientationModal) {
        orientationBtn.addEventListener("click", () => {
            orientationModal.show();
        });
    }

    // =========================
    // ORIENTATION FORM (MODAL)
    // =========================
    const orientationForm = document.getElementById("orientationForm");

    // =========================
    // FOOTER ORIENTATION FORMS
    // =========================

    const orientationFormsFooter = document.querySelectorAll(".footerOrientationForm");

    const orientationScriptURL =
        "https://script.google.com/macros/s/AKfycbyso7H82QU5RV_R976UUdvibUSswjZKfh3TslytVkk8Vr-SugUkzr8_FF63MrSUm3zamg/exec";

    function handleOrientationSubmit(form) {
        form.addEventListener("submit", e => {
            e.preventDefault();

            // HTML5 validation
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            fetch(orientationScriptURL, {
                method: "POST",
                body: new FormData(form)
            })
                .then(() => {
                    alert("Orientation booked successfully!");
                    form.reset();
                })
                .catch(() => {
                    alert("Something went wrong. Please try again.");
                });
        });
    }

    // Attach submit handler to ALL footer forms
    orientationFormsFooter.forEach(form => {
        handleOrientationSubmit(form);
    });

    if (orientationForm) {
        handleOrientationSubmit(orientationForm);
    }


    // =========================
    // PROGRAM ENQUIRY MODAL
    // =========================
    const enquiryModalEl = document.getElementById("programEnquiryModal");
    const programForm = document.getElementById("programEnquiryForm");
    const sourceInput = document.getElementById("formSource");

    let enquiryModal = null;
    if (enquiryModalEl) {
        enquiryModal = new bootstrap.Modal(enquiryModalEl);
    }

    document.querySelectorAll(".enquire-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            if (!programForm || !enquiryModal) return;

            programForm.reset();

            // Source
            sourceInput.value = btn.dataset.source || "Unknown";

            // Auto-select program
            const program = btn.dataset.program;
            if (program) {
                const radio = programForm.querySelector(
                    `input[name="program"][value="${program}"]`
                );
                if (radio) radio.checked = true;
            }

            enquiryModal.show();
        });
    });

    // =========================
    // PROGRAM FORM SUBMIT
    // =========================
    const programScriptURL =
        "https://script.google.com/macros/s/AKfycbzyJMGvT2lJwtm0yAgdmxrDnDK_ItfvzYWSzPOf5erku4qBNswcqiikDi_XQnEHORDFwA/exec";

    if (programForm) {
        programForm.addEventListener("submit", e => {
            e.preventDefault();

            if (!validateForm(programForm)) return;

            fetch(programScriptURL, {
                method: "POST",
                body: new FormData(programForm)
            })
                .then(() => {
                    alert("Thank you! We’ll contact you shortly.");
                    programForm.reset();
                    enquiryModal.hide();
                    cleanupBackdrop();
                })
                .catch(() => alert("Submission failed"));
        });
    }

    // =========================
    // VALIDATION
    // =========================
    function validateForm(form) {
        const phone = form.querySelector('input[name="phone"]')?.value.trim();
        const email = form.querySelector('input[name="email"]')?.value.trim();

        if (!/^\d{10}$/.test(phone)) {
            alert("Phone number must be exactly 10 digits");
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Enter a valid email address");
            return false;
        }

        return true;
    }

    // =========================
    // BACKDROP CLEANUP (IMPORTANT)
    // =========================
    function cleanupBackdrop() {
        document.body.classList.remove("modal-open");
        document.querySelectorAll(".modal-backdrop").forEach(b => b.remove());
    }

});
