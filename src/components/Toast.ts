import { f7 } from "framework7-react";
type ToastType = "info" | "error" | "success" | undefined
const presentToast = (type: ToastType, message: string) => {
	const icon = type === 'info' ? '<i class="f7-icons">info_circle</i>' :
		type === "error" ? '<i class="f7-icons">exclamationmark_circle</i>' :
		type === "success" ? '<i class="f7-icons">checkmark_alt_circle</i>':
		'';
	const newToast = f7.toast.create({
		icon: icon,
		text: message,
		position: 'center',
		closeTimeout: 2000
	})
	newToast.open();
}
export default presentToast
