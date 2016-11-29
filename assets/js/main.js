/*
  Find and compare movie cast
  Author: Sebastian Ślęczka
  Version 1.0
*/

// Compare arrays
Array.prototype.diff = function(secondArray) {
    var returnedArray = [];
    this.sort();
    secondArray.sort();
    for(var i = 0; i < this.length; i++) {
        if(secondArray.indexOf( this[i] ) > -1){
            returnedArray.push( this[i] );
        }
    }
    return returnedArray;
};

// Get JSON request
function JSONRequest(url){
    var httpReq = new XMLHttpRequest();

    httpReq.open("GET",url,false);
    httpReq.onreadystatechange = function () {
      if (httpReq.readyState == 4 && httpReq.status == "200") {
        // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
      } else {
        alert(httpReq.responseText);
      }
    };
    httpReq.send(null);

    return httpReq.responseText;
}

// Define variables
var firstMov,
    secondMov,
    firstMovieTitle = document.querySelector('#firstMovie'),
    secondMovieTitle = document.querySelector('#secondMovie'),
    firstMovieActors,
    secondMovieActors,
    firstMovieTitleOriginal = [],
    secondMovieTitleOriginal = [],
    comparedActors,
    myActors = document.getElementById("commonActors"),
    myDirectors = document.getElementById("commonDirectors"),
    item,
    actorName,
    movieItem,
    movieSubitem,
    movieSubitemContent,
    actualMovies = [],
    commons = [],
    recentlyMovies = [],
    historyTableSelector = document.querySelector('#moviesHistory tbody');

// Get items from localStorage
if(localStorage.getItem('compareResults')) {
  recentlyMovies = JSON.parse(localStorage.getItem('compareResults'));
}

// Display actors or directors inside unordered list
function displayItems(itemsArray, destination) {
    while (destination.firstChild) {
        destination.removeChild(destination.firstChild);
    }
    for(var i = 0; i < itemsArray.length; i++) {
      item = document.createElement("li");
      item.className = "mdl-list__item";
      itemName = document.createTextNode(itemsArray[i]);
      item.appendChild(itemName);
      destination.appendChild(item);
    }
}

// Split JSON string into array
function splitString(rawString) {
  return rawString.split(', ');
}

// Add element into table
function historyTable(historyArray) {
  var movieItem, movieSubitem, lastMovieItem, lastArrayFromHistory, stringFromArray;

  lastMovieItem = historyArray.length-1;
  lastArrayFromHistory = historyArray[lastMovieItem];
  movieItem = document.createElement('tr');

  for(var i = 0; i < lastArrayFromHistory.length; i++) {
    for(var j = 0; j < 1; j++) {
      movieSubitem = document.createElement('td');
      movieSubitem.className = 'mdl-data-table__cell--non-numeric';
      stringFromArray = lastArrayFromHistory[i].toString();
      movieSubitemContent = document.createTextNode(lastArrayFromHistory[i]);

      movieSubitem.appendChild(movieSubitemContent);
      movieItem.appendChild(movieSubitem);
      historyTableSelector.insertBefore(movieItem, historyTableSelector.childNodes[0]);
    }
  }
}

// Display recently searched inside table
if(recentlyMovies) {
  for(var i = recentlyMovies.length-1; i >= 0; i--) {

    movieItem = document.createElement('tr');

    for(var j = 0, k = recentlyMovies[i].length; j < k; j++) {

      movieSubitem = document.createElement('td');
      movieSubitem.className = 'mdl-data-table__cell--non-numeric';
      movieSubitemContent = document.createTextNode(recentlyMovies[i][j]);

      movieSubitem.appendChild(movieSubitemContent);
      movieItem.appendChild(movieSubitem);

      historyTableSelector.appendChild(movieItem);


    }
  }
}

// Put item into localStorage
function movieStorage(first, second, actors, directors) {

  if(directors.length === 0) {
    directors.push('--');
  }

  if(actors.length === 0) {
    actors.push('--');
  }

  commons = [
    first = first,
    second = second,
    actors = actors,
    directors = directors,
  ];

  recentlyMovies.push(commons);
  localStorage.setItem('compareResults', JSON.stringify(recentlyMovies));
}

// Modal errors
var dialog = document.querySelector('dialog');
var showDialogButton = document.querySelector('#show-dialog');
// if (! dialog.showModal) {
//  dialogPolyfill.registerDialog(dialog);
// }
dialog.querySelector('.mdl-button').addEventListener('click', function() {
   dialog.close();
   firstMovieTitle.value = '';
   secondMovieTitle.value = '';
   firstMovieTitle.select();
});

// Clear recently searched
document.querySelector('#clearHistory').addEventListener('click', function(){
  localStorage.clear();
  window.location.reload(0);
});

// Action after click compare button!
document.querySelector('#search-form button').addEventListener('click', function(){

  firstMov = JSON.parse(JSONRequest('https://www.omdbapi.com/?t=' + firstMovieTitle.value + '&y=&plot=short&r=json'));
  secondMov = JSON.parse(JSONRequest('https://www.omdbapi.com/?t=' + secondMovieTitle.value + '&y=&plot=short&r=json'));

  if((firstMov.Response === "False") || (secondMov.Response === "False") || (firstMovieTitle.value == '') || (secondMovieTitle.value == '')) {
    // Validate inputs and response
    dialog.showModal();

  } else {

    firstMovieActors = splitString(firstMov.Actors);
    secondMovieActors = splitString(secondMov.Actors);
    comparedActors = firstMovieActors.diff(secondMovieActors);
    displayItems(comparedActors, myActors);

    firstMovieDirector = splitString(firstMov.Director);
    secondMovieDirector = splitString(secondMov.Director);
    comparedDirectors = firstMovieDirector.diff(secondMovieDirector);
    displayItems(comparedDirectors, myDirectors);
    if(comparedDirectors)

    firstMovieTitleOriginal = [];
    secondMovieTitleOriginal = [];
    firstMovieTitleOriginal.push(firstMov.Title);
    secondMovieTitleOriginal.push(secondMov.Title);

    movieStorage(firstMovieTitleOriginal, secondMovieTitleOriginal, comparedActors, comparedDirectors);
    historyTable(recentlyMovies);

    window.location.hash = '#results';
  }

});
