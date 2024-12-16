import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const body = await req.json();
    const { stockId, quantity, transactionType, returnType, marketplaceId, date } = body;

    const client = await clientPromise;
    const db = client.db('flikertag');

    // Get stock details
    const stock = await db.collection('stock').findOne(
      { _id: new ObjectId(stockId) }
    );

    if (!stock) {
      return new Response(
        JSON.stringify({ message: 'Stock not found' }), 
        { status: 404 }
      );
    }

    // Calculate new quantity
    const newQuantity = transactionType === 'sell' 
      ? stock.availableQuantity - quantity
      : stock.availableQuantity + quantity;

    if (newQuantity < 0) {
      return new Response(
        JSON.stringify({ message: 'Insufficient stock' }), 
        { status: 400 }
      );
    }

    // Get marketplace details
    const marketplace = await db.collection('marketplace').findOne(
      { _id: new ObjectId(marketplaceId) }
    );

    if (!marketplace) {
      return new Response(
        JSON.stringify({ message: 'Marketplace not found' }), 
        { status: 404 }
      );
    }

    // Get category details
    const category = await db.collection('category').findOne(
      { _id: stock.categoryId }
    );

    // Create transaction record
    await db.collection('transactions').insertOne({
      stockId: new ObjectId(stockId),
      marketplaceId: new ObjectId(marketplaceId),
      categoryId: stock.categoryId,
      modelName: stock.modelName,
      categoryName: category.name,
      marketplaceName: marketplace.name,
      quantity: parseInt(quantity),
      transactionType,
      returnType,
      date: new Date(date),
      createdAt: new Date()
    });

    // Update stock quantity
    await db.collection('stock').updateOne(
      { _id: new ObjectId(stockId) },
      { $set: { availableQuantity: newQuantity } }
    );

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

    const transactions = await db.collection('transactions')
      .find(query)
      .sort({ date: -1 })
      .toArray();

    return new Response(
      JSON.stringify(transactions), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return new Response(
      JSON.stringify({ message: 'Error fetching transactions' }), 
      { status: 500 }
    );
  }
} 