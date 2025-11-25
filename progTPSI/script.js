const API_KEY = "a09f90d";
const API_URL = "https://www.omdbapi.com/";

let currentPage = 1;
let totalPages = 1;

const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const yearFilter = document.getElementById("yearFilter");
const movieList = document.getElementById("movieList");
const pagination = document.getElementById("pagination");

// Eventi
searchBtn.addEventListener("click", searchMovies);
searchInput.addEventListener("keypress", e => {
  if (e.key === "Enter") searchMovies();
});

// Carica anni dinamicamente
function loadYears() {
  let currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= 1900; y--) {
    const option = document.createElement("option");
    option.value = y;
    option.innerText = y;
    yearFilter.appendChild(option);
  }
}

// Ricerca film
async function searchMovies() {
  const query = searchInput.value.trim();
  const year = yearFilter.value;

  if (!query && !year) {
    movieList.innerHTML = `<p class="text-center text-danger">Inserisci un titolo o un anno.</p>`;
    return;
  }

  movieList.innerHTML = `<div class="text-center"><div class="spinner-border text-light"></div></div>`;

  let url = `${API_URL}?apikey=${API_KEY}&page=${currentPage}`;

  if (query) url += `&s=${query}`;
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
      pagination.innerHTML = "";
    }
  } catch (error) {
    movieList.innerHTML = `<p class="text-center text-danger">Errore di connessione</p>`;
  }
}

// Mostra film
function displayMovies(movies) {
  movieList.innerHTML = "";

  movies.forEach(movie => {
    const col = document.createElement("div");
    col.classList.add("col-12", "col-sm-6", "col-md-4", "col-lg-3");

    col.innerHTML = `
      <div class="card bg-secondary text-light h-100" data-id="${movie.imdbID}">
        <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=Nessuna+Immagine"}"
             class="card-img-top">
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

// Dettagli film
async function showMovieDetails(id) {
  const res = await fetch(`${API_URL}?apikey=${API_KEY}&i=${id}&plot=full`);
  const movie = await res.json();

  document.getElementById("movieTitle").textContent = movie.Title;
  document.getElementById("movieYear").textContent = movie.Year;
  document.getElementById("moviePlot").textContent = movie.Plot;
  document.getElementById("moviePoster").src =
    movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450";

  new bootstrap.Modal(document.getElementById("movieModal")).show();
}

// Pagination
function updatePagination() {
  const ul = pagination.querySelector(".pagination");
  ul.innerHTML = "";

  const maxPagesToShow = 5;
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (currentPage > 1) {
    ul.innerHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${currentPage - 1})">«</a></li>`;
  }

  for (let p = startPage; p <= endPage; p++) {
    ul.innerHTML += `
      <li class="page-item ${p === currentPage ? "active" : ""}">
        <a class="page-link" href="#" onclick="changePage(${p})">${p}</a>
      </li>
    `;
  }

  if (currentPage < totalPages) {
    ul.innerHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${currentPage + 1})">»</a></li>`;
  }
}

function changePage(page) {
  currentPage = page;
  searchMovies();
}

document.addEventListener("DOMContentLoaded", loadYears);
