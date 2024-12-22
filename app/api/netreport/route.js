import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('flikertag');

    const stocks = await db.collection('stock').aggregate([
      {
        $lookup: {
          from: 'transactions',
          let: { stockId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$stockData.id', { $toString: '$$stockId' }] },
                    { $eq: ['$stockId', '$$stockId'] }
                  ]
                }
              }
            }
          ],
          as: 'transactions'
        }
      },
      {
        $lookup: {
          from: 'category',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'categoryData'
        }
      },
      {
        $unwind: {
          path: '$categoryData',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          modelName: 1,
          initialQuantity: 1,
          availableQuantity: 1,
          categoryId: 1,
          categoryName: '$categoryData.name',
          transactions: 1
        }
      },
      {
        $sort: { modelName: 1 }
      }
    ]).toArray();

    const reports = stocks.map(stock => {
      const transactions = stock.transactions || [];
      
      const totalSell = transactions
        .filter(t => t.transactionType === 'sell')
        .reduce((sum, t) => t.quantity ? sum + parseInt(t.quantity) : sum, 0);

      const courierReturn = transactions
        .filter(t => t.transactionType === 'return' && t.returnType === 'courier')
        .reduce((sum, t) => t.quantity ? sum + parseInt(t.quantity) : sum, 0);

      const customerReturn = transactions
        .filter(t => t.transactionType === 'return' && t.returnType === 'customer')
        .reduce((sum, t) => t.quantity ? sum + parseInt(t.quantity) : sum, 0);

      const totalReturn = courierReturn + customerReturn;

      return {
        modelName: stock.modelName,
        categoryId: stock.categoryId ? stock.categoryId.toString() : '',
        categoryName: stock.categoryName || 'Uncategorized',
        entryStock: stock.initialQuantity || 0,
        availableStock: stock.availableQuantity || 0,
        totalSell: totalSell || 0,
        courierReturn: courierReturn || 0,
        customerReturn: customerReturn || 0,
        netSell: (totalSell - totalReturn) || 0
      };
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error generating net report:', error);
    return NextResponse.json(
      { message: 'Error generating net report' },
      { status: 500 }
    );
  }
} 