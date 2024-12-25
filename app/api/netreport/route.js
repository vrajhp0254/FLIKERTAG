import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('specly');

    const stocks = await db.collection('stock').aggregate([
      {
        $lookup: {
          from: 'transactions',
          let: { 
            modelName: '$modelName',
            stockId: '$_id'
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $or: [
                        // Match current stock's transactions
                        {
                          $and: [
                            { $eq: ['$stockId', '$$stockId'] }
                          ]
                        },
                        // Match transactions with stockData reference
                        {
                          $and: [
                            { $eq: ['$stockData.id', { $toString: '$$stockId' }] },
                            { $ne: [{ $ifNull: ['$stockData.isDeleted', false] }, true] }
                          ]
                        }
                      ]
                    }
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
      }
    ]).toArray();

    const reports = stocks.map(stock => {
      const transactions = stock.transactions || [];
      
      // Calculate total sell (excluding initial transactions)
      const totalSell = transactions
        .filter(t => t.transactionType === 'sell')
        .reduce((sum, t) => sum + (parseInt(t.quantity) || 0), 0);

      // Calculate returns
      const courierReturn = transactions
        .filter(t => t.transactionType === 'return' && t.returnType === 'courier')
        .reduce((sum, t) => sum + (parseInt(t.quantity) || 0), 0);

      const customerReturn = transactions
        .filter(t => t.transactionType === 'return' && t.returnType === 'customer')
        .reduce((sum, t) => sum + (parseInt(t.quantity) || 0), 0);

      const totalReturn = courierReturn + customerReturn;

      return {
        modelName: stock.modelName,
        categoryId: stock.categoryId ? stock.categoryId.toString() : '',
        categoryName: stock.categoryData?.name || 'Uncategorized',
        entryStock: stock.initialQuantity || 0,
        availableStock: stock.availableQuantity || 0,
        totalSell,
        courierReturn,
        customerReturn,
        netSell: totalSell - totalReturn
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