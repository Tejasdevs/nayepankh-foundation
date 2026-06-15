const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const volunteerForm = document.querySelector("#volunteerForm");
const toast = document.querySelector("#toast");
const counters = document.querySelectorAll(".counter");
const sections = document.querySelectorAll("section[id]");
const navItems = document.querySelectorAll(".nav-links a");
const themeToggle = document.querySelector(".theme-toggle");
const themeToggleText = document.querySelector(".theme-toggle-text");
let countersStarted = false;
const savedTheme = localStorage.getItem("nayepankhTheme");

function setTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-mode", isDark);
  themeToggleText.textContent = isDark ? "Light" : "Dark";
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  localStorage.setItem("nayepankhTheme", theme);
}

setTheme(savedTheme || "light");

if (window.AOS) {
  AOS.init({
    duration: 750,
    easing: "ease-out-cubic",
    once: true,
    offset: 80
  });
} else {
  document.querySelectorAll("[data-aos]").forEach((element) => {
    element.removeAttribute("data-aos");
    element.removeAttribute("data-aos-delay");
  });
}

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.classList.toggle("open", isOpen);
  document.body.classList.toggle("nav-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

navItems.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.classList.remove("open");
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
  });
});

document.addEventListener("click", (event) => {
  if (!document.body.classList.contains("nav-open")) {
    return;
  }

  if (!navLinks.contains(event.target) && !navToggle.contains(event.target)) {
    navLinks.classList.remove("open");
    navToggle.classList.remove("open");
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
  }
});

themeToggle.addEventListener("click", () => {
  const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
  setTheme(nextTheme);
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

function getVolunteers() {
  return JSON.parse(localStorage.getItem("nayepankhVolunteers") || "[]");
}

function saveVolunteer(volunteer) {
  const volunteers = getVolunteers();
  volunteers.push(volunteer);
  localStorage.setItem("nayepankhVolunteers", JSON.stringify(volunteers));
}

if (volunteerForm) {
  volunteerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(volunteerForm);
    const id = window.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    const volunteer = {
      id,
      name: formData.get("name").trim(),
      email: formData.get("email").trim(),
      phone: formData.get("phone").trim(),
      skills: formData.get("skills").trim(),
      interest: formData.get("interest"),
      message: formData.get("message").trim(),
      registeredAt: new Date().toISOString()
    };
    saveVolunteer(volunteer);
    volunteerForm.reset();
    showToast("Thank you for registering. Your details were saved in this browser.");
  });
}

function animateCounter(counter) {
  const target = Number(counter.dataset.target);
  const duration = 1600;
  const startTime = performance.now();

  function update(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = Math.floor(eased * target).toLocaleString("en-IN");

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      counter.textContent = target.toLocaleString("en-IN");
    }
  }

  requestAnimationFrame(update);
}

const impactObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !countersStarted) {
      countersStarted = true;
      counters.forEach(animateCounter);
      impactObserver.disconnect();
    }
  });
}, { threshold: 0.35 });

counters.forEach((counter) => {
  impactObserver.observe(counter);
});

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const targetHash = `#${entry.target.id}`;
      const matchingItems = Array.from(navItems).filter((item) => {
        const itemUrl = new URL(item.getAttribute("href"), window.location.href);
        return itemUrl.hash === targetHash;
      });

      if (matchingItems.length) {
        navItems.forEach((item) => item.classList.remove("active"));
        matchingItems.forEach((item) => item.classList.add("active"));
      }
    }
  });
}, { rootMargin: "-40% 0px -55% 0px" });

sections.forEach((section) => {
  navObserver.observe(section);
});
