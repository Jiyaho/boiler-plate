const { User } = require("../models/User");

let auth = (req, res, next) => {
  // 인증 처리 하는 곳

  // 클라이언트 쿠키에서 토큰을 가져온다.
  let token = req.cookies.x_auth;

  // 토큰을 복호화(decode)한 후 유저를 찾는다.
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user) return res.json({ isAuth: false, error: true }); // 해당 유저가 없는 경우

    // 해당 유저가 있는 경우
    req.token = token;
    req.user = user;
    // req에 token과 user를 넣어주는 이유는 index.js에서 사용할 수 있도록 하는 코드
    next(); // middleware인 auth에서 다음 단계인 save로 넘어가도록 하는 코드
  });
};

module.exports = { auth };
