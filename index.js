// Config
// Algolia searchClient
const searchClient = algoliasearch('BTOPSXRKEY', '168aae4702118f3f96f8d2bcfb1651f4');

// Using Algolia helper to collect the information from database
const helper = algoliasearchHelper(searchClient, 'new-index-1647862262', {
  facets: ['food_type', 'price_range', 'stars_count'],
  hitsPerPage: 5,
  maxValuesPerFacet: 4,
  getRankingInfo: true
});

// DeclaringUI -- declaring different part of the UI that we need to use
let $searchfield = $("#search-box");
let $hits = $('#hits');
let $fetchDescriptor = $('#fetch-descriptor');
let $facets = $('#facets');
let $geoLocation = $('#geo-location');
$facets.on('click', handleFacetClick);

// Looking for the result that is coming from Algolia
helper.on('result', (content) => {
  renderFetchDescriptor($fetchDescriptor, content);
  searchResultCallback(content);
});

// Trigger the search when there is new search input and update it
$searchfield.keyup((e) => {
  helper.setQuery($searchfield.val()).search();
  
});

helper.search();

// limit geo loation by clicking on switch
$geoLocation.change(function() {
  if (this.checked) {
     limitGeoLocation();
  }
  else {
    helper.setQueryParameter('aroundLatLng', "");
    helper.setQueryParameter('aroundRadius', "");
    helper.search();
    $progressBar.hide();
  }
});

// request geo information from the user * 
function limitGeoLocation() {
  navigator.geolocation.getCurrentPosition((pos) => {
      let lat = pos.coords.latitude;
      let lng = pos.coords.longitude;
      let query = lat + ', ' + lng;
      let aroundRadius = 80000; // in meters
      helper.setQueryParameter('aroundLatLng', query);
      helper.setQueryParameter('aroundRadius', aroundRadius);
      helper.search();
  });
}

// Results data per hits 
function renderFetchDescriptor(container, content) {
let results = content.nbHits;
let resultFound = $('<b></b>').html(results);
let resultDescriptor = $('<span></span>').html(resultFound).append(' Results ').append('<hr>')
 if (results > 0) {
    container.html(resultDescriptor);
} else {
    let noResults = $('<p></p>').html('Sorry, no Restaurants were found around your Location! ');
    let clearButton = $('<a></a>').attr('class', 'title').html('Clear').on('click', () => {
    helper.setQueryParameter('aroundLatLng', "");
    helper.setQueryParameter('aroundRadius', "");
    helper.clearRefinements('food_type');
    toggledFacets = {};
    $searchBox.val('');
    helper.setQuery('').search();
    $geoLocation.prop('checked', false)
    })
    container.html(resultDescriptor).append(noResults).append(clearButton);
}
  
}
// Search result call back 
function searchResultCallback(content) {
  if (content.hits.length === 0) {
    // If there is no result return a message!
    $hits.empty().html("No search result found, Please try something else!");
    return;
  }
  renderHits($hits, content);
  renderFacets($facets, content);
}

// Look for all the hits and return them
function renderHits($hits, results) {
  const hits = results.hits.map(function renderHit(hit) {
    i = 0;
    let stars = "";
    while (i <= Math.max(hit.stars_count)) {
      stars += '<span class="fa fa-star"></span>';
      i++;
    }
    while (i <= 5) {
      stars += '<span class="fa fa-star"></span>';
      i++;
    }
    // card component UI
    return (
      `   <a href="${hit.reserve_url}">   
      <div class="card">
      <img class="image" src="${hit.image_url}" />
      <div class="custom-icon"> <i class="fas fa-heart icon-heart"></i> </div>
      <div class="detailContainer"> 
          <div class="titleContainer">
              <p class="title ml-2">
                ${hit.name}
              </p>
              <div class="ratingContainer">
                  <i class="fa fa-star star-icon"></i>
                  <p class="rating">
                    ${hit.stars_count}
                  </p>
              </div>
          </div>
          <div class="subTitleContainer">
              <p class="subTitle">
                  45 - 60 min
              </p>
              <p class="fee">
                ${hit.price_range}
              </p>

          </div>
      </div>
  </div>     
  </a>

`)
  });
  $hits.html(hits);
}

// Display all the filtering (facets) block - Filtering block component UI
function renderFacets($facets, results) {
  const facets = results.facets.map((facet) => {
    let name = facet.name;
    let filter = '<h2 class="category-title">' + capitalize(name.replace("_", " ")) + '</h2>';
    let facetResults = results.getFacetValues(name);
    let facetsResultsList = $.map(facetResults, (facetResult) => {
      let facetsResultCount = '<div id="checkboxes">' + '<a class ="category-link" data-attribute="' + name + '" data-value="' + facetResult.name + '" href="#">' + facetResult.name  + '</a>' + '<input class="checkbox" type="checkbox" checked>' + '</div>';
      return `<li class="list-group-item"> ${facetsResultCount} </li>`;
    })
    return filter + '<ul class="list-group">' + facetsResultsList.join('') + '</ul>';
  });
  $facets.html(facets.join(''));
}

function handleFacetClick(e) {
  e.preventDefault();
  let target = e.target;
  let attribute = target.dataset.attribute;
  let value = target.dataset.value;
  if (!attribute || !value) return;
  helper.toggleRefine(attribute, value).search();
}

// Display the fist letter of the catgory upper-case
function capitalize(word) {
  return word
    .charAt(0)
    .toUpperCase() + word.slice(1);
}

// Instant Search used only for  the map
// Todo - add this in the future without instant search!  

let search = instantsearch({
    appId: 'BTOPSXRKEY',
    apiKey: '168aae4702118f3f96f8d2bcfb1651f4',
    indexName: 'new-index-1647862262',
  
      urlSync: true
    });
  
  
    search.addWidget(
    instantsearch.widgets.searchBox({
      container: '#search-box',
    })
    );
  
  search.addWidget(
    instantsearch.widgets.googleMaps({
      container: document.querySelector('#map')
    })
  );
  
  search.start();