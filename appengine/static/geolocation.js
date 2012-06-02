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