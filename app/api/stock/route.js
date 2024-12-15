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
          as: 'category'
        }
      },
      {
        $lookup: {
          from: 'marketplace',
          localField: 'marketplaceId',
          foreignField: '_id',
          as: 'marketplace'
        }
      },
      {
        $project: {
          modelName: 1,
          initialQuantity: 1,
          availableQuantity: 1,
          createdAt: 1,
          category: { $arrayElemAt: ['$category.name', 0] },
          marketplace: { $arrayElemAt: ['$marketplace.name', 0] }
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
    
    const requiredFields = ['modelName', 'quantity', 'categoryId', 'marketplaceId'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return new Response(
          JSON.stringify({ message: `${field} is required` }), 
          { status: 400 }
        );
      }
    }

    const client = await clientPromise;
    const db = client.db('flikertag');

    const category = await db.collection('category').findOne({
      _id: new ObjectId(body.categoryId)
    });
    const marketplace = await db.collection('marketplace').findOne({
      _id: new ObjectId(body.marketplaceId)
    });

    if (!category || !marketplace) {
      return new Response(
        JSON.stringify({ message: 'Invalid category or marketplace' }), 
        { status: 400 }
      );
    }

    const quantity = parseInt(body.quantity);
    const result = await db.collection('stock').insertOne({
      modelName: body.modelName.trim(),
      initialQuantity: quantity,
      availableQuantity: quantity,
      categoryId: new ObjectId(body.categoryId),
      marketplaceId: new ObjectId(body.marketplaceId),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return new Response(
      JSON.stringify({
        message: 'Stock added successfully',
        stock: {
          id: result.insertedId,
          modelName: body.modelName,
          initialQuantity: quantity,
          availableQuantity: quantity
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