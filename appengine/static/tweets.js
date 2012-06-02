
// CLASSES
/**
* In deze class staan de regular expressions
* voor een bepaalde vraag, en de methods om
* ertegen te matchen
*/
Question = function(question, reStart, reEnd, reAnswer){
    this.init(question, reStart, reEnd, reAnswer);
}

$.extend(Question.prototype, {
    
    // object variables
    init: function(question, reStart, reEnd, reAnswer) {
        // do initialization here
        this.question       = question;
        this.reStart        = reStart;
        this.reEnd          = reEnd;
        this.reAnswer       = reAnswer;
        this.answers        = {};
        this.officialAnswer = null;
        this.numberOfPoints = 10;
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
               this.officialAnswer = endMatch[1];
            };
        }
    },
    
    /**
    * Process a list of answer tweets, 
    * To find the given answers and who gave them.
    */
    processAnswerTweets: function(tweets) {
        for (var i = 0; i < tweets.length; i++){
            // Reverse, oldest tweet first
            var tweet = tweets[tweets.length - 1 - i];
            var answersByUser = {};
            // Iterate through all expressions for this answer
            for (var j = 0; j < this.reAnswer.length; j++){
                var m = this.reAnswer[j].exec(tweet.text);
                if (m != null){
                    // m[1] is the first matching group
                    answersByUser[tweet.from_user] = [tweet, m[1]];
                }
            }
        }
        for (var user in answersByUser){
            tweet = answersByUser[user][0];
            answer = answersByUser[user][1];
            if (!(answer in this.answers)){
                // Create a list of all tweets that gave this answer
                this.answers[answer] = [];
            }
            this.answers[answer].push(tweet);
        }
        
        // Sort each answer by id, putting the earliest tweets first.        
        for (var answer in this.answers){
            this.answers[answer].sort(function(a,b){
                return ( ( a.id_str == b.id_str ) ? 0 : ( ( a.id_str > b.id_str ) ? 1 : -1 ) );
            })
        }
    },
    
    /**
    * Assign points to users in the list, based on if they
    * had the correct answer. If the user did not occur in the list,
    * assigns 0 points.
    */
    assignPoints: function(userPoints){
        if (this.officialAnswer == null){
            console.log("No official answer found to this question: " + this.question);
            return;
         }
         for (var i = 0; i < this.answers[this.officialAnswer].length; i ++){
             var tweet = this.answers[this.officialAnswer][i];
             var user = tweet.from_user;
             if (!(user in userPoints)){
                 userPoints[user] = 0;
             }
             userPoints[user] += this.numberOfPoints;
         }
         return userPoints;
    }
});

    
// CONSTANTS
_tep.HASHTAGID       = "#twitterpoule";
_tep.OFFICIALACCOUNT = "twitterpoule2012";
_tep.LOCATIONRANGE = '0.1km';
    
_tep.questions = {}
// MOGELIJKE VRAGEN
_tep.questions.winnaar = new Question("Winnaar wedstrijd.", /Wie gaat er winnen/, /(.+?)heeftgewonnen/,[ /(.+?)gaatwinnen/ ]);
_tep.questions.test = new Question("Wat voor poule?", /Wat is dit voor poule?/, /een(.+?)poule/,[ /#(.+?)poule/ ]);
    

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
          _tep.questions.winnaar.processOfficialTweets(data.results);
          redraw();
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
      success: function(data){
          _tep.questions.test.processAnswerTweets(data.results);
          console.log(_tep.questions.test.assignPoints({}, 10));
          redraw();
      }
    });
}

function redraw(){
    for (var key in _tep.questions.test.answers){
        var u = _tep.questions.test.answers[key][0];
        $('#container').append(u.from_user + " answered \"" + key + "\" to \"" + _tep.questions.test.question + '"')
    }
}
