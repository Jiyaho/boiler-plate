const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true, // trim: 유저가 입력한 스페이스 빈 공간을 없애주는 코드
    unique: 1, // 여러 유저가 중복된 이메일주소를 쓸 수 없게끔하는 코드
  },
  password: {
    type: String,
    maxlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    // 사용자 권한을 분류
    type: Number,
    default: 0, // 사용자 권한 디폴트값
  },
  image: String,
  token: {
    // 유효성 관리
    type: String,
  },
  tokenExp: {
    // 토큰 유효기간
    type: Number,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = { User }; // 다른 컴포넌트에서도 쓸 수 있도록 export
