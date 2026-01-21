
export class CryptoService {
    private static key: CryptoKey | null = null;

    static async init() {
        if (this.key) return;
        this.key = await window.crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: 256,
            },
            true,
            ["encrypt", "decrypt"]
        );
    }

    static async encrypt(text: string): Promise<string> {
        if (!this.key) await this.init();
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const iv = window.crypto.getRandomValues(new Uint8Array(12));

        if (!this.key) throw new Error("Key generation failed");

        const encrypted = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            this.key,
            data
        );

        // Combine IV + Encrypted Data -> Hex String
        const ivArray = Array.from(iv);
        const encryptedArray = Array.from(new Uint8Array(encrypted));
        const combined = [...ivArray, ...encryptedArray];

        return "0x" + combined.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    static async decrypt(hexBlob: string): Promise<string> {
        if (!this.key) await this.init();

        const raw = hexBlob.startsWith("0x") ? hexBlob.slice(2) : hexBlob;
        const bytes = new Uint8Array(raw.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

        const iv = bytes.slice(0, 12);
        const data = bytes.slice(12);

        if (!this.key) throw new Error("Key missing");

        const decrypted = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            this.key,
            data
        );

        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    }
}
