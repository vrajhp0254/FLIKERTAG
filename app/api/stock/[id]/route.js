import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const parseDate = (dateString) => {
  try {
    // If the date is in YYYY-MM-DD format (from input type="date")
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

// Update stock
export async function PUT(request, { params }) {
  try {
    const id = params.id;
    const body = await request.json();
    const { modelName, categoryId, initialQuantity, availableQuantity, date } = body;

    if (!modelName || !categoryId || !initialQuantity || !availableQuantity || !date) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('flikertag');

    // Get current stock data and check for existing transactions
    const currentStock = await db.collection('stock').findOne(
      { _id: new ObjectId(id) }
    );

    // Check if there are any transactions other than 'initial'
    const hasTransactions = await db.collection('transactions').findOne({
      stockId: new ObjectId(id),
      transactionType: { $ne: 'initial' }
    });

    // If there are transactions, don't allow changing initial quantity
    if (hasTransactions && currentStock.initialQuantity !== parseInt(initialQuantity)) {
      return NextResponse.json(
        { message: 'Cannot modify initial quantity after transactions have been recorded' },
        { status: 400 }
      );
    }

    // Update the stock
    const result = await db.collection('stock').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          modelName,
          categoryId: new ObjectId(categoryId),
          initialQuantity: parseInt(initialQuantity),
          availableQuantity: parseInt(availableQuantity),
          date: parseDate(date),
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Stock not found' },
        { status: 404 }
      );
    }

    // Update initial transaction if no other transactions exist
    if (!hasTransactions && currentStock.initialQuantity !== parseInt(initialQuantity)) {
      await db.collection('transactions').updateOne(
        { 
          stockId: new ObjectId(id),
          transactionType: 'initial'
        },
        {
          $set: {
            quantity: parseInt(initialQuantity),
            availableQuantity: parseInt(availableQuantity),
            date: parseDate(date),
            updatedAt: new Date()
          }
        }
      );
    }

    return NextResponse.json(
      { message: 'Stock updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { message: 'Error updating stock' },
      { status: 500 }
    );
  }
}

// Delete stock
export async function DELETE(request, { params }) {
  try {
    const id = params.id;
    
    const client = await clientPromise;
    const db = client.db('flikertag');

    const result = await db.collection('stock').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: 'Stock not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Stock deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting stock:', error);
    return NextResponse.json(
      { message: 'Error deleting stock' },
      { status: 500 }
    );
  }
} 