/**
 * Unit tests for FAQs Zod schemas.
 */
import { jest } from '@jest/globals';
import { faqsSchema, updateFaqSchema, deleteMultiFaqsSchema } from '../schema/faqs.schema.js';

describe('FAQs Schema Validation', () => {
    const validObjectId = '507f1f77bcf86cd799439011';

    describe('faqsSchema (addFaq)', () => {
        it('should pass with valid title and answer', () => {
            const validData = {
                body: {
                    title: 'How do I order?',
                    answer: 'You can order by adding items to your cart.',
                },
            };
            
            const result = faqsSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail if title is empty', () => {
            const invalidData = {
                body: {
                    title: '',
                    answer: 'Valid answer',
                },
            };
            
            const result = faqsSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should fail if answer is missing', () => {
            const invalidData = {
                body: {
                    title: 'Valid title?',
                },
            };
            
            const result = faqsSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should fail with invalid title characters', () => {
            const invalidData = {
                body: {
                    title: 'Title with @special# chars',
                    answer: 'Valid answer',
                },
            };
            
            const result = faqsSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe('updateFaqSchema', () => {
        it('should pass with valid faqSingleId and body', () => {
            const validData = {
                params: {
                    faqSingleId: validObjectId,
                },
                body: {
                    title: 'Updated title?',
                    answer: 'Updated answer.',
                },
            };
            
            const result = updateFaqSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail with invalid faqSingleId', () => {
            const invalidData = {
                params: {
                    faqSingleId: 'invalid-id',
                },
                body: {
                    title: 'Title',
                    answer: 'Answer',
                },
            };
            
            const result = updateFaqSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe('deleteMultiFaqsSchema', () => {
        it('should pass with array of valid ObjectIds', () => {
            const validData = {
                body: {
                    faqIds: [validObjectId, '507f1f77bcf86cd799439012'],
                },
            };
            
            const result = deleteMultiFaqsSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail with empty array', () => {
            const invalidData = {
                body: {
                    faqIds: [],
                },
            };
            
            const result = deleteMultiFaqsSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });
});
