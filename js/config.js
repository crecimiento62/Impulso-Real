// ============================================================
// CONFIGURACIÓN PÚBLICA
// ============================================================
// Con esta arquitectura (Netlify Identity + Netlify Blobs), ya no
// necesitas pegar ninguna llave aquí — Netlify Identity funciona
// automáticamente en el dominio donde publiques el sitio, sin
// configuración adicional en el código.
//
// Lo único que debes editar es tu enlace real de compra de Hotmart,
// una vez lo tengas:
// ============================================================
export const HOTMART_CHECKOUT_URL = "<script type="text/javascript">
	function importHotmart(){ 
 		var imported = document.createElement('script'); 
 		imported.src = 'https://static.hotmart.com/checkout/widget.min.js'; 
 		document.head.appendChild(imported); 
		var link = document.createElement('link'); 
		link.rel = 'stylesheet'; 
		link.type = 'text/css'; 
		link.href = 'https://static.hotmart.com/css/hotmart-fb.min.css'; 
		document.head.appendChild(link);	} 
 	importHotmart(); 
 </script> 
 <a onclick="return false;" href="https://pay.hotmart.com/P107598395P?checkoutMode=2" class="hotmart-fb hotmart__button-checkout"><img src='https://static.hotmart.com/img/btn-buy-green.png'></a> ";
