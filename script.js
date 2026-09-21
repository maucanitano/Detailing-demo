const WHATSAPP="5491127712203";
let selectedServices=[];
const money=n=>new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(n);
const $=s=>document.querySelector(s);

function renderSelectedServices(){
  const box=$("#selectedServices");
  const total=selectedServices.reduce((sum,service)=>sum+service.price,0);
  $("#chosenPrice").textContent=selectedServices.length?money(total):"";
  if(!selectedServices.length){
    box.innerHTML="<p>Elegí uno o más servicios arriba</p>";
    return;
  }
  box.innerHTML=selectedServices.map((service,index)=>`
    <div class="selected-service">
      <span>${service.name}</span>
      <strong>${money(service.price)}</strong>
      <button type="button" class="remove-service" data-index="${index}" aria-label="Quitar ${service.name}">×</button>
    </div>
  `).join("");
  box.querySelectorAll(".remove-service").forEach(btn=>btn.addEventListener("click",()=>{
    selectedServices.splice(Number(btn.dataset.index),1);
    renderSelectedServices();
    showToast("Servicio quitado");
  }));
}

document.querySelectorAll(".select-service").forEach(btn=>btn.addEventListener("click",()=>{
  const service={name:btn.dataset.service,price:Number(btn.dataset.price)};
  const exists=selectedServices.some(item=>item.name===service.name);
  if(exists){
    showToast("Ese servicio ya está seleccionado");
    return;
  }
  selectedServices.push(service);
  renderSelectedServices();
  document.querySelector("#turno").scrollIntoView({behavior:"smooth"});
  showToast("Servicio agregado: "+service.name);
}));

$("#bookingForm").addEventListener("submit",e=>{
  e.preventDefault();
  if(!selectedServices.length){
    showToast("Primero elegí al menos un servicio");
    return;
  }
  const date=$("#date").value;
  const dateText=new Date(date+"T12:00:00").toLocaleDateString("es-AR",{day:"2-digit",month:"2-digit",year:"numeric"});
  const total=selectedServices.reduce((sum,service)=>sum+service.price,0);
  const servicesText=selectedServices.map(service=>"• "+service.name+" — "+money(service.price)).join("%0A");
  let message="Hola BRUTAL DETAIL, quiero solicitar un turno.%0A%0A*Servicios:*%0A"+servicesText+"%0A*Total estimado:* "+encodeURIComponent(money(total))+"%0A*Nombre:* "+encodeURIComponent($("#name").value.trim())+"%0A*WhatsApp:* "+encodeURIComponent($("#phone").value.trim())+"%0A*Fecha:* "+encodeURIComponent(dateText)+"%0A*Horario:* "+encodeURIComponent($("#time").value)+"%0A*Vehículo:* "+encodeURIComponent($("#vehicle").value.trim());
  if($("#plate").value.trim())message+="%0A*Patente:* "+encodeURIComponent($("#plate").value.trim());
  if($("#notes").value.trim())message+="%0A*Mensaje:* "+encodeURIComponent($("#notes").value.trim());
  window.open("https://wa.me/"+WHATSAPP+"?text="+message,"_blank")
});

const today=new Date();
today.setMinutes(today.getMinutes()-today.getTimezoneOffset());
$("#date").min=today.toISOString().split("T")[0];

function showToast(t){
  const el=$("#toast");
  el.textContent=t;
  el.classList.add("show");
  setTimeout(()=>el.classList.remove("show"),1800)
}

$("#menu").addEventListener("click",()=>$("#nav").classList.toggle("open"));
document.querySelectorAll("#nav a").forEach(a=>a.addEventListener("click",()=>$("#nav").classList.remove("open")));

const observer=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){
    e.target.classList.add("visible");
    observer.unobserve(e.target)
  }
}),{threshold:.12});
document.querySelectorAll(".reveal").forEach(e=>observer.observe(e));

renderSelectedServices();