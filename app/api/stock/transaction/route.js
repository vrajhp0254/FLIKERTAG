import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const body = await req.json();
    const { stockId, type, quantity, transactionType } = body;

    if (!stockId || !type || !quantity || !transactionType) {
      return new Response(
        JSON.stringify({ message: 'Missing required fields' }), 
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('flikertag');

    // Get current stock with category and marketplace info
    const stock = await db.collection('stock').aggregate([
      { 
        $match: { _id: new ObjectId(stockId) }
      },
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
          categoryId: 1,
          marketplaceId: 1,
          category: { $arrayElemAt: ['$category.name', 0] },
          marketplace: { $arrayElemAt: ['$marketplace.name', 0] }
        }
      }
    ]).next();

    if (!stock) {
      return new Response(
        JSON.stringify({ message: 'Stock not found' }), 
        { status: 404 }
      );
    }

    let newQuantity;
    if (type === 'sell') {
      if (stock.availableQuantity < quantity) {
        return new Response(
          JSON.stringify({ message: 'Insufficient stock' }), 
          { status: 400 }
        );
      }
      newQuantity = stock.availableQuantity - quantity;
    } else if (type === 'return') {
      newQuantity = stock.availableQuantity + quantity;
    } else {
      return new Response(
        JSON.stringify({ message: 'Invalid transaction type' }), 
        { status: 400 }
      );
    }

    // Update stock
    await db.collection('stock').updateOne(
      { _id: new ObjectId(stockId) },
      { 
        $set: { 
          availableQuantity: newQuantity,
          updatedAt: new Date()
        } 
      }
    );

    // Create report entry
    await db.collection('reports').insertOne({
      stockId: new ObjectId(stockId),
      modelName: stock.modelName,
      categoryId: stock.categoryId,
      categoryName: stock.category,
      marketplaceId: stock.marketplaceId,
      marketplaceName: stock.marketplace,
      initialQuantity: stock.initialQuantity,
      availableQuantity: newQuantity,
      transactionType: type,
      returnType: type === 'return' ? transactionType : null,
      quantity: quantity,
      date: new Date()
    });

    return new Response(
      JSON.stringify({
        message: 'Transaction successful',
        newQuantity
      }), 
      { status: 200 }
    );

  } catch (error) {
    console.error('Transaction error:', error);
    return new Response(
      JSON.stringify({ message: 'Error processing transaction' }), 
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const marketplaceId = searchParams.get('marketplaceId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const client = await clientPromise;
    const db = client.db('flikertag');

    let query = {};

    if (categoryId) {
      query.categoryId = new ObjectId(categoryId);
    }
    if (marketplaceId) {
      query.marketplaceId = new ObjectId(marketplaceId);
    }
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const reports = await db.collection('reports')
      .find(query)
      .sort({ date: -1 })
      .toArray();

    return new Response(JSON.stringify(reports), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    return new Response(
      JSON.stringify({ message: 'Error fetching reports' }), 
      { status: 500 }
    );
  }
} 