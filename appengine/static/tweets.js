
// CLASSES
/**
* In deze class staan de regular expressions
* voor een bepaalde vraag, en de methods om
* ertegen te matchen
*/
Question = function(title, reStart, reEnd, reAnswer){
    this.init(title, reStart, reEnd, reAnswer);
}
$.extend(Question.prototype, {
    
    // object variables
    init: function(title, reStart, reEnd, reAnswer) {
        // do initialization here
        this.title    = title;
        this.reStart  = reStart;
        this.reEnd    = reEnd;
        this.reAnswer = reAnswer;
    },
   
    /**
    * Process a list of 'official' tweets,
    * to find the start tweet, end tweet, and
    * the "correct" answer to the question
    */
    processOfficialTweets: function(tweets) {
        for (var i = 0; i < tweets.length; i++){
            var tweet = tweets[i];
            if (this.reStart.exec(tweet.text) != null){
               this.startTweet = tweet;
            };
            var endMatch = this.reEnd.exec(tweet.text);
            if (endMatch != null){
               this.endTweet = tweet;
            };
        }
    },
    
    /**
    * Process a list of answer tweets, 
    * To find the given answers and who gave them.
    */
    processAnswerTweets: function(tweets) {
        this.answers = {};
    }
});

    
// CONSTANTS
_tep.HASHTAGID       = "#twitterpoule";
_tep.OFFICIALACCOUNT = "twitterpoule2012";
_tep.LOCATIONRANGE = '0.1km';
    
_tep.questions = {}
// MOGELIJKE VRAGEN
_tep.questions.winnaar = new Question(
    "Winnaar wedstrijd.", 
    /Wie gaat er winnen/,
    /(.+)heeftgewonnen/,
    [ /(.+)gaatwinnen/ ]);
    

// ZOEK HUIDIGE LOCATIE
// TOM MAAKT DIT!!
    
// FETCH OFFICIELE TWEETS
function fetchOfficialTweets(){
    var q = 'from:' + _tep.OFFICIALACCOUNT;
    $.ajax({
      url: "http://search.twitter.com/search.json",
      dataType: 'jsonp',
      data: {'q': q, 
             'rpp': '100', 
             'include_entities': 'true',
             'result_type': 'recent'},
      
      success: function(data){
          for (var q = 0; q < _tep.QUESTIONS.length; q++){
              _tep.questions.winnaar.processOfficialTweets(data.results);
          }
      }
    });
}
        
// TWEETS IN DE BUURT, MET ONZE HASHTAG, BINNEN TIJD
function fetchAnswerTweets(location, since_id){
    var q = _tep.HASHTAGID;
    var gc = location.lat + ',' + location.lon + ',' + _tep.LOCATIONRANGE
    $.ajax({
      url: "http://search.twitter.com/search.json",
      dataType: 'jsonp',
      data: {'q': q, 
             'geocode': gc, 
             'rpp': '100', 
             'include_entities': 'true',
             'result_type': 'recent',
             'since_id': since_id},
      success: function(data){console.log(data.results);}
    });
}
    

$(document).ready(function(){
    console.log("Fetching answers");
    var loc = {'lat': 52.356801,'lon':4.909659}
    var since_id = '208933242810806271';
    var max_id = '208933242810806273';
    fetchAnswerTweets(loc, since_id);
})
