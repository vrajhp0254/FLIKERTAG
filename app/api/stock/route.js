import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db('flikertag');

    const stocks = await db.collection('stock')
      .aggregate([
        {
          $lookup: {
            from: 'category',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'categoryInfo'
          }
        },
        {
          $unwind: '$categoryInfo'
        },
        {
          $project: {
            _id: 1,
            modelName: 1,
            initialQuantity: 1,
            availableQuantity: 1,
            date: 1,
            category: '$categoryInfo.name',
            categoryId: 1
          }
        }
      ])
      .toArray();

    // Format dates before sending response
    const formattedStocks = stocks.map(stock => ({
      ...stock,
      date: stock.date.toISOString() // Ensure date is in ISO format
    }));

    return new Response(JSON.stringify(formattedStocks), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
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