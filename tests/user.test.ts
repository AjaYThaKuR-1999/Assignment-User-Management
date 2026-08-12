import { Server } from 'http';
import { AddressInfo } from 'net';
import mongoose from 'mongoose';
import app from '../src/app';
import User from '../src/models/User';

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/user_management_test';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address() as AddressInfo;
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('User Management API Tests (v1)', () => {
  const validUserData = {
    name: 'Alice Smith',
    email: 'alice@example.com',
    phone: '+1-202-555-0143',
    company: 'Tech Solutions Inc',
    address: {
      city: 'San Francisco',
      zipcode: '94105',
      geo: {
        lat: 37.7749,
        lng: -122.4194
      }
    }
  };

  // 1. Create User
  describe('POST /api/v1/users - Create User', () => {
    it('should create a new user with valid payload', async () => {
      const res = await fetch(`${baseUrl}/api/v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validUserData)
      });
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('_id');
      expect(body.data.email).toBe(validUserData.email);
    });

    it('should return 400 when required fields are missing', async () => {
      const res = await fetch(`${baseUrl}/api/v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Bob' })
      });
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Validation failed');
    });

    it('should return 409 when email already exists', async () => {
      await User.create(validUserData);

      const res = await fetch(`${baseUrl}/api/v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validUserData)
      });
      const body = await res.json();

      expect(res.status).toBe(409);
      expect(body.success).toBe(false);
    });
  });

  // 2. List Users
  describe('GET /api/v1/users - List Users', () => {
    it('should return paginated list of users', async () => {
      await User.create(validUserData);

      const res = await fetch(`${baseUrl}/api/v1/users?page=1&limit=10`);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.page).toBe(1);
      expect(body.limit).toBe(10);
      expect(body.total).toBe(1);
      expect(body.data.length).toBe(1);
    });

    it('should filter users by search query (name or email)', async () => {
      await User.create(validUserData);
      await User.create({
        ...validUserData,
        name: 'Bob Marley',
        email: 'bob@example.com'
      });

      const res = await fetch(`${baseUrl}/api/v1/users?search=bob`);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.total).toBe(1);
      expect(body.data[0].name).toBe('Bob Marley');
    });
  });

  // 3. User Details
  describe('GET /api/v1/users/:id - User Details', () => {
    it('should return user details by valid ID', async () => {
      const user = await User.create(validUserData);

      const res = await fetch(`${baseUrl}/api/v1/users/${user._id}`);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data._id).toBe(user._id.toString());
      expect(body.data.email).toBe(validUserData.email);
    });

    it('should return 404 if user does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await fetch(`${baseUrl}/api/v1/users/${nonExistentId}`);
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.success).toBe(false);
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await fetch(`${baseUrl}/api/v1/users/invalid-id-123`);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
    });
  });
});
