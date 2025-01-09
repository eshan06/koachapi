require('dotenv').config();

// app.test.js
const request = require('supertest');
const app = require('./app');
const mongoose = require('mongoose');

beforeAll(async () => {
  await mongoose.connect(process.env.SERVER, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
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

  it('should handle registration error', async () => {
    const response = await request(app)
      .post('/register')
      .send({ username: 'testuser' }); // Missing password

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Error registering user');
  });
});

// Test /login endpoint
describe('POST /login', () => {
  it('should log in a user with valid credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'validuser', password: 'validpassword' });

    expect(response.status).toBe(200);
    expect(response.body.auth).toBe(true);
    expect(response.body.token).toBeDefined();
  });

  it('should handle invalid password', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'validuser', password: 'invalidpassword' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid password');
  });

  it('should handle user not found', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'nonexistinguser', password: 'somepassword' });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('should handle missing username', async () => {
    const response = await request(app)
      .post('/login')
      .send({ password: 'somepassword' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Username is required');
  });

  it('should handle missing password', async () => {
    const response = await request(app)
      .post('/login')
      .send({ username: 'validuser' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Password is required');
  });

  it('should handle empty request body', async () => {
    const response = await request(app)
      .post('/login')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Username and password are required');
  });
});

