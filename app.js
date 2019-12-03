const express = require('express');
const app = express();
const port = 3000
var template = require('./lib/template');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var compression = require('compression');
var passport = require('./passport/localStrategy');
var session = require('express-session');
var passportConfig=require('./passport');
var ejs = require('ejs');
var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'abcd1',
  database : 'selfmk'
});
db.connect();

//app.use(express.static('public'));
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());                    // passport 동작
app.use(passport.session());  

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "pyh",
    cookie: {
      httpOnly: true,
      secure: false
    }
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "view"));

app.get("/", (req, res) => {
  res.render("index");
});

passportConfig(passport);

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (authError, user, info) => {
    return req.login(user, loginError => {
      if (loginError) {
        console.error(loginError);
      }
    });
  })(req, res, next);

  res.redirect("/success");
});

app.get("/success", (req, res, next) => {
  res.render("success", {
    user: req.user
  });
});
// const local = require("./localStrategy");

// module.exports = passport => {
//   passport.serializeUser((user, done) => {   // req.login()에서 넘겨준 user값
//     done(null, user.id);                     // user에서 id만 세션에 저장
//   });

//   // 메모리에 한번만 저장
//   passport.deserializeUser((id, done) => {  // 매개변수 id는 세션에 저장됨 값(req.session.passport.user)
//     done(null, id);
//   });

//   local(passport);
// };




//home
app.get('/', function(req, res) {
  db.query(`SELECT * FROM post` , function(error,posts){
    var title = 'welcome';
    var description = 'hello, node';
    var list = template.list(posts);
    var html = template.HTML(title,
      `<p><a href="/login_process">LOGIN</a></p>
      <p><a href="/join">JOIN</a></p>`,list,
    `<h2>${title}</h2>${description}`,
    `<a href="/create">create</a>`);
    res.send(html);
  });  
});
//글 목록
app.post('/post/delete_process',function(req,res){
  var body = req.body;
  db.query(`DELETE FROM post WHERE index_post=?`,[body.id],function(err,result){
    res.writeHead(302,{location:`/`})
    res.end();
  });
});
app.get('/post', function(req,res){
  db.query(`SELECT * FROM post`,function(err1,posts){
    db.query(`SELECT * FROM post WHERE index_post = ?`,[req.query.id],function(err2,post){
      var title = post[0].title;
      var description = post[0].description;
      var list = template.list(posts);
      var html = template.HTML(title,list,
        `<h2>${title}</h2>
        <p>${description}</p>`,
        `<a href="/create">create</a>
        <a href="/update?id=${req.query.id}">update</a>
        <form action="delete_process" method="post">
        <input type="hidden" name="id" value="${req.query.id}">
        <input type="submit" value="delete">
        </form>`,"");
        res.send(html);
    });
  })
});

app.get('/create',function(req,res){
  db.query(`SELECT * FROM post`, function(err1,posts){
    var title = "글 작성";
    var list = template.list(posts);
    var html = template.HTML(title,list,
    `
      <form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
      `,"","",""
      );
    res.send(html);
  });
});

app.post('/create_process',function(req,res){
  var body = req.body;
  var title = body.title;
  var description = body.description;
  db.query(`INSERT INTO post ( title, description,  datetime, user_id) VALUES(?,?,NOW(),?)`,[title,description,1],
  function(err,result){
    res.writeHead(302, {location:`/?post=${result.insertId}`});
        res.end('success');
  });
});

app.get('/update',function(req,res){
  db.query(`SELECT * FROM post`, function(err1,posts){
    db.query(`SELECT * FROM post WHERE index_post=?`,[req.query.id],function(err2, post){
      var list = template.list(posts);
      var html = template.HTML(post[0].title,list,
      `
      <form action="/update_process" method="post">
      <input type="hidden" name="id" value="${post[0].index_post}">
      <p><input type="text" name="title" placeholder="title" value="${post[0].title}"></p>
      <p>
        <textarea name="description" placeholder="description">${post[0].description}</textarea>
      </p>
      <p>
        <input type="submit">
      </p>
      </form>
      `,"","")
      res.send(html);
    });
  });  
});

app.post('/update_process',function(req,res){
  var body = req.body;
  db.query(`UPDATE post SET title=?, description=?, user_id=1 WHERE index_post=?`,[body.title, body.description, body.id],function(err,result){
    res.writeHead(302, {location:`/post/?id=${body.id}`});
    res.end('');
  })
});

app.get('/join',function(req,res){
  var title = '회원가입';
  var html =template.HTML(title,"",
  `<form action="/join_process" method="post">
  <p><input type="text" name="id" placeholder="아이디를 입력하세요"></p>
  <p><input type="text" name="name" placeholder="이름을 입력하세요"></p>
  <p><input type="password" name="pwd" placeholder="비밀번호를 입력하세요"></p>
  <button type="submit">가입</button> <button><a href="/">취소</a></button>
</form>`,"","","")
res.send(html);
});

app.post('/join_process',function(req,res){
  var body = req.body;
  var id = body.id;
  var name = body.name;
  var pwd = body.pwd;
  db.query(`INSERT INTO user (id,name,pwd) VALUES(?,?,?)`,[id,name,pwd],function(err, result){
    res.writeHead(302, {location:`/`});
    res.end('');
  });
});

// app.get('/login_process',function(req,res){
//   var title = "로그인"
//   var html = template.HTML(title,`<form action ="/login" method="post"> 
//   <p><input type="text" name="id" placeholder="아이디를 입력하세요"><p>
//   <p><input type="password" name="pwd" placeholder="비밀번호를 입력하세요"><p>
//   <button id="login_button">로그인</button> 
//   </form>`,"","","","");
//   res.send(html);
// });

// app.post('/login_process',function(req,res){
//   var body = req.body;
  
// });

app.listen(port, function() {
  console.log('connected');  
});