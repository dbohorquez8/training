'use strict'

var Popcorn = {
  movies: []
}

Popcorn.apiKey = '?api_key=475d960c7374b0d07a51bf9f1e9cfd03';
Popcorn.apiPath = 'https://api.themoviedb.org/3/movie/';
Popcorn.imgPath = 'https://image.tmdb.org/t/p/w';

Popcorn.getMovies = function (category) {
  var url = this.apiPath + category + this.apiKey;

  $.getJSON(url, function (data) {
    var movies = data.results;

    $.each(movies, function (index, movie) {
      // Checks if movie is already on the list
      var existingMovie = _.findWhere(Popcorn.movies, { 'id': movie.id });

      if (!existingMovie) {
        // Adds the new movie to the list
        movie.categories = [category];
        movie.small_poster_url = Popcorn.imgPath + '92' + movie.poster_path;
        movie.large_poster_url = Popcorn.imgPath + '300' + movie.poster_path;
        movie.year = movie.release_date.substring(0, 4);
        movie.cast = Popcorn.getCast(movie.id);
        Popcorn.movies.push(movie);        
      } else {
        // Adds new category to the existing movie
        existingMovie.categories.push(category);
      }
    });
  });
};

Popcorn.getCast = function (movieID) {
  var url = this.apiPath + movieID + '/credits' + this.apiKey;
  var movieCast = [];

  $.getJSON(url, function (data) {
    var cast = data.cast;

    for(var i = 0; i < 3; i++) {
      var castMember = cast[i];
      castMember.image_url = Popcorn.imgPath + '45' + cast[i].profile_path,
      movieCast.push(castMember);
    }
  });

  return movieCast;
};

Popcorn.listMovies = function (category, container) {
  var categoryMovies = _.findWhere(this.movies, { 'category': category });
  console.log(this.movies);

  // $.getJSON(url, function (data) {
  //   var movies = data.results;
  //   var imgUrl = 'https://image.tmdb.org/t/p/w92';

  //   $.each(movies, function (index, movie) {
  //     Popcorn.movies[category].push(movie);
  //     var movieElement = $('<a/>')
  //       .attr('href', '#')
  //       .on('click', function (){
  //         Popcorn.showMovie(movie.id);
  //       });
  //     var moviePoster = $('<img/>')
  //       .attr('src', imgUrl + movie.poster_path)
  //       .attr('alt', movie.title);

  //     movieElement.append(moviePoster);
  //     $(container).append(movieElement);
  //   });
  // });
};

Popcorn.showMovie = function (movieID) {
  var container = $('.js-movie-details');
  container.fadeIn();
  var url = this.apiPath + movieID + this.apiKey;

  $.getJSON(url, function (movie) {
    var movieYear = movie.release_date.substring(0, 4);
    $('.js-movie-title').text(movie.title + ' (' + movieYear + ')');
    $('.js-movie-description').text(movie.overview);

    var imgUrl = 'https://image.tmdb.org/t/p/w300' + movie.poster_path;
    $('.js-movie-poster')
        .attr('src', imgUrl)
        .attr('alt', movie.title);
  });

  Popcorn.listCast(movieID);
};

Popcorn.listCast = function (movieID) {
  var url = this.apiPath + movieID + '/credits' + this.apiKey;
  $.getJSON(url, function (data) {
    var cast = data.cast;
    var castImgUrl = 'https://image.tmdb.org/t/p/w45';
    var castContainer = $('.js-movie-cast');
    castContainer.html('');
    for(var i = 0; i < 3; i++) {
      var castMember = $('<li/>');
      var castMemberPhoto = $('<img/>')
        .attr('src', castImgUrl + cast[i].profile_path)
        .attr('alt', cast[i].name);
      var castMemberName = $('<span/>').text(cast[i].name);
      castMember.append(castMemberPhoto);
      castMember.append(castMemberName);
      castContainer.append(castMember);
    }
  });
};

function init() {
  Popcorn.getMovies('popular');
  Popcorn.getMovies('top_rated');
}

(function($) {
  init();

  Popcorn.listMovies('popular', '.js-popular');
  Popcorn.listMovies('top_rated', '.js-top-rated');
})(jQuery);

