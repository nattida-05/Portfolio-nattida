// -----------------------------
// Responsive Menu
// -----------------------------
const navMenu = document.querySelector("nav ul");
const logo = document.querySelector(".logo");

logo.addEventListener("click", () => {
    navMenu.classList.toggle("active");
});


// -----------------------------
// Hero Background Slideshow
// -----------------------------
const slides = document.querySelectorAll(".bg-slide");

const bgImages = [
    "Img Portfolio/1.jpg",
    "Img Portfolio/2.jpg",
    "Img Portfolio/3.jpg",
    "Img Portfolio/4.jpg"
];

let current = 0;

// ใส่ภาพ background ให้แต่ละ slide
slides.forEach((slide, i) => {
    slide.style.backgroundImage =
        `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${bgImages[i]}')`;
});

// แสดง slide
function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.style.opacity = (i === index) ? 1 : 0;
    });
}

// เริ่มภาพแรก
showSlide(current);

// เปลี่ยนภาพ
setInterval(() => {
    current = (current + 1) % slides.length;
    showSlide(current);
}, 3000);


// -----------------------------
// Performance Scroll Buttons
// -----------------------------
const leftBtn = document.querySelector(".scroll-btn.left");
const rightBtn = document.querySelector(".scroll-btn.right");
const perfGrid = document.querySelector(".performance-grid");

if (leftBtn && rightBtn && perfGrid) {

    const scrollAmount = 320; // ระยะเลื่อน

    leftBtn.addEventListener("click", () => {
        perfGrid.scrollBy({
            left: -scrollAmount,
            behavior: "smooth"
        });
    });

    rightBtn.addEventListener("click", () => {
        perfGrid.scrollBy({
            left: scrollAmount,
            behavior: "smooth"
        });
    });
}


// -----------------------------
// Open Image (Preview)
// -----------------------------
function openImage(src) {
    window.open(src, "_blank");
}