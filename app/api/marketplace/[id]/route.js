import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Update marketplace
export async function PUT(request, { params }) {
  try {
    const id = await Promise.resolve(params.id);
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { message: 'Marketplace name is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('specly');

    // Check for duplicate marketplace name
    const duplicate = await db.collection('marketplace').findOne({
      _id: { $ne: new ObjectId(id) },
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (duplicate) {
      return NextResponse.json(
        { message: 'Marketplace name already exists' },
        { status: 409 }
      );
    }

    const result = await db.collection('marketplace').updateOne(
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
        { message: 'Marketplace not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Marketplace updated successfully' });
  } catch (error) {
    console.error('Error updating marketplace:', error);
    return NextResponse.json(
      { message: 'Error updating marketplace' },
      { status: 500 }
    );
  }
}

// Delete marketplace
export async function DELETE(request, { params }) {
  try {
    const id = params.id;
    const client = await clientPromise;
    const db = client.db('specly');

    // Delete the marketplace
    const result = await db.collection('marketplace').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: 'Marketplace not found' },
        { status: 404 }
      );
    }

    // Update any transactions that used this marketplace
    await db.collection('transactions').updateMany(
      { marketplaceId: new ObjectId(id) },
      { $set: { marketplaceName: 'Deleted Marketplace' } }
    );

    return NextResponse.json(
      { message: 'Marketplace deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting marketplace:', error);
    return NextResponse.json(
      { message: 'Error deleting marketplace' },
      { status: 500 }
    );
  }
} 