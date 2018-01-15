var express        = require( 'express' );
var http           = require( 'http' );
var app            = express();
var expressWs      = require('express-ws')(app);

var signalClients = [];
var rooms = {};

app.use('/', express.static(__dirname + '/src'));
app.use('/chat', express.static(__dirname + '/src/chat'));
app.use('/signaltest', express.static(__dirname + '/src/signaltest'));
app.use('/room', express.static(__dirname + '/src/room'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
  });
  
// app.engine('html', require('ejs').renderFile);
// app.set('view engine', 'ejs');
app.set( 'port', process.env.PORT || 3000 );

// app.get('/signal/callee', function(req,res){
//   res.render('./src/signaltest/callee');
// });

// app.get('/signal/caller', function(req,res){
//   res.render('./src/signaltest/caller');
// });


app.get('/', function(req, res, next){
  res.send('Hello World');  
});

app.get('/roomlist', function(req, res, next){
  res.send(Object.keys(rooms));  
});

app.ws('/echo', function(ws, req) {
  ws.on('message', function(msg) {
    ws.send(msg);
  });
});

app.ws('/signal', function(ws, req) {

  signalClients.push(ws);

  ws.on('message', function(msg) {
    console.info('message : ' + msg + ', ' + signalClients.length);

    signalClients.forEach(function(tgt) {
        try {
          if (tgt && tgt != ws) {
            tgt.send(msg);
          }
        } catch (e) {
          console.info(e);
        }
      });
  });

  ws.on('close', function() {
    console.log('The signal server connection was closed!');
    const idx = signalClients.indexOf(ws);
     if (idx > -1) signalClients.splice(idx, 1);
  });      

});


function send(tgt, code, message) {
  if (tgt) {
      tgt.send(JSON.stringify({ code: code, msg: message}));
  }
}

function broadcast(room, from_ws, code, message) {
  room.forEach(function(tgt) {
      try {
          if (tgt != from_ws) {
              send(tgt, code, message);
          }
      } catch (e) {
          room.delete(tgt);
      }
  });
}

// app.ws('/room/:room/:nick',function(ws,req){
//   var room_name = req.params.room;
//   var nickname = req.params.nick;
//   broadcast(rooms[room_name], ws, '02', nickname);
// });

app.ws('/room/:room/', function(ws, req) {
  try {
    console.info(req.params);
    var room_name = req.params.room;
    var room_pass = req.query.pass;
    if(room_pass == undefined) room_pass = '';
    if (!(room_name in rooms)) {
      console.info({ room: room_name, pass: room_pass }, "new room created");
      rooms[room_name] = new Set([ws]);
      rooms[room_name].pass = room_pass;
    } else {
      console.info(room_name + ' : ' + rooms[room_name].size);      
      if (rooms[room_name].size >= 2) {
        var errmsg = {code : '99', msg : 'can not enter more than two client' };
        ws.send(JSON.stringify(errmsg));
        ws.close();
      }
      else {
        if(rooms[room_name].pass == room_pass){
          rooms[room_name].add(ws);
          if (rooms[room_name].size == 2) {
            broadcast(rooms[room_name], null, '01', 'start');
          }
        }
        else {
          var errmsg = {code : '99', msg : 'invalid password' };
          ws.send(JSON.stringify(errmsg));
          ws.close();
        }
      }    
    }

    var room = rooms[room_name];

    ws.on('close', function() {
      console.log('The connection was closed!');
      room.forEach(function(tgt){
        try {
          if (tgt == ws) {
            room.delete(tgt);
            if (room.size == 0) {
              delete rooms[room_name];
            }
          }
        } catch (e) {
          console.error(e);
        }
      });      
    });

    ws.on('message', function(msg) {
        broadcast(room, ws, '00', msg);
    });
  } catch (error) {
    console.error(error);    
  }    
});

// app.listen(port)사용하면 ws가 안된다.
app.listen(app.get( 'port' ), function(){
  console.log( 'Express server listening on port ' + app.get( 'port' ));
});