import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Update stock
export async function PUT(request, { params }) {
  try {
    const id = await Promise.resolve(params.id);
    const body = await request.json();
    const { modelName, categoryId, quantity } = body;

    if (!modelName || !categoryId || !quantity) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('flikertag');

    // Check if category exists
    const categoryExists = await db.collection('category').findOne({
      _id: new ObjectId(categoryId)
    });

    if (!categoryExists) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    // Check for duplicate model name in the same category (excluding current stock)
    const duplicate = await db.collection('stock').findOne({
      _id: { $ne: new ObjectId(id) },
      categoryId: new ObjectId(categoryId),
      modelName: { $regex: new RegExp(`^${modelName}$`, 'i') }
    });

    if (duplicate) {
      return NextResponse.json(
        { message: 'Model name already exists in this category' },
        { status: 409 }
      );
    }

    const result = await db.collection('stock').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          modelName,
          categoryId: new ObjectId(categoryId),
          initialQuantity: parseInt(quantity),
          availableQuantity: parseInt(quantity),
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

    return NextResponse.json({ message: 'Stock updated successfully' });
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
    const id = await Promise.resolve(params.id);
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