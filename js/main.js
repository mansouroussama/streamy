const apiKey = '2735829e78f8d489459b70bf916b677e';
const moviesNshows = {
	movies1:['inception', 'joker', 'the+fault+in+our+stars', 'interstellar'],
	movies2:['the+wolf+of+wall+street', 'prisoners', 'gone+girl', 'get+out'],
	shows1:['ozark', 'mr+robot', 'chernobyl', 'breaking+bad'],
	shows2:[ 'money+heist', 'narcos','unbelievable', 'you']
}
const getMediaGenres = async function(mediaType) {
	try {
		const mediaGenresURL = `https://api.themoviedb.org/3/genre/${mediaType}/list?api_key=${apiKey}&language=en-US`;
		const res = await fetch(mediaGenresURL);
		if (!res.ok) throw new Error('Name entered is wrong');
		const mediaAllGenresData = await res.json();
		console.log(mediaAllGenresData.genres);
	
		return mediaAllGenresData.genres;

	} catch (err) {
		console.error(`Something went wrong: ${err}`)
	}
}
const getMediaHtml = async function(mediaType, mediaGenres, mediaNameQuery) {
	try {
		
		// Get the URL of the movie/show
		const searchURL = `https://api.themoviedb.org/3/search/${mediaType}?api_key=${apiKey}&query=${mediaNameQuery}`;
		// console.log(searchURL);
		
		// Use URL to fetch movie/show info
		const res1 = await fetch(searchURL);
		console.log(res1);
		if (!res1.ok) throw new Error('Name entered is wrong');
		const mediaDataRes = await res1.json();
		const mediaData = mediaDataRes.results[0];
		console.log(mediaData);
		
		// switch (mediaType) {
		// 	case 'movie':
		// 		mediaName = mediaData.title;
		// 		break;
		// 	case 'tv':
		// 		mediaName = mediaData.name;
		// 		break;
		// }
		
		// switch (mediaType) {
		// 	case 'movie':
		// 		mediaReleaseDate = mediaData.release_date.slice(0,4);
		// 		break;
		// 	case 'tv':
		// 		mediaReleaseDate = mediaData.first_air_date.slice(0,4);
		// 		break;
		// }
		let mediaName, mediaReleaseDate;
		if (mediaType == 'movie') {
			mediaName = mediaData.title;
			mediaReleaseDate = mediaData.release_date.slice(0,4);

		} else if (mediaType == 'tv') {
			mediaName = mediaData.name;
			mediaReleaseDate = mediaData.first_air_date.slice(0,4);
		}

		// const mediaName = (mediaType == 'movie') ? mediaData.title : mediaData.name;
		// const mediaReleaseDate = (mediaType == 'movie') ? mediaData.release_date.slice(0,4) : mediaData.first_air_date.slice(0,4);
		const mediaDescription = mediaData.overview;
		const mediaRating = `${mediaData.vote_average.toFixed(1)}/10`;
		const mediaGenresIDs = mediaData.genre_ids;
		const mediaPoster = `https://image.tmdb.org/t/p/w500${mediaData.poster_path}`;
		const mediaID = mediaData.id;

		console.log(mediaName);
		console.log(mediaReleaseDate);
		console.log(mediaDescription);
		console.log(mediaRating);
		console.log(mediaGenresIDs);
		console.log(mediaPoster);
		console.log(mediaID);
			
		// Loop over the list of all available genres
		const mediaGenresString = mediaGenres.filter(mediaGenre => {
			// Loop over the list of the current media's genres
			for (mediaGenreID of mediaGenresIDs) {
				// Check if the current media genre id is the same as the current available genre id
				if (mediaGenreID == mediaGenre.id) return true
			}
		}).slice(0, 2).map(mediaGenre => mediaGenre.name).reduce((str, mediaGenreName) => `${str}${mediaGenreName}, `, '').slice(0, -2);

		console.log(mediaGenresString);
		const html = `<div class="media-img-container">
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
			</div>`;
		return html;

	} catch (err) {
		console.error(`Something went wrong: ${error.message}`);
		throw err;
	}
};

(async function() {
	const t0 = performance.now();
	try {
		const mediaGroups = document.querySelectorAll('[data-media-group-type]');
		console.log(mediaGroups);

		const res = [...mediaGroups].map(async(mediaGroup) => {
			const mediaType = mediaGroup.getAttribute('data-media-group-type');
			const mediaGroupName = mediaGroup.getAttribute('data-media-group-name');
			const mediaContainers = mediaGroup.querySelectorAll('.media-container');
			console.log(mediaType);
			console.log(mediaGroupName);
			const mediaGenres = await getMediaGenres(mediaType);

			const res = Array.from(mediaContainers).map(async (mediaContainer, i) => {
				const mediaNameQuery = moviesNshows[mediaGroupName][i];
				console.log(mediaContainer);
				const html = await getMediaHtml(mediaType, mediaGenres, mediaNameQuery);
				mediaContainer.insertAdjacentHTML('afterbegin', html);
			})
			// console.log(res);
			const mediaGroupContents = await Promise.all(res);
			// console.log(mediaGroupContents);
		})
		// console.log(res);
		const mediaGroupsContents = await Promise.all(res);
		// console.log(mediaGroupsContents);

	} catch (err) {
		console.error(`Something went wrong: ${err}`)
	}
	const t1 = performance.now(); 
	console.log(`time duration is: ${t1 - t0} milliseconds.`);
})()

// // await promise all, console log array vs await res
// // remove all html in index and change innerhtml to append
// fix font size in small width, change font-size or change to only one column
// // fix continue watching & trailer
// in other pages, create another js file and create the fetchData module and import it and use the function depending on the corresponding movies/shows array
// seperate css file for each html page
// // browse page redesign & show popular movies and tv shows (other things maybe, see api docs) and make input button that responds to kepup event that makes a request

//--------------------------
