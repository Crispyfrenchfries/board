const express = require('express');
const app = express();
const port = 3000
var template = require('./lib/template');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var compression = require('compression');
var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'abcd1',
  database : 'selfmk'
});
db.connect();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());

//home
app.get('/', function(req, res) {
  db.query(`SELECT * FROM post` , function(error,posts){
    var title = 'welcome';
    var description = 'hello, node';
    var list = template.list(posts);
    var html = template.HTML(title,
      `<p><a href="/login">LOGIN</a></p>
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

app.get('/login',function(req,res){
  var title = "로그인"
  var html = template.HTML(title,`<form action ="/login_process" method="post"> 
  <p><input type="text" name="id" placeholder="아이디를 입력하세요"><p>
  <p><input type="password" name="pwd" placeholder="비밀번호를 입력하세요"><p>
  <button id="login_button">로그인</button> 
  </form>`,"","","","");
  res.send(html);
});

app.post('/login_process',function(req,res){
  var body = req.body;
  
});

app.listen(port, function() {
  console.log('connected');  
});