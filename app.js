const { json } = require('express');
const express = require('express');
const fs = require('fs');
const bodyParser= require('body-parser')


const app = express();

//parse request body
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.redirect('/home');
})

app.get('/home', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
})

app.get('/create', (req, res) => {
    res.sendFile(__dirname + '/views/create.html')
})

app.set('view engine', 'ejs')

app.get('/users', (req, res) => {
    res.render(__dirname + '/views/users.ejs', {users: getUsers()})
})

app.get('/user/edit/(:id)', (req, res) => {
    const user = getUserById(req.params.id);
    res.render(__dirname + '/views/edit.ejs', {user: user})
})


app.get('/user/list', (req, res) => {
    const users = getUsers();
    res.send(users);
})

app.post('/user/create', (req, res) =>{
    const user = req.body;
    
    //validate user
    
    if(user.username === '' || user.password == ''){
        return (res.status(401)).send({success : false, msg: 'The username or password is required'})
    }
    
    //existing user
    const userExist = getUsers();

    const findExist = userExist.find(usr => usr.username.toLowerCase() === user.username.toLowerCase());
    if(findExist){
        return res.status(409).send({success : false, msg: 'The username is taken'})
    }

    //create user
    user.id = Date.now().toString(36) + Math.random().toString(36).substring(2);

    userExist.push(user)
    saveUser(userExist);

    return res.status(200).redirect("/");
    //.send({success: true, msg: 'User Created'})
})

app.delete('/user/delete/', (req, res) => {
    const userId = req.body.id;

    const users = getUsers();

    const filter = users.filter(usr => usr.id !== userId);
    console.log(filter)

    if(users.length === filter.length){
        return res.status(409).send({success : false, msg: 'The user does not exists'})
    }

    saveUser(filter);
    return res.status(200).send({success: true, msg: 'User removed successfully'});

})

app.patch('/user/update' , (req,res) =>{
    console.log("hey")
    const id = req.body.id;
    const user = req.body;
    const users = getUsers();

    var findExist = users.find(usr => usr.id === id);

    if(!findExist){
        return res.status(409).send({success : false, msg: 'The user does not exists'})
    }

    const updateUser = users.filter(usr => usr.id !== id);

    updateUser.push(user);

    saveUser(updateUser);

    return res.status(200).send({success: true, msg: 'User updated successfully'}).redirect("/users");

})

const getUsers =  () => {
    const jsonData = fs.readFileSync('users.json');
    return JSON.parse(jsonData);   
}


const getUserById = (id) =>{
    const users = getUsers();
    const user = users.find(usr => usr.id === id)
    return user;
}

const saveUser = (data) =>{
    const stringfyData = JSON.stringify(data);
    fs.writeFileSync('users.json', stringfyData);
}

const port = process.env.PORT || 3005;
//configure the server port
app.listen(port, () => { 
    console.log(`Server is running on port ${port}`)
});