import {dispatchDeskAlerts} from './push';
import {dispatchDiscordReceipts} from './discord';
export async function dispatchOrderNotifications(){
 const [phone,discord]=await Promise.allSettled([dispatchDeskAlerts(),dispatchDiscordReceipts()]);
 return {phone:phone.status==='fulfilled'?phone.value:{retry:true},discord:discord.status==='fulfilled'?discord.value:{retry:true}};
}
