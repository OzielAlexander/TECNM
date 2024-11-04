// Carrusel de imágenes
let currentImageIndex = 0;
const images = document.querySelectorAll('.login-left img');
const totalImages = images.length;

function changeImage() {
    images[currentImageIndex].classList.remove('active');
    currentImageIndex = (currentImageIndex + 1) % totalImages;
    images[currentImageIndex].classList.add('active');
}

setInterval(changeImage, 3000); // Cambiar imagen cada 3 segundos

