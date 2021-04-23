const express = require('express');
const ejs = require("ejs");
const bodyParser = require("body-parser");
const app = express()
const mongoose = require('mongoose');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

mongoose.connect('mongodb+srv://AdminD:Franz1994@cluster0.124kv.mongodb.net/DuneDB?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});

const gameSchema = {
  name:String,
  faction:String,
  soloWin:Number,
  allianceWin:Number
}

const Game = mongoose.model('Game', gameSchema)

const playerSchema = {
  name: String,
  score:Number,
  gamesPlayed:Number,
  soloWins:Number,
  allianceWins:Number,
  faction:Array,
  logoNum:Number,
  games: [gameSchema]
}

const Player = mongoose.model('Player', playerSchema);

app.get('/', (req, res) => {
  let rank=0
  Player.find().sort({score:-1}).exec(function(err,foundPlayers){
    res.render('index.ejs',{foundPlayers:foundPlayers,rank:rank})
  })
})

app.get('/login',(req,res)=>{

  res.render("login.ejs")
})

app.get("/admin",(req,res)=>{
  let rank=0
  Player.find().sort({score:-1}).exec(function(err,foundPlayers){
    res.render('admin.ejs',{foundPlayers:foundPlayers,rank:rank})
  })
})

app.get("/rules",(req,res)=>{
  
  res.render("rules.ejs")
})

app.get("/playerdash/:paramName",(req,res)=>{
  clickedId=req.params.paramName
  Player.findOne({_id:clickedId},function(err,clickedPlayer){
    res.render("playerdash.ejs",{clickedPlayer:clickedPlayer})
  })

})

app.get('/about', (req, res) => {

    res.render('about.ejs')
  })

app.post("/login",(req,res)=>{
  uName=req.body.username
  password=req.body.passs
  if (uName==="Dune" && password==="SpiceMustFlow"){
    let rank=0
    Player.find().sort({score:-1}).exec(function(err,foundPlayers){
      res.render('admin.ejs',{foundPlayers:foundPlayers,rank:rank})
    })
  }else{
    res.render("loginfailed.ejs")
  }
})

app.post("/admin",(req,res)=>{
  newPlayern=req.body.players
  fact=req.body.faction
  var soloInc=0
  var allInc=0
  if(req.body.soloW==1){
    soloInc=1
  }else{inc=0}
  if(req.body.allW==1){allInc=1}else{allInc=0}

  const game = new Game({
    name:newPlayern,
    faction:fact,
    soloWin:soloInc,
    allianceWin:allInc
  });
  game.save().then(() => console.log('succesfully saved new game'));

  Player.findOne({name:newPlayern},function(err,foundPlayer){

    foundPlayer.soloWins=Number(foundPlayer.soloWins)+soloInc,
    foundPlayer.allianceWins=Number(foundPlayer.allianceWins)+allInc,
    foundPlayer.faction.push(fact),
    foundPlayer.gamesPlayed=foundPlayer.faction.length,
    foundPlayer.score=(foundPlayer.soloWins*2)+foundPlayer.allianceWins
    foundPlayer.games.push(game)
      foundPlayer.save().then(()=>console.log("succesfully updated"));
      res.redirect("/admin")
})
  })

app.post("/newplayer",(req,res)=>{
  const player = new Player({ name:req.body.newPlayer,
score:0,
soloWins:0,
allianceWins:0,
gamesPlayed:0,
logoNum:Math.floor(Math.random()*30)+1
});
player.save().then(() => console.log('succesfully saved new player'));
res.redirect("/admin")
})

app.post("/changeProfile",(req,res)=>{
  Player.findOne({name:req.body.playah},function(err,foundPlayer){
      foundPlayer.logoNum= Math.floor(Math.random()*30)+1;
      foundPlayer.save().then(()=>console.log("Successfully updated picture"));
      res.redirect("/playerdash/"+foundPlayer._id)
})
})
app.post("/deleteplayer", (req,res)=>{
  Player.deleteOne({name:req.body.playerstodel},function(err){
    if (err){console.log(err)}else{console.log("succesfully deleted player")}
    res.redirect("/admin")
  })
})

app.listen(process.env.PORT || 3000,function(){
  console.log("Server is up and running")
});
