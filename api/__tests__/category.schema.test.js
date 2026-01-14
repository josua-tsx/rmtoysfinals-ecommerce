/**
 * Unit tests for Category Zod schemas.
 * These tests validate the schema logic directly without using Supertest/Express.
 */
import { jest } from '@jest/globals';
import { createCategorySchema, updateCategorySchema } from '../schema/category.schema.js';

describe('Category Schema Validation', () => {
    describe('createCategorySchema', () => {
        it('should pass with valid data', () => {
            const validData = {
                body: {
                    categoryName: 'Action Figures',
                    categoryDescription: 'Super hero action figures',
                },
            };
            
            const result = createCategorySchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail if categoryName is missing', () => {
            const invalidData = {
                body: {
                    categoryDescription: 'Description only',
                },
            };
            
            const result = createCategorySchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should fail if categoryName is too short', () => {
            const invalidData = {
                body: {
                    categoryName: 'AB',
                    categoryDescription: 'Valid description',
                },
            };
            
            const result = createCategorySchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toMatch(/3-50 characters/);
            }
        });

        it('should fail if categoryName contains invalid characters', () => {
            const invalidData = {
                body: {
                    categoryName: 'Action@Figures!',
                    categoryDescription: 'Valid description',
                },
            };
            
            const result = createCategorySchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should pass with numbers in categoryName', () => {
            const validData = {
                body: {
                    categoryName: 'RC Cars 2024',
                    categoryDescription: 'Remote control cars',
                },
            };
            
            const result = createCategorySchema.safeParse(validData);
            expect(result.success).toBe(true);
        });
    });

    describe('updateCategorySchema', () => {
        it('should pass with valid params and partial body', () => {
            const validData = {
                params: {
                    categoryId: '507f1f77bcf86cd799439011', // Valid ObjectId
                },
                body: {
                    categoryName: 'Updated Name',
                },
            };
            
            const result = updateCategorySchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail with invalid categoryId', () => {
            const invalidData = {
                params: {
                    categoryId: 'invalid-id',
                },
                body: {
                    categoryName: 'Updated Name',
                },
            };
            
            const result = updateCategorySchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });
});
