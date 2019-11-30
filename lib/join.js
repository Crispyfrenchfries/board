module.exports ={ 
    joinHTML:function(join){
    return
    `
    <!doctype html>
    <html>
    <head>
    <title>WEB1 - 회원가입</title>
    <meta charset="utf-8">
    </head>
    <body>
      ${join}
    </body>
    </html>
    `;
  }
}