const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const config = require("./config/key");
const { User } = require("./models/User");
const { auth } = require("./middleware/auth");

//"application/x-www-form-urlencoded" 형식의 데이터를 parse해 줌
app.use(bodyParser.urlencoded({ extended: true }));

//"application/json" 형식의 데이터를 parse해 줌
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require("mongoose");
mongoose
  .connect(config.mongoURI)
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => res.send("Hello World!"));

app.get("/api/hello", (req, res) => {
  res.send("안녕하세요~");
});

app.post("/api/users/register", (req, res) => {
  //회원 가입 시 필요한 정보들을 Client에서 가져오면 그 값들을 데이터 베이스에 넣어줌

  const user = new User(req.body); //유저가 입력한 로그인 정보들을 담고 있음
  user.save((err, userInfo) => {
    //save는 mongoDB method임
    if (err) return res.json({ success: false, err }); //error난 경우
    return res.status(200).json({
      //status(200)은 성공했을 때.
      success: true,
    });
  });
});

app.post("/api/users/login", (req, res) => {
  // 클라이언트에서 요청한 이메일을 데이터베이스에서 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다.",
      });
    }
    // 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });
      // 비밀번호까지 맞다면 Token을 생성하기.
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        // 토큰을 저장(쿠키, 로컬스토리지 등에 저장할 수 있음)
        // 쿠키에 저장하기위한 라이브러리 설치: cookieParser
        res
          .cookie("x_auth", user.token)
          .status(200) // 성공한 경우
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

app.get("/api/users/auth", auth, (req, res) => {
  // Authentication = true인 경우 (유저 인증 성공한 경우)
  // cf. role 0: 일반 유저, 그 이외: 관리자
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

app.get("/api/users/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

const port = 5000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
