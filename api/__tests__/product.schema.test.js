/**
 * Unit tests for Product Zod schemas.
 */
import { jest } from '@jest/globals';
import { createProductSchema, updateProductSchema } from '../schema/product.schema.js';

describe('Product Schema Validation', () => {
    const validObjectId = '507f1f77bcf86cd799439011';

    describe('createProductSchema', () => {
        it('should pass with valid product data', () => {
            const validData = {
                body: {
                    productName: 'RC Car Deluxe',
                    productDescription: 'A high-quality remote control car',
                    category: validObjectId,
                    productImages: ['image1.jpg'],
                    taxStatus: 'exempt',
                },
            };
            
            const result = createProductSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail if productName is too short', () => {
            const invalidData = {
                body: {
                    productName: 'Car',
                    productDescription: 'Valid description',
                    category: validObjectId,
                    productImages: ['image1.jpg'],
                },
            };
            
            const result = createProductSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should fail if productName starts with a number', () => {
            const invalidData = {
                body: {
                    productName: '123 Product Name',
                    productDescription: 'Valid description',
                    category: validObjectId,
                    productImages: ['image1.jpg'],
                },
            };
            
            const result = createProductSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should fail if no product images provided', () => {
            const invalidData = {
                body: {
                    productName: 'Valid Product',
                    productDescription: 'Valid description',
                    category: validObjectId,
                    productImages: [],
                },
            };
            
            const result = createProductSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should fail if taxStatus is vatable but no VAT provided', () => {
            const invalidData = {
                body: {
                    productName: 'Valid Product',
                    productDescription: 'Valid description',
                    category: validObjectId,
                    productImages: ['img.jpg'],
                    taxStatus: 'vatable',
                    // vat is missing
                },
            };
            
            const result = createProductSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                const vatIssue = result.error.issues.find(i => i.path.includes('vat'));
                expect(vatIssue).toBeDefined();
            }
        });

        it('should pass if taxStatus is vatable and VAT is provided', () => {
            const validData = {
                body: {
                    productName: 'Valid Product',
                    productDescription: 'Valid description',
                    category: validObjectId,
                    productImages: ['img.jpg'],
                    taxStatus: 'vatable',
                    vat: validObjectId,
                },
            };
            
            const result = createProductSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });
    });
});
