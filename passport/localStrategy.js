const localStrategy = require("passport-local").Strategy;

module.exports = passport => {
  passport.use(
    new localStrategy(
      {
        usernameField: "id",
        passwordField: "pwd"
      },
      (id, pwd, done) => {
        const user = {
          id: "test",
          pwd: "1234"
        };

        if (id === user.id && pwd === user.pwd) {
          console.log("localStrategy에서 id,pw 조회 성공");
          done(null, user);
        }
      }
    )
  );
};