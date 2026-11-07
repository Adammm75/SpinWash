const days=[["Lun","lundi"],["Mar","mardi"],["Mer","mercredi"],["Jeu","jeudi"],["Ven","vendredi"],["Sam","samedi"],["Dim","dimanche"]];
const slots=[["10h–12h","Matin"],["13h–15h","Après-midi"],["16h–18h","Après-midi"],["19h–21h","Soir"]];
const WA="https://wa.me/33755107459";
const esc=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
function link(abbr,full,slot){
  const sun=abbr==="Dim";
  const msg=["Bonjour SPINWASH, je souhaite réserver un lavage.","",
    `Créneau souhaité : ${full} de ${slot}`,
    sun?"Lieu : sur place à Drancy (60 rue Saint-Stenay)":"Ville : ",
    "Véhicule (marque et modèle) : ","","Merci de me confirmer la disponibilité."].join("\n");
  return `${WA}?text=${encodeURIComponent(msg)}`;
}
let rows="";
for(const [slot,part] of slots){
  rows+=`        <tr>\n          <th scope="row">${slot}<small>${part}</small></th>\n`;
  for(const [abbr,full] of days){
    const sun=abbr==="Dim";
    rows+=`          <td><a class="slot${sun?" slot--sun":""}" href="${esc(link(abbr,full,slot))}" target="_blank" rel="noopener noreferrer" title="Réserver ${full} de ${slot} sur WhatsApp" aria-label="Réserver ${full} de ${slot} sur WhatsApp"><span aria-hidden="true"></span></a></td>\n`;
  }
  rows+=`        </tr>\n`;
}
let head="";
for(const [abbr] of days) head+=`          <th scope="col"${abbr==="Dim"?' class="sun"':""}>${abbr}</th>\n`;
process.stdout.write(`          <th scope="col"><span class="sr">Créneau</span></th>\n${head}@@SPLIT@@${rows}`);
