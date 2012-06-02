$(document).ready(function(){
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    error('not supported');
  }
});

function success(position) {
  
  if (s.className == 'success') {
    // prevent double loads in FF
    return;
  }

  // store position
  _tep.position = position
  
  // get objects for showing stuff.
  var s = $('#status');
  var map_element = $("#mapcanvas");

  // report the status ofthe 
  // setStatus(s, "found you!", "success");
  // createMap(map_element, position);

  // go fetch the twitzz
  // twitz

}

function setStatus(obj, message, classname){
  
  obj[0].innerHTML = message;
  obj[0].className = classname;

}


function createMap(obj, position){

  var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  var map_options = {
    zoom: 15,
    center: latlng,
    mapTypeControl: false,
    navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var map = new google.maps.Map(obj[0], map_options);
  
  var marker = new google.maps.Marker({
      position: latlng, 
      map: map, 
      title:"You are here! (at least within a "+position.coords.accuracy+" meter radius)"
  });

}

function error(msg) {
  var s = $('body');
  msg = "<h1>Helaas pindakaas. Om mee te doen met de Twitter EK Poule 2012 moet je geolocation aan hebben staan.</h1>";
  setStatus(s, msg, 'fail');
}





