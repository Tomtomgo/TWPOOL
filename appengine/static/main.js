// the main object
_tep = {}

// program flow
$(document).ready(function(){
	
    // initialize from GPS location 
    // or show error message
	_tep.init()

});

_tep.init = function(){

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position){

            // if already set, do not
            if(typeof(_tep.position)!="undefined"){return;}

            // store position
            _tep.position = position
            
            // fetch dze tweetz
            var loc = {'lat': _tep.position.coords.latitude,'lon':_tep.position.coords.longitude}
            var since_id = '208933242810806271';
            fetchAnswerTweets(loc, since_id);

        }, function(){
            error();
        });

    } else {
        error('not supported');
    }

}
