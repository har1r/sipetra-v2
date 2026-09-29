import { z } from 'zod';

export const optionalString = z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' || val === undefined ? null : val));

export const optionalNumber = z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => {
        if (val === '' || val === null || val === undefined) return null;
        const num = Number(val);
        return isNaN(num) ? null : num;
    });