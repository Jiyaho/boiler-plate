const express = require("express");
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const { User } = require("./models/User");
const config = require("./config/key");

//"application/x-www-form-urlencoded" 형식의 데이터를 parse해 줌
app.use(bodyParser.urlencoded({ extended: true }));

//"application/json" 형식의 데이터를 parse해 줌
app.use(bodyParser.json());

const mongoose = require("mongoose");
mongoose
  .connect(config.mongoURI)
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.get("/", (req, res) => res.send("Hello World!"));

app.post("/register", (req, res) => {
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

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
