document.addEventListener("DOMContentLoaded", function () {
  var menuToggle = document.getElementById("menu-toggle");
  var navMenu = document.getElementById("nav-menu");
  var contactForm = document.getElementById("contact-form");

  menuToggle.addEventListener("click", function () {
    navMenu.classList.toggle("active");
  });

  var navLinks = document.querySelectorAll(".nav-menu a");
  for (var i = 0; i < navLinks.length; i++) {
    navLinks[i].addEventListener("click", function (e) {
      e.preventDefault();

      var targetId = this.getAttribute("href").substring(1);
      var targetSection = document.getElementById(targetId);

      if (targetSection) {
        var offsetTop = targetSection.offsetTop - 70;

        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });

        navMenu.classList.remove("active");
      }
    });
  }

  var getInTouchBtn = document.querySelector(".hero .btn");
  getInTouchBtn.addEventListener("click", function (e) {
    e.preventDefault();

    var contactSection = document.getElementById("contact");
    var offsetTop = contactSection.offsetTop - 70;

    window.scrollTo({
      top: offsetTop,
      behavior: "smooth",
    });
  });

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var message = document.getElementById("message").value;

    if (name === "" || email === "" || message === "") {
      alert("Please fill in all fields.");
      return;
    }

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    alert("Thank you for your message! I will get back to you soon.");

    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("message").value = "";
  });

  window.addEventListener("scroll", function () {
    var nav = document.querySelector("nav");
    if (window.scrollY > 50) {
      nav.style.background = "rgba(255, 255, 255, 0.95)";
    } else {
      nav.style.background = "#fff";
    }
  });

  var skillItems = document.querySelectorAll(".skill-item");
  var projectCards = document.querySelectorAll(".project-card");

  function isElementInViewport(element) {
    var rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  function animateOnScroll() {
    for (var i = 0; i < skillItems.length; i++) {
      if (isElementInViewport(skillItems[i])) {
        skillItems[i].style.opacity = "1";
        skillItems[i].style.transform = "translateY(0)";
      }
    }

    for (var j = 0; j < projectCards.length; j++) {
      if (isElementInViewport(projectCards[j])) {
        projectCards[j].style.opacity = "1";
        projectCards[j].style.transform = "translateY(0)";
      }
    }
  }

  for (var k = 0; k < skillItems.length; k++) {
    skillItems[k].style.opacity = "0";
    skillItems[k].style.transform = "translateY(20px)";
    skillItems[k].style.transition = "opacity 0.6s, transform 0.6s";
  }

  for (var l = 0; l < projectCards.length; l++) {
    projectCards[l].style.opacity = "0";
    projectCards[l].style.transform = "translateY(20px)";
    projectCards[l].style.transition = "opacity 0.6s, transform 0.6s";
  }

  window.addEventListener("scroll", animateOnScroll);
  animateOnScroll();
});
