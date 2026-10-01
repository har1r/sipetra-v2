import { z } from 'zod';

export const optionalString = z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal(''))
    .transform((val) => (val === '' || val === undefined || val === null ? null : val));

export const optionalNumber = z
    .union([z.number(), z.string(), z.null()])
    .optional()
    .nullable()
    .transform((val) => {
        if (val === '' || val === null || val === undefined) return null;
        const num = Number(val);
        return isNaN(num) ? null : num;
    });