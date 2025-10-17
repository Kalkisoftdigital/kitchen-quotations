import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'eventTimeFormat'
})
export class EventTimeFormatPipe implements PipeTransform {
  transform(dateString: string): string {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `AT ${formattedHours}:${formattedMinutes} ${ampm}`;
  }
}
