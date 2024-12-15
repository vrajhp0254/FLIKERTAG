// app/api/category/route.js
import clientPromise from '../../../lib/mongodb';

export async function POST(req) {
  try {
    const body = await req.json();
    
    if (!body.name) {
      return new Response(
        JSON.stringify({ message: 'Category name is required' }), 
        { status: 400 }
      );
    }

    const categoryName = body.name.trim();
    
    const client = await clientPromise;
    if (!client) {
      throw new Error('Database connection failed');
    }

    const db = client.db('flikertag');
    
    // Check for duplicate category
    const existingCategory = await db.collection('category').findOne({
      name: { $regex: new RegExp(`^${categoryName}$`, 'i') }
    });

    if (existingCategory) {
      return new Response(
        JSON.stringify({ message: 'Category already exists' }), 
        { status: 409 }
      );
    }

    // Insert new category
    const result = await db.collection('category').insertOne({
      name: categoryName,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return new Response(
      JSON.stringify({
        message: 'Category added successfully',
        category: {
          id: result.insertedId,
          name: categoryName,
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
    console.error('Category creation error:', error);
    
    const errorMessage = error.message === 'Database connection failed'
      ? 'Database connection error'
      : 'Error creating category';

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
    const db = client.db('flikertag');
    
    const categories = await db.collection('category')
      .find({})
      .sort({ name: 1 })
      .toArray();

    return new Response(
      JSON.stringify(categories),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return new Response(
      JSON.stringify({ message: 'Error fetching categories' }), 
      { status: 500 }
    );
  }
}

