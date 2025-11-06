// Defina a média de avaliações
const ratingStars = document.querySelectorAll(".fa-star");

// Média de avaliações
const ratingAverage = 4.5;

// Adiciona a classe checked para as estrelas correspondentes
for (let i = 0; i < ratingAverage; i++) {
  ratingStars[i].classList.add("checked");
}

