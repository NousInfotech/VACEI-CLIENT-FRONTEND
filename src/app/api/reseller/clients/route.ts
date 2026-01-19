import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Mock database storage (in-memory, resets on server restart)
// In a real application, this would be a database connection
const clients: any[] = [];

export async function POST(request: Request) {
  try {
    // 1. Authorization Check
    // In a real app, verify the session/token and check for 'reseller' role.
    // For this mock, we assume the request is authorized if it reaches here.
    // const session = await getSession();
    // if (!session || session.user.role !== 'reseller') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    const body = await request.json();
    const { firstName, lastName, email, password, resellerId } = body;

    // 2. Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // 3. Unique Email Check
    const existingClient = clients.find((c) => c.email === email);
    if (existingClient) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // 4. Hash Password
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
      .toString('hex');
    const passwordHash = `${salt}:${hash}`;

    // 5. Create Client
    const newClient = {
      id: crypto.randomUUID(),
      reseller_id: resellerId || 'current-reseller-id', // In real app, get from session
      first_name: firstName,
      last_name: lastName,
      email,
      password_hash: passwordHash, // Storing hash, not plain password
      role: 'client', // Default role
      created_at: new Date().toISOString(),
    };

    clients.push(newClient);

    console.log('Client created:', { ...newClient, password_hash: '***' });

    return NextResponse.json(
      { message: 'Client created successfully', client: { ...newClient, password_hash: undefined } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
