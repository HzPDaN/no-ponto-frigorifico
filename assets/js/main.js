/* ==================================================================
   No Ponto Frigorífico — comportamentos do site
   Menu, submenus, animações de entrada, contadores, aviso de cookies,
   mapa de cortes interativo e formulários (enviados para enviar.php).
   ================================================================== */
(function () {
  'use strict';

  var raiz = document.documentElement;
  raiz.classList.add('js');

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EN = /^en/i.test(raiz.lang);
  var BASE = window.NP_DADOS || {};
  var DADOS = EN && BASE.traduzir ? BASE.traduzir('en') : BASE;
  var RAIZ_SITE = document.body.getAttribute('data-raiz') || '';
  // Textos da interface em inglês (chave = texto em português)
  var TXT_EN = {
    ' · cortes desta região:': ' · cuts from this region:',
    'Fechar': 'Close', 'Código do produto': 'Product code', 'Descrição': 'Description', 'Marca': 'Brand',
    'Peso aprox.': 'Approx. weight', 'NCM': 'NCM (HS code)', 'Tipo de etiqueta': 'Label type', 'Código de barras': 'Barcode',
    'Corte anterior': 'Previous cut', 'Próximo corte': 'Next cut', 'Solicitar este corte': 'Request this cut',
    'Em breve': 'Coming soon', 'Sob consulta': 'On request', 'Corte': 'Cut', 'Foto do produto': 'Product photo', 'em breve': 'coming soon',
    'Olá! Tenho interesse no corte ': 'Hello! I am interested in the cut ',
    'É preciso concordar para enviar.': 'Please agree before sending.', 'Preencha este campo.': 'Please fill in this field.',
    'Informe um e-mail válido.': 'Please enter a valid e-mail.', 'Informe o telefone com DDD.': 'Please enter the phone number with area code.',
    'Envie um arquivo de até 10 MB.': 'Please send a file of up to 10 MB.', 'Revise os campos destacados.': 'Please check the highlighted fields.',
    'Aguarde alguns segundos antes de enviar de novo.': 'Please wait a few seconds before sending again.', 'Enviando…': 'Sending…',
    'Mensagem enviada! Nossa equipe retornará em breve.': 'Message sent! Our team will get back to you soon.',
    'Não foi possível enviar agora. Tente de novo ou fale pelo WhatsApp ': 'We could not send it right now. Please try again or reach us on WhatsApp '
  };
  var T = function (s) { return (EN && TXT_EN[s]) || s; };
  // Nome do corte em português (as chaves do CATALOGO são em português)
  var PT_DE = {};
  if (EN && BASE.TRAD_EN) Object.keys(BASE.TRAD_EN).forEach(function (k) { PT_DE[BASE.TRAD_EN[k]] = k; });
  var CONTATO = DADOS.CONTATO || {};
  var escapar = function (s) { return String(s).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); };
  var porSlug = {};
  (DADOS.ESPECIES || []).forEach(function (e) { porSlug[e.slug] = e; });

  /* ---------- Cabeçalho ---------- */
  var cab = $('[data-cab]');
  function aoRolar() { if (cab) cab.classList.toggle('is-rolado', window.pageYOffset > 10); }
  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();

  /* ---------- Menu do celular ---------- */
  var botaoMenu = $('.cab__menu');
  function fecharMenu() {
    raiz.classList.remove('menu-aberto');
    if (botaoMenu) botaoMenu.setAttribute('aria-expanded', 'false');
  }
  if (botaoMenu) {
    botaoMenu.addEventListener('click', function () {
      var abrir = !raiz.classList.contains('menu-aberto');
      raiz.classList.toggle('menu-aberto', abrir);
      botaoMenu.setAttribute('aria-expanded', String(abrir));
    });
  }

  /* ---------- Submenus ---------- */
  var itens = $$('.nav__item');
  var desktop = window.matchMedia('(min-width: 1181px)');
  function abrirSub(item, abrir) {
    item.classList.toggle('is-aberto', abrir);
    $('.nav__abre', item).setAttribute('aria-expanded', String(abrir));
  }
  itens.forEach(function (item) {
    var botao = $('.nav__abre', item);
    botao.addEventListener('click', function () {
      var abrir = !item.classList.contains('is-aberto');
      itens.forEach(function (outro) { if (outro !== item) abrirSub(outro, false); });
      abrirSub(item, abrir);
    });
    item.addEventListener('mouseenter', function () { if (desktop.matches) abrirSub(item, true); });
    item.addEventListener('mouseleave', function () { if (desktop.matches) abrirSub(item, false); });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav__item')) itens.forEach(function (i) { abrirSub(i, false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    itens.forEach(function (i) { abrirSub(i, false); });
    fecharMenu();
  });
  $$('.nav a').forEach(function (a) { a.addEventListener('click', fecharMenu); });

  /* ---------- Animação de entrada e contadores ---------- */
  function contar(el) {
    var alvo = parseInt(el.getAttribute('data-contar'), 10);
    if (semMovimento || !alvo) return;
    var inicio = null, dur = 1400;
    function passo(t) {
      if (!inicio) inicio = t;
      var p = Math.min((t - inicio) / dur, 1);
      var v = Math.round(alvo * (1 - Math.pow(1 - p, 3)));
      el.textContent = el.hasAttribute('data-milhar') ? v.toLocaleString(EN ? 'en-US' : 'pt-BR') : v;
      if (p < 1) requestAnimationFrame(passo);
    }
    el.textContent = '0';
    requestAnimationFrame(passo);
  }

  var revelar = $$('[data-revela]');
  var contadores = $$('[data-contar]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        if (el.hasAttribute('data-contar')) contar(el);
        else el.classList.add('is-visivel');
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revelar.forEach(function (el, i) {
      var irmaos = el.parentElement ? $$(':scope > [data-revela]', el.parentElement) : [];
      var ordem = irmaos.indexOf(el);
      if (ordem > 0) el.style.transitionDelay = Math.min(ordem * 90, 450) + 'ms';
      io.observe(el);
    });
    contadores.forEach(function (el) { io.observe(el); });
  } else {
    revelar.forEach(function (el) { el.classList.add('is-visivel'); });
  }

  /* ---------- Aviso de cookies ---------- */
  var aviso = $('[data-aviso]');
  var chaveAviso = 'np-aviso-ok';
  var avisoVisto = false;
  try { avisoVisto = localStorage.getItem(chaveAviso) === '1'; } catch (e) { avisoVisto = false; }
  if (aviso && !avisoVisto) {
    aviso.hidden = false;
    $('[data-aviso-ok]', aviso).addEventListener('click', function () {
      aviso.hidden = true;
      try { localStorage.setItem(chaveAviso, '1'); } catch (e) { /* navegação privada */ }
    });
  }

  /* ---------- Mapa de cortes ---------- */
  var abas = $$('.mapa__aba');
  if (abas.length && DADOS.ESPECIES) {
    function escolherEspecie(slug, atualizarEndereco) {
      if (!porSlug[slug]) return;
      abas.forEach(function (a) { a.setAttribute('aria-selected', String(a.getAttribute('data-especie') === slug)); });
      $$('.mapa__painel').forEach(function (p) { p.hidden = p.getAttribute('data-especie') !== slug; });
      if (atualizarEndereco && history.replaceState) history.replaceState(null, '', '#' + slug);
    }

    function mostrarRegiao(painel, id, fixar) {
      var esp = porSlug[painel.getAttribute('data-especie')];
      var reg = esp && esp.regioes[id];
      if (!reg) return;
      $('[data-titulo]', painel).textContent = reg[0];
      $('[data-parte]', painel).textContent = reg[1] + T(' · cortes desta região:');
      $('[data-cortes]', painel).innerHTML = reg[2].map(function (c) {
        var t = escapar(c);
        return '<li><button type="button" class="corte corte--chip" data-ficha="' + esp.slug + '|' + id + '|' + t + '">' + t + '<span aria-hidden="true">+</span></button></li>';
      }).join('');
      if (fixar) {
        $$('.cm-reg', painel).forEach(function (p) { p.classList.toggle('is-ativo', p.getAttribute('data-regiao') === id); });
        $$('[data-escolher]', painel).forEach(function (b) { b.classList.toggle('is-ativo', b.getAttribute('data-escolher') === id); });
      }
    }

    abas.forEach(function (aba) {
      aba.addEventListener('click', function () { escolherEspecie(aba.getAttribute('data-especie'), true); });
      aba.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        var i = abas.indexOf(aba) + (e.key === 'ArrowRight' ? 1 : -1);
        var prox = abas[(i + abas.length) % abas.length];
        prox.focus();
        escolherEspecie(prox.getAttribute('data-especie'), true);
      });
    });

    $$('.mapa__painel').forEach(function (painel) {
      var ativa = null;
      $$('.cm-reg', painel).forEach(function (p) {
        var id = p.getAttribute('data-regiao');
        p.addEventListener('click', function () { ativa = id; mostrarRegiao(painel, id, true); });
        p.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ativa = id; mostrarRegiao(painel, id, true); }
        });
        p.addEventListener('mouseenter', function () { mostrarRegiao(painel, id, false); });
        p.addEventListener('mouseleave', function () { if (ativa) mostrarRegiao(painel, ativa, false); });
      });
      $$('[data-escolher]', painel).forEach(function (b) {
        var id = b.getAttribute('data-escolher');
        b.addEventListener('click', function () { ativa = id; mostrarRegiao(painel, id, true); });
        b.addEventListener('mouseenter', function () {
          $$('.cm-reg', painel).forEach(function (p) { p.classList.toggle('is-hover', p.getAttribute('data-regiao') === id); });
        });
        b.addEventListener('mouseleave', function () { $$('.cm-reg', painel).forEach(function (p) { p.classList.remove('is-hover'); }); });
      });
    });

    var inicial = location.hash.slice(1);
    if (porSlug[inicial]) {
      escolherEspecie(inicial, false);
      var secaoCortes = document.getElementById('cortes');
      if (secaoCortes) setTimeout(function () { secaoCortes.scrollIntoView(); }, 60);
    }
  }

  /* ---------- Ficha do produto (ao clicar em um corte) ---------- */
  var ficha = null, fichaLista = [], fichaPos = 0, fichaOrigem = null;

  function montarFicha() {
    ficha = document.createElement('dialog');
    ficha.className = 'ficha';
    ficha.setAttribute('aria-labelledby', 'ficha-titulo');
    ficha.innerHTML =
      '<div class="ficha__caixa">' +
        '<button type="button" class="ficha__fechar" data-ficha-fechar aria-label="' + T('Fechar') + '">×</button>' +
        '<div class="ficha__grade">' +
          '<div class="ficha__animal" data-f="animal"></div>' +
          '<div class="ficha__foto" data-f="foto"></div>' +
        '</div>' +
        '<dl class="ficha__dados">' +
          '<div class="ficha__dado--largo"><dt>' + T('Descrição') + '</dt><dd data-f="descricao"></dd></div>' +
          '<div><dt>' + T('Marca') + '</dt><dd data-f="marca"></dd></div>' +
          '<div><dt>' + T('Código do produto') + '</dt><dd data-f="codigo"></dd></div>' +
          '<div><dt>' + T('Peso aprox.') + '</dt><dd data-f="peso"></dd></div>' +
          '<div><dt>' + T('NCM') + '</dt><dd data-f="ncm"></dd></div>' +
          '<div><dt>' + T('Tipo de etiqueta') + '</dt><dd data-f="etiqueta"></dd></div>' +
          '<div><dt>' + T('Código de barras') + '</dt><dd data-f="barras"></dd></div>' +
        '</dl>' +
        '<div class="ficha__base">' +
          '<div><p class="ficha__esp" data-f="especie"></p><h2 id="ficha-titulo" class="ficha__titulo" data-f="nome"></h2></div>' +
          '<div class="ficha__acoes">' +
            '<button type="button" class="ficha__nav" data-ficha-ir="-1" aria-label="' + T('Corte anterior') + '">←</button>' +
            '<button type="button" class="ficha__nav" data-ficha-ir="1" aria-label="' + T('Próximo corte') + '">→</button>' +
            '<a class="btn btn--vermelho" data-f="pedir" target="_blank" rel="noopener">' + T('Solicitar este corte') + '</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ficha);
    ficha.addEventListener('click', function (e) {
      if (e.target === ficha || e.target.closest('[data-ficha-fechar]')) ficha.close();
      var ir = e.target.closest('[data-ficha-ir]');
      if (ir) mostrarFicha(fichaPos + parseInt(ir.getAttribute('data-ficha-ir'), 10));
    });
    ficha.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') mostrarFicha(fichaPos + 1);
      if (e.key === 'ArrowLeft') mostrarFicha(fichaPos - 1);
    });
    ficha.addEventListener('close', function () {
      raiz.classList.remove('ficha-aberta');
      if (fichaOrigem && document.contains(fichaOrigem)) fichaOrigem.focus();
    });
  }

  // Todos os cortes da espécie, na ordem do mapa, para navegar na ficha
  function cortesDaEspecie(esp) {
    var lista = [];
    esp.geo.regioes.forEach(function (r) {
      esp.regioes[r[0]][2].forEach(function (c) { lista.push([esp.slug, r[0], c]); });
    });
    return lista;
  }

  function desenhoAnimal(esp, regId) {
    var fonte = $('.mapa__painel[data-especie="' + esp.slug + '"] .cm-svg') || $('.cortes-mapa__fig .cm-svg');
    if (!fonte) return '';
    var svg = fonte.cloneNode(true);
    $$('.cm-num, .cm-chao, .cm-contato, title', svg).forEach(function (n) { n.parentNode.removeChild(n); });
    $$('.cm-reg', svg).forEach(function (p) {
      p.removeAttribute('tabindex'); p.removeAttribute('role'); p.removeAttribute('aria-label');
      p.classList.remove('is-ativo', 'is-hover');
      p.classList.toggle('is-alvo', p.getAttribute('data-regiao') === regId);
    });
    svg.setAttribute('aria-hidden', 'true');
    var ponto = null;
    esp.geo.regioes.forEach(function (r) { if (r[0] === regId) ponto = r[2]; });
    if (ponto) {
      var ns = 'http://www.w3.org/2000/svg';
      [['ficha__pulso', 16], ['ficha__ponto', 8]].forEach(function (d) {
        var c = document.createElementNS(ns, 'circle');
        c.setAttribute('class', d[0]); c.setAttribute('cx', ponto[0]); c.setAttribute('cy', ponto[1]); c.setAttribute('r', d[1]);
        svg.appendChild(c);
      });
    }
    return svg;
  }

  function mostrarFicha(pos) {
    if (!fichaLista.length) return;
    fichaPos = (pos + fichaLista.length) % fichaLista.length;
    var item = fichaLista[fichaPos];
    var esp = porSlug[item[0]], reg = esp.regioes[item[1]], nome = item[2];
    var cat = (DADOS.CATALOGO || {})[esp.slug + '/' + (PT_DE[nome] || nome)] || {};
    var f = function (k) { return $('[data-f="' + k + '"]', ficha); };
    var marcaPadrao = (esp.marcas && esp.marcas[0]) || 'No Ponto Frigorífico';
    f('descricao').textContent = cat.descricao || (EN ? esp.singular + ' cut · ' + reg[1].toLowerCase() : 'Corte ' + esp.singular.toLowerCase() + ' · ' + reg[1].toLowerCase());
    f('marca').textContent = cat.marca || marcaPadrao;
    f('codigo').textContent = cat.codigo || T('Em breve');
    f('peso').textContent = cat.peso || T('Sob consulta');
    f('ncm').textContent = cat.ncm || T('Em breve');
    f('etiqueta').textContent = cat.etiqueta || T('Em breve');
    f('barras').textContent = cat.barras || T('Em breve');
    f('especie').textContent = esp.singular + ' · ' + reg[0];
    f('nome').textContent = nome;
    var animal = f('animal'); animal.innerHTML = '';
    var desenho = desenhoAnimal(esp, item[1]);
    if (desenho) animal.appendChild(desenho);
    f('foto').innerHTML = cat.foto
      ? '<img src="' + escapar(cat.foto) + '" alt="' + escapar(nome) + '">'
      : '<p class="ficha__vazio"><span>' + T('Foto do produto') + '</span>' + T('em breve') + '</p>';
    f('pedir').href = 'https://wa.me/' + (CONTATO.whatsapp || '') + '?text=' +
      encodeURIComponent(T('Olá! Tenho interesse no corte ') + nome + ' (' + esp.singular.toLowerCase() + ').');
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ficha]');
    if (!b || !porSlug[b.getAttribute('data-ficha').split('|')[0]]) return;
    var p = b.getAttribute('data-ficha').split('|');
    var esp = porSlug[p[0]];
    if (!ficha) montarFicha();
    if (typeof ficha.showModal !== 'function') return;
    fichaOrigem = b;
    fichaLista = cortesDaEspecie(esp);
    var nome = b.textContent.replace(/\+$/, '').trim();
    var pos = 0;
    fichaLista.forEach(function (it, i) { if (it[1] === p[1] && it[2] === nome) pos = i; });
    mostrarFicha(pos);
    raiz.classList.add('ficha-aberta');
    ficha.showModal();
  });

  // Página da espécie: acende a região do animal ao passar o mouse no corte
  var figCortes = $('.cortes-mapa__fig');
  if (figCortes) {
    var acender = function (id) {
      $$('.cm-reg', figCortes).forEach(function (p) { p.classList.toggle('is-hover', p.getAttribute('data-regiao') === id); });
    };
    $$('.cortes [data-ficha]').forEach(function (b) {
      var id = b.getAttribute('data-ficha').split('|')[1];
      b.addEventListener('mouseenter', function () { acender(id); });
      b.addEventListener('focus', function () { acender(id); });
      b.addEventListener('mouseleave', function () { acender(null); });
      b.addEventListener('blur', function () { acender(null); });
    });
  }

  /* ---------- Contato: pré-seleciona o assunto (#comprar / #fale) ---------- */
  function assuntoPeloEndereco() {
    var sel = $('#ct-assunto');
    if (!sel) return;
    var h = location.hash.slice(1);
    if (h === 'comprar') sel.value = 'Comprar produtos';
    if (h === 'fale') sel.value = 'Fale conosco';
  }
  assuntoPeloEndereco();
  window.addEventListener('hashchange', assuntoPeloEndereco);

  /* ---------- Formulários ---------- */
  var INTERVALO_MS = 10000;
  var ultimoEnvio = 0;

  $$('[data-tel]').forEach(function (campo) {
    campo.addEventListener('input', function () {
      var d = campo.value.replace(/\D/g, '').slice(0, 11);
      var v = d;
      if (d.length > 10) v = '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
      else if (d.length > 6) v = '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
      else if (d.length > 2) v = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      else if (d.length) v = '(' + d;
      campo.value = v;
    });
  });

  function erroDoCampo(c) {
    var v = c.type === 'checkbox' ? c.checked : c.value.trim();
    if (c.required && !v) return T(c.type === 'checkbox' ? 'É preciso concordar para enviar.' : 'Preencha este campo.');
    if (c.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return T('Informe um e-mail válido.');
    if (c.hasAttribute('data-tel') && v && v.replace(/\D/g, '').length < 10) return T('Informe o telefone com DDD.');
    if (c.type === 'file' && c.files && c.files[0] && c.files[0].size > 10 * 1024 * 1024) return T('Envie um arquivo de até 10 MB.');
    return '';
  }

  function marcarErro(c, msg) {
    var campo = c.closest('.campo') || c.closest('.aceite');
    if (!campo) return;
    campo.classList.toggle('is-erro', !!msg);
    var slot = $('.campo__erro', campo);
    if (slot) slot.textContent = msg;
    c.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  $$('[data-form]').forEach(function (form) {
    var status = $('.form__status', form);
    var botao = $('[type="submit"]', form);
    var campos = $$('input, select, textarea', form).filter(function (c) { return !c.closest('.armadilha') && c.type !== 'hidden'; });

    campos.forEach(function (c) {
      c.addEventListener('blur', function () { if (c.value || c.closest('.is-erro')) marcarErro(c, erroDoCampo(c)); });
    });

    function avisar(msg, ok) {
      status.textContent = msg;
      status.classList.toggle('is-ok', !!ok);
      status.classList.toggle('is-erro', !ok);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var primeiro = null;
      campos.forEach(function (c) {
        var msg = erroDoCampo(c);
        marcarErro(c, msg);
        if (msg && !primeiro) primeiro = c;
      });
      if (primeiro) { avisar(T('Revise os campos destacados.'), false); primeiro.focus(); return; }
      if (Date.now() - ultimoEnvio < INTERVALO_MS) { avisar(T('Aguarde alguns segundos antes de enviar de novo.'), false); return; }

      botao.disabled = true;
      avisar(T('Enviando…'), true);
      fetch(RAIZ_SITE + 'enviar.php', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (resp) {
          if (!resp || !resp.ok) throw new Error((resp && resp.erro) || 'erro');
          ultimoEnvio = Date.now();
          form.reset();
          avisar(T('Mensagem enviada! Nossa equipe retornará em breve.'), true);
        })
        .catch(function (err) {
          var msg = err && err.message && err.message !== 'erro' && err.message.indexOf('JSON') === -1 && err.message.indexOf('fetch') === -1
            ? err.message
            : T('Não foi possível enviar agora. Tente de novo ou fale pelo WhatsApp ') + (CONTATO.whatsappTexto || '') + '.';
          avisar(msg, false);
        })
        .then(function () { botao.disabled = false; });
    });
  });
})();
