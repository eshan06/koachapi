const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

const users = []; // In-memory user storage

// Secret Key for JWT
const SECRET_KEY = process.env.JWT_KEY;

// Register endpoint
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    users.push({ username, password: hashedPassword });
    res.status(201).send({ message: 'User registered successfully!' });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(404).send({ message: 'User not found!' });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
        return res.status(401).send({ message: 'Invalid password!' });
    }

    const token = jwt.sign({ id: user.username }, SECRET_KEY, { expiresIn: 86400 }); // 24 hours
    res.status(200).send({ auth: true, token });
});

// Get User Profile endpoint
app.get('/getuser', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(401).send({ message: 'No token provided!' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(500).send({ message: 'Failed to authenticate token.' });
        }

        res.status(200).send({
            message: `Welcome ${decoded.id}!`,
            username: decoded.id
        });
    });
});

// Update User Profile endpoint
app.put('/update', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(401).send({ message: 'No token provided!' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(500).send({ message: 'Failed to authenticate token.' });
        }

        // Find the user profile based on the decoded ID
        const user = users.find(u => u.username === decoded.id);
        if (!user) {
            return res.status(404).send({ message: 'User not found!' });
        }

        // Update user profile details
        const { username, password } = req.body;
        if (username) {
            res.status(200).send({ message: ` Username changed from ${user.username} to ${username} `});
            user.username = username;
            console.log(user.username);
        }
        if (password) {
            res.status(200).send({ message: ` Username changed from ${user.password} to ${password} `});
            user.password = bcrypt.hashSync(password, 8);
            console.log(user.password);
        }

        res.status(200).send({ message: 'User profile updated successfully!' });
    });
});

// Delete User Profile endpoint
app.delete('/delete', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(401).send({ message: 'No token provided!' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(500).send({ message: 'Failed to authenticate token.' });
        }

        // Find the user index based on the decoded ID
        const userIndex = users.findIndex(u => u.username === decoded.id);
        if (userIndex === -1) {
            return res.status(404).send({ message: 'User not found!' });
        }

        // Remove the user from the array
        users.splice(userIndex, 1);

        res.status(200).send({ message: 'User profile deleted successfully!' });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 