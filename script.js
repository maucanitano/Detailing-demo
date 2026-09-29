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

const TURNOS_URL="https://script.google.com/macros/s/AKfycbz7auQThTcaUxm_xfo2Xpb9Yrr5csNHRGJLFtCGX8p68mQAwqZi0y5spZfEeqLDfrQ8/exec";

$("#bookingForm").addEventListener("submit",async e=>{
  e.preventDefault();
  if(!selectedServices.length){
    showToast("Primero elegí al menos un servicio");
    return;
  }

  const form=e.currentTarget;
  const submitButton=form.querySelector("button[type=submit]");
  const originalText=submitButton.textContent;
  const date=$("#date").value;
  const time=$("#time").value;
  const name=$("#name").value.trim();
  const phone=$("#phone").value.trim();
  const vehicle=$("#vehicle").value.trim();
  const plate=$("#plate").value.trim();
  const notes=$("#notes").value.trim();
  const dateText=new Date(date+"T12:00:00").toLocaleDateString("es-AR",{day:"2-digit",month:"2-digit",year:"numeric"});
  const total=selectedServices.reduce((sum,service)=>sum+service.price,0);
  const servicesText=selectedServices.map(service=>"• "+service.name+" — "+money(service.price)).join("%0A");

  submitButton.disabled=true;
  submitButton.textContent="Verificando horario...";

  try{
    // text/plain evita un preflight CORS innecesario en Apps Script.
    const response=await fetch(TURNOS_URL,{
      method:"POST",
      redirect:"follow",
      headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify({
        fecha:date,
        hora:time,
        nombre:name,
        telefono:phone,
        servicios:selectedServices.map(service=>service.name).join(", ")
      })
    });

    const result=JSON.parse(await response.text());

    if(!result.success){
      showToast(result.message||"Ese horario ya no está disponible");
      alert("❌ "+(result.message||"Ese horario ya no está disponible."));
      return;
    }

    let message="Hola BRUTAL DETAIL, quiero solicitar un turno.%0A%0A*Servicios:*%0A"+servicesText+"%0A*Total estimado:* "+encodeURIComponent(money(total))+"%0A*Nombre:* "+encodeURIComponent(name)+"%0A*WhatsApp:* "+encodeURIComponent(phone)+"%0A*Fecha:* "+encodeURIComponent(dateText)+"%0A*Horario:* "+encodeURIComponent(time)+"%0A*Vehículo:* "+encodeURIComponent(vehicle);
    if(plate)message+="%0A*Patente:* "+encodeURIComponent(plate);
    if(notes)message+="%0A*Mensaje:* "+encodeURIComponent(notes);

    showToast("¡Turno reservado!");
    window.open("https://wa.me/"+WHATSAPP+"?text="+message,"_blank");
    form.reset();
    selectedServices=[];
    renderSelectedServices();
  }catch(error){
    console.error(error);
    alert("❌ No pudimos confirmar el turno. No se abrió WhatsApp para evitar una reserva sin confirmar.");
  }finally{
    submitButton.disabled=false;
    submitButton.textContent=originalText;
  }
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