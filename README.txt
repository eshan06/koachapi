# Express Login API

This is a simple Express.js API for user registration, login, and user management.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/eshan06/koachapi.git
   ```

2. Install dependencies:
   ```bash
   cd express-login-api
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add the following environment variables to the `.env` file:
     ```
     SERVER=your_mongodb_connection_string
     SECRET_KEY=your_secret_key
     ```

4. Start the server:
   ```bash
   cd ..
   npm start
   ```

## Endpoints

### Register a User
- **URL:** `/register`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "username": "your_username",
    "password": "your_password"
  }
  ```
- **Response:**
  - `201 Created` on successful registration
  - `500 Internal Server Error` on registration error

### Login
- **URL:** `/login`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "username": "your_username",
    "password": "your_password"
  }
  ```
- **Response:**
  - `200 OK` with authentication token on successful login
  - `401 Unauthorized` for invalid password
  - `404 Not Found` for user not found
  - `500 Internal Server Error` on login error

### Get User Information
- **URL:** `/getuser`
- **Method:** `GET`
- **Request Header:**
  - `x-access-token`: Authentication token
- **Response:**
  - `200 OK` with user information
  - `401 Unauthorized` for missing token
  - `500 Internal Server Error` on authentication error

### Update User
- **URL:** `/update`
- **Method:** `PUT`
- **Request Header:**
  - `x-access-token`: Authentication token
- **Request Body:**
  ```json
  {
    "username": "new_username",
    "password": "new_password"
  }
  ```
- **Response:**
  - `200 OK` on successful update
  - `401 Unauthorized` for missing token
  - `500 Internal Server Error` on authentication error or update error

### Delete User
- **URL:** `/delete`
- **Method:** `DELETE`
- **Request Header:**
  - `x-access-token`: Authentication token
- **Response:**
  - `200 OK` on successful deletion
  - `401 Unauthorized` for missing token
  - `500 Internal Server Error` on authentication error or deletion error

## Running Tests

To run the tests, use the following command:
   ```bash
   npx jest --detectOpenHandles
   ```

This command will execute the test suite for the application and provide feedback on the functionality and correctness of the code.
After running the tests, you can review the test results to ensure that the application is functioning as expected.

## Accessing API Documentation

To access the API documentation, navigate to the following URL in your web browser:
http://localhost:3000/api-docs

This URL will display the Swagger UI interface, providing detailed documentation for the API endpoints, request and response formats, and other relevant information.
