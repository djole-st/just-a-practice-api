const { json } = require('express');
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();



function verifyToken(req, res, next){
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  //console.log(req.headers);
  //console.log(token);
  //if there is no token, the request is unauthorized
  if (!token){
      return res.status(403).send("Unauthorised");
  }

  let payload
  try{
      //use the jwt.verify method to verify the access token
      //throws an error if the token has expired or has a invalid signature
      payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      //console.log(payload);
      next();
  }
  catch(e){
      //if an error occured return request unauthorized error
      //console.log(e.message);
      return res.status(401).send();
  }
}



router.post('/authorise',(req,res)=>{
  var username = req.body.username;
  var password = req.body.password;
  var hash = crypto.createHash('sha1');
  data = hash.update(password, 'utf-8');
  hashpass= data.digest('hex');
  
  var email = req.body.email;
  let db =  new sqlite3.Database('./database.db', (err) => {
    if (err) {
      return console.error(err.message);
    }

  });

  let sql = 'select * from users where username=? and password=? and email=?';
  db.get(sql, [username,hashpass,email], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    if(row == null)
    {
      res.status(401).end(`Wrong credentials`);
    }
    else
    {
      //ulogovao se kako treba
      let payload = {username: username};
      let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: process.env.ACCESS_TOKEN_LIFE
      });
      res.status(200).send(accessToken);
    }
  });
  db.close();
});

router.post('/authorised',verifyToken,(req,res)=>{
  res.statusCode = 200;
  res.send("Welcome To Authorised Person Only!");
});
/*
router.get('/hash',(req,res)=>{
  data = hash.update('nodejsera', 'utf-8');
  gen_hash= data.digest('hex');
  console.log("hash : " + gen_hash);
});
*/
router.get('/list',(req,res)=>{
    let sql = 'select * from users';

    let db =  new sqlite3.Database('./database.db', (err) => {
        if (err) {
          return console.error(err.message);
        }
    });

    db.all(sql, (err, results)=>{
        if(err){
            console.log(err.message);
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(results));
    });

    db.close();
});

router.get('/get/:id',(req,res)=>{

  let db =  new sqlite3.Database('./database.db', (err) => {
      if (err) {
        return console.error(err.message);
      }
      //console.log('Connected to the SQlite database.');
  });

  var id = req.params.id;

  let sql = 'select * from users where id=?';
  db.get(sql, [id], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    if(row == null)
    {
      res.status(404).end(`User with id ${id} was not found`);
    }
    res.status(200).end(JSON.stringify(row));
  });
  db.close();
});

router.get('/get',(req,res)=>{

  let db =  new sqlite3.Database('./database.db', (err) => {
      if (err) {
        return console.error(err.message);
      }
  });

  var id = req.query.id;
  let sql = 'select * from users where id=?';
  db.get(sql, [id], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    if(row == null)
    {
      res.status(404).end(`User with id ${id} was not found`);
    }
    res.status(200).end(JSON.stringify(row));
  });

  db.close();
});

function dataCheck(req,res,next){
  var numbersCheck = /[0-9]+/;
  var specialCharactersCheck = /[!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]+/;

  var username = req.body.username;

  if(numbersCheck.test(username))
  {
    res.status(400).end(`Username must not contain numbers`);
  }
  else if(specialCharactersCheck.test(username))
  {
    res.status(400).end(`Username must not contain special characters`);
  }
  else{
    next();
  }

}

router.post('/add',dataCheck,(req,res)=>{

    let db =  new sqlite3.Database('./database.db', (err) => {
        if (err) {
          return console.error(err.message);
        }
    });

    var a = req.body.username;
    var b = req.body.password;
    var hash = crypto.createHash('sha1');
    let data = hash.update(b, 'utf-8');
    let hashpass= data.digest('hex');
    var c = req.body.email;

    var stmt = db.prepare("insert into users values (null,?,?,?)");
    stmt.run(a,hashpass,c);
    stmt.finalize();

    db.close();

    res.status(200).end("Successfully added");
});

function checkIfExistsQuery(req,res,next){
  let db =  new sqlite3.Database('./database.db', (err) => {
    if (err) {
      return console.error(err.message);
    }
  });

  var id = req.query.id;

  let sql = 'select * from users where id=?';

  db.get(sql, [id], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    if(row == null)
    {
      res.status(404).end(`User with id ${id} was not found`);
    }
    else
    {
      next();
    }
  });
}

function checkIfExistsParams(req,res,next){
  let db =  new sqlite3.Database('./database.db', (err) => {
    if (err) {
      return console.error(err.message);
    }
  });

  var id = req.params.id;

  let sql = 'select * from users where id=?';

  db.get(sql, [id], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    if(row == null)
    {
      res.status(404).end(`User with id ${id} was not found`);
    }
    else
    {
      next();
    }
  });
}



router.delete('/delete/:id',verifyToken,checkIfExistsParams,(req,res)=>{

  let db =  new sqlite3.Database('./database.db', (err) => {
      if (err) {
        return console.error(err.message);
      }
  });

  var a = req.params.id;

  var stmt = db.prepare("delete from users where id = ?");
  stmt.run(a);
  stmt.finalize();

  db.close();

  res.status(200).end("Successfully deleted");
});

router.get('/delete',verifyToken,checkIfExistsQuery,(req,res)=>{

  let db =  new sqlite3.Database('./database.db', (err) => {
      if (err) {
        return console.error(err.message);
      }
  });

  var a = req.query.id;

  var stmt = db.prepare("delete from users where id = ?");
  stmt.run(a);
  stmt.finalize();

  db.close();

  res.status(200).end("Successfully deleted");
});


function checkIfUserExists(req,res,next){
  let db =  new sqlite3.Database('./database.db', (err) => {
    if (err) {
      return console.error(err.message);
    }
  });

  var username = req.body.username;
  var password = req.body.password;
  var hash = crypto.createHash('sha1');
  let data = hash.update(password, 'utf-8');
  let hashpass= data.digest('hex');

  let sql = 'select * from users where username=? and password=?';
  db.get(sql, [username,hashpass], (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    if(row == null)
    {
      res.status(404).end("User not found.");   
    }
    else
    {   
      db.close();
      next();     
    }
  });
  
}

//only password or email possible as what to update
router.post('/update/:what',checkIfUserExists,(req,res)=>{
  var what = req.params.what;
  var value = '';
  var username = req.body.username;
  var password = req.body.password;
  var hash = crypto.createHash('sha1');
  let data = hash.update(password, 'utf-8');
  let hashpass= data.digest('hex');
  if(what == 'email')
  {
    value = req.body.email;
  }
  else if(what == 'password')
  {
    var hash2 = crypto.createHash('sha1');
    data2 = hash2.update(req.body.new_password, 'utf-8');
    hashpass2= data2.digest('hex');
    value = hashpass2;
  }
  else 
  {
    req.pause();
    res.statusCode = 404;
    res.end('Update Not Found');
  }

  let db =  new sqlite3.Database('./database.db', (err) => {
    if (err) {
      return console.error(err.message);
    }
  });

  var stmt = null;
  if(what == 'email')
  {
    stmt = db.prepare("update users set email = ? where username=? and password=?");
  }
  if(what == 'password')
  {
    stmt = db.prepare("update users set password = ? where username=? and password=?");
  }

  if(stmt)
  {
    stmt.run(value,username,hashpass);
    stmt.finalize((err) =>{
      if (err) {
        return console.error(err.message);
      }
    });
  }

  db.close();

  res.status(200).end("Successfully updated");
});


module.exports = router;