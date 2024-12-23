import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { stockId, quantity, transactionType, returnType, marketplaceId, date } = body;

    const client = await clientPromise;
    const db = client.db('specly');

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

    // Calculate new quantity based on transaction type and return type
    const currentAvailableQuantity = stock.availableQuantity;
    let newQuantity;

    if (transactionType === 'sell') {
      newQuantity = currentAvailableQuantity - parseInt(quantity);
    } else if (transactionType === 'return') {
      newQuantity = returnType === 'courier' 
        ? currentAvailableQuantity + parseInt(quantity)
        : currentAvailableQuantity;
    }

    // Validation checks...
    if (newQuantity < 0) {
      return new Response(
        JSON.stringify({ message: 'Insufficient stock' }), 
        { status: 400 }
      );
    }

    if (newQuantity > stock.initialQuantity) {
      return new Response(
        JSON.stringify({ message: 'Return quantity exceeds initial stock quantity' }), 
        { status: 400 }
      );
    }

    // Create transaction with actual data instead of IDs
    const transaction = {
      stockData: {
        id: stock._id.toString(),
        modelName: stock.modelName,
        initialQuantity: stock.initialQuantity
      },
      categoryData: {
        id: category._id.toString(),
        name: category.name
      },
      marketplaceData: {
        id: marketplace._id.toString(),
        name: marketplace.name
      },
      quantity: parseInt(quantity),
      previousAvailableQuantity: currentAvailableQuantity,
      newAvailableQuantity: newQuantity,
      transactionType,
      returnType,
      date: new Date(date),
      createdAt: new Date()
    };

    // Insert transaction
    await db.collection('transactions').insertOne(transaction);

    // Update stock quantity
    await db.collection('stock').updateOne(
      { _id: new ObjectId(stockId) },
      { $set: { availableQuantity: newQuantity } }
    );

    return NextResponse.json({
      message: 'Transaction processed successfully',
      newQuantity
    });

  } catch (error) {
    console.error('Error processing transaction:', error);
    return NextResponse.json(
      { message: 'Error processing transaction' },
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
    const transactionType = searchParams.get('transactionType');

    const client = await clientPromise;
    const db = client.db('specly');

    const transactions = await db.collection('transactions').aggregate([
      {
        $match: {
          $and: [
            categoryId ? {
              $or: [
                { 'categoryData.id': categoryId },
                { categoryId: new ObjectId(categoryId) }  // For initial entries
              ]
            } : {},
            marketplaceId ? {
              $or: [
                { 'marketplaceData.id': marketplaceId },
                { marketplaceId: new ObjectId(marketplaceId) }
              ]
            } : {},
            startDate && endDate ? {
              date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
              }
            } : {},
            transactionType ? { transactionType } : {}
          ]
        }
      },
      {
        $addFields: {
          initialQuantity: {
            $cond: {
              if: { $eq: ["$transactionType", "initial"] },
              then: "$quantity",
              else: "$stockData.initialQuantity"
            }
          }
        }
      },
      {
        $sort: { 
          date: -1,
          _id: -1 
        }
      }
    ]).toArray();

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { message: 'Error fetching transactions' },
      { status: 500 }
    );
  }
} 