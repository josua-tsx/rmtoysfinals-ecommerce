/**
 * Unit tests for VAT Zod schemas.
 */
import { jest } from '@jest/globals';
import { addVatSchema, editVatSchema } from '../schema/vat.schema.js';

describe('VAT Schema Validation', () => {
    const validObjectId = '507f1f77bcf86cd799439011';

    describe('addVatSchema', () => {
        it('should pass with valid vatPercent', () => {
            const validData = {
                body: {
                    vatPercent: 12,
                },
            };
            
            const result = addVatSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail if vatPercent is negative', () => {
            const invalidData = {
                body: {
                    vatPercent: -5,
                },
            };
            
            const result = addVatSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should fail if vatPercent exceeds 10000', () => {
            const invalidData = {
                body: {
                    vatPercent: 20000,
                },
            };
            
            const result = addVatSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe('editVatSchema', () => {
        it('should pass with valid vatId and vatPercent', () => {
            const validData = {
                params: {
                    vatId: validObjectId,
                },
                body: {
                    vatPercent: 15,
                },
            };
            
            const result = editVatSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail with invalid vatId', () => {
            const invalidData = {
                params: {
                    vatId: 'bad-id',
                },
                body: {
                    vatPercent: 15,
                },
            };
            
            const result = editVatSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });
});
