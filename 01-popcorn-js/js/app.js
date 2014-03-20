'use strict'

var Popcorn = {
  movies: []
};

Popcorn.apiKey = '?api_key=475d960c7374b0d07a51bf9f1e9cfd03';
Popcorn.apiPath = 'https://api.themoviedb.org/3/movie/';
Popcorn.imgPath = 'https://image.tmdb.org/t/p/w';

//Service to make requests
Popcorn.get = function (url){
  var deferred = new $.Deferred();

  $.getJSON(url, function (data) {
    deferred.resolve(data);
  });

  return deferred.promise();
};

Popcorn.getMovies = function (categories) {
  //Gets the movies in the specified categories
  $.each(categories, function (index, category) {
    var url = Popcorn.apiPath + category + Popcorn.apiKey;
    var promise = Popcorn.get(url);

    promise.done(function (data){
      var movies = data.results;

      $.each(movies, function (index, movie) {
        // Checks if movie is already on the list
        var existingMovie = _.findWhere(Popcorn.movies, { 'id': movie.id });

        if (!existingMovie) {
          // Adds the new movie to the list
          movie.categories = [category];

          //Checks if movie has been added to Local Favorites
          if(_.contains(JSON.parse(localStorage['favorites']), movie.id)){
            movie.categories.push('favorites');
          }

          //Adds additional data for the movie
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

      $(Popcorn).trigger('modelReady:' + category);
    });
  });
};

Popcorn.getCast = function (movieID) {
  var url = this.apiPath + movieID + '/credits' + this.apiKey;
  var movieCast = [];

  var promise = this.get(url);

  promise.done(function (data){
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
  $(container).html('');

  //Finds movies belonging to the specified category
  var movies = _.filter(Popcorn.movies, function (movie) {
    return _.contains(movie.categories, category);
  });

  $.each(movies, function (index, movie) {
    var movieElement = $('<a/>')
      .attr('href', '#')
      .on('click', function (){
        Popcorn.showMovie(movie.id);
      });
    var moviePoster = $('<img/>')
      .attr('src', movie.small_poster_url)
      .attr('alt', movie.title);

    movieElement.append(moviePoster);
    $(container).append(movieElement);
  });
};

Popcorn.showMovie = function (movieID) {
  var container = $('.js-movie-overlay');
  container.fadeIn();
  var movie = _.findWhere(this.movies, { 'id': movieID });

  $('.js-movie-title').text(movie.title + ' (' + movie.year + ')');
  $('.js-movie-description').text(movie.overview);

  $('.js-movie-poster')
      .attr('src', movie.large_poster_url)
      .attr('alt', movie.title);

  var castContainer = $('.js-movie-cast');
  castContainer.html('');

  $.each(movie.cast, function (index, cast) {
    var castMember = $('<li/>');
    var castMemberPhoto = $('<img/>')
      .attr('src', cast.image_url)
      .attr('alt', cast.name);
    var castMemberName = $('<span/>').text(cast.name);
    castMember.append(castMemberPhoto);
    castMember.append(castMemberName);
    castContainer.append(castMember);
  });

  $('.js-favorite-button, .js-unfavorite-button').data('movie', movie.id);
  $('.js-favorite-button, .js-unfavorite-button').hide();

  if(_.contains(movie.categories, 'favorites')){
    $('.js-unfavorite-button').show();
  }else{
    $('.js-favorite-button').show();
  }
};

Popcorn.hideMovie = function () {
  $('.js-movie-overlay').fadeOut();
};

Popcorn.addFavorite = function (movieID) {
  var movie = _.findWhere(Popcorn.movies, { 'id': movieID });

  movie.categories.push('favorites');

  Popcorn.listMovies('favorites', '.js-favorites');

  $('.js-favorite-button').hide();
  $('.js-unfavorite-button').show();

  var favorites = JSON.parse(localStorage['favorites']);
  favorites.push(movie.id);
  localStorage['favorites'] = JSON.stringify(favorites);
};

Popcorn.removeFavorite = function (movieID) {
  var movie = _.findWhere(Popcorn.movies, { 'id': movieID });

  movie.categories.pop('favorites');

  Popcorn.listMovies('favorites', '.js-favorites');

  $('.js-unfavorite-button').hide();
  $('.js-favorite-button').show();
  
  var favorites = JSON.parse(localStorage['favorites']);
  favorites.pop(movie.id);
  localStorage['favorites'] = JSON.stringify(favorites);
};

function init() {
  if(!localStorage['favorites']) localStorage.setItem('favorites', '[]');

  Popcorn.categories = ['popular', 'top_rated'];
  Popcorn.getMovies(Popcorn.categories);

  $('.js-favorite-button').on('click', function (e){
    e.preventDefault();
    Popcorn.addFavorite($(this).data('movie'));
  });

  $('.js-unfavorite-button').on('click', function (e){
    e.preventDefault();
    Popcorn.removeFavorite($(this).data('movie'));
  });

  $('.js-movie-overlay').on('click', function (){
    Popcorn.hideMovie();
  });

  $('.js-movie-details').on('click', function (e){
    e.stopPropagation();
  });
}

(function($) {
  init();

  $.each(Popcorn.categories, function (index, category){
    $(Popcorn).on('modelReady:' + category, function (){
      Popcorn.listMovies(category, '.js-' + category);
      Popcorn.listMovies('favorites', '.js-favorites');
    });
  });
  
})(jQuery);