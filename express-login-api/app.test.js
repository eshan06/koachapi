const request = require('supertest');
const app = require('./app');
const mongoose = require('mongoose');
const User = require('./config');

beforeAll(async () => {
  await mongoose.connect(process.env.SERVER, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

beforeEach(async () => {
  // Clear the User collection in the database
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
});

// Test /register endpoint
describe('POST /register', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/register')
      .send({ username: 'testuser', password: 'testpassword' });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully');
  });

  it('should handle registration error for an incomplete body (all cases)', async () => {
    // Missing password
    const response = await request(app)
      .post('/register')
      .send({ username: 'testuser' });
    // Missing username
    const response2 = await request(app)
      .post('/register')
      .send({ password: 'testpassword' })
    // Missing username and password
    const response3 = await request(app)
        .post('/register')
        .send({})
    expect(response.status).toBe(400); // Expect 400 Bad Request
    expect(response.body.message).toBe('Username and password are required');
    expect(response2.status).toBe(400); // Expect 400 Bad Request
    expect(response2.body.message).toBe('Username and password are required');
    expect(response3.status).toBe(400); // Expect 400 Bad Request
    expect(response2.body.message).toBe('Username and password are required');
  });

  it('should handle registration of a non-unique user', async () => {
    await request(app)
      .post('/register')
      .send({ username: 'testuser', password: 'testpassword' });

    const response = await request(app)
      .post('/register')
      .send({ username: 'testuser', password: 'testpassword' });

    expect(response.status).toBe(409); // Expect 400 Bad Request
    expect(response.body.message).toBe('User already exists');
  });
});

// Test /login endpoint
describe('POST /login', () => {
  it('should log in a user with valid credentials', async () => {
    await request(app)
      .post('/register')
      .send({ username: 'validuser', password: 'validpassword' });
    const response = await request(app)
      .post('/login')
      .send({ username: 'validuser', password: 'validpassword' });

    expect(response.status).toBe(200);
    expect(response.body.auth).toBe(true);
    expect(response.body.token).toBeDefined();
  });
  
  it('should not log in a user with invalid credentials (all cases)', async () => {
    await request(app)
      .post('/register')
      .send({ username: 'validuser', password: 'validpassword' });
    // Invalid user
    const response = await request(app)
      .post('/login')
      .send({ username: 'validuser', password: 'invalidpassword' });
    // Invalid user
    const response2 = await request(app)
      .post('/login')
      .send({ username: 'invaliduser', password: 'validpassword' });
    // Invalid user and pass
    const response3 = await request(app)
      .post('/login')
      .send({ username: 'invaliduser', password: 'invalidpassword' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid password');
    expect(response2.status).toBe(404);
    expect(response2.body.message).toBe('User not found');
    expect(response3.status).toBe(404);
    expect(response3.body.message).toBe('User not found');
  });
});

// Test /getuser endpoint
describe('GET /getuser', () => {
    it('should get user information with a valid token', async () => {
      await request(app)
        .post('/register')
        .send({ username: 'testuser', password: 'testpassword' });
      const loginResponse = await request(app)
        .post('/login')
        .send({ username: 'testuser', password: 'testpassword' });
      const token = loginResponse.body.token;

      const response = await request(app)
        .get('/getuser')
        .set('x-access-token', token);
  
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Welcome testuser');
      expect(response.body.username).toBe('testuser');
    });
  
    it('should handle missing token', async () => {
      // Attempt to retrieve user information without providing an authentication token
      const response = await request(app)
        .get('/getuser');
  
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No token provided');
    });
  
    it('should handle invalid token', async () => {
      const response = await request(app)
        .get('/getuser')
        .set('x-access-token', 'invalidtoken');
  
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to authenticate token.');
    });
  
    it('should handle user not found', async () => {
      // Registering a valid token, then deleting the user
      await request(app)
        .post('/register')
        .send({ username: 'testuser', password: 'testpassword' });
      const loginResponse = await request(app)
        .post('/login')
        .send({ username: 'testuser', password: 'testpassword' });
      const token = loginResponse.body.token;
      await request(app)
        .delete('/delete')
        .set('x-access-token', token);

      const response = await request(app)
        .get('/getuser')
        .set('x-access-token', token);
  
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
});

// Test /update endpoint
describe('PUT /update', () => {
  it('should update user information with a valid token (all cases)', async () => {
    await request(app)
      .post('/register')
      .send({ username: 'testuser', password: 'testpassword' });
    const loginResponse = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'testpassword' });
    const token = loginResponse.body.token;

    // update only username
    const response = await request(app)
      .put('/update')
      .set('x-access-token', token)
      .send({ username: 'updateduser' });
    // update only password
    const response2 = await request(app)
      .put('/update')
      .set('x-access-token', token)
      .send({ password: 'updatedpassword' });
    // update username and password
    const response3 = await request(app)
      .put('/update')
      .set('x-access-token', token)
      .send({ username: 'updateduser2', password: 'updatedpassword2' });

    expect(response.status).toBe(200);
    expect(response2.status).toBe(200);
    expect(response3.status).toBe(200);
  });

  it('should handle missing token', async () => {
    // no token provided
    const response = await request(app)
      .put('/update')
      .send({ username: 'updateduser', password: 'updatedpassword' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('should handle invalid token', async () => {
    // invalid authentication token
    const response = await request(app)
      .put('/update')
      .set('x-access-token', 'invalidtoken')
      .send({ username: 'updateduser', password: 'updatedpassword' });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Failed to authenticate token.');
  });
});

// Test /delete endpoint
describe('DELETE /delete', () => {
  it('should delete user profile with a valid token', async () => {
    await request(app)
      .post('/register')
      .send({ username: 'testuser', password: 'testpassword' });
    const loginResponse = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'testpassword' });
    const token = loginResponse.body.token;

    const response = await request(app)
      .delete('/delete')
      .set('x-access-token', token);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User profile deleted successfully');
  });

  it('should handle missing token', async () => {
    // missing authentication token
    const response = await request(app)
      .delete('/delete');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No token provided');
  });

  it('should handle invalid token', async () => {
    // invalid authentication token
    const response = await request(app)
      .delete('/delete')
      .set('x-access-token', 'invalidtoken');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Failed to authenticate token.');
  });

  it('should handle an invalid user', async () => {
    await request(app)
      .post('/register')
      .send({ username: 'testuser', password: 'testpassword' });
    const loginResponse = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'testpassword' });
    const token = loginResponse.body.token;
    await request(app)
      .delete('/delete')
      .set('x-access-token', token);

    // the user with this token does not exist anymore
    const response = await request(app)
      .delete('/delete')
      .set('x-access-token', token)
    
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  })
});