window._tep = {};
    
// CLASSES
/**
* In deze class staan de regular expressions
* voor een bepaalde vraag, en de methods om
* ertegen te matchen
*/
_tep.PollQuestion = function(title, expressions){
    this.init(expressions);
}
$.extend(_tep.PollQuestion, {
   // object variables
   expressions: {},

   init: function(title, expressions) {
       // do initialization here
       this.title       = title;
       this.expressions = expressions;
   },

   matchesStart: function(tweet) {
       var result = this.expressions['start'].exec(tweet);
       return (result != null);
   }
});

    
// CONSTANTS
window._tep.HASHTAGID       = "#twitterpoule";
window._tep.OFFICIALACCOUNT = "twitterpoule2012";
window._tep.LOCATIONRANGE = '0.1km';
    
// MOGELIJKE VRAGEN
window._tep.QUESTIONS = [
    PollQuestion("Winnaar wedstrijd.", 
    {'start': /Wie gaat er winnen/,
     'end': /(.+)heeftgewonnen/,
     'answers': [ /(.+)gaatwinnen/ ] })
];
    

// ZOEK HUIDIGE LOCATIE
// TOM MAAKT DIT!!
    
// FETCH OFFICIELE TWEETS
function fetchOfficialTweets(){
    var q = 'from:' + window.OFFICIALACCOUNT;
    $.ajax({
      url: "http://search.twitter.com/search.json",
      dataType: 'jsonp',
      data: {'q': q, 
             'rpp': '100', 
             'include_entities': 'true',
             'result_type': 'recent'},
      success: function(data){
          for (var i=0; i < data.results.length; i++){
              var tweet = data.results[i];
              for (var q=0; q < window._tep.QUESTIONS.length; q++){
                  console.log(window._tep.QUESTIONS[q].matchesStart(tweet))
              }
          }
      }
    });
}
        
// TWEETS IN DE BUURT, MET ONZE HASHTAG, BINNEN TIJD
function fetchAnswerTweets(location, since_id){
    var q = window.HASHTAGID
    var gc = location.lat + ',' + location.lon + ',' + window.LOCATIONRANGE
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
    
    
// VRAGEN SORTEREN
    
// RANKING, SCORES OPTELLEN
    
// PAGINA BOUWEN ADHV ANTWOORDEN
    
        
$(document).ready(function(){
    var loc = {'lat': 52.356801,'lon':4.909659}
    var since_id = '208933242810806271';
    var max_id = '208933242810806273';
    fetchAnswerTweets(loc, since_id, max_id);
})
