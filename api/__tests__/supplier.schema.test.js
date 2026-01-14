/**
 * Unit tests for Supplier Zod schemas.
 */
import { jest } from '@jest/globals';
import { createSupplierSchema, updateSupplierSchema } from '../schema/supplier.schema.js';

describe('Supplier Schema Validation', () => {
    const validObjectId = '507f1f77bcf86cd799439011';

    describe('createSupplierSchema', () => {
        it('should pass with valid supplier data', () => {
            const validData = {
                body: {
                    supplierName: 'Toy World Inc.',
                    contactNumber: '09171234567',
                    contactPerson: 'Juan Dela Cruz',
                    supplierAddress: '123 Main Street, Manila',
                },
            };
            
            const result = createSupplierSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail with invalid phone format', () => {
            const invalidData = {
                body: {
                    supplierName: 'Toy World Inc.',
                    contactNumber: '1234567890', // Not PH format
                    contactPerson: 'Juan Dela Cruz',
                    supplierAddress: '123 Main Street, Manila',
                },
            };
            
            const result = createSupplierSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toMatch(/11 digits/);
            }
        });

        it('should fail if supplier name is too short', () => {
            const invalidData = {
                body: {
                    supplierName: 'AB',
                    contactNumber: '09171234567',
                    contactPerson: 'Juan',
                    supplierAddress: '123 Main Street',
                },
            };
            
            const result = createSupplierSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should fail if address is too short', () => {
            const invalidData = {
                body: {
                    supplierName: 'Valid Supplier',
                    contactNumber: '09171234567',
                    contactPerson: 'Contact Person',
                    supplierAddress: '123', // Too short
                },
            };
            
            const result = createSupplierSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe('updateSupplierSchema', () => {
        it('should pass with valid supplierId and partial body', () => {
            const validData = {
                params: {
                    supplierId: validObjectId,
                },
                body: {
                    supplierName: 'Updated Supplier Name',
                },
            };
            
            const result = updateSupplierSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail with invalid supplierId', () => {
            const invalidData = {
                params: {
                    supplierId: 'bad-id',
                },
                body: {
                    supplierName: 'Updated Name',
                },
            };
            
            const result = updateSupplierSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });
});
