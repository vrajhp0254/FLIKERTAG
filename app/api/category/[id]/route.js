import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Update category
export async function PUT(request, { params }) {
  try {
    const id = await Promise.resolve(params.id);
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { message: 'Category name is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('flikertag');

    // Check for duplicate category name (excluding current category)
    const duplicate = await db.collection('category').findOne({
      _id: { $ne: new ObjectId(id) },
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (duplicate) {
      return NextResponse.json(
        { message: 'Category name already exists' },
        { status: 409 }
      );
    }

    const result = await db.collection('category').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          name,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { message: 'Error updating category' },
      { status: 500 }
    );
  }
}

// Delete category
export async function DELETE(request, { params }) {
  try {
    const id = await Promise.resolve(params.id);
    const client = await clientPromise;
    const db = client.db('flikertag');

    // Check if category is in use
    const stockCount = await db.collection('stock').countDocuments({
      categoryId: new ObjectId(id)
    });

    if (stockCount > 0) {
      return NextResponse.json(
        { message: 'Cannot delete category that is in use' },
        { status: 400 }
      );
    }

    const result = await db.collection('category').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { message: 'Error deleting category' },
      { status: 500 }
    );
  }
} 