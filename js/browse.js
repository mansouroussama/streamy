const apiKey = '2735829e78f8d489459b70bf916b677e';
const trendingContainer = document.querySelector('.trending-container');
const sectionViewLabel = document.querySelector('.section-view-label');

const filterCategories = document.querySelector('.filter-categories');

// // error(catch): show: no results found, please check what you typed
// //hide filters + change heading to results of: query
//// min input length is 3 characters,
// format string and don't accept whitespace or numbers or special characters
// // when input is empty: return to showing trending media
// show multiple results?
// // clear input button


// Search for any media (using debounce)
const searchMedia = document.querySelector('.search-media');
const searchMediaClearBtn = document.querySelector('.search-media-clear');
const debounce = (func, delay) => {
	let debounceTimer;
   return function() {
      const context = this;
      const args = arguments;
      clearTimeout(debounceTimer);
   	debounceTimer = setTimeout(() => func.apply(context, args), delay)
   }
}
const seachMediaEv = function(trendingContainerHTML) {
	const trendingView = function () {
		trendingContainer.innerHTML = trendingContainerHTML;
		searchMedia.value = '';
		searchMedia.focus();
		sectionViewLabel.textContent = 'trending now';
		filterCategories.classList.remove('d-none');
	}
	searchMediaClearBtn.addEventListener('click', trendingView);
	searchMedia.addEventListener('keyup', debounce(async function() {
		try {
			if (searchMedia.value == '') {
				trendingView();
			}
			if (searchMedia.value.length > 3 ) {
				console.log('is is working!!');
				const mediaQuery = searchMedia.value;
				console.log(mediaQuery);
				//.replace(' ', '+')
				const html = await getMediaHtml(mediaQuery);
				console.log(html);
				filterCategories.classList.add('d-none');
				trendingContainer.innerHTML = html;
				sectionViewLabel.innerHTML = `<span class='text-warning pe-2'>results for:</span> ${searchMedia.value}`;	
			}
			
		} catch (err) {
			console.error(err);
			filterCategories.classList.add('d-none');
			trendingContainer.innerHTML = `<h2 class='text-center h5 py-5 text-gray-3 lh-lg'>No movies or TV shows found. Please check the name you entered.</h2>`;
			sectionViewLabel.innerHTML = `<span class='text-warning pe-1'>0 </span> results found`;	
		}
	}, 1000));
}

const getMediaHtml = async function(mediaNameQuery) {
	try {
		// Get the URL of the movie/show
		const searchURL = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${mediaNameQuery}`;
		console.log(searchURL);
		
		// Use URL to fetch movie/show info
		const res1 = await fetch(searchURL);
		const mediaDataRes = await res1.json();
		console.log(mediaDataRes);
		if (mediaDataRes.total_results == 0) throw new Error('Name entered is wrong');
		const mediaData = mediaDataRes.results[0];
		console.log(mediaData);

		const movieGenres = await getMediaGenres('movie');
		const tvGenres = await getMediaGenres('tv');
		const mediaType = mediaData.media_type;

		let mediaName, mediaReleaseDate, mediaGenres;
		if (mediaType == 'movie') {
			mediaName = mediaData.title;
			mediaReleaseDate = mediaData.release_date.slice(0,4);
			mediaGenres = movieGenres;

		} else if (mediaType == 'tv') {
			mediaName = mediaData.name;
			mediaReleaseDate = mediaData.first_air_date.slice(0,4);
			mediaGenres = tvGenres;
		}

		// const mediaName = (mediaType == 'movie') ? mediaData.title : mediaData.name;
		// const mediaReleaseDate = (mediaType == 'movie') ? mediaData.release_date.slice(0,4) : mediaData.first_air_date.slice(0,4);
		const mediaDescription = mediaData.overview;
		const mediaRating = `${mediaData.vote_average.toFixed(1)}/10`;
		const mediaGenresIDs = mediaData.genre_ids;
		const mediaPoster = `https://image.tmdb.org/t/p/w500${mediaData.poster_path}`;
		const mediaID = mediaData.id;

		// Loop over the list of all available genres
		const mediaGenresString = mediaGenres.filter(mediaGenre => {
			// Loop over the list of the current media's genres
			for (mediaGenreID of mediaGenresIDs) {
				// Check if the current media genre id is the same as the current available genre id
				if (mediaGenreID == mediaGenre.id) return true
			}
		}).slice(0, 2).map(mediaGenre => mediaGenre.name).reduce((str, mediaGenreName) => `${str}${mediaGenreName}, `, '').slice(0, -2);

		const html = `<div class="col-lg-3 col-6 mb-4 border-0 bg-transparent show-card">
			<div class="media-container d-block rounded-2 overflow-hidden" data-media-type="${mediaType}">
				<div class="media-img-container">
					<img class="img-fluid" src="${mediaPoster}" alt="movie">
				</div>
				<div class="media-info d-flex flex-column justify-content-center align-items-start text-white">
					<h2 class="h4 fw-bold text-gray-1">${mediaName}<span class="h6 m-0 ps-2 text-gray-3 text-uppercase fw-bold align-middle">(${mediaType})</span></h2>
					<h3 class="h6 mb-3 mb-2 text-warning">${mediaReleaseDate}</h3>
					<div class="media-description mb-3 text-gray-2">
						<p class="d-inline m-0">${mediaDescription}</p>
					</div>
					<p class="media-genre mb-1">
						<span class="text-warning">Genre:</span>
						<span>${mediaGenresString}</span>
					</p>
					<p class="media-rating mb-3">
						<span class="text-warning">Rating:</span>
						<span>${mediaRating}</span>
					</p>
					<a class="media-watch btn btn-outline-warning text-uppercase border-2" href="https://www.themoviedb.org/${mediaType}/${mediaID}-${mediaName}" target='_blank'>Watch now</a>
				</div>
			</div>
		</div>`;
		return html;

	} catch (err) {
		console.error(`Something went wrong: ${err.message}`);
		throw err;
	}
};

// Trending Media categories filter
filterCategories.addEventListener('click', (e) => {
	const categoryBtn = e.target.closest('button');
	const mediaType = categoryBtn.dataset.mediaType;
	console.log(mediaType);
	const medias = trendingContainer.querySelectorAll('.media-container');
	filterCategories.querySelectorAll('.filter-category').forEach((filterCategory)=> {
		filterCategory.classList.remove('bg-warning','text-black');
		filterCategory.classList.add('bg-secondary','text-gray-3');
	})
	categoryBtn.classList.add('bg-warning','text-black',);
	categoryBtn.classList.remove('bg-secondary','text-gray-3');
	
	medias.forEach((media) => {
		if (mediaType == 'all' || media.dataset.mediaType == mediaType) {
			media.parentElement.classList.remove('d-none');
		} else {
			media.parentElement.classList.add('d-none');
		}
	})
})
console.log(filterCategories);

const getMediaGenres = async function(mediaType) {
	try {
		const mediaGenresURL = `https://api.themoviedb.org/3/genre/${mediaType}/list?api_key=${apiKey}&language=en-US`;
		const res = await fetch(mediaGenresURL);
		if (!res.ok) throw new Error('Name entered is wrong');
		const mediaAllGenresData = await res.json();
		// console.log(mediaAllGenresData.genres);
	
		return mediaAllGenresData.genres;

	} catch (err) {
		console.error(`Something went wrong: ${err}`)
	}
}
const getTrendingMedia = async function() {
	const query = `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}`;
	let trendingContainerHTML;
	try {
		const res = await fetch(query);
		// console.log(res);
		if (!res.ok) throw new Error('Something is wrong.');
		const trendingMediaRes = await res.json();
		const trendingMedias = trendingMediaRes.results;
		// .slice(0, 12) / Math.trunc(trendingMediaRes.results.length /2)
		console.log(trendingMedias);
		const HTML = Promise.all(trendingMedias.map(async(trendingMedia) => {
			// console.log(trendingMedia);
			
			// Get Media genres
			const movieGenres = await getMediaGenres('movie');
			const tvGenres = await getMediaGenres('tv');
		
			// Get Media info
			const mediaType = trendingMedia.media_type;

			let mediaName, mediaReleaseDate, mediaGenres;
			if (mediaType == 'movie') {
				mediaName = trendingMedia.title;
				mediaReleaseDate = trendingMedia.release_date.slice(0,4);
				mediaGenres = movieGenres;
	
			} else if (mediaType == 'tv') {
				mediaName = trendingMedia.name;
				mediaReleaseDate = trendingMedia.first_air_date.slice(0,4);
				mediaGenres = tvGenres;
			}

			const mediaDescription = trendingMedia.overview;
			const mediaRating = `${trendingMedia.vote_average.toFixed(1)}/10`;
			const mediaGenresIDs = trendingMedia.genre_ids;
			const mediaPoster = `https://image.tmdb.org/t/p/w500${trendingMedia.poster_path}`;
			const mediaID = trendingMedia.id;
			
			const mediaGenresString = mediaGenres.filter(mediaGenre => {
				// Loop over the list of the current media's genres
				for (mediaGenreID of mediaGenresIDs) {
					// Check if the current media genre id is the same as the current available genre id
					if (mediaGenreID == mediaGenre.id) return true
				}
			}).slice(0, 2).map(mediaGenre => mediaGenre.name).reduce((str, mediaGenreName) => `${str}${mediaGenreName}, `, '').slice(0, -2);
	
			const html = `<div class="col-lg-3 col-6 mb-4 border-0 bg-transparent show-card">
				<div class="media-container d-block rounded-2 overflow-hidden" data-media-type="${mediaType}">
					<div class="media-img-container">
						<img class="img-fluid" src="${mediaPoster}" alt="movie">
					</div>
					<div class="media-info d-flex flex-column justify-content-center align-items-start text-white">
						<h2 class="h4 fw-bold text-gray-1">${mediaName}<span class="h6 m-0 ps-2 text-gray-3 text-uppercase fw-bold align-middle">(${mediaType})</span></h2>
						<h3 class="h6 mb-3 mb-2 text-warning">${mediaReleaseDate}</h3>
						<div class="media-description mb-3 text-gray-2">
							<p class="d-inline m-0">${mediaDescription}</p>
						</div>
						<p class="media-genre mb-1">
							<span class="text-warning">Genre:</span>
							<span>${mediaGenresString}</span>
						</p>
						<p class="media-rating mb-3">
							<span class="text-warning">Rating:</span>
							<span>${mediaRating}</span>
						</p>
						<a class="media-watch btn btn-outline-warning text-uppercase border-2" href="https://www.themoviedb.org/${mediaType}/${mediaID}-${mediaName}" target='_blank'>Watch now</a>
					</div>
				</div>
			</div>`;
			// console.log(html);
			trendingContainer.insertAdjacentHTML('beforeend', html);
		}));
		const _ = await HTML;
		seachMediaEv(trendingContainer.innerHTML);
	} catch (err) {
		console.error(err);
	}
}
getTrendingMedia()