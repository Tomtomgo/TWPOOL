
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
    init: function(reStart, reEnd, reAnswer) {
        // do initialization here
        this.question       = 'Wat?';
        this.reStart        = reStart;
        this.reEnd          = reEnd;
        this.reAnswer       = reAnswer;
        this.answers        = {};
        this.officialAnswer = null;
        this.numberOfPoints = 10; //TODO: We zouden het aantal punten kunnen parsen uit de tweet "Voor 10 punten: wie gaat er scoren?".
    },
   
    /**
    * Process a list of 'official' tweets,
    * to find the start tweet, end tweet, and
    * the "correct" answer to the question
    */
    processOfficialTweets: function(tweets) {
        for (var i = 0; i < tweets.length; i++){
            var tweet = tweets[i];
            console.log("Scanning official:" + tweet.text);
            var startMatch = this.reStart.exec(tweet.text);
            if (startMatch != null){
               this.startTweet = tweet;
               this.question = startMatch[0];
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
        var answersByUser = {};
        
        // First, find the last answer by each user
        for (var i = 0; i < tweets.length; i++){
            // Reverse, oldest tweet first
            var tweet = tweets[tweets.length - 1 - i];
            // Iterate through all expressions for this answer
            for (var j = 0; j < this.reAnswer.length; j++){
                var m = this.reAnswer[j].exec(tweet.text);
                if (m != null){
                    // m[1] is the first matching group
                    answersByUser[tweet.from_user] = [tweet, m[1]];
                }
            }
        }
        
        // Group all the answers by the answer they gave
        for (var user in answersByUser){
            tweet = answersByUser[user][0];
            answer = answersByUser[user][1];
            answer = answer.replace(" ","");
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
         
         if (this.officialAnswer in this.answers){
             for (var i = 0; i < this.answers[this.officialAnswer].length; i ++){
                 var tweet = this.answers[this.officialAnswer][i];
                 var user = tweet.from_user;
                 if (!(user in userPoints)){
                     userPoints[user] = 0;
                 }
                 userPoints[user] += this.numberOfPoints;
             }             
         }
         return userPoints;
    },
    
    /**
    * Builds a div with the results
    */
    buildHTML: function(){
        var box = $('<div></div>');
        box.append('<h2>' + this.question + '</h2>');
        var answerCount = [];
        // Count the answers
        var max = 0;
        for (var answer in this.answers){
            var numAnswer = this.answers[answer].length;
            answerCount.push([numAnswer, answer]);
            if (numAnswer > max) {
                max = numAnswer;
            }
        }
        // Sort (most given answer first)
        answerCount.sort().reverse();
        // Create a bar for each answer
        for (var i = 0; i < answerCount.length; i++){
            var row = $('<div class="answer clearfix"></div>');
            var count = answerCount[i][0];
            var answer = answerCount[i][1];
            row.append('<div class="head"><span>' + answer + "</span>   </div>");
            var bar = $('<div class="bar"></div>');
            var inner = $('<div class="inner"></div>')
            inner.css("width", (count/max * 100) + '%')
            bar.append(inner);
            inner.append(count)
            var users = $.map(this.answers[answer], function(el, idx){ return el.from_user }).join(', ');
            bar.append("<div class='users'>"+users+"</class>");
            row.append(bar);
            box.append(row);
        }
        return box;
    }
});

    
// CONSTANTS
_tep.HASHTAGID       = "#tp2012";
_tep.OFFICIALACCOUNT = "tweetpoule";
_tep.LOCATIONRANGE = '30km';
    
_tep.questions = {}

// MOGELIJKE VRAGEN
_tep.questions.uitslag = new Question(/Wat wordt de eindstand ([\w ]+-[\w ]+)\?/,
                                      /Eindstand [\w ]+-[\w ]+ ([0-9]{1,2} ?- ?[0-9]{1,2})/i,
                                      [ /#hetwordt *([0-9]{1,2} *- *[0-9]{1,2})/ ]);

// FETCH OFFICIELE TWEETS
function fetchTweets(){
    fetchOfficialTweets();
}

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
          _tep.questions.uitslag.processOfficialTweets(data.results);
          fetchAnswerTweets(1);
          redraw();
      }
    });
}

// TWEETS IN DE BUURT, MET ONZE HASHTAG, BINNEN TIJD
function fetchAnswerTweets(since_id){
    var q = _tep.HASHTAGID;
    var gc = _tep.position.latitude + ',' + _tep.position.longitude + ',' + _tep.LOCATIONRANGE
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
          _tep.questions.uitslag.processAnswerTweets(data.results);
          console.log(_tep.questions.uitslag.assignPoints({}));
          redraw();
      }
    });
}

function redraw(){
    $('#questions').empty();
    $('#questions').append(_tep.questions.uitslag.buildHTML() )
}
