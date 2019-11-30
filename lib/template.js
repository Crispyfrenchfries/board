module.exports = {
  HTML:function (title,user,list,body,controll,replys){
  return `
    <!doctype html>
    <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      <h1><a href="/">게시판 만들기</a></h1>
      ${user}
      ${list}
      ${controll}
      ${body}
      ${replys}
    </body>
    </html>
  `;
},
list:function (posts){
  var list = '<ul>';
  var i =0;
  while(i<posts.length){
    list = list+`<li><a href="/post/?id=${posts[i].index_post}">${posts[i].title}</a></li>`;
    i=i+1;
    //console.log(posts[i]);
  }
  list = list + '</ul>';
  
  return list;
},
reply:function(replys){
  var reply_list ='<ul>';
  var i=0;
  while(i<replys.length){
    reply_list = reply_list+`<li><a>${replys[i].description}</a></li>`;
    i++;
  }
  reply_list =  reply_list + '</ul>';
  return reply_list;
}

}