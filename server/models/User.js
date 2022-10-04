const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10; // 10자리 소스로 salt생성
const jwt = require("jsonwebtoken");

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
    // maxlength: 5,
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

// mongoose method pre('save', 동작할함수입력): save하기 전 동작할 함수 입력
// parameter 'next': index.js의 save가 실행되도록 넘겨줌
userSchema.pre("save", function (next) {
  var user = this; // userSchema의 Object들을 가리킴
  // user가 password 값을 변경할때만 실행(비밀번호 외의 정보들을 변경할 때는 아래 작업을 실행하지 않음)
  if (user.isModified("password")) {
    // 유저 비밀번호 암호화: genSalt(salt 생성하는 코드)
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err); // err발생 시 user.save로 넘어감
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash; // 성공 시, 유저의 plain password를 hash(암호화된 코드)로 표출
        // hash의 첫번째 인자: myPlaintextPassword (user가 입력한 실질적인 password)
        // 따라서 여기선, user.password를 hash의 첫번째 인자로 넣는다.
        next(); // 완료 후 next로 넘겨 user.save되도록 함
      });
    });
  } else {
    next(); // 요청이 비밀번호 변경이 아닌 경우 바로 save하도록 넘겨줌
  }
});

//Login 요청 시, Client가 요청한 것과 DB에 있는 데이터가 맞는지 비교하는 method 생성: comparePassword
userSchema.methods.comparePassword = function (plainPassword, cb) {
  //plainPassword를 암호화한 hashedPassword와 같은지 체크
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    //plainPassword를 다시 암호화해서 DB에 있는 hashedPassword와 같은지를 체크해야하기에 bcrypt 사용
    if (err) return cb(err); //false일때.
    cb(null, isMatch); //true일때 즉, callback할 내용: null(err없으니 보낼 err메세지 없음), isMatch는 true
  });
};

userSchema.methods.generateToken = function (cb) {
  // jsonwebtoken 이용하여 token생성하기
  var user = this;
  var token = jwt.sign(user._id.toHexString(), "secretToken");
  //user._id: DB에 있는 유저들의 _id값임, toHexString(): String형태로 변환하기 위함.
  //user._id + 'secretToken' = token
  user.token = token; //위와 같이 생성한 토큰을 user model의 token으로 넣어주는 코드
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user); //save 성공한 경우
  });
};

userSchema.statics.findByToken = function (token, cb) {
  var user = this;

  // 토큰을 decode한다.
  jwt.verify(token, "secretToken", function (err, decoded) {
    // decoded: user._id가 나옴
    // 유저ID를 통해 유저를 찾고 클라이언트에서 가져온 토큰과 DB에 보관된 토큰의 일치여부 확인
    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) return cb(err); // 에러있는 경우, 에러를 callback
      cb(null, user); // 에러가 없는 경우, 유저 정보 callback
    });
  });
};
const User = mongoose.model("User", userSchema); // Model로 Schema를 감싸준다.

module.exports = { User }; // 다른 컴포넌트에서도 쓸 수 있도록 export
