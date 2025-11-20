const API_KEY = "a09f90d"; // Sostituisci con la tua chiave API
const API_URL = "https://www.omdbapi.com/";

let currentPage = 1;
let totalPages = 1;

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const yearFilter = document.getElementById("yearFilter");
const movieList = document.getElementById("movieList");
const pagination = document.getElementById("pagination");

searchBtn.addEventListener("click", searchMovies);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchMovies();
});

// Carica gli anni dinamicamente
function loadYears() {
  let currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= 1900; i--) {
    let option = document.createElement("option");
    option.value = i;
    option.innerText = i;
    yearFilter.appendChild(option);
  }
}

// Ricerca dei film
async function searchMovies() {
  const query = searchInput.value.trim();
  const category = categoryFilter.value;
  const year = yearFilter.value;

  if (!query) return;

  movieList.innerHTML = `<div class="text-center"><div class="spinner-border text-light" role="status"></div></div>`;

  let url = `${API_URL}?apikey=${API_KEY}&s=${query}&type=movie&page=${currentPage}`;

  if (category) url += `&genre=${category}`;
  if (year) url += `&y=${year}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.Response === "True") {
      totalPages = Math.ceil(data.totalResults / 10);
      displayMovies(data.Search);
      updatePagination();
    } else {
      movieList.innerHTML = `<p class="text-center text-danger">Nessun film trovato 😞</p>`;
    }
  } catch (error) {
    console.error(error);
    movieList.innerHTML = `<p class="text-center text-danger">Errore di connessione</p>`;
  }
}

// Visualizza i film trovati
function displayMovies(movies) {
  movieList.innerHTML = "";

  movies.forEach((movie) => {
    const col = document.createElement("div");
    col.classList.add("col-12", "col-sm-6", "col-md-4", "col-lg-3");

    col.innerHTML = `
      <div class="card bg-secondary text-light h-100" data-id="${movie.imdbID}">
        <img src="${movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/300x450?text=Nessuna+Immagine'}" 
             class="card-img-top" alt="${movie.Title}">
        <div class="card-body">
          <h5 class="card-title">${movie.Title}</h5>
          <p class="card-text">${movie.Year}</p>
        </div>
      </div>
    `;

    col.querySelector(".card").addEventListener("click", () => showMovieDetails(movie.imdbID));
    movieList.appendChild(col);
  });
}

// Dettagli del film
async function showMovieDetails(id) {
  try {
    const res = await fetch(`${API_URL}?apikey=${API_KEY}&i=${id}&plot=full`);
    const movie = await res.json();

    document.getElementById("movieTitle").textContent = movie.Title;
    document.getElementById("movieYear").textContent = movie.Year;
    document.getElementById("moviePlot").textContent = movie.Plot;
    document.getElementById("moviePoster").src = movie.Poster !== "N/A" 
      ? movie.Poster 
      : 'https://via.placeholder.com/300x450?text=Nessuna+Immagine';

    const modal = new bootstrap.Modal(document.getElementById("movieModal"));
    modal.show();
  } catch (error) {
    console.error("Errore nel recupero dettagli film:", error);
  }
}

// Aggiorna la navigazione con numeri e frecce
function updatePagination() {
  pagination.innerHTML = '';

  // Freccia indietro
  if (currentPage > 1) {
    pagination.innerHTML += `
      <li class="page-item">
        <a class="page-link" href="#" aria-label="Precedente" onclick="changePage('prev')">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>
    `;
  }

  // Pagine successive
  const startPage = Math.max(currentPage, 1);
  const endPage = Math.min(currentPage + 3, totalPages);

  for (let i = startPage; i <= endPage; i++) {
    const activeClass = i === currentPage ? 'active' : '';
    pagination.innerHTML += `
      <li class="page-item ${activeClass}">
        <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
      </li>
    `;
  }

  // Freccia avanti e ultima pagina
  if (currentPage + 3 < totalPages) {
    pagination.innerHTML += `
      <li class="page-item">
        <a class="page-link" href="#" aria-label="Ultima" onclick="changePage(${totalPages})">
          <span aria-hidden="true">&raquo;&raquo;</span>
        </a>
      </li>
    `;
  } else if (currentPage < totalPages) {
    pagination.innerHTML += `
      <li class="page-item">
        <a class="page-link" href="#" aria-label="Successiva" onclick="changePage('next')">
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    `;
  }

  // Centralizzazione
  pagination.classList.add("d-flex", "justify-content-center", "align-items-center", "py-3", "pagination-lg");
}

// Cambia pagina
function changePage(page) {
  if (page === 'prev') {
    currentPage = Math.max(currentPage - 1, 1);
  } else if (page === 'next') {
    currentPage = Math.min(currentPage + 1, totalPages);
  } else {
    currentPage = page;
  }

  searchMovies();
}

// Carica gli anni quando la pagina è pronta
document.addEventListener("DOMContentLoaded", () => {
  loadYears();
});