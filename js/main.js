const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];

// Show movies

var elMoviesList = document.querySelector('.movies');
var tempMovie = document.querySelector('#tempMovie').content;
var moviesFragment = document.createDocumentFragment();
var movies = moviesData.slice();

let TOTAL_ITEMS = movies.length;
const ITEMS_PER_PAGE = 10;
let CURRENT_PAGE = 1;
const NEIGHBOUR_PAGES = 2;
let TOTAL_PAGES = Math.ceil(TOTAL_ITEMS / ITEMS_PER_PAGE);
let isPaginationValid = (CURRENT_PAGE + NEIGHBOUR_PAGES) - (CURRENT_PAGE - NEIGHBOUR_PAGES) === NEIGHBOUR_PAGES * 2 && CURRENT_PAGE - NEIGHBOUR_PAGES >= 1 && CURRENT_PAGE + NEIGHBOUR_PAGES <= TOTAL_PAGES;

function showMovies(movies, searchWord) {
  elMoviesList.innerHTML = '';

  for (var i = 0; i < movies.length; i++) {
    var newMovie = tempMovie.cloneNode(true);
    newMovie.querySelector('.movie__poster').src = movies[i].youtubePoster;
    newMovie.querySelector('.movie__poster').alt = `Poster of ${movies[i].title}`;
    newMovie.querySelector('.movie__title').title = movies[i].title;
    if (searchWord.source !== '(?:)' && searchWord)
      newMovie.querySelector('.movie__title').innerHTML = movies[i].title.replace(searchWord, `<mark class="p-0 bg-warning">${searchWord.source}</mark>`);
    else
      newMovie.querySelector('.movie__title').textContent = movies[i].title;
    newMovie.querySelector('.movie__info-rating').textContent = movies[i].imdbRating;
    newMovie.querySelector('.movie__info-year').textContent = movies[i].year;
    newMovie.querySelector('.movie__info-duration').textContent = `${Math.ceil(movies[i].runtime / 60)}h ${movies[i].runtime % 60}min`;
    newMovie.querySelector('.movie__genres').textContent = movies[i].categories.join(', ');
    newMovie.querySelector('.movie__more-link').dataset.index = movies[i].imdbId;
    newMovie.querySelector('.movie__bookmark').dataset.uniqueId = movies[i].imdbId;

    if (bookmarks.findIndex(bookmark => bookmark.imdbId === movies[i].imdbId) >= 0) {
      newMovie.querySelector('.movie__bookmark').classList.add('movie__bookmark--added');
      newMovie.querySelector('.movie__bookmark').children[0].src = './img/icon-bookmark-added.svg';
      newMovie.querySelector('.movie__bookmark').children[1].textContent = 'Added to bookmark';
    }

    moviesFragment.appendChild(newMovie);
  }

  elMoviesList.appendChild(moviesFragment);
}

// Show movie info

var elMovieModal = document.querySelector('#movieModal');

elMoviesList.addEventListener('click', (e) => {
  if (e.target.matches('.movie__more-link')) {
    let movie = movies.find(movie => movie.imdbId === e.target.dataset.index);
    elMovieModal.dataset.uniqueId = movie.imdbId;
    elMovieModal.querySelector('.movie__title').textContent = movie.title;
    elMovieModal.querySelector('.movie__info-rating').textContent = movie.imdbRating;
    elMovieModal.querySelector('.movie__info-year').textContent = movie.year;
    elMovieModal.querySelector('.movie__info-duration').textContent = `${Math.ceil(movie.runtime / 60)}h ${movie.runtime % 60}min`;
    elMovieModal.querySelector('.movie__trailer').src = `https://www.youtube.com/embed/${movie.youtubeId}`;
    elMovieModal.querySelector('.movie__summary').textContent = movie.summary;
    elMovieModal.querySelector('.movie__imdb-link').href = `https://www.imdb.com/title/${movie.imdbId}`;
    elMovieModal.querySelector('.movie__bookmark').dataset.uniqueId = movie.imdbId;

    if (bookmarks.findIndex(bookmark => bookmark.imdbId === movie.imdbId) >= 0) {
      elMovieModal.querySelector('.movie__bookmark').classList.add('movie__bookmark--added');
      elMovieModal.querySelector('.movie__bookmark').children[0].src = './img/icon-bookmark-added.svg';
      elMovieModal.querySelector('.movie__bookmark').children[1].textContent = 'Added to bookmark';
    }
  }
})

elMovieModal.addEventListener('hide.bs.modal', () => {
  elMovieModal.querySelector('.movie__trailer').src = '';
  elMovieModal.querySelector('.movie__bookmark').classList.remove('movie__bookmark--added');
  elMovieModal.querySelector('.movie__bookmark').children[0].src = './img/icon-bookmark-add.svg';
  elMovieModal.querySelector('.movie__bookmark').children[1].textContent = 'Add to bookmark';

  if (bookmarks.findIndex(bookmark => bookmark.imdbId === elMovieModal.dataset.uniqueId) >= 0) {
    elMoviesList.querySelector(`.movie__bookmark[data-unique-id="${elMovieModal.dataset.uniqueId}"`).classList.add('movie__bookmark--added');
    elMoviesList.querySelector(`.movie__bookmark[data-unique-id="${elMovieModal.dataset.uniqueId}"`).children[0].src = './img/icon-bookmark-added.svg';
    elMoviesList.querySelector(`.movie__bookmark[data-unique-id="${elMovieModal.dataset.uniqueId}"`).children[1].textContent = 'Added to bookmark';
  }
  else {
    elMoviesList.querySelector(`.movie__bookmark[data-unique-id="${elMovieModal.dataset.uniqueId}"`).classList.remove('movie__bookmark--added');
    elMoviesList.querySelector(`.movie__bookmark[data-unique-id="${elMovieModal.dataset.uniqueId}"`).children[0].src = './img/icon-bookmark-add.svg';
    elMoviesList.querySelector(`.movie__bookmark[data-unique-id="${elMovieModal.dataset.uniqueId}"`).children[1].textContent = 'Add to bookmark';
  }
})

// Filters

let filteredMovies = [];
const elFilters = document.querySelector('.filters');
const elFiltersQuery = elFilters.q;
const elFiltersCategories = elFilters.categories;
const elFiltersYearMin = elFilters.from_year;
const elFiltersYearMax = elFilters.to_year;
const elFiltersRating = elFilters.rating;
const elFiltersFilter = elFilters.filter;

function filterMovies(arr, option) {
  if (option === 'a-z') {
    arr.sort((a, b) => {
      if (a.title > b.title) return 1;
      if (a.title < b.title) return -1;
      return 0;
    })
  }
  else if (option === 'z-a') {
    arr.sort((a, b) => {
      if (a.title > b.title) return -1;
      if (a.title < b.title) return 1;
      return 0;
    })
  }
  else if (option === 'rating') {
    arr.sort((a, b) => {
      return b.imdbRating - a.imdbRating;
    })
  }
  else if (option === 'year') {
    arr.sort((a, b) => {
      return b.year - a.year;
    })
  }
}

elFilters.addEventListener('submit', e => {
  e.preventDefault();

  let regexSearch = new RegExp(elFiltersQuery.value.trim(), 'gi');
  filteredMovies = movies.filter(movie => {
    return (
      (movie.title.match(regexSearch)) &&
      (elFiltersCategories.value.includes('all') || movie.categories.includes(elFiltersCategories.value)) &&
      (movie.year >= (Number(elFiltersYearMin.value) || 1900) && movie.year <= (Number(elFiltersYearMax.value) || 2021)) &&
      (movie.imdbRating >= Number(elFiltersRating.value))
    );
  });

  if (filteredMovies.length > 0) {
    filterMovies(filteredMovies, elFiltersFilter.value);

    buildPagination(CURRENT_PAGE);
    buildPage(CURRENT_PAGE);
  }
  else
    elMoviesList.innerHTML = '<p class="text-center fw-bold h2 mb-0">No movie found</p>'
})


// Bookmarks

elMoviesList.addEventListener('click', e => {
  if (e.target.matches('.movie__bookmark')) {
    if (e.target.matches('.movie__bookmark--added')) {
      e.target.classList.remove('movie__bookmark--added');
      e.target.children[0].src = './img/icon-bookmark-add.svg';
      e.target.children[1].textContent = 'Add to bookmark';

      let bookmarkIndex = bookmarks.findIndex(bookmark => e.target.dataset.uniqueId === bookmark.imdbId);
      bookmarks.splice(bookmarkIndex, 1);
      console.log(bookmarks);
    }
    else {
      e.target.classList.add('movie__bookmark--added');
      e.target.children[0].src = './img/icon-bookmark-added.svg';
      e.target.children[1].textContent = 'Added to bookmark';

      let newBookmark = movies.find(movie => e.target.dataset.uniqueId === movie.imdbId);
      bookmarks.push(newBookmark);
      console.log(bookmarks);
    }

    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }
})

elMovieModal.addEventListener('click', e => {
  if (e.target.matches('.movie__bookmark')) {
    if (e.target.matches('.movie__bookmark--added')) {
      e.target.classList.remove('movie__bookmark--added');
      e.target.children[0].src = './img/icon-bookmark-add.svg';
      e.target.children[1].textContent = 'Add to bookmark';

      let bookmarkIndex = bookmarks.findIndex(bookmark => e.target.dataset.uniqueId === bookmark.imdbId);
      bookmarks.splice(bookmarkIndex, 1);
      console.log(bookmarks);
    }
    else {
      e.target.classList.add('movie__bookmark--added');
      e.target.children[0].src = './img/icon-bookmark-added.svg';
      e.target.children[1].textContent = 'Added to bookmark';

      let newBookmark = movies.find(movie => e.target.dataset.uniqueId === movie.imdbId);
      bookmarks.push(newBookmark);
      console.log(bookmarks);
    }

    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }
})

// Watchlist modal actions

const elWatchlistModal = document.querySelector('.watchlist-modal');
const elWatchlistGroup = elWatchlistModal.querySelector('.watchlist-modal__list');
const watchlistFragment = document.createDocumentFragment();

function showWatchlist() {
  elWatchlistGroup.innerHTML = '';

  for (let bookmark of bookmarks) {
    let newBookmark = `<li class="bookmark watchlist-modal__item list-group-item d-flex align-items-center justify-content-between">
    <a class="bookmark__title h4 link-info" href="https://www.imdb.com/title/${bookmark.imdbId}" target="_blank">${bookmark.title} (${bookmark.year})</a>
    <button class="bookmark__remove btn btn-danger btn-sm text-white" type="button" title="Remove from watchlist" data-unique-id="${bookmark.imdbId}">&#10006;</button>
    </li>`;

    elWatchlistGroup.insertAdjacentHTML('beforeend', newBookmark)
  }
}

elWatchlistModal.addEventListener('show.bs.modal', showWatchlist);

elWatchlistModal.addEventListener('click', (e) => {
  if (e.target.matches('.bookmark__remove')) {
    const bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.imdbId === e.target.dataset.uniqueId);
    const removedBookmark = bookmarks.splice(bookmarkIndex, 1)[0];

    const elBookmark = elMoviesList.querySelector(`.movie__bookmark[data-unique-id="${removedBookmark.imdbId}"]`);
    elBookmark.classList.remove('movie__bookmark--added');
    elBookmark.children[0].src = './img/icon-bookmark-add.svg';
    elBookmark.children[1].textContent = 'Add to bookmark';


    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    showWatchlist();
  }
})


// Pagination

const elPagination = document.querySelector('.pagination');
const elsPaginationLinks = elPagination.querySelectorAll('.pagination__link');
const elPaginationControlPrev = elPagination.querySelector('.pagination__control--prev');
const elPaginationControlNext = elPagination.querySelector('.pagination__control--next');

// let TOTAL_ITEMS = elMoviesList.children.length;
// const ITEMS_PER_PAGE = 10;
// let CURRENT_PAGE = 1;
// const NEIGHBOUR_PAGES = 2;
// let TOTAL_PAGES = Math.ceil(TOTAL_ITEMS / ITEMS_PER_PAGE);
// let isPaginationValid = (CURRENT_PAGE + NEIGHBOUR_PAGES) - (CURRENT_PAGE - NEIGHBOUR_PAGES) === NEIGHBOUR_PAGES * 2 && CURRENT_PAGE - NEIGHBOUR_PAGES >= 1 && CURRENT_PAGE + NEIGHBOUR_PAGES <= TOTAL_PAGES;

function buildPagination(clickedPage) {
  isPaginationValid = (clickedPage + NEIGHBOUR_PAGES) - (clickedPage - NEIGHBOUR_PAGES) === NEIGHBOUR_PAGES * 2 && clickedPage - NEIGHBOUR_PAGES >= 1 && clickedPage + NEIGHBOUR_PAGES <= TOTAL_PAGES;

  if (isPaginationValid) {
    for (let i = clickedPage - NEIGHBOUR_PAGES, j = 0; i <= clickedPage + NEIGHBOUR_PAGES; i++, j++) {
      elsPaginationLinks[j].textContent = i;
    }
  }
}

function buildPage(currPage) {
  if (currPage < 1 || currPage > TOTAL_PAGES) return;

  for (let link of elsPaginationLinks) {
    if (+link.textContent === currPage)
      link.parentElement.classList.add('active');
    else
    link.parentElement.classList.remove('active');
  }

  const trimStart = (currPage - 1) * ITEMS_PER_PAGE;
  const trimEnd = trimStart + ITEMS_PER_PAGE;

  if (filteredMovies.length > 0) {
    TOTAL_ITEMS = filteredMovies.length;
    TOTAL_PAGES = Math.ceil(TOTAL_ITEMS / ITEMS_PER_PAGE)
    if (TOTAL_PAGES < 5) {
      for (let i = 1; i <= 5; i++) {
        if (i > TOTAL_PAGES) {
          elsPaginationLinks[i - 1].style.display = 'none';
        }
      }
    } else {
      debugger;
      for (let i = 0; i <= 4; i++) {
        elsPaginationLinks[i].style.display = 'initial';
      }
    }

    showMovies(filteredMovies.slice(trimStart, trimEnd), new RegExp(elFiltersQuery.value.trim(), 'gi'));
    return;
  }

  showMovies(movies.slice(trimStart, trimEnd), '');
}

function onPaginationAction(currPage) {
  CURRENT_PAGE = currPage;
  buildPagination(CURRENT_PAGE);
  buildPage(CURRENT_PAGE);
}

elsPaginationLinks.forEach(link => {
  link.addEventListener('click', () => {
    onPaginationAction(+link.textContent);
  })
})

elPaginationControlPrev.addEventListener('click', () => {
  onPaginationAction(CURRENT_PAGE - 1);
});
elPaginationControlNext.addEventListener('click', () => {
  onPaginationAction(CURRENT_PAGE + 1);
});

buildPage(CURRENT_PAGE);
