import clientPromise from '../../../lib/mongodb';

export async function POST(req) {
  try {
    const body = await req.json();
    
    if (!body.name) {
      return new Response(
        JSON.stringify({ message: 'Marketplace name is required' }), 
        { status: 400 }
      );
    }

    const marketplaceName = body.name.trim();
    
    const client = await clientPromise;
    if (!client) {
      throw new Error('Database connection failed');
    }

    const db = client.db('specly');
    
    // Check for duplicate marketplace
    const existingMarketplace = await db.collection('marketplace').findOne({
      name: { $regex: new RegExp(`^${marketplaceName}$`, 'i') }
    });

    if (existingMarketplace) {
      return new Response(
        JSON.stringify({ message: 'Marketplace already exists' }), 
        { status: 409 }
      );
    }

    // Insert new marketplace
    const result = await db.collection('marketplace').insertOne({
      name: marketplaceName,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return new Response(
      JSON.stringify({
        message: 'Marketplace added successfully',
        marketplace: {
          id: result.insertedId,
          name: marketplaceName,
        }
      }), 
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Marketplace creation error:', error);
    
    const errorMessage = error.message === 'Database connection failed'
      ? 'Database connection error'
      : 'Error creating marketplace';

    return new Response(
      JSON.stringify({ 
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      }), 
      { 
        status: error.message === 'Database connection failed' ? 503 : 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('specly');
    
    const marketplaces = await db.collection('marketplace')
      .find({})
      .sort({ name: 1 })
      .toArray();

    return new Response(
      JSON.stringify(marketplaces),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching marketplaces:', error);
    return new Response(
      JSON.stringify({ message: 'Error fetching marketplaces' }), 
      { status: 500 }
    );
  }
} 