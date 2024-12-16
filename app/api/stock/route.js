import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const marketplaceId = searchParams.get('marketplaceId');
    const searchTerm = searchParams.get('search');

    const client = await clientPromise;
    const db = client.db('flikertag');

    let query = {};
    
    if (categoryId) {
      query.categoryId = new ObjectId(categoryId);
    }
    if (marketplaceId) {
      query.marketplaceId = new ObjectId(marketplaceId);
    }
    if (searchTerm) {
      query.modelName = { $regex: searchTerm, $options: 'i' };
    }

    const stocks = await db.collection('stock').aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'category',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categoryData'
        }
      },
      {
        $project: {
          modelName: 1,
          initialQuantity: 1,
          availableQuantity: 1,
          createdAt: 1,
          categoryId: 1,
          category: { $arrayElemAt: ['$categoryData.name', 0] }
        }
      }
    ]).toArray();

    return new Response(JSON.stringify(stocks), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching stocks:', error);
    return new Response(
      JSON.stringify({ message: 'Error fetching stocks' }), 
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { modelName, categoryId, quantity, date } = body;

    // Validate required fields
    if (!modelName || !categoryId || !quantity || !date) {
      return new Response(
        JSON.stringify({ message: 'Model name, category, quantity, and date are required' }), 
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('flikertag');

    // Verify category exists
    const category = await db.collection('category').findOne({ 
      _id: new ObjectId(categoryId) 
    });

    if (!category) {
      return new Response(
        JSON.stringify({ message: 'Category not found' }), 
        { status: 404 }
      );
    }

    // Create stock
    const result = await db.collection('stock').insertOne({
      modelName,
      categoryId: new ObjectId(categoryId),
      initialQuantity: parseInt(quantity),
      availableQuantity: parseInt(quantity),
      date: new Date(date),
      createdAt: new Date()
    });

    return new Response(
      JSON.stringify({
        message: 'Stock added successfully',
        stock: {
          id: result.insertedId,
          modelName,
          initialQuantity: parseInt(quantity),
          availableQuantity: parseInt(quantity),
          date
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
    console.error('Stock creation error:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Error creating stock',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      }), 
      { status: 500 }
    );
  }
} 