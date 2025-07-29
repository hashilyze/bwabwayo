const express = require('express')
const path = require('path');
const app = express()
const port = 5000

// use를 사용해서 미들웨어 추가 : 요청과 응답 객체를 수정 및 종료, request보내기
// express.static() 미들웨어 생성
app.use(express.static(path.join(__dirname, '..')));

// 모든 경로에 대해 콘솔
app.get('/', (req, res) => {
  res.send('Hello World!')
})

// 5000포트에서 요청을 들을 수 있게
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})