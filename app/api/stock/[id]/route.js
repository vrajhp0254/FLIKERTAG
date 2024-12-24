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
    const id = (await params).id;
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

    // Get current stock data and category details
    const currentStock = await db.collection('stock').findOne(
      { _id: new ObjectId(id) }
    );

    const category = await db.collection('category').findOne(
      { _id: new ObjectId(categoryId) }
    );

    // Calculate the difference in initial quantity
    const quantityDifference = parseInt(initialQuantity) - currentStock.initialQuantity;
    const newAvailableQuantity = currentStock.availableQuantity + quantityDifference;

    // Update the stock
    const result = await db.collection('stock').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          modelName,
          categoryId: new ObjectId(categoryId),
          initialQuantity: parseInt(initialQuantity),
          availableQuantity: newAvailableQuantity,
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

    // Create a new initial transaction instead of updating existing ones
    if (quantityDifference !== 0) {
      const newInitialTransaction = {
        stockData: {
          modelName,
          initialQuantity: parseInt(initialQuantity),
          availableQuantity: newAvailableQuantity
        },
        categoryData: {
          id: category._id.toString(),
          name: category.name
        },
        quantity: Math.abs(quantityDifference),
        previousAvailableQuantity: currentStock.availableQuantity,
        newAvailableQuantity: newAvailableQuantity,
        transactionType: 'initial',
        date: parseDate(date),
        createdAt: new Date()
      };

      await db.collection('transactions').insertOne(newInitialTransaction);
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
    const id = (await params).id;
    const client = await clientPromise;
    const db = client.db('specly');

    // Get stock details before deletion
    const stock = await db.collection('stock').findOne(
      { _id: new ObjectId(id) }
    );

    if (!stock) {
      return NextResponse.json(
        { message: 'Stock not found' },
        { status: 404 }
      );
    }

    // Update all transactions to store stock data
    await db.collection('transactions').updateMany(
      { 'stockData.id': id },
      {
        $set: {
          'stockData.isDeleted': true,
          'stockData.deletedAt': new Date()
        }
      }
    );

    // Delete the stock
    const result = await db.collection('stock').deleteOne({
      _id: new ObjectId(id)
    });

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