/* ============================================================
   Autodiagnóstico operativo — lógica 100% en cliente.
   Sin fetch, sin cookies, sin localStorage/sessionStorage.
   Todo el estado vive en variables JS en memoria.
   ============================================================ */
(function () {
  'use strict';

  // valor mayor = más resuelto / mejor sistema (0 peor … 3 mejor)
  const QUESTIONS = [
    {
      q: 'Cuando alguien busca un documento o dato, ¿lo encuentra rápido o depende de a quién pregunte?',
      opts: [
        ['Depende totalmente de a quién preguntes', 0],
        ['A veces se encuentra, a veces hay que preguntar', 1],
        ['Casi siempre se encuentra sin preguntar', 2],
        ['Hay un sitio único y se encuentra al instante', 3]
      ]
    },
    {
      q: 'Las decisiones importantes, ¿quedan registradas en un sitio común o viven en chats y correos?',
      opts: [
        ['Viven en chats y correos', 0],
        ['Algunas se anotan, la mayoría no', 1],
        ['Casi todas quedan registradas', 2],
        ['Todo queda documentado en un sitio común', 3]
      ]
    },
    {
      q: 'Si una persona clave se va de vacaciones, ¿el equipo sigue funcionando igual?',
      opts: [
        ['Se nota muchísimo, casi se para', 0],
        ['Cuesta, hay que ir preguntando', 1],
        ['Funciona con algún bache', 2],
        ['Sigue igual: todo está documentado', 3]
      ]
    },
    {
      q: '¿Cada persona organiza su trabajo a su manera o hay un sistema compartido?',
      opts: [
        ['Cada uno a su manera', 0],
        ['Hay intentos, pero poco consenso', 1],
        ['Sistema compartido en parte', 2],
        ['Sistema compartido y seguido por todos', 3]
      ]
    },
    {
      q: '¿Cuántas herramientas distintas usáis a diario para gestionar el trabajo?',
      opts: [
        ['Más de 6, sin conexión entre ellas', 0],
        ['Entre 4 y 6', 1],
        ['2 o 3', 2],
        ['1 o 2 bien integradas', 3]
      ]
    },
    {
      q: 'Cuando entra un cliente o proyecto nuevo, ¿el proceso es siempre el mismo o se improvisa?',
      opts: [
        ['Se improvisa cada vez', 0],
        ['Depende de quién lo lleve', 1],
        ['Hay un proceso, no siempre se sigue', 2],
        ['Proceso claro y repetible siempre', 3]
      ]
    },
    {
      q: '¿Sabéis en tiempo real el estado de cada cliente o proyecto sin tener que preguntar?',
      opts: [
        ['No, hay que preguntar', 0],
        ['Solo algunos, de forma parcial', 1],
        ['Casi siempre, con algo de esfuerzo', 2],
        ['Sí, visible en tiempo real', 3]
      ]
    },
    {
      q: '¿Habéis montado o pensáis montar IA sobre vuestros procesos actuales?',
      opts: [
        ['Ya la usamos sobre lo que hay, aunque esté desordenado', 0],
        ['Queremos montarla ya, sobre lo actual', 1],
        ['Nos lo planteamos; sabemos que hay que ordenar antes', 2],
        ['Primero ordenamos: la IA vendrá sobre base sólida', 3]
      ]
    },
    {
      q: 'La información que daríais a una IA, ¿está ordenada y es fiable, o está dispersa?',
      opts: [
        ['Dispersa y poco fiable', 0],
        ['Parcialmente ordenada', 1],
        ['Bastante ordenada', 2],
        ['Ordenada, centralizada y fiable', 3]
      ]
    },
    {
      q: 'Si tuvierais que demostrar cómo se tomó una decisión hace 3 meses, ¿podríais?',
      opts: [
        ['Imposible, no queda rastro', 0],
        ['Con mucho esfuerzo y algo de suerte', 1],
        ['En parte, reconstruyéndolo', 2],
        ['Sí: queda registrado y es trazable', 3]
      ]
    }
  ];

  const MAX = QUESTIONS.length * 3; // 30

  const BANDS = {
    red: {
      tag: 'Caos operativo',
      color: 'b-red',
      headline: 'El desorden ya os está costando tiempo y dinero.',
      body: 'Aunque no aparezca en ninguna factura, el desorden operativo ya os está costando tiempo y dinero. La buena noticia: cuanto antes se ordene, menos cuesta.',
      step: 'Elige UN solo sitio para las decisiones importantes (un doc, un canal) y úsalo esta semana. Solo eso ya reduce el “¿dónde estaba esto?”.'
    },
    amber: {
      tag: 'Zona de riesgo',
      color: 'b-amber',
      headline: 'Funcionáis, pero el crecimiento empieza a tensar las costuras.',
      body: 'El sistema aguanta el día a día, pero el crecimiento empieza a tensar las costuras. Es el momento de ordenar antes de que duela.',
      step: 'Escribe el proceso de “cliente/proyecto nuevo” en 5 pasos y compártelo con el equipo. Tener UN proceso claro evita la mitad de las improvisaciones.'
    },
    green: {
      tag: 'Sistema sólido',
      color: 'b-green',
      headline: 'Tu base aguanta. El siguiente paso es escalar sin romperla.',
      body: 'Tenéis una base que aguanta. El siguiente paso es escalar sin romperla — y aquí es donde la IA multiplica resultados en vez de multiplicar el caos.',
      step: 'Identifica la tarea repetitiva que más tiempo os come y documentádla. Esa es la primera candidata a automatizar o delegar en IA sobre una base fiable.'
    }
  };

  // ---------- estado en memoria ----------
  const answers = new Array(QUESTIONS.length).fill(null);
  let idx = 0;
  let lastBand = null;

  // ---------- refs ----------
  const screens = {
    hero: document.getElementById('screen-hero'),
    quiz: document.getElementById('screen-quiz'),
    result: document.getElementById('screen-result')
  };
  const mount = document.getElementById('q-mount');
  const fill = document.getElementById('progress-fill');
  const qCurrent = document.getElementById('q-current');
  const backBtn = document.getElementById('back-btn');

  function show(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
    window.scrollTo(0, 0);
  }

  const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7"/></svg>';

  function renderQuestion() {
    const item = QUESTIONS[idx];
    qCurrent.textContent = String(idx + 1);
    // progreso: cuántas respondidas (o posición actual mínima)
    const answeredCount = answers.filter(a => a !== null).length;
    const pct = Math.max((idx) / QUESTIONS.length, answeredCount / QUESTIONS.length) * 100;
    // base visual: nunca del todo vacía (efecto “ya has empezado”)
    fill.style.width = Math.max(6, (idx / QUESTIONS.length) * 100) + '%';

    const card = document.createElement('div');
    card.className = 'q-card';
    let html = '<div class="q-num">PREGUNTA ' + (idx + 1) + ' / ' + QUESTIONS.length + '</div>';
    html += '<div class="q-text">' + item.q + '</div>';
    html += '<div class="options">';
    item.opts.forEach((o, i) => {
      const sel = answers[idx] === o[1] && answers[idx] !== null && selectedIndex() === i;
      html += '<button class="option' + (selectedIndex() === i ? ' selected' : '') + '" data-i="' + i + '" data-val="' + o[1] + '">' +
        '<span class="tick">' + TICK + '</span>' +
        '<span class="otext">' + o[0] + '</span>' +
        '</button>';
    });
    html += '</div>';
    card.innerHTML = html;
    mount.innerHTML = '';
    mount.appendChild(card);

    card.querySelectorAll('.option').forEach(btn => {
      btn.addEventListener('click', () => choose(parseInt(btn.dataset.i, 10), parseInt(btn.dataset.val, 10)));
    });

    backBtn.style.visibility = 'visible';
  }

  // qué índice de opción está seleccionado en la pregunta actual
  let selOptionIdx = new Array(QUESTIONS.length).fill(null);
  function selectedIndex() { return selOptionIdx[idx]; }

  function choose(optIndex, val) {
    answers[idx] = val;
    selOptionIdx[idx] = optIndex;
    // marcar visualmente
    const opts = mount.querySelectorAll('.option');
    opts.forEach((b, i) => b.classList.toggle('selected', i === optIndex));
    // avanzar suave
    setTimeout(() => {
      if (idx < QUESTIONS.length - 1) {
        idx++;
        renderQuestion();
      } else {
        finish();
      }
    }, 320);
  }

  function goBack() {
    if (idx === 0) {
      show('hero');
      return;
    }
    idx--;
    renderQuestion();
  }

  function bandFor(score) {
    const r = score / MAX;
    if (r < 0.45) return 'red';
    if (r < 0.73) return 'amber';
    return 'green';
  }

  function finish() {
    const score = answers.reduce((a, b) => a + (b || 0), 0);
    const key = bandFor(score);
    const band = BANDS[key];

    document.getElementById('r-score').textContent = String(score);
    document.getElementById('r-label').textContent = band.tag;
    document.getElementById('r-tag').textContent = band.tag;
    document.getElementById('r-headline').textContent = band.headline;
    document.getElementById('r-body').textContent = band.body;
    document.getElementById('r-step').textContent = band.step;
    lastBand = band;

    const bandEl = document.getElementById('r-band');
    bandEl.className = 'band ' + band.color;

    const labelColors = { red: 'var(--red)', amber: 'var(--amber-deep)', green: 'var(--green)' };
    document.getElementById('r-label').style.color = labelColors[key];
    document.getElementById('r-score').parentElement.style.color = labelColors[key];

    show('result');
    // animar marcador tras pintar
    const marker = document.getElementById('r-marker');
    marker.style.left = '0%';
    requestAnimationFrame(() => {
      setTimeout(() => { marker.style.left = (score / MAX * 100) + '%'; }, 60);
    });
  }

  function restart() {
    for (let i = 0; i < QUESTIONS.length; i++) { answers[i] = null; selOptionIdx[i] = null; }
    idx = 0;
    show('hero');
  }

  // ---------- wire ----------
  document.getElementById('start-btn').addEventListener('click', () => {
    idx = 0;
    show('quiz');
    renderQuestion();
  });
  backBtn.addEventListener('click', goBack);
  document.getElementById('restart-btn').addEventListener('click', restart);

  // compartir resultado (100% en cliente; no envía ni guarda nada)
  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const tag = lastBand ? lastBand.tag.toLowerCase() : '';
      const url = location.href.split('#')[0];
      const text = 'Acabo de medir si el sistema de trabajo de mi empresa aguanta el crecimiento. Resultado: ' + tag + '. Autodiagnóstico de 2 min, sin registro:';
      try {
        if (navigator.share) {
          await navigator.share({ title: 'Autodiagnóstico operativo', text: text, url: url });
        } else {
          window.open('https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url), '_blank', 'noopener');
        }
      } catch (e) { /* el usuario canceló el diálogo de compartir */ }
    });
  }

  // teclado: flechas para opciones 1-4, backspace atrás
  document.addEventListener('keydown', (e) => {
    if (!screens.quiz.classList.contains('active')) return;
    if (e.key >= '1' && e.key <= '4') {
      const opts = mount.querySelectorAll('.option');
      const n = parseInt(e.key, 10) - 1;
      if (opts[n]) opts[n].click();
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      goBack();
    }
  });
})();
