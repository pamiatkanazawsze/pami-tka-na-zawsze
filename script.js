// === KONFIGURACJA (edytuj tutaj) ===
// ADRES DO KTÓREGO OTWIERANY JEST MAILTO (zmień na swój)
const BUSINESS_EMAIL = "twojemail@domena.pl"; // <-- podmień
document.getElementById?.("contactEmail")?.setAttribute?.("href", `mailto:${BUSINESS_EMAIL}`);

// PIERWOTNA LISTA PRODUKTÓW (edytujesz tu: title, type, price, img, desc)
const products = [
  {id:1, title:"Zawieszka - Mamba (czarna)", type:"zawieszka", price:40, img:"prod-mamba.jpg", desc:"Zawieszka z futerkiem, ramka złota."},
  {id:2, title:"Pierścionek - Regulowany, złoto", type:"pierscionek", price:25, img:"prod-ring1.jpg", desc:"Regulowany pierścionek z żywicy."},
  {id:3, title:"Brelok - Serce", type:"brelok", price:35, img:"prod-brelok1.jpg", desc:"Brelok z włosem i mini-kwiatkami."}
];

// DOM + helpery
document.addEventListener("DOMContentLoaded", ()=> {
  // safe set contact link if element exists
  const ce = document.getElementById("contactEmail");
  if(ce) ce.href = `mailto:${BUSINESS_EMAIL}`;

  const grid = document.getElementById("productsGrid");
  const filter = document.getElementById("filterType");
  const search = document.getElementById("search");
  const year = document.getElementById("year");
  const promoText = document.getElementById("promoText");
  const cartBtn = document.getElementById("cartBtn");
  const orderModal = document.getElementById("orderModal");
  const modalBody = document.getElementById("modalBody");
  const closeModal = document.getElementById("closeModal");
  const copyOrder = document.getElementById("copyOrder");
  const mailOrder = document.getElementById("mailOrder");
  const orderForm = document.getElementById("orderForm");
  const adminToggle = document.getElementById("adminToggle");
  const adminPanel = document.getElementById("adminPanel");
  const addFlowerBtn = document.getElementById("addFlower");
  const newFlowerInput = document.getElementById("newFlower");
  const flowersListEl = document.getElementById("flowersList");
  const closeAdmin = document.getElementById("closeAdmin");
  const howBtn = document.getElementById("howBtn");

  year.textContent = new Date().getFullYear();
  promoText.textContent = "Promocja: zawieszki 40 zł — do 31.12";

  // Dynamiczna lista kwiatów sztucznych - zapis w localStorage
  const FLOWER_STORAGE_KEY = "tm_artificial_flowers_v1";

  function getFlowers(){
    try{
      const raw = localStorage.getItem(FLOWER_STORAGE_KEY);
      if(!raw) return [
        "Różyczki pastelowe",
        "Białe mini",
        "Pastelowe różowe",
        "Mocny róż",
        "Niebieskie",
        "Fioletowe"
      ];
      return JSON.parse(raw);
    }catch(e){
      return ["Różyczki pastelowe","Białe mini"];
    }
  }
  function setFlowers(arr){ localStorage.setItem(FLOWER_STORAGE_KEY, JSON.stringify(arr)); renderFlowersAdmin(); }

  function renderFlowersAdmin(){
    const arr = getFlowers();
    flowersListEl.innerHTML = "";
    arr.forEach((f, idx)=>{
      const li = document.createElement("li");
      li.innerHTML = `<span>${f}</span><button data-idx="${idx}" class="rmFlower">Usuń</button>`;
      flowersListEl.appendChild(li);
    });
    document.querySelectorAll(".rmFlower").forEach(b=>{
      b.addEventListener("click", (e)=>{
        const i = +e.currentTarget.dataset.idx;
        const a = getFlowers();
        a.splice(i,1);
        setFlowers(a);
      });
    });
  }

  // RENDER PRODUKTÓW
  function render(list){
    grid.innerHTML = "";
    if(!list.length) grid.innerHTML = "<p>Brak produktów — dodaj w script.js</p>";
    list.forEach(p=>{
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${p.img}" alt="${p.title}" />
        <h4>${p.title}</h4>
        <p class="small">${p.desc || ""}</p>
        <div class="price-row">
          <div><strong>${p.price} zł</strong></div>
          <div>
            <button class="btn small btn-order" data-id="${p.id}">Zamów</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
    // eventy
    document.querySelectorAll(".btn-order").forEach(b=>{
      b.addEventListener("click", e=>{
        const id = +e.currentTarget.dataset.id;
        const prod = products.find(x=>x.id===id);
        openModalFor(prod);
      });
    });
  }

  // FILTER + SEARCH
  function applyFilters(){
    const type = filter.value;
    const q = (search.value||"").toLowerCase().trim();
    let res = products.filter(p => (type==="all" || p.type===type));
    if(q) res = res.filter(p => (p.title + " " + p.desc).toLowerCase().includes(q));
    render(res);
  }
  filter.addEventListener("change", applyFilters);
  search.addEventListener("input", applyFilters);

  // MODAL PERSONALIZACJI (pełna wersja)
  function openModalFor(prod){
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const flowers = getFlowers(); // dynamiczne

    modalBody.innerHTML = `
      <p><strong>${prod.title}</strong></p>
      <p>${prod.desc}</p>
      <p>Cena: <strong>${prod.price} zł</strong></p>
      <hr style="margin:12px 0;">
      <label>Wybierz literkę (opcjonalnie):</label>
      <select id="mLetter" style="width:100%;padding:8px;margin:6px 0;">
        <option value="">Brak literki</option>
        ${alphabet.map(l=>`<option value="${l}">${l}</option>`).join("")}
      </select>

      <label>Co zatapiamy?</label>
      <select id="mMaterial" style="width:100%;padding:8px;margin:6px 0;">
        <option value="wlos">Włosy / futerko</option>
        <option value="prochy">Prochy</option>
        <option value="kwiaty_suszone">Kwiaty suszone</option>
        <option value="kwiaty_sztuczne">Kwiaty sztuczne</option>
      </select>

      <div id="flowersSection" style="display:none;margin-top:10px;">
        <label>Wybierz rodzaj sztucznych kwiatków:</label>
        <select id="mFlower" style="width:100%;padding:8px;margin:6px 0;">
          ${flowers.map(f=>`<option value="${f}">${f}</option>`).join("")}
        </select>
      </div>

      <label>Wybierz literkę graweru (opcjonalnie, ta sama co wyżej):</label>
      <input id="mEngrave" placeholder="Tekst do graweru (max 10 znaków)" style="width:100%;padding:8px;margin:6px 0;" />

      <label>Wybierz kolor ramki:</label>
      <select id="mFrame" style="width:100%;padding:8px;margin:6px 0;">
        <option value="zloty">Złoto</option>
        <option value="srebrny">Srebro</option>
        <option value="czarny">Czarny</option>
      </select>

      <label>Imię:</label>
      <input id="mName" style="width:100%;padding:8px;margin-top:6px" />

      <label>Email:</label>
      <input id="mEmail" style="width:100%;padding:8px;margin-top:6px" />

      <label>Uwagi (np. preferencje, zdjęcie dołączone mailowo):</label>
      <textarea id="mNotes" style="width:100%;padding:8px;margin-top:6px"></textarea>
    `;

    // show/hide flowers
    setTimeout(()=>{
      const material = document.getElementById("mMaterial");
      const flowerSection = document.getElementById("flowersSection");
      material.addEventListener("change", ()=>{
        flowerSection.style.display = material.value === "kwiaty_sztuczne" ? "block" : "none";
      });
    }, 50);

    orderModal.classList.remove("hidden");

    // kopiuj
    copyOrder.onclick = ()=>{
      const name = document.getElementById("mName").value || "[Imię]";
      const email = document.getElementById("mEmail").value || "[Email]";
      const notes = document.getElementById("mNotes").value || "[Uwagi]";
      const letter = document.getElementById("mLetter").value || "brak";
      const material = document.getElementById("mMaterial").value;
      const flower = material === "kwiaty_sztuczne" ? document.getElementById("mFlower").value : "nie dotyczy";
      const engrave = document.getElementById("mEngrave").value || "brak";
      const frame = document.getElementById("mFrame").value || "zloty";

      const materialLabel = {
        "wlos": "Włosy / futerko",
        "prochy": "Prochy",
        "kwiaty_suszone": "Kwiaty suszone",
        "kwiaty_sztuczne": "Kwiaty sztuczne"
      }[material] || material;

      const text = 
`Zamówienie: ${prod.title}
Cena: ${prod.price} zł

Personalizacja:
- Literka wyboru: ${letter}
- Grawer: ${engrave}
- Zatapiane: ${materialLabel}
- Rodzaj kwiatów sztucznych: ${flower}
- Kolor ramki: ${frame}

Dane:
Imię: ${name}
Email: ${email}

Uwagi:
${notes}`;

      navigator.clipboard?.writeText(text)
        .then(()=>alert("Skopiowano treść zamówienia do schowka"))
        .catch(()=>{ prompt("Skopiuj ręcznie (CTRL+C):", text); });
    };

    // mailto
    mailOrder.onclick = ()=>{
      const name = document.getElementById("mName").value || "";
      const email = document.getElementById("mEmail").value || "";
      const notes = document.getElementById("mNotes").value || "";
      const letter = document.getElementById("mLetter").value || "brak";
      const material = document.getElementById("mMaterial").value;
      const flower = material === "kwiaty_sztuczne" ? document.getElementById("mFlower").value : "nie dotyczy";
      const engrave = document.getElementById("mEngrave").value || "brak";
      const frame = document.getElementById("mFrame").value || "zloty";

      const materialLabel = {
        "wlos": "Włosy / futerko",
        "prochy": "Prochy",
        "kwiaty_suszone": "Kwiaty suszone",
        "kwiaty_sztuczne": "Kwiaty sztuczne"
      }[material] || material;

      const subject = encodeURIComponent(`Zamówienie: ${prod.title}`);
      const body = encodeURIComponent(
`Zamówienie: ${prod.title}
Cena: ${prod.price} zł

Personalizacja:
- Literka wyboru: ${letter}
- Grawer: ${engrave}
- Zatapiane: ${materialLabel}
- Rodzaj kwiatów sztucznych: ${flower}
- Kolor ramki: ${frame}

Imię: ${name}
Email: ${email}

Uwagi:
${notes}`
      );

      window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;
    };
  }

  // eventy modalu
  closeModal.onclick = ()=> orderModal.classList.add("hidden");
  orderModal.addEventListener("click", (e)=> { if(e.target === orderModal) orderModal.classList.add("hidden"); });

  // szybkie zamówienie z sekcji kontakt (mailto)
  orderForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const fd = new FormData(orderForm);
    const subject = encodeURIComponent(`Zamówienie: ${fd.get("itemType")}`);
    const body = encodeURIComponent(
      `Imię: ${fd.get("name")}\nEmail: ${fd.get("email")}\nTyp: ${fd.get("itemType")}\nUwagi: ${fd.get("notes")}`
    );
    window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;
  });

  // admin panel: toggle
  adminToggle.addEventListener("click", ()=> {
    adminPanel.classList.toggle("hidden");
    renderFlowersAdmin();
  });
  closeAdmin.addEventListener("click", ()=> adminPanel.classList.add("hidden"));

  // dodawanie kwiatu
  addFlowerBtn.addEventListener("click", ()=>{
    const v = (newFlowerInput.value || "").trim();
    if(!v) return alert("Wpisz nazwę kwiatuszka.");
    const a = getFlowers();
    a.push(v);
    setFlowers(a);
    newFlowerInput.value = "";
  });

  // how to
  howBtn?.addEventListener?.("click", ()=> {
    alert("Jak zamówić: wybierz produkt → kliknij 'Zamów' → w oknie wybierz literkę, materiał (np. prochy/włosy) i ewentualnie rodzaj sztucznych kwiatków. Skopiuj zamówienie lub wyślij maila. Zdjęcia dołącz przez maila/Instagram.");
  });

  // initial render
  render(products);
  renderFlowersAdmin();
  applyFilters();
});
