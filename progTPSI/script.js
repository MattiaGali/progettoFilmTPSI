const API_KEY = "a09f90d"; // Sostituisci con la tua chiave OMDb
const API_URL = "https://www.omdbapi.com/";

let currentPage = 1;
let totalPages = 1;

document.addEventListener("DOMContentLoaded", () => {
  loadYears();

  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");

  searchBtn.addEventListener("click", searchMovies);
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchMovies();
  });
});

// Carica gli anni dinamicamente
function loadYears() {
  const yearFilter = document.getElementById("yearFilter");
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= 1900; i--) {
    const option = document.createElement("option");
    option.value = i;
    option.innerText = i;
    yearFilter.appendChild(option);
  }
}

// Ricerca film
async function searchMovies() {
  const query = document.getElementById("searchInput").value.trim();
  const year = document.getElementById("yearFilter").value;
  const movieList = document.getElementById("movieList");
  const pagination = document.getElementById("pagination");

  if (!query && !year) {
    movieList.innerHTML = `<p class="text-center text-danger">Inserisci un titolo o un anno!</p>`;
    pagination.innerHTML = "";
    return;
  }

  movieList.innerHTML = `<div class="text-center"><div class="spinner-border text-light" role="status"></div></div>`;

  let url = `${API_URL}?apikey=${API_KEY}&page=${currentPage}`;
  if (query) url += `&s=${encodeURIComponent(query)}`;
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
      pagination.innerHTML = '';
    }
  } catch (error) {
    console.error(error);
    movieList.innerHTML = `<p class="text-center text-danger">Errore di connessione</p>`;
  }
}

// Mostra film
function displayMovies(movies) {
  const movieList = document.getElementById("movieList");
  movieList.innerHTML = "";

  // Raggruppa i film a gruppi di 4
  for (let i = 0; i < movies.length; i += 4) {
    const row = document.createElement("div");
    row.classList.add("row", "gy-4");

    // Se sono meno di 4 in questa riga, centra
    if (i + 4 > movies.length) {
      row.classList.add("justify-content-center");
    }

    const slice = movies.slice(i, i + 4);
    slice.forEach(movie => {
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
      row.appendChild(col);
    });

    movieList.appendChild(row);
  }
}


// Dettagli film
async function showMovieDetails(id) {
  try {
    const res = await fetch(`${API_URL}?apikey=${API_KEY}&i=${id}&plot=full`);
    const movie = await res.json();

    document.getElementById("movieRating").textContent = movie.Rating.Value;
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

// PAGINAZIONE
function updatePagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = '';

  const ul = document.createElement("ul");
  ul.classList.add("pagination", "justify-content-center");

  // «« Prima pagina
  if (currentPage > 1) {
    ul.innerHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(1)">««</a></li>`;
  }
  // « Precedente
  if (currentPage > 1) {
    ul.innerHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${currentPage-1})">«</a></li>`;
  }

  // numeri
  const startPage = Math.max(1, currentPage-2);
  const endPage = Math.min(totalPages, currentPage+2);
  for(let i=startPage;i<=endPage;i++){
    ul.innerHTML += `<li class="page-item ${i===currentPage?'active':''}"><a class="page-link" href="#" onclick="changePage(${i})">${i}</a></li>`;
  }

  // » Successiva
  if (currentPage < totalPages) {
    ul.innerHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${currentPage+1})">»</a></li>`;
  }

  // »» Ultima
  if (currentPage < totalPages) {
    ul.innerHTML += `<li class="page-item"><a class="page-link" href="#" onclick="changePage(${totalPages})">»»</a></li>`;
  }

  pagination.appendChild(ul);
}

// Cambia pagina
function changePage(page) {
  if (page === 'prev') currentPage = Math.max(currentPage-1,1);
  else if (page === 'next') currentPage = Math.min(currentPage+1,totalPages);
  else currentPage = page;
  searchMovies();
}

