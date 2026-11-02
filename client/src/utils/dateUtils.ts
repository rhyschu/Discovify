
export class DateUtils {
    private date: Date;

    constructor(date?: Date) {
        this.date = date ? date : new Date();
    }
    getYear(): number {
        return this.date.getFullYear();
    }
    getMonth(): number {
        return this.date.getMonth() + 1;
    }
    getDate(): number {
        return this.date.getDate();
    }
    getHours(): number {
        return this.date.getHours();
    }
    getMinutes(): number {
        return this.date.getMinutes();
    }
    getSeconds(): number {
        return this.date.getSeconds();
    }
    formatDateTime(): string {
        const year = this.getYear();
        const month = String(this.getMonth()).padStart(2, '0');
        const date = String(this.getDate()).padStart(2, '0');
        const hours = String(this.getHours()).padStart(2, '0');
        const minutes = String(this.getMinutes()).padStart(2, '0');
        const seconds = String(this.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
    }
    formatDate(): string {
        const year = this.getYear();
        const month = String(this.getMonth()).padStart(2, '0');
        const date = String(this.getDate()).padStart(2, '0');

        return `${year}-${month}-${date}`;
    }
    formatTime(): string {
        const hours = String(this.getHours()).padStart(2, '0');
        const minutes = String(this.getMinutes()).padStart(2, '0');
        const seconds = String(this.getSeconds()).padStart(2, '0');

        return `${hours}:${minutes}:${seconds}`;
    }
}