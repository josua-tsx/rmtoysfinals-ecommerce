/**
 * Unit tests for Stock Zod schemas.
 * These tests validate the schema logic directly without using Supertest/Express.
 */
import { jest } from '@jest/globals';
import { orderStockSchema, reorderStockSchema, updateStockQuantitySchema } from '../schema/stock.schema.js';

describe('Stock Schema Validation', () => {
    const validObjectId = '507f1f77bcf86cd799439011';

    describe('orderStockSchema', () => {
        it('should pass with valid data', () => {
            const validData = {
                body: {
                    product: validObjectId,
                    supplier: validObjectId,
                    deliveryId: 'DEL-001',
                    dateDelivery: '2024-01-15',
                    supplierPrice: 50,
                    shopPrice: 100,
                    shippingPrice: 10,
                    quantity: 20,
                },
            };
            
            const result = orderStockSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail if shop price is lower than supplier price', () => {
            const invalidData = {
                body: {
                    product: validObjectId,
                    supplier: validObjectId,
                    deliveryId: 'DEL-001',
                    dateDelivery: '2024-01-15',
                    supplierPrice: 100,
                    shopPrice: 50, // Invalid: lower than supplier
                    shippingPrice: 10,
                    quantity: 20,
                },
            };
            
            const result = orderStockSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toMatch(/Shop price cannot be lower/);
            }
        });

        it('should fail if quantity is less than 11', () => {
            const invalidData = {
                body: {
                    product: validObjectId,
                    supplier: validObjectId,
                    deliveryId: 'DEL-001',
                    dateDelivery: '2024-01-15',
                    supplierPrice: 50,
                    shopPrice: 100,
                    shippingPrice: 10,
                    quantity: 5, // Invalid: minimum is 11
                },
            };
            
            const result = orderStockSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toMatch(/at least 11/);
            }
        });

        it('should fail with invalid product ObjectId', () => {
            const invalidData = {
                body: {
                    product: 'invalid-id',
                    supplier: validObjectId,
                    deliveryId: 'DEL-001',
                    dateDelivery: '2024-01-15',
                    supplierPrice: 50,
                    shopPrice: 100,
                    shippingPrice: 10,
                    quantity: 20,
                },
            };
            
            const result = orderStockSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe('updateStockQuantitySchema', () => {
        it('should pass with valid stockId and quantity', () => {
            const validData = {
                params: {
                    stockId: validObjectId,
                },
                body: {
                    quantity: 50,
                },
            };
            
            const result = updateStockQuantitySchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail with negative quantity', () => {
            const invalidData = {
                params: {
                    stockId: validObjectId,
                },
                body: {
                    quantity: -10,
                },
            };
            
            const result = updateStockQuantitySchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });
});
