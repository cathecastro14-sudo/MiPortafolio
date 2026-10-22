// =========================================================
// Portafolio Catherine Castro Escudero
// =========================================================

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const punteroFino = matchMedia('(pointer: fine)').matches;
const raiz = document.documentElement;

// ---------- Luz que sigue al cursor ----------
let punto = { x: innerWidth * 0.72, y: innerHeight * 0.18 };
let ultimoMovimiento = -Infinity;
let luzPendiente = false;

if (punteroFino && !reduceMotion) {
    window.addEventListener('pointermove', e => {
        punto = { x: e.clientX, y: e.clientY };
        ultimoMovimiento = performance.now();
        if (!luzPendiente) {
            luzPendiente = true;
            requestAnimationFrame(() => {
                raiz.style.setProperty('--mx', punto.x + 'px');
                raiz.style.setProperty('--my', punto.y + 'px');
                luzPendiente = false;
            });
        }
    }, { passive: true });
}

// ---------- Nombre: las letras reaccionan al cursor ----------
const nombre = document.getElementById('nombre');
const letras = [];

nombre.querySelectorAll('.linea').forEach(linea => {
    const texto = linea.textContent.trim();
    linea.textContent = '';
    for (const ch of texto) {
        if (ch === ' ') { linea.append(' '); continue; }
        const s = document.createElement('span');
        s.className = 'l';
        s.textContent = ch;
        s.setAttribute('aria-hidden', 'true');
        letras.push({ el: s, actual: 0 });
        linea.append(s);
    }
});

const PESO_BASE = 350;
const PESO_EXTRA = 450;

function pintarLetra(l, t) {
    l.actual = t;
    l.el.style.fontWeight = Math.round(PESO_BASE + PESO_EXTRA * t);
    l.el.style.setProperty('--t', t.toFixed(3));
}

if (!reduceMotion) {
    let heroVisible = true;
    new IntersectionObserver(([en]) => { heroVisible = en.isIntersecting; })
        .observe(document.getElementById('inicio'));

    const RADIO = 190;

    function bucle(ahora) {
        if (heroVisible && !document.hidden) {
            const siguiendo = punteroFino && ahora - ultimoMovimiento < 3000;
            letras.forEach((l, i) => {
                let objetivo;
                if (siguiendo) {
                    const r = l.el.getBoundingClientRect();
                    const d = Math.hypot(r.left + r.width / 2 - punto.x, r.top + r.height / 2 - punto.y);
                    objetivo = Math.pow(Math.max(0, 1 - d / RADIO), 1.4);
                } else {
                    // Ola suave cuando no hay cursor cerca
                    objetivo = (Math.sin(ahora / 650 - i * 0.55) + 1) / 2 * 0.75;
                }
                pintarLetra(l, l.actual + (objetivo - l.actual) * 0.14);
            });
        }
        requestAnimationFrame(bucle);
    }
    requestAnimationFrame(bucle);
} else {
    letras.forEach(l => pintarLetra(l, 0.15));
}

// ---------- Rol que se escribe solo ----------
const typed = document.getElementById('typed');
const frases = [
    'Estudiante de Desarrollo Web',
    'Aprendiendo HTML, CSS y JavaScript',
    'Líder de equipos en tienda',
    'Atención al cliente con empatía'
];

if (!reduceMotion) {
    let f = 0, c = 0, borrando = false;
    function escribir() {
        const frase = frases[f];
        c += borrando ? -1 : 1;
        typed.textContent = frase.slice(0, c);

        let espera = borrando ? 28 : 65;
        if (!borrando && c === frase.length) { borrando = true; espera = 1700; }
        else if (borrando && c === 0) { borrando = false; f = (f + 1) % frases.length; espera = 350; }
        setTimeout(escribir, espera);
    }
    typed.textContent = '';
    setTimeout(escribir, 900);
}

// ---------- Retrato con inclinación 3D ----------
const retrato = document.getElementById('retrato');
const marco = retrato.querySelector('.retrato__marco');

if (punteroFino && !reduceMotion) {
    retrato.addEventListener('pointermove', e => {
        const r = retrato.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        marco.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
    });
    retrato.addEventListener('pointerleave', () => { marco.style.transform = ''; });
}

// Si la foto no carga, muestra las iniciales
const foto = document.getElementById('foto');
const iniciales = document.getElementById('iniciales');
function sinFoto() { foto.hidden = true; iniciales.hidden = false; }
foto.addEventListener('error', sinFoto);
if (foto.complete && foto.naturalWidth === 0) sinFoto();

// ---------- Línea de tiempo desplegable ----------
document.querySelectorAll('.cab').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.closest('li');
        const abierto = item.classList.toggle('abierto');
        btn.setAttribute('aria-expanded', abierto);
    });
});

// ---------- Progreso, botón subir y enlace activo ----------
const progreso = document.getElementById('progreso');
const subir = document.getElementById('subir');
let scrollPendiente = false;

function alScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    progreso.style.setProperty('--p', max > 0 ? Math.min(1, scrollY / max) : 0);
    subir.hidden = scrollY < 500;
    scrollPendiente = false;
}
window.addEventListener('scroll', () => {
    if (!scrollPendiente) { scrollPendiente = true; requestAnimationFrame(alScroll); }
}, { passive: true });
alScroll();

subir.addEventListener('click', () => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

const enlaces = [...document.querySelectorAll('.nav a:not(.nav__marca)')];
const obsMenu = new IntersectionObserver(entradas => {
    entradas.forEach(en => {
        if (en.isIntersecting) {
            enlaces.forEach(a => a.classList.toggle('activo', a.getAttribute('href') === '#' + en.target.id));
        }
    });
}, { rootMargin: '-45% 0px -50% 0px' });
enlaces.forEach(a => {
    const sec = document.querySelector(a.getAttribute('href'));
    if (sec) obsMenu.observe(sec);
});

// ---------- Año del pie ----------
document.getElementById('anio').textContent = new Date().getFullYear();

// ---------- Formulario: contador y validación ----------
const form = document.getElementById('formContacto');
const mensaje = document.getElementById('mensaje');
const contador = document.getElementById('contador');
const estado = document.getElementById('estadoForm');

mensaje.addEventListener('input', () => {
    contador.textContent = `${mensaje.value.length} / ${mensaje.maxLength}`;
});

function validarCampo(campo) {
    const contenedor = campo.closest('.campo');
    const error = contenedor.querySelector('.error');
    let texto = '';

    if (campo.validity.valueMissing) texto = 'Completa este campo para poder enviar el mensaje.';
    else if (campo.validity.typeMismatch) texto = 'Escribe un correo con este formato: nombre@dominio.com.';
    else if (campo.validity.tooShort) texto = `Escribe al menos ${campo.minLength} caracteres.`;

    error.textContent = texto;
    contenedor.classList.toggle('invalido', !!texto);
    return !texto;
}

const campos = [...form.querySelectorAll('input, textarea')];
campos.forEach(c => {
    c.addEventListener('blur', () => validarCampo(c));
    c.addEventListener('input', () => {
        if (c.closest('.campo').classList.contains('invalido')) validarCampo(c);
    });
});

form.addEventListener('submit', e => {
    e.preventDefault();
    const validos = campos.map(validarCampo);

    if (!validos.every(Boolean)) {
        estado.className = 'estado';
        estado.textContent = '';
        campos[validos.indexOf(false)].focus();
        return;
    }

    const nom = form.nombre.value.trim();
    const asunto = encodeURIComponent('Contacto desde tu portafolio - ' + nom);
    const cuerpo = encodeURIComponent(`${form.mensaje.value.trim()}\n\n${nom} (${form.correo.value.trim()})`);
    window.location.href = `mailto:cathecastro14@gmail.com?subject=${asunto}&body=${cuerpo}`;

    estado.className = 'estado ok';
    estado.textContent = 'Se abrió tu aplicación de correo con el mensaje listo para enviar.';
    form.reset();
    contador.textContent = `0 / ${mensaje.maxLength}`;