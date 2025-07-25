export class CurrencyUtil {
    // Convert BigInt to formatted IDR string
    static formatIDR(amount: bigint): string {
        return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        }).format(Number(amount));
    }

    // Convert float to BigInt (for input handling)
    static floatToBigInt(value: number): bigint {
        if (isNaN(value)) throw new Error('Invalid number');
        return BigInt(Math.round(value));
    }
}