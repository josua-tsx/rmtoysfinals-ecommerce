/**
 * Unit tests for Rider Zod schemas.
 */
import { jest } from '@jest/globals';
import { riderSchema, editRiderSchema, deleteMultiRiderSchema } from '../schema/rider.schema.js';

describe('Rider Schema Validation', () => {
    const validObjectId = '507f1f77bcf86cd799439011';

    describe('riderSchema (addRider)', () => {
        it('should pass with valid name and phone', () => {
            const validData = {
                body: {
                    riderName: 'Juan Dela Cruz',
                    riderPhoneNumber: '09171234567',
                },
            };
            
            const result = riderSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail with invalid phone format', () => {
            const invalidData = {
                body: {
                    riderName: 'Juan Dela Cruz',
                    riderPhoneNumber: '1234567890', 
                },
            };
            
            const result = riderSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toMatch(/Invalid Philippine mobile number/);
            }
        });

        it('should fail with numbers in name', () => {
            const invalidData = {
                body: {
                    riderName: 'Juan123',
                    riderPhoneNumber: '09171234567',
                },
            };
            
            const result = riderSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toMatch(/Full name can only contain letters/);
            }
        });

        it('should pass with +63 phone format', () => {
            const validData = {
                body: {
                    riderName: 'Maria Santos',
                    riderPhoneNumber: '+639171234567',
                },
            };
            
            const result = riderSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });
    });

    describe('deleteMultiRiderSchema', () => {
        it('should pass with array of valid ObjectIds', () => {
            const validData = {
                body: {
                    riderIds: [validObjectId, '507f1f77bcf86cd799439012'],
                },
            };
            
            const result = deleteMultiRiderSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail with empty array', () => {
            const invalidData = {
                body: {
                    riderIds: [],
                },
            };
            
            const result = deleteMultiRiderSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toMatch(/Rider IDS should be an array/);
            }
        });
    });

    describe('editRiderSchema', () => {
        it('should pass with valid edit data', () => {
            const validData = {
                params: { riderId: validObjectId },
                body: {
                    riderName: 'Updated Rider',
                    riderPhoneNumber: '09876543210',
                },
            };
            
            const result = editRiderSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });
    });
});
