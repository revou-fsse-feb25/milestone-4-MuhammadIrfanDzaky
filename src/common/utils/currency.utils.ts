export class CurrencyUtil {
    static safeFormatIDR(amount: bigint): string {
        return this.formatIDR ? this.formatIDR(amount) : `Rp${amount}`;
    }
    
    // Convert BigInt to formatted IDR string
    static formatIDR(amount: bigint): string {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(Number(amount));
    }

    // Convert float to BigInt (for input handling)
    static floatToBigInt(value: number): bigint {
        if (isNaN(value)) throw new Error('Invalid number');
        return BigInt(Math.round(value));
    }

    static parseIDR(amountString: string): bigint {
        if (!amountString) throw new Error('Empty input');
        const cleanString = amountString.replace(/[^\d]/g, '');
        return BigInt(cleanString);
    }
}