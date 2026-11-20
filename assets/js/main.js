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
  var DADOS = window.NP_DADOS || {};
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
      el.textContent = Math.round(alvo * (1 - Math.pow(1 - p, 3)));
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
      $('[data-parte]', painel).textContent = reg[1] + ' · cortes desta região:';
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
        '<button type="button" class="ficha__fechar" data-ficha-fechar aria-label="Fechar">×</button>' +
        '<dl class="ficha__dados">' +
          '<div><dt>Código do produto</dt><dd data-f="codigo"></dd></div>' +
          '<div><dt>Descritivo do produto</dt><dd data-f="descricao"></dd></div>' +
          '<div><dt>Peso aprox.</dt><dd data-f="peso"></dd></div>' +
        '</dl>' +
        '<div class="ficha__grade">' +
          '<div class="ficha__animal" data-f="animal"></div>' +
          '<div class="ficha__foto" data-f="foto"></div>' +
        '</div>' +
        '<div class="ficha__base">' +
          '<div><p class="ficha__esp" data-f="especie"></p><h2 id="ficha-titulo" class="ficha__titulo" data-f="nome"></h2></div>' +
          '<div class="ficha__acoes">' +
            '<button type="button" class="ficha__nav" data-ficha-ir="-1" aria-label="Corte anterior">←</button>' +
            '<button type="button" class="ficha__nav" data-ficha-ir="1" aria-label="Próximo corte">→</button>' +
            '<a class="btn btn--vermelho" data-f="pedir" target="_blank" rel="noopener">Solicitar este corte</a>' +
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
    var cat = (DADOS.CATALOGO || {})[esp.slug + '/' + nome] || {};
    var f = function (k) { return $('[data-f="' + k + '"]', ficha); };
    f('codigo').textContent = cat.codigo || 'Em breve';
    f('descricao').textContent = cat.descricao || ('Corte ' + esp.singular.toLowerCase() + ' · ' + reg[1].toLowerCase());
    f('peso').textContent = cat.peso || 'Sob consulta';
    f('especie').textContent = esp.singular + ' · ' + reg[0];
    f('nome').textContent = nome;
    var animal = f('animal'); animal.innerHTML = '';
    var desenho = desenhoAnimal(esp, item[1]);
    if (desenho) animal.appendChild(desenho);
    f('foto').innerHTML = cat.foto
      ? '<img src="' + escapar(cat.foto) + '" alt="' + escapar(nome) + '">'
      : '<p class="ficha__vazio"><span>Foto do produto</span>em breve</p>';
    f('pedir').href = 'https://wa.me/' + (CONTATO.whatsapp || '') + '?text=' +
      encodeURIComponent('Olá! Tenho interesse no corte ' + nome + ' (' + esp.singular.toLowerCase() + ').');
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

  /* ---------- Churrascômetro ---------- */
  var chur = $('[data-churrasco]');
  if (chur && DADOS.CHURRASCO) {
    var C = DADOS.CHURRASCO;
    var saida = $('[data-resultado]');
    var kg = function (g) { return (Math.ceil(g / 100) / 10).toFixed(1).replace('.', ','); };
    var num = function (nome) { var v = parseInt(chur.elements[nome].value, 10); return isNaN(v) || v < 0 ? 0 : Math.min(v, 500); };
    var marcado = function (nome) { var r = $('input[name="' + nome + '"]:checked', chur); return r ? parseFloat(r.value) : 1; };

    function calcular() {
      var adultos = num('adultos'), criancas = num('criancas');
      var fator = marcado('duracao') * marcado('apetite') * (chur.elements.acompanhamentos.checked ? 0.85 : 1);
      var total = (adultos * C.gramasAdulto + criancas * C.gramasCrianca) * fator;
      var cortes = $$('input[name="corte"]:checked', chur);
      var lista = $('[data-lista]', saida);
      if (!cortes.length || !total) {
        $('[data-total]', saida).textContent = '0';
        lista.innerHTML = '<li class="chur__vazio">' + (!total ? 'Informe quantas pessoas vão ao churrasco.' : 'Escolha ao menos um corte.') + '</li>';
        ['carvao', 'sal', 'pao'].forEach(function (k) { $('[data-' + k + ']', saida).textContent = '—'; });
        $('[data-compartilhar]', saida).hidden = true;
        return;
      }
      var porCorte = total / cortes.length;
      var linhas = cortes.map(function (c) { return [c.getAttribute('data-rotulo'), kg(porCorte)]; });
      var totalKg = (Math.ceil(porCorte / 100) * cortes.length) / 10;
      $('[data-total]', saida).textContent = totalKg.toFixed(1).replace('.', ',');
      lista.innerHTML = linhas.map(function (l) { return '<li><span>' + escapar(l[0]) + '</span><strong>' + l[1] + ' kg</strong></li>'; }).join('');
      var carvao = Math.max(3, Math.ceil(totalKg * 1.2 / 3) * 3);
      var sal = Math.max(500, Math.ceil(totalKg / 4) * 250);
      var pao = adultos * 2 + criancas;
      $('[data-carvao]', saida).textContent = carvao + ' kg';
      $('[data-sal]', saida).textContent = (sal >= 1000 ? (sal / 1000).toFixed(1).replace('.', ',') + ' kg' : sal + ' g');
      $('[data-pao]', saida).textContent = pao + ' unid.';
      var texto = 'Meu churrasco (' + adultos + ' adultos' + (criancas ? ', ' + criancas + ' crianças' : '') + '):\n' +
        linhas.map(function (l) { return '• ' + l[0] + ': ' + l[1] + ' kg'; }).join('\n') +
        '\nTotal: ' + totalKg.toFixed(1).replace('.', ',') + ' kg de carne\nCarvão: ' + carvao + ' kg\n\nCalculado no Churrascômetro No Ponto';
      var enviar = $('[data-compartilhar]', saida);
      enviar.hidden = false;
      enviar.href = 'https://wa.me/?text=' + encodeURIComponent(texto);
    }

    $$('[data-mais]', chur).forEach(function (b) {
      b.addEventListener('click', function () {
        var campo = b.parentNode.querySelector('input');
        campo.value = Math.max(0, Math.min(500, (parseInt(campo.value, 10) || 0) + parseInt(b.getAttribute('data-mais'), 10)));
        calcular();
      });
    });
    chur.addEventListener('input', calcular);
    chur.addEventListener('change', calcular);
    chur.addEventListener('submit', function (e) { e.preventDefault(); });
    calcular();
  }

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
    if (c.required && !v) return c.type === 'checkbox' ? 'É preciso concordar para enviar.' : 'Preencha este campo.';
    if (c.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Informe um e-mail válido.';
    if (c.hasAttribute('data-tel') && v && v.replace(/\D/g, '').length < 10) return 'Informe o telefone com DDD.';
    if (c.type === 'file' && c.files && c.files[0] && c.files[0].size > 10 * 1024 * 1024) return 'Envie um arquivo de até 10 MB.';
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
      if (primeiro) { avisar('Revise os campos destacados.', false); primeiro.focus(); return; }
      if (Date.now() - ultimoEnvio < INTERVALO_MS) { avisar('Aguarde alguns segundos antes de enviar de novo.', false); return; }

      botao.disabled = true;
      avisar('Enviando…', true);
      fetch('enviar.php', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (resp) {
          if (!resp || !resp.ok) throw new Error((resp && resp.erro) || 'erro');
          ultimoEnvio = Date.now();
          form.reset();
          avisar('Mensagem enviada! Nossa equipe retornará em breve.', true);
        })
        .catch(function (err) {
          var msg = err && err.message && err.message !== 'erro' && err.message.indexOf('JSON') === -1 && err.message.indexOf('fetch') === -1
            ? err.message
            : 'Não foi possível enviar agora. Tente de novo ou fale pelo WhatsApp ' + (CONTATO.whatsappTexto || '') + '.';
          avisar(msg, false);
        })
        .then(function () { botao.disabled = false; });
    });
  });
})();
