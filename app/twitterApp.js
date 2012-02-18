var twitter = require("ntwitter");

var twit = new twitter({
		"consumer_key":"[puthereyours]",
    "consumer_secret":"[puthereyours]",
    "access_token_key":"[puthereyours]",
    "access_token_secret":"[puthereyours]",

});

twit.stream('statuses/filter', {track : "NeverTellAGirl"}, function(stream){
	stream.on('data', function(data){
		console.log(data.text);
	});
});