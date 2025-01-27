// requirements
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require("./config")
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const openApiSpec = YAML.load('openapi.yaml');
const app = express();
app.use(express.json());

// Documentation path
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// Secret Key for JWT
const SECRET_KEY = process.env.JWT_KEY;

// Define a route to handle the root path
app.get('/', (req, res) => {
    res.send('Welcome to the API');
});

// Register endpoint
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).send({ message: 'Username and password are required' });
    }
    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(409).send({ message: 'User already exists' });
    }
    const hashedPassword = bcrypt.hashSync(password, 8);
    
    try {
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).send({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).send({ message: 'Error registering user', error: err });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send({ message: 'Invalid password' });
        }

        const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: 86400 }); // 24 hours
        res.status(200).send({ auth: true, token });
    } catch (err) {
        res.status(500).send({ message: 'Error logging in', error: err });
    }
});

// Get User endpoint
app.get('/getuser', async (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(401).send({ message: 'No token provided' });
    }

    jwt.verify(token, SECRET_KEY, async (err, decoded) => {
        if (err) {
            return res.status(500).send({ message: 'Failed to authenticate token.' });
        }

        try {
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(404).send({ message: 'User not found' });
            }

            res.status(200).send({
                message: `Welcome ${user.username}`,
                username: user.username
            });
        } catch (err) {
            console.error('Error fetching user:', err);
            res.status(500).send({ message: 'Error fetching user', error: err.message });
        }
    });
});

// Update User endpoint
app.put('/update', async (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(401).send({ message: 'No token provided' });
    }

    jwt.verify(token, SECRET_KEY, async (err, decoded) => {
        if (err) {
            return res.status(500).send({ message: 'Failed to authenticate token.' });
        }

        try {
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(404).send({ message: 'User not found' });
            }
            const { username, password } = req.body;

            if (username) {
                user.username = username;
                console.log(`Username changed to ${username}`);
            }
            if (password) {
                user.password = bcrypt.hashSync(password, 8);
            }

            await user.save();
            res.status(200).send({ message: 'User profile updated successfully' });
        } catch (err) {
            console.error('Error updating user:', err);
            res.status(500).send({ message: 'Error updating user', error: err.message });
        }
    });
});

// Delete User endpoint
app.delete('/delete', async (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(401).send({ message: 'No token provided' });
    }

    jwt.verify(token, SECRET_KEY, async (err, decoded) => {
        if (err) {
            return res.status(500).send({ message: 'Failed to authenticate token.' });
        }

        try {
            const deletionResult = await User.deleteOne({ _id: decoded.id });
            if (deletionResult.deletedCount === 0) {
                return res.status(404).send({ message: 'User not found' });
            }

            res.status(200).send({ message: 'User profile deleted successfully' });
        } catch (err) {
            console.error('Error deleting user:', err);
            res.status(500).send({ message: 'Error deleting user', error: err.message });
        }
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 

module.exports = app;