/**
 * Unit tests for Auth Zod schemas.
 */
import { jest } from '@jest/globals';
import { signupSchema, signinSchema, forgetPasswordSchema, resetPasswordSchema, addWorkerSchema, editWorkerSchema } from '../schema/auth.schema.js';

describe('Auth Schema Validation', () => {

    describe('signupSchema', () => {
        it('should pass with valid signup data', () => {
            const validData = {
                body: {
                    username: 'johndoe',
                    email: 'john@example.com',
                    password: 'Password1!',
                    confirmPassword: 'Password1!',
                },
            };
            
            const result = signupSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail if passwords do not match', () => {
            const invalidData = {
                body: {
                    username: 'johndoe',
                    email: 'john@example.com',
                    password: 'Password1!',
                    confirmPassword: 'DifferentPass1!',
                },
            };
            
            const result = signupSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toMatch(/do not match/);
            }
        });

        it('should fail if password is too weak', () => {
            const invalidData = {
                body: {
                    username: 'johndoe',
                    email: 'john@example.com',
                    password: 'weak',
                    confirmPassword: 'weak',
                },
            };
            
            const result = signupSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should fail if username starts with number', () => {
            const invalidData = {
                body: {
                    username: '123john',
                    email: 'john@example.com',
                    password: 'Password1!',
                    confirmPassword: 'Password1!',
                },
            };
            
            const result = signupSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should fail with invalid email format', () => {
            const invalidData = {
                body: {
                    username: 'johndoe',
                    email: 'not-an-email',
                    password: 'Password1!',
                    confirmPassword: 'Password1!',
                },
            };
            
            const result = signupSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe('signinSchema', () => {
        it('should pass with valid login credentials', () => {
            const validData = {
                body: {
                    loginId: 'john@example.com',
                    password: 'anypassword',
                },
            };
            
            const result = signinSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail if loginId is empty', () => {
            const invalidData = {
                body: {
                    loginId: '',
                    password: 'anypassword',
                },
            };
            
            const result = signinSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe('forgetPasswordSchema', () => {
        it('should pass with valid email', () => {
            const validData = {
                body: {
                    email: 'john@example.com',
                },
            };
            
            const result = forgetPasswordSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail with invalid email', () => {
            const invalidData = {
                body: {
                    email: 'invalid-email',
                },
            };
            
            const result = forgetPasswordSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe('addWorkerSchema', () => {
        it('should pass with valid worker data', () => {
            const validData = {
                body: {
                    email: 'worker@example.com',
                    username: 'workeruser',
                    password: 'WorkerPass1!',
                    confirmPassword: 'WorkerPass1!',
                    role: 'admin',
                    jobDescription: 'Manager',
                },
            };
            
            const result = addWorkerSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail with invalid role', () => {
            const invalidData = {
                body: {
                    email: 'worker@example.com',
                    username: 'workeruser',
                    password: 'WorkerPass1!',
                    confirmPassword: 'WorkerPass1!',
                    role: 'invalidRole',
                    jobDescription: 'Manager',
                },
            };
            
            const result = addWorkerSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe('editWorkerSchema', () => {
        const validWorkerId = '507f1f77bcf86cd799439011';

        it('should pass with valid edit data', () => {
            const validData = {
                params: { workerId: validWorkerId },
                body: {
                    email: 'updated@example.com',
                    username: 'updateduser',
                    role: 'rider',
                    jobDescription: 'Delivery Rider',
                },
            };
            
            const result = editWorkerSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it('should fail with invalid email', () => {
            const invalidData = {
                params: { workerId: validWorkerId },
                body: {
                    email: 'invalid-email',
                    username: 'updateduser',
                    role: 'rider',
                    jobDescription: 'Delivery Rider',
                },
            };
            
            const result = editWorkerSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it('should pass with empty password (for edits where password is not changed)', () => {
            const validData = {
                params: { workerId: validWorkerId },
                body: {
                    email: 'updated@example.com',
                    username: 'updateduser',
                    password: '',
                    role: 'rider',
                    jobDescription: 'Delivery Rider',
                },
            };
            
            const result = editWorkerSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });
    });
});
