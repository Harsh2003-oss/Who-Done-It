const express = require('express');
const app = express();

const PORT = 3000;

app.post('/try',(req,res)=>{
console.log("recieved")
res.status(200);
})


app.listen(PORT,()=>{
console.log("listnening on")
})