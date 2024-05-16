/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { CreateStockCartDto } from './dto/create-stock-cart.dto';
import { UpdateStockCartDto } from './dto/update-stock-cart.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { Prisma } from '@prisma/client';
import * as excel from 'exceljs';

@Injectable()
export class StockCartsService {
  constructor(private prisma: PrismaService) {}

  async create(
    data: CreateStockCartDto,
    file: Express.Multer.File,
  ): Promise<any> {
    const {
      caseBrand,
      caseModelVariations,
      caseImage,
      title,
      description,
      barcode,
      cost,
      quantity,
    } = data;
    const caseImageUrl = await this.saveImage(file);
    const stockCarts = [];
    this.deleteAllStockCartHistory();
    const phoneIdsArray: string[] = JSON.parse(data.phoneIds);
    const caseModelArray: string[] = JSON.parse(data.caseModelVariations);
    for (const phoneId of phoneIdsArray) {
      for (const caseModel of caseModelArray) {
        const stockCart: Prisma.StockCartHistoryCreateInput = {
          Phone: {
            connect: {
              id: phoneId,
            },
          },
          caseBrand,
          caseModelVariation: caseModel,
          caseImage: caseImageUrl,
          title,
          description,
          barcode,
          cost: parseFloat(cost),
          quantity: parseInt(quantity),
        };
        const createdStockCart = await this.prisma.stockCartHistory.create({
          data: stockCart,
        });
        stockCarts.push(createdStockCart);
      }
    }
    return stockCarts;
  }

  private saveImage(file: Express.Multer.File): Promise<string> {
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.resolve(__dirname, '..', '..', 'public', fileName);
    const fileUrl = `/uploads/${fileName}`;

    return new Promise((resolve, reject) => {
      const fileStream = fs.createWriteStream(filePath);
      fileStream.on('finish', () => resolve(fileUrl));
      fileStream.on('error', reject);
      fileStream.write(file.buffer);
      fileStream.end();
    });
  }

  async deleteAllStockCartHistory() {
    return this.prisma.stockCartHistory.deleteMany({});
  }

  async deleteAllStockCart() {
    return this.prisma.stockCart.deleteMany({});
  }

  async getAllStockCartHistoryWithCustomOutput() {
    const stockCartHistories = await this.prisma.stockCartHistory.findMany();
    const stockCartHistoriesWithCustomOutput = stockCartHistories.map(
      async (stockCartHistory) => {
        const phone = await this.prisma.phone.findUnique({
          where: {
            id: stockCartHistory.phoneId,
          },
        });
        return {
          id: stockCartHistory.id,
          caseImage: stockCartHistory.caseImage,
          stockCode: `${stockCartHistory.caseBrand}\\${phone.stockCode}/${stockCartHistory.caseModelVariation}`,
          myorStockName: `${phone.brand} ${phone.model} ${stockCartHistory.caseBrand} ${stockCartHistory.caseModelVariation}`,
          ikasStockName: `${phone.brand} ${phone.model} ${stockCartHistory.title} ${stockCartHistory.caseBrand} ${stockCartHistory.caseModelVariation}`,
          title: stockCartHistory.title,
          description: stockCartHistory.description,
          cost: stockCartHistory.cost,
          quantity: stockCartHistory.quantity,
          barcode: stockCartHistory.barcode,
        };
      },
    );
    return stockCartHistoriesWithCustomOutput;
  }

  async getAllStockCartWithCustomOutput() {
    const stockCarts = await this.prisma.stockCart.findMany();
    const stockCartsWithCustomOutput = stockCarts.map(
      async (stockCartHistory) => {
        const phone = await this.prisma.phone.findUnique({
          where: {
            id: stockCartHistory.phoneId,
          },
        });
        return {
          id: stockCartHistory.id,
          caseImage: stockCartHistory.caseImage,
          stockCode: `${stockCartHistory.caseBrand}\\${phone.stockCode}/${stockCartHistory.caseModelVariation}`,
          myorStockName: `${phone.brand} ${phone.model} ${stockCartHistory.caseBrand} ${stockCartHistory.caseModelVariation}`,
          ikasStockName: `${phone.brand} ${phone.model} ${stockCartHistory.title} ${stockCartHistory.caseBrand} ${stockCartHistory.caseModelVariation}`,
          title: stockCartHistory.title,
          description: stockCartHistory.description,
          cost: stockCartHistory.cost,
          quantity: stockCartHistory.quantity,
          barcode: stockCartHistory.barcode,
        };
      },
    );
    return stockCartsWithCustomOutput;
  }

  getAllStockCart() {
    return this.prisma.stockCart.findMany();
  }

  getAllStockCartHistory() {
    return this.prisma.stockCartHistory.findMany();
  }

  async deleteStockCartHistoriesIdsNotSent(ids: string[]) {
    const stockCarts = await this.prisma.stockCartHistory.findMany();
    const stockCartIds = stockCarts.map((stockCart) => stockCart.id);
    const stockCartsIdsNotSent = stockCartIds.filter((id) => !ids.includes(id));
    return this.prisma.stockCartHistory.deleteMany({
      where: {
        id: {
          in: stockCartsIdsNotSent,
        },
      },
    });
  }

  async transferStockCartHistoriesToStockCart(): Promise<any> {
    const stockCartHistories = await this.prisma.stockCartHistory.findMany();
    const stockCarts = stockCartHistories.map(async (stockCartHistory) => {
      const newData: Prisma.StockCartCreateInput = {
        Phone: {
          connect: {
            id: stockCartHistory.phoneId,
          },
        },
        caseBrand: stockCartHistory.caseBrand,
        caseModelVariation: stockCartHistory.caseModelVariation,
        caseImage: stockCartHistory.caseImage,
        title: stockCartHistory.title,
        description: stockCartHistory.description,
        barcode: stockCartHistory.barcode,
        cost: stockCartHistory.cost,
        quantity: stockCartHistory.quantity,
      };
      await this.prisma.stockCart.create({
        data: newData,
      });
    });
    return Promise.all(stockCarts);
  }

  async exportStockCartsToExcelForMyor() {
    const stockCarts = await this.prisma.stockCart.findMany();

    const workbook = new excel.Workbook();
    const templateFilePath = path.join(
      __dirname,
      '../..',
      'templates',
      'StokListesi.xlsx',
    );
  }
}
