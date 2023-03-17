// Example express application adding the parse-server module to expose Parse
// compatible API routes.

const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const path = require('path');
const args = process.argv || [];
const test = args.some(arg => arg.includes('jasmine'));
const PushAdapter = require('@parse/push-adapter').default;
const pushOptions = {
  ios: {
    token: {
      key: './AuthKey_3L58C9R9D6.p8',
      keyId: "3L58C9R9D6",
      teamId: "6A7255KVFQ" // The Team ID for your developer account
    },
    topic: 'com.forklabs.queuick', // The bundle identifier associated with your app
    production: false
  },
  android: {
    senderId: "422961269305",
    apiKey: "AAAAYnp0yjk:APA91bG_JBjkvK8XXIojtQGcyeTQ2-NsJcbTjeUaAZgVgbOu1IVNZRvodJlwcK5MmX87Xu8rkl--SJQIq7Nqjn1ZAhPw5tv4lQDdDQMXtV7onI47IBLGdDhSe8oH-hqVN_E_2Hzi25Kb"
  }
}


const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}
const config = {
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'madhur',
  masterKey: process.env.MASTER_KEY || 'madhur', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse', // Don't forget to change to https if needed
  liveQuery: {
    classNames: ['Posts', 'Comments'], // List of classes to support for query subscriptions
  },
  push: {
    adapter: new PushAdapter(pushOptions),
  },


};
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

const app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
const mountPath = process.env.PARSE_MOUNT || '/parse';
if (!test) {
  const api = new ParseServer(config);
  app.use(mountPath, api);
}

// Parse Server plays nicely with the rest of your web routes
app.get('/', function (req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

const port = process.env.PORT || 1337;
if (!test) {
  const httpServer = require('http').createServer(app);
  httpServer.listen(port, function () {
    console.log('parse-server-example running on port ' + port + '.');
  });
  // This will enable the Live Query real-time server
  ParseServer.createLiveQueryServer(httpServer);
}

module.exports = {
  app,
  config,
};
