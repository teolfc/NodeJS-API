const express = require('express');
const fs = require('fs')
const app = express();
const port = 3000;

app.use(express.json());

const save = (data) => {
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync('./data.json', json);
}

app.get('/', (req, res) => {
  res.status(200).send("Dobrodosli!");
});

// Get user by id
app.get('/users/:id', (req, res) => {
  fs.readFile('./data.json', 'utf-8', (err, data) => {
    if(err) throw err;

    const users = JSON.parse(data).users;
    const user = users.find(user => user.id === parseInt(req.params.id));

    if(!user){
      res.status(400).send("Unable to find user");
    }
    else{
      res.status(200).send(user);
    } 
  });
});

// Get post by id
app.get('/posts/:id', (req, res) => {
  fs.readFile('./data.json', (err, data) => {
    if(err) throw err;

    const posts = JSON.parse(data).posts;
    const post = posts.find(post => post.id === parseInt(req.params.id));

    if(!post){
      res.status(404).send("Unable to find post!");
    }
    else{
      res.status(200).send(post);
    }
  });
});

// Get all posts in range of 2 dates
app.get('/posts', (req, res) => {
  fs.readFile('./data.json', 'utf8', (err, data) => {
    if (err) throw err;

    const allPosts = JSON.parse(data).posts;

    const start = new Date(req.query.start);
    const end = new Date(req.query.end);

    const filtered = allPosts.filter((post) => {
      const date = new Date(post.last_update);
      return (date >= start) && (date <= end);
    });
    res.status(200).send(filtered);
  });
});

// Post method to change email by user id
app.post('/users/emails/:id', (req, res) => {
  fs.readFile('./data.json', 'utf8', (err, data) => {
    if (err) throw err;

    const parsed = JSON.parse(data);
    const user = parsed.users.find((u) => u.id === parseInt(req.params.id));

    if(!user)
      res.status(404).send("User not found");

    user.email = req.body.email;
    save(parsed);
    res.status(200).send(user);
  });
});

// Put method that allows creating a new post
app.put('/posts', (req, res) => {
  fs.readFile('./data.json', 'utf8', (err, data) => {
    if (err) throw err;
    const parsedData = JSON.parse(data);
    const { title, body, user_id } = req.body;
    const last_update = new Date().toISOString();
    const newPost = { id: parsedData.posts.length + 1, user_id, title, body, last_update };
    parsedData.posts.push(newPost);
    save(parsedData); 
    res.send(newPost);
  });
});

app.listen(port, () => {
  console.log('Server started on port 3000');
}); 