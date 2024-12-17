import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const parseDate = (dateString) => {
  try {
    const [day, month, year] = dateString.split('-');
    return new Date(Date.UTC(year, month - 1, day));
  } catch (error) {
    console.error('Date parsing error:', error);
    return new Date();
  }
};

// Update stock
export async function PUT(request, context) {
  try {
    const id = context.params.id;
    const body = await request.json();
    const { modelName, categoryId, quantity, date } = body;

    if (!modelName || !categoryId || !quantity || !date) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('flikertag');

    const categoryExists = await db.collection('category').findOne({
      _id: new ObjectId(categoryId)
    });

    if (!categoryExists) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    const category = categoryExists.name;
    const parsedDate = parseDate(date);

    const result = await db.collection('stock').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          modelName,
          categoryId: new ObjectId(categoryId),
          category,
          initialQuantity: parseInt(quantity),
          availableQuantity: parseInt(quantity),
          date: parsedDate,
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

    return NextResponse.json({ 
      message: 'Stock updated successfully',
      stock: {
        modelName,
        category,
        initialQuantity: parseInt(quantity),
        availableQuantity: parseInt(quantity),
        date: parsedDate
      }
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { message: 'Error updating stock' },
      { status: 500 }
    );
  }
}

// Delete stock
export async function DELETE(request, context) {
  try {
    const id = context.params.id;
    const client = await clientPromise;
    const db = client.db('flikertag');

    // Check if stock has any transactions
    const transactionCount = await db.collection('transactions').countDocuments({
      stockId: new ObjectId(id)
    });

    if (transactionCount > 0) {
      return NextResponse.json(
        { message: 'Cannot delete stock that has transactions' },
        { status: 400 }
      );
    }

    const result = await db.collection('stock').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: 'Stock not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Stock deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock:', error);
    return NextResponse.json(
      { message: 'Error deleting stock' },
      { status: 500 }
    );
  }
} 