'use strict'

class Movie { 
    title;
    year;
    id;
    poster;
    constructor(title, year, id, poster){
        this.title = title;
        this.year = year;
        this.id = id;
        this.poster = poster;
    }    
}

let movies = [];
let favoriteMovies = [];
let total = "";


displayStoredFavorites();
$(document).on('click', `#topBtn`, ()=>{toTop()});
$("#s-btn").click(()=>{searchMovies()});
//For dynamically created buttons
$(document).on('click', `.heart`, (e)=>{addToFavorites(e)});
$(document).on('click', `.trash`, (e)=>{removeFromFavorites(e)});


//To top button
function toTop(){
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

window.onscroll = function() {scrollFunction()};
//Show button for scrolling up
function scrollFunction(){
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        topBtn.style.display = `block`;
    } else {
        topBtn.style.display = `none`;
    }
}


//gets the searched movie and displays result
async function searchMovies(){
    let inputValue = getInputValue();
    let data = await getData(inputValue); 
    displayMovies(data);    
}

//fetches data
async function getData(input){
    const api_key = "dff00005";
    const urlStart = "http://www.omdbapi.com/";
    let url = `${urlStart}?apikey=${api_key}&s=${input}`;
    let result;
    //Do request
    try {
        result = await $.ajax({
            url: url, 
            dataType: "json",
            method: "GET"
        });
        movies = [];
        total = "";
        if(result.Search){
            total = result.totalResults;
            result.Search.forEach(function(item){
                movies.push(new Movie(item.Title, item.Year, item.imdbID, item.Poster));   
            });
        }
    } catch (error) {
        console.error(error);
    }
}


//Returns value from input
function getInputValue(){

    let $input = $("#movieSearch").val();
    //Empty the input field
    $("#movieSearch").val("");
    $input = $input.trim();
    $input = $input.split(" ").join("+");
    
    return $input;
}


function addToFavorites(event){
    let id = event.target.parentElement.parentElement.getAttribute("id");
    //add to favorites if it is not there
    if(!isInFavorites(id)){
        let movie = getMovieById(id);
        favoriteMovies.push(movie);
        //localStorage
        storeList(favoriteMovies, `favorites`);
        displayFavorite(movie);
        updateNumberFavorites();
    }
}


function removeFromFavorites(event){

    let id = event.target.parentElement.parentElement.getAttribute(`id`);
    let removeIndex = 0;
    $.each(favoriteMovies, (idx, item)=>{
        if(item.id === id){removeIndex = idx}
    })
    favoriteMovies.splice(removeIndex, 1);
    //localStorage
    storeList(favoriteMovies, `favorites`);
    event.target.parentElement.parentElement.remove();
    updateNumberFavorites();
}


//Returns true if movie exists in favorites, otherwise false
function isInFavorites(id){
    let contains = false;
    $.each(favoriteMovies, (idx, item)=>{
        if(item.id === id){contains = true;}
    });
    return contains;
}


//Returns the movie with the given id
function getMovieById(id){
    //find index
    let movieIndex = 0;
    $.each(movies, (idx, item)=>{
        if(item.id === id){movieIndex = idx;}
    });
    
    return movies[movieIndex];
}


function displayFavorite(movie){
    let movieContainer = createMovieContainer(movie, `&#128465;`, `trash`);
    $("#wrapper2").append(movieContainer);
}


function displayMovies(){
    
    $("#wrapper1").html("");
    //Check if there are movies
    if (movies.length){
        $("#message").html(`${movies.length} movies of ${total}`);

        $.each(movies, (idx, item)=>{
            let movieContainer = createMovieContainer(item, `&#10084;`, `heart`);
            $("#wrapper1").append(movieContainer);
        });                
    }
    else{
        $("#message").html(`Could not find the movie`);        
    }   
}


function displayStoredFavorites(){
    retrieveList(favoriteMovies, `favorites`);
    $.each(favoriteMovies, (idx, item)=>{
        displayFavorite(item);
    });
    updateNumberFavorites();   
}


function updateNumberFavorites(){
    if(favoriteMovies.length > 0){
        $("#number-items").html(`${favoriteMovies.length}`);
    }
    else{ $("#number-items").html(""); }   
}



function createMovieContainer(movie, icon, iconClass){
    let movieContainer = $(`<div></div>`);
    movieContainer.addClass(`mv`);
    movieContainer.attr(`id`, `${movie.id}`);
    let content = "";
    content += `<div class="img-container">`;
            
    if(movie.poster != "N/A"){
        content += `<img src="${movie.poster}" alt="movie poster">`;
    }
    else{ content += `<img src="../images/noimage2.png" alt="poster is missing">`; }
    content += `</div>`;
    let titleStr = movie.title;
    let hiddenTitle = "";
    if(titleStr.length > 38){
        titleStr = `${titleStr.substr(0, 35)}...`;
        hiddenTitle = `data-toggle="tooltip" title="${movie.title}"`;
    }
    content += `<div class="text" ${hiddenTitle}><p><b>${titleStr}</b><br><span>${movie.year}</span></p>
    <span class="${iconClass}" data-toggle="tooltip" title="favorite">${icon}</span></div>`;

    movieContainer.html(content);
    return movieContainer;
}



//Local storage
function storeList(arr, storageName){
    //Check if browser has webStorage
    if(typeof(Storage) !== "undefined"){           
        localStorage.setItem(storageName, JSON.stringify(arr));           
    }
}


function retrieveList(arr, storageName){
    //Check if browser has webStorage
    if(typeof(Storage) !== "undefined"){

        //Check if list is defined in localStorage
        if(localStorage.getItem(storageName)){

            //Retrieve from localStorage
            let tempList;
            let temp = localStorage.getItem(storageName); 
            tempList = (temp)? JSON.parse(temp) : [];
            
            if(tempList.length > 0){
                arr.length = 0;
                $.each(tempList, (idx, item)=>{
                    arr.push(new Movie(item.title, item.year, item.id, item.poster));
                });
            }
        }    
    }
    else{
        $("#message").html(`This browser does not support local storage`);
    }    
}
