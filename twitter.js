var TwitterStream = require('twitter-stream-api'),
  fs = require('fs');

var keys = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  token: process.env.TOKEN,
  token_secret: process.env.TOKEN_SECRET
};

var Twitter = new TwitterStream(keys, false);
Twitter.stream('statuses/filter', {
  track: 'javascript'
});

Twitter.pipe(fs.createWriteStream('tweets.json'));
