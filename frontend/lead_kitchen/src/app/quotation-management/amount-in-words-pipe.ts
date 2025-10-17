import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "amountInWords"
})
export class AmountInWordsPipe implements PipeTransform {
  private readonly ones: string[] = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  private readonly teens: string[] = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  private readonly tens: string[] = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  transform(value: number): string {
    if (isNaN(value)) return 'Invalid value';
    if (value === 0) return 'Zero';

    let str = '';

    if (value < 0) {
      str += 'Minus ';
      value = Math.abs(value);
    }

    const crore = Math.floor(value / 10000000);
    const lakh = Math.floor((value % 10000000) / 100000);
    const thousand = Math.floor((value % 100000) / 1000);
    const hundred = Math.floor((value % 1000) / 100);
    const tens = Math.floor((value % 100) / 10);
    const ones = Math.floor(value % 10);

    if (crore > 0) {
      str += this.convertThreeDigitsToWords(crore) + ' Crore ';
    }

    if (lakh > 0) {
      str += this.convertThreeDigitsToWords(lakh) + ' Lakh ';
    }

    if (thousand > 0) {
      str += this.convertThreeDigitsToWords(thousand) + ' Thousand ';
    }

    if (hundred > 0) {
      str += this.convertThreeDigitsToWords(hundred) + ' Hundred ';
    }

    if (tens === 1) {
      str += this.teens[ones] || '';
    } else {
      str += this.tens[tens] + ' ' + this.ones[ones];
    }

    return str.trim();
  }

  private convertThreeDigitsToWords(num: number): string {
    let str = '';

    const hundreds = Math.floor(num / 100);
    const tens = Math.floor((num % 100) / 10);
    const ones = Math.floor(num % 10);

    if (hundreds > 0) {
      str += this.ones[hundreds] + ' Hundred ';
    }

    if (tens === 1) {
      str += this.teens[ones] || '';
    } else {
      str += this.tens[tens] + ' ' + this.ones[ones];
    }

    return str.trim();
  }
}
