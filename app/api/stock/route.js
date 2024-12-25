import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

const parseDate = (dateString) => {
  try {
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-');
      return new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
    }
    return new Date(dateString);
  } catch (error) {
    console.error('Date parsing error:', error);
    return new Date();
  }
};

export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db('specly');

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

    const formattedStocks = stocks.map(stock => ({
      ...stock,
      date: stock.date.toISOString()
    }));

    return NextResponse.json(formattedStocks, { status: 200 });
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return NextResponse.json(
      { message: 'Error fetching stocks' }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { modelName, categoryId, initialQuantity, date } = body;

    if (!modelName || !categoryId || !initialQuantity || !date) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('specly');

    // Check if stock with same model name and category exists
    const existingStock = await db.collection('stock').findOne({
      modelName: modelName,
      categoryId: new ObjectId(categoryId)
    });

    if (existingStock) {
      return NextResponse.json(
        { message: 'A stock with this model name and category already exists' },
        { status: 400 }
      );
    }

    const stockResult = await db.collection('stock').insertOne({
      modelName,
      categoryId: new ObjectId(categoryId),
      initialQuantity: parseInt(initialQuantity),
      availableQuantity: parseInt(initialQuantity),
      date: parseDate(date),
      createdAt: new Date()
    });

    const category = await db.collection('category').findOne(
      { _id: new ObjectId(categoryId) }
    );

    await db.collection('transactions').insertOne({
      stockId: stockResult.insertedId,
      stockData: {
        id: stockResult.insertedId.toString(),
        modelName: modelName,
        initialQuantity: parseInt(initialQuantity),
        availableQuantity: parseInt(initialQuantity)
      },
      categoryId: new ObjectId(categoryId),
      categoryData: {
        id: category._id.toString(),
        name: category.name
      },
      modelName: modelName,
      categoryName: category.name,
      quantity: parseInt(initialQuantity),
      previousAvailableQuantity: 0,
      newAvailableQuantity: parseInt(initialQuantity),
      transactionType: 'initial',
      date: parseDate(date),
      createdAt: new Date(),
      isInitialTransaction: true
    });

    return NextResponse.json(
      { message: 'Stock created successfully', id: stockResult.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating stock:', error);
    return NextResponse.json(
      { message: 'Error creating stock' },
      { status: 500 }
    );
  }
} 