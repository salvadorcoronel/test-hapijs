var Hapi = require('hapi');
var Vision = require('vision');
var Path = require('path');
var H2o2 = require('h2o2');
var Wreck = require('wreck');
var SteamID = require('steamid');
var server = new Hapi.Server();

var _APIKEYSTEAM = 'XXXXXXX----XXXXXXX'; 

server.connection({
    host: 'localhost',
    port: Number(process.argv[2] || 3000)
});

server.register(Vision, function () {});

server.register(H2o2, function () {});

server.views({
    engines: {
        html: require('handlebars')
    },
    path: Path.join(__dirname, 'templates')
});

server.route({
    method: 'GET',
    path: '/{nickname}',
    handler: function (request, reply){

        reply.proxy({
            mapUri: function (request, callback) {                
                callback(null, 'http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?vanityurl='+request.params.nickname+'&key='+_APIKEYSTEAM);
            },
            onResponse: function (err, res, request, reply, settings, ttl) {                
                Wreck.read(res, { json: true }, function (err, payload) {
                    var objectSTeamID = new SteamID(payload.response.steamid);
                    reply.view('index', { steamid: objectSTeamID.getSteam2RenderedID() });
                });
            } 
        });
    }
});

server.start(() => {
    console.log('Server:', server.info.uri);
});