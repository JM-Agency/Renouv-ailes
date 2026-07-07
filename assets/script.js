(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Nav background state
  var nav = document.querySelector('.nav');
  var onScroll = function () {
    if (window.scrollY > 40) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  onScroll();
  document.addEventListener('scroll', onScroll, { passive: true });

  // Reveal on scroll via IntersectionObserver
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el, i) {
      el.style.animationDelay = (i % 4) * 0.08 + 's';
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Vidéo de fond du hero (home) et des sous-héros (autres pages) — jouée
  // seulement hors reduced-motion ; sans JS ou sous reduced-motion, la vidéo
  // reste sur sa première image (pas d'attribut autoplay dans le HTML), ce
  // qui sert déjà de repli statique.
  if (!reduceMotion) {
    document.querySelectorAll('.hero-video, .subhero-video').forEach(function (video) {
      var playPromise = video.play();
      if (playPromise && playPromise.catch) playPromise.catch(function () {});
    });
  }

  // Fondu différé générique (lede, boutons, tag du hero) — délai fixe au
  // chargement, pas de scroll : chaque élément porte son propre data-delay.
  // Sous reduced-motion, tout est déjà visible via la règle CSS dédiée.
  if (!reduceMotion) {
    document.querySelectorAll('.fade-in-timed').forEach(function (el) {
      var delay = parseInt(el.getAttribute('data-delay'), 10) || 0;
      setTimeout(function () { el.classList.add('is-visible'); }, delay);
    });
  }

  // Titre du hero — révélation caractère par caractère. Le HTML contient du
  // texte brut par défaut (donc lisible sans JS) ; le JS segmente seulement
  // en <span> pour animer par-dessus, jamais sous reduced-motion.
  var heroHeading = document.querySelector('.hero-heading');
  if (heroHeading && !reduceMotion) {
    var heroCharDelay = 30;
    var heroInitialDelay = 200;
    var heroLines = Array.prototype.slice.call(heroHeading.querySelectorAll('.hero-heading-line'));
    heroLines.forEach(function (line, lineIndex) {
      var text = line.textContent;
      line.textContent = '';
      Array.prototype.slice.call(text).forEach(function (ch, charIndex) {
        var span = document.createElement('span');
        span.className = 'hero-char';
        span.textContent = ch === ' ' ? ' ' : ch;
        var delay = heroInitialDelay + lineIndex * text.length * heroCharDelay + charIndex * heroCharDelay;
        span.style.transitionDelay = delay + 'ms';
        line.appendChild(span);
      });
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        heroHeading.classList.add('is-visible');
      });
    });
  }

  // Mobile nav toggle
  var navToggle = document.querySelector('.nav-toggle');
  var mobilePanel = document.querySelector('.nav-mobile');
  if (navToggle && mobilePanel) {
    navToggle.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobilePanel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobilePanel.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Sphère régionale (le-lieu.html) — le Jura dans son contexte (Bâle,
  // Neuchâtel, Alsace, Paris à 3h), projeté à la main en 2D (pas de librairie
  // 3D). Placé AVANT le early-return GSAP ci-dessous car la sphère doit
  // rester visible, figée à son orientation de départ, sous prefers-reduced-
  // motion — contrairement aux autres décors de ce fichier, son état de repos
  // est calculé en JS (distribution de Fibonacci) et non déjà présent dans le
  // CSS/HTML, donc il ne peut pas profiter du early-return comme repli.
  var regionGlobe = document.querySelector('.region-globe');
  if (regionGlobe) {
    var rgSvg = regionGlobe.querySelector('svg');
    var rgCount = 170;
    var rgRadius = 140; // px, dans un viewBox de 360x360
    var rgCenter = 180;
    var rgGoldenAngle = Math.PI * (3 - Math.sqrt(5));
    var rgAccentIndex = Math.floor(rgCount * 0.35); // le Jura, "là où on est"

    var rgPoints = [];
    for (var rgI = 0; rgI < rgCount; rgI++) {
      var rgYUnit = 1 - (rgI / (rgCount - 1)) * 2;
      var rgRadiusAtY = Math.sqrt(Math.max(0, 1 - rgYUnit * rgYUnit));
      var rgTheta = rgGoldenAngle * rgI;
      var rgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      if (rgI === rgAccentIndex) rgCircle.setAttribute('class', 'is-accent');
      rgSvg.appendChild(rgCircle);
      rgPoints.push({
        x: Math.cos(rgTheta) * rgRadiusAtY,
        y: rgYUnit,
        z: Math.sin(rgTheta) * rgRadiusAtY,
        el: rgCircle,
      });
    }

    // Rotation autour de l'axe vertical uniquement (x/z tournent, y fixe),
    // comme une Terre qui tourne sur elle-même. z sert uniquement à moduler
    // opacité et taille pour suggérer le volume (pas d'occlusion complexe).
    var rgRender = function (angle) {
      var cosA = Math.cos(angle);
      var sinA = Math.sin(angle);
      for (var i = 0; i < rgPoints.length; i++) {
        var p = rgPoints[i];
        var rx = p.x * cosA - p.z * sinA;
        var rz = p.x * sinA + p.z * cosA;
        var depth = (rz + 1) / 2; // 0 (arrière, caché) à 1 (avant, visible)
        var r = 1 + depth * 1.4;
        var opacity = 0.12 + depth * 0.78;
        p.el.setAttribute('cx', (rgCenter + rx * rgRadius).toFixed(1));
        p.el.setAttribute('cy', (rgCenter + p.y * rgRadius).toFixed(1));
        p.el.setAttribute('r', r.toFixed(2));
        p.el.style.opacity = opacity.toFixed(2);
      }
    };

    rgRender(0); // orientation de départ — sert aussi de repli reduced-motion/no-js

    if (!reduceMotion && typeof gsap !== 'undefined') {
      var rgPeriod = 50; // secondes pour un tour complet — lent et contemplatif
      var rgSpeed = (Math.PI * 2) / rgPeriod;
      gsap.ticker.add(function (time) {
        rgRender(time * rgSpeed);
      });
    }
  }

  if (reduceMotion || typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  // Teinte narrative des motifs topographiques (accueil uniquement) — de la forêt
  // en haut de page à l'aube en bas, sur la progression de scroll globale.
  // Une seule custom property (--topo-tint), lue par tous les stroke="var(--topo-tint)".
  if (document.querySelector('.hero')) {
    var topoTintFrom = { r: 0x6e, g: 0x85, b: 0x77 }; // --c-moss-400
    var topoTintTo = { r: 0xe2, g: 0x70, b: 0x3a }; // --c-amber-500
    var topoTintRoot = document.documentElement;
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: function (self) {
        var t = self.progress;
        var r = Math.round(topoTintFrom.r + (topoTintTo.r - topoTintFrom.r) * t);
        var g = Math.round(topoTintFrom.g + (topoTintTo.g - topoTintFrom.g) * t);
        var b = Math.round(topoTintFrom.b + (topoTintTo.b - topoTintFrom.b) * t);
        topoTintRoot.style.setProperty('--topo-tint', 'rgb(' + r + ',' + g + ',' + b + ')');
      },
    });
  }

  // Champ de papillons ambiant (accueil) — un pool fixe vit dans les marges pendant
  // tout le scroll ; aucune création/destruction DOM. Une vague continue (pilotée
  // par la progression de scroll globale, comme la teinte narrative ci-dessus)
  // parcourt le pool plusieurs fois sur la hauteur de la page : chaque papillon
  // fond en opacité selon sa distance circulaire à la position courante de la
  // vague, si bien que seuls quelques-uns sont visibles à la fois. Un ticker
  // ajoute une dérive organique déphasée par papillon (même principe que
  // .orbit-card), active en continu qu'il scrolle ou non.
  var butterflyField = document.querySelector('.butterfly-field');
  if (butterflyField) {
    var bfEls = Array.prototype.slice.call(butterflyField.querySelectorAll('.butterfly'));

    // Déphasage aléatoire du battement d'aile et de la respiration au chargement,
    // pour qu'aucun papillon ne batte ou ne respire au même rythme qu'un autre.
    bfEls.forEach(function (bf) {
      var wingL = bf.querySelector('.butterfly-wing-l');
      var wingR = bf.querySelector('.butterfly-wing-r');
      var scaleEl = bf.querySelector('.butterfly-scale');
      wingL.style.animationDelay = -(Math.random() * 0.65) + 's';
      wingR.style.animationDelay = -(Math.random() * 0.65) + 's';
      scaleEl.style.animationDuration = (6 + Math.random() * 4) + 's';
      scaleEl.style.animationDelay = -(Math.random() * 10) + 's';
    });

    // Teinte selon le fond derrière : bascule quand une section sombre ou claire
    // franchit la ligne centrale du viewport (même trick que le scrollspy classique).
    if ('IntersectionObserver' in window) {
      var bfSections = document.querySelectorAll('header.hero, section.block, footer');
      var bfBgObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var dark = entry.target.tagName === 'HEADER' || entry.target.classList.contains('on-dark');
            butterflyField.classList.toggle('is-dark-bg', dark);
          });
        },
        { rootMargin: '-49% 0px -49% 0px', threshold: 0 }
      );
      bfSections.forEach(function (s) { bfBgObserver.observe(s); });
    }

    var bfCount = bfEls.length;
    var bfCycles = 4; // nombre de passages de la vague sur toute la hauteur de page
    var bfWindow = 1.6; // largeur (en indices de pool) de la fenêtre visible autour de la vague
    var bfWavePos = 0;

    var bfCircularDist = function (a, b) {
      var d = Math.abs(a - b) % bfCount;
      return Math.min(d, bfCount - d);
    };

    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: function (self) {
        bfWavePos = (self.progress * bfCycles * bfCount) % bfCount;
      },
    });

    var bfDrift = bfEls.map(function () {
      return {
        ampX: 8 + Math.random() * 10,
        ampY: 10 + Math.random() * 12,
        speedX: (Math.PI * 2) / (9 + Math.random() * 6),
        speedY: (Math.PI * 2) / (9 + Math.random() * 6),
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
      };
    });

    gsap.ticker.add(function (time) {
      for (var i = 0; i < bfCount; i++) {
        var dist = bfCircularDist(i, bfWavePos);
        var opacity = Math.max(0, 1 - dist / bfWindow);
        var d = bfDrift[i];
        gsap.set(bfEls[i], {
          opacity: opacity,
          x: Math.sin(time * d.speedX + d.phaseX) * d.ampX,
          y: Math.sin(time * d.speedY + d.phaseY) * d.ampY,
        });
      }
    });
  }

  // Colonnes de marge (escale-jeune-et-randonnee.html) — deux traces symboliques
  // purement pilotées par la progression de scroll globale (pas d'animation en
  // continu) : les empreintes du groupe qui marche (droite) et les repères du
  // jeûne qui s'amenuisent (gauche). Une position d'activation voyage une seule
  // fois le long de chaque colonne, du premier au dernier emplacement ; chaque
  // élément fond en opacité selon sa distance à cette position.
  var marginTrailRight = document.querySelector('.margin-trail-right');
  var marginTrailLeft = document.querySelector('.margin-trail-left');
  if (marginTrailRight || marginTrailLeft) {
    // Masque les deux colonnes tant que le sous-héro ou le footer est à l'écran,
    // pour qu'elles n'empiètent jamais sur la nav ou le pied de page.
    var mtSubhero = document.querySelector('.subhero');
    var mtFooter = document.querySelector('footer');
    if ('IntersectionObserver' in window && (mtSubhero || mtFooter)) {
      var mtBoundaryObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var hide = entry.isIntersecting;
          if (marginTrailLeft) marginTrailLeft.classList.toggle('is-hidden', hide);
          if (marginTrailRight) marginTrailRight.classList.toggle('is-hidden', hide);
        });
      }, { threshold: 0 });
      if (mtSubhero) mtBoundaryObserver.observe(mtSubhero);
      if (mtFooter) mtBoundaryObserver.observe(mtFooter);
    }

    // Teinte des empreintes selon le fond derrière (même trick de ligne centrale
    // que le champ de papillons de la home).
    if (marginTrailRight && 'IntersectionObserver' in window) {
      var mtSections = document.querySelectorAll('header.subhero, section.block, footer');
      var mtBgObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var dark = entry.target.tagName === 'HEADER' || entry.target.classList.contains('on-dark');
            marginTrailRight.classList.toggle('is-dark-bg', dark);
          });
        },
        { rootMargin: '-49% 0px -49% 0px', threshold: 0 }
      );
      mtSections.forEach(function (s) { mtBgObserver.observe(s); });
    }

    var mtMakeWave = function (container, selector, window_) {
      if (!container) return null;
      var els = Array.prototype.slice.call(container.querySelectorAll(selector));
      return els.length ? { els: els, count: els.length, window: window_ } : null;
    };
    // Fenêtre plus étroite (transition plus rapide) pour les empreintes, plus
    // large (transitions plus longues et espacées) pour les repères du jeûne.
    var mtRight = mtMakeWave(marginTrailRight, '.trail-step', 1.1);
    var mtLeft = mtMakeWave(marginTrailLeft, '.trail-mark', 1.6);

    var mtApplyWave = function (wave, t) {
      if (!wave) return;
      var pos = t * (wave.count - 1);
      for (var i = 0; i < wave.count; i++) {
        var dist = Math.abs(i - pos);
        wave.els[i].style.opacity = Math.max(0, 1 - dist / wave.window);
      }
    };

    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: function (self) {
        mtApplyWave(mtRight, self.progress);
        mtApplyWave(mtLeft, self.progress);
      },
    });
  }

  // Réseau d'équipe — la cohésion du groupe qui se construit du premier au
  // dernier jour. Cycle : formation lâche (dérive) -> traits qui se dessinent
  // un par un -> cohésion tenue -> fondu -> reprise en formation lâche.
  // État de repos CSS = réseau déjà complet et visible, donc rien à ajouter
  // pour le fallback reduced-motion/no-js.
  var teamNetwork = document.querySelector('.team-network');
  if (teamNetwork) {
    var tnDotEls = Array.prototype.slice.call(teamNetwork.querySelectorAll('.team-network-dot'));
    var tnLineEls = Array.prototype.slice.call(teamNetwork.querySelectorAll('.team-network-line'));
    var tnLen = 90;
    var tnCycle = 15; // secondes — une durée de séjour, pas une micro-interaction
    var tnBuildStart = tnCycle * 0.15;
    var tnBuildEnd = tnCycle * 0.75;
    var tnLineDuration = 1.3;
    var tnInterval = (tnBuildEnd - tnBuildStart - tnLineDuration) / (tnLineEls.length - 1);

    gsap.set(tnLineEls, { strokeDasharray: tnLen, strokeDashoffset: tnLen });

    var tnTl = gsap.timeline({ repeat: -1 });
    tnTl.fromTo(teamNetwork, { opacity: 0 }, { opacity: 1, duration: tnCycle * 0.05, ease: 'none' }, 0);
    tnLineEls.forEach(function (line, i) {
      tnTl.fromTo(
        line,
        { strokeDashoffset: tnLen },
        { strokeDashoffset: 0, duration: tnLineDuration, ease: 'none' },
        tnBuildStart + i * tnInterval
      );
    });
    tnTl.to(teamNetwork, { opacity: 0, duration: tnCycle * 0.1, ease: 'none' }, tnCycle * 0.9);

    // Dérive organique et continue de chaque point ; les lignes suivent leurs
    // deux points via data-a/data-b pour ne jamais se détacher visuellement.
    var tnDrift = tnDotEls.map(function (dot) {
      return {
        el: dot,
        baseX: parseFloat(dot.getAttribute('cx')),
        baseY: parseFloat(dot.getAttribute('cy')),
        ampX: 2 + Math.random() * 2,
        ampY: 2 + Math.random() * 2,
        speedX: (Math.PI * 2) / (6 + Math.random() * 5),
        speedY: (Math.PI * 2) / (6 + Math.random() * 5),
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
      };
    });
    gsap.ticker.add(function (time) {
      for (var i = 0; i < tnDrift.length; i++) {
        var d = tnDrift[i];
        d.el.setAttribute('cx', (d.baseX + Math.sin(time * d.speedX + d.phaseX) * d.ampX).toFixed(1));
        d.el.setAttribute('cy', (d.baseY + Math.sin(time * d.speedY + d.phaseY) * d.ampY).toFixed(1));
      }
      for (var j = 0; j < tnLineEls.length; j++) {
        var line = tnLineEls[j];
        var a = tnDotEls[parseInt(line.getAttribute('data-a'), 10)];
        var b = tnDotEls[parseInt(line.getAttribute('data-b'), 10)];
        line.setAttribute('x1', a.getAttribute('cx'));
        line.setAttribute('y1', a.getAttribute('cy'));
        line.setAttribute('x2', b.getAttribute('cx'));
        line.setAttribute('y2', b.getAttribute('cy'));
      }
    });
  }

  // Agitation -> pause -> le rien -> retour. Un GSAP timeline (repeat: -1)
  // orchestre les changements discrets (icônes, teinte de l'anneau, fondu du
  // bouton) ; un ticker lit sa progression courante pour piloter en continu
  // la dérive, le resserrement et la disparition des points, façon .orbit-card.
  var orbitFocus = document.querySelector('.orbit-focus');
  if (orbitFocus) {
    var ofRing = orbitFocus.querySelector('.orbit-focus-ring');
    var ofPlay = orbitFocus.querySelector('.orbit-focus-icon-play');
    var ofPause = orbitFocus.querySelector('.orbit-focus-icon-pause');
    var ofButton = orbitFocus.querySelector('.orbit-focus-button');
    var ofDotEls = Array.prototype.slice.call(orbitFocus.querySelectorAll('.orbit-focus-dot'));
    var ofAmber = '#E2703A'; // var(--c-amber-500)
    var ofMoss = '#3F5344'; // var(--c-moss-600)

    var ofDots = [
      { baseRadius: 48, angularSpeed: (2 * Math.PI) / 9, jitterAmp: 3, jitterSpeed: 1.3, size: 4, angle: 0 },
      { baseRadius: 62, angularSpeed: (2 * Math.PI) / 11, jitterAmp: 4, jitterSpeed: 1.1, size: 5, angle: 0.898 },
      { baseRadius: 55, angularSpeed: (-2 * Math.PI) / 8, jitterAmp: 2.5, jitterSpeed: 1.6, size: 3, angle: 1.795 },
      { baseRadius: 72, angularSpeed: (2 * Math.PI) / 13, jitterAmp: 5, jitterSpeed: 0.9, size: 6, angle: 2.693 },
      { baseRadius: 45, angularSpeed: (-2 * Math.PI) / 10, jitterAmp: 3, jitterSpeed: 1.4, size: 4, angle: 3.59 },
      { baseRadius: 66, angularSpeed: (2 * Math.PI) / 12, jitterAmp: 4, jitterSpeed: 1.0, size: 5, angle: 4.488 },
      { baseRadius: 50, angularSpeed: (-2 * Math.PI) / 9, jitterAmp: 3.5, jitterSpeed: 1.2, size: 3.5, angle: 5.386 },
    ];

    gsap.set(ofPlay, { opacity: 1 });
    gsap.set(ofPause, { opacity: 0 });
    gsap.set(ofRing, { stroke: ofAmber });

    var ofTl = gsap.timeline({ repeat: -1 });
    // 30% : l'agitation cède la place au calme (icônes + teinte de l'anneau)
    ofTl.to(ofPlay, { opacity: 0, duration: 1.6, ease: 'none' }, 6);
    ofTl.to(ofPause, { opacity: 1, duration: 1.6, ease: 'none' }, 6);
    ofTl.to(ofRing, { stroke: ofMoss, duration: 1.6, ease: 'none' }, 6);
    // 85% : le bouton s'estompe jusqu'au rien
    ofTl.to(ofButton, { opacity: 0, duration: 1, ease: 'none' }, 17);
    // pendant l'invisibilité totale (92.5%), on repositionne pour la reprise
    ofTl.set(ofPlay, { opacity: 1 }, 18.5);
    ofTl.set(ofPause, { opacity: 0 }, 18.5);
    ofTl.set(ofRing, { stroke: ofAmber }, 18.5);
    // 95% : retour en fondu doux, jamais un cut visible
    ofTl.to(ofButton, { opacity: 1, duration: 1, ease: 'none' }, 19);

    var ofClamp01 = function (x) { return Math.max(0, Math.min(1, x)); };
    var ofSmoothstep = function (a, b, x) { var u = ofClamp01((x - a) / (b - a)); return u * u * (3 - 2 * u); };
    var ofRadiusScale = function (t) {
      if (t < 0.3) return 1;
      if (t < 0.6) return 1 - 0.6 * ofSmoothstep(0.3, 0.6, t);
      if (t < 0.85) { var u = ofClamp01((t - 0.6) / 0.25); return 0.4 * (1 - Math.pow(u, 1.6)); }
      if (t < 0.95) return 0;
      return ofSmoothstep(0.95, 1, t);
    };
    var ofOpacityScale = function (t) {
      if (t < 0.6) return 1;
      if (t < 0.85) return 1 - ofSmoothstep(0.6, 0.85, t);
      if (t < 0.95) return 0;
      return ofSmoothstep(0.95, 1, t);
    };
    var ofSpeedScale = function (t) {
      if (t < 0.3) return 1;
      if (t < 0.6) return 1 - 0.8 * ofSmoothstep(0.3, 0.6, t);
      if (t < 0.95) return 0.2;
      return 0.2 + 0.8 * ofSmoothstep(0.95, 1, t);
    };

    var ofLastTime = null;
    gsap.ticker.add(function (time) {
      var dt = ofLastTime === null ? 0 : time - ofLastTime;
      ofLastTime = time;
      var t = ofTl.progress();
      var rs = ofRadiusScale(t);
      var os = ofOpacityScale(t);
      var ss = ofSpeedScale(t);
      for (var i = 0; i < ofDots.length; i++) {
        var d = ofDots[i];
        d.angle += d.angularSpeed * ss * dt;
        var jitter = Math.sin(time * d.jitterSpeed + i) * d.jitterAmp * rs;
        var r = d.baseRadius * rs + jitter;
        var x = 100 + Math.cos(d.angle) * r;
        var y = 100 + Math.sin(d.angle) * r;
        var el = ofDotEls[i];
        el.setAttribute('cx', x.toFixed(1));
        el.setAttribute('cy', y.toFixed(1));
        el.setAttribute('r', (d.size * (0.25 + 0.75 * rs)).toFixed(1));
        el.style.opacity = os;
      }
    });
  }

  // Carte-orbite — composant réutilisable : une figure centrale fixe, entourée de
  // points qui dérivent chacun sur son propre cycle (dérive + respiration radiale),
  // déphasage aléatoire au chargement pour que rien ne paraisse synchronisé.
  // Un seul ticker recalcule tous les points de toutes les cartes-orbite de la page.
  var orbitCards = document.querySelectorAll('.orbit-card');
  if (orbitCards.length) {
    var orbitDots = [];
    orbitCards.forEach(function (card) {
      var svg = card.querySelector('svg');
      var box = svg.viewBox.baseVal;
      var centerX = box.width / 2;
      var centerY = box.height / 2;
      card.querySelectorAll('.orbit-dot').forEach(function (dot) {
        var baseCx = parseFloat(dot.getAttribute('data-base-cx'));
        var baseCy = parseFloat(dot.getAttribute('data-base-cy'));
        orbitDots.push({
          el: dot,
          vecX: baseCx - centerX,
          vecY: baseCy - centerY,
          centerX: centerX,
          centerY: centerY,
          ampX: 15 + Math.random() * 10,
          ampY: 15 + Math.random() * 10,
          speedX: (Math.PI * 2) / (8 + Math.random() * 6) * 0.85,
          speedY: (Math.PI * 2) / (8 + Math.random() * 6) * 1.2,
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          radialAmp: 0.12 + Math.random() * 0.1,
          radialSpeed: (Math.PI * 2) / (8 + Math.random() * 6),
          radialPhase: Math.random() * Math.PI * 2,
        });
      });
    });
    gsap.ticker.add(function (time) {
      for (var i = 0; i < orbitDots.length; i++) {
        var d = orbitDots[i];
        var breath = 1 + d.radialAmp * Math.sin(time * d.radialSpeed + d.radialPhase);
        var driftX = d.ampX * Math.sin(time * d.speedX + d.phaseX);
        var driftY = d.ampY * Math.sin(time * d.speedY + d.phaseY);
        d.el.setAttribute('cx', (d.centerX + d.vecX * breath + driftX).toFixed(1));
        d.el.setAttribute('cy', (d.centerY + d.vecY * breath + driftY).toFixed(1));
      }
    });
  }

  // Approche progressive du lieu (le-lieu.html) — le motif régional se resserre
  // vers la carte du lieu au fil du scroll entre les deux sections. L'état de
  // repos (sans transform) EST le rendu "resserré" : from() anime seulement le
  // départ "large", donc rien à faire pour le fallback reduced-motion/no-js.
  var lieuApproachBg = document.querySelector('.lieu-approach .region-zoom-bg');
  var lieuApproachTarget = document.querySelector('.lieu-map');
  if (lieuApproachBg && lieuApproachTarget) {
    gsap.from(lieuApproachBg, {
      scale: 1.5,
      x: -40,
      y: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.lieu-approach',
        start: 'top top',
        endTrigger: lieuApproachTarget,
        end: 'top center',
        scrub: true,
      },
    });
  }

  // Trait de progression des timelines (Avant/Pendant/Après, Matin/Après-midi/Soir) —
  // se remplit au rythme du scroll dans sa propre section, pas sur toute la page.
  gsap.utils.toArray('.timeline').forEach(function (tl) {
    var fill = tl.querySelector('.timeline-fill');
    if (!fill) return;
    gsap.to(fill, {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: tl,
        start: 'top 70%',
        end: 'bottom 60%',
        scrub: true,
      },
    });
  });

  // Petit groupe de marcheurs (carte featured "Escale, jeûne et randonnée")
  // — suit le sentier du milieu des 3 lignes topo de .topo-mini via SMIL
  // animateMotion. Le déphasage entre les points est encodé directement dans
  // le keyPoints/keyTimes de chaque animateMotion (retour 100%→0% instantané,
  // même trick qu'un repeat normal), pas dans un décalage de temps réel :
  // un beginElement() simultané suffit, le groupe est déjà régulièrement
  // espacé dès la première image, sans période de mise en place. Fonction
  // commune réutilisable si d'autres cartes reprennent la même mécanique.
  // Reduced motion : ce bloc entier est ignoré (return plus haut), donc
  // beginElement() n'est jamais appelé et les points restent visibles,
  // immobiles, à leur position de départ sur le sentier (cx/cy de base).
  var initSmilWalkerGroup = function (svg) {
    if (!svg || !('IntersectionObserver' in window)) return;
    var anims = Array.prototype.slice.call(svg.querySelectorAll('.walker animateMotion'));
    if (!anims.length) return;
    var started = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (!started) {
            started = true;
            anims.forEach(function (anim) { anim.beginElement(); });
          }
          if (svg.unpauseAnimations) svg.unpauseAnimations();
        } else if (started && svg.pauseAnimations) {
          svg.pauseAnimations();
        }
      });
    }, { threshold: 0.2 });
    io.observe(svg);
  };
  initSmilWalkerGroup(document.querySelector('.program-card.featured .topo-mini'));

  // Magnetic CTA — small pull toward cursor, communicates interactivity on the primary action
  document.querySelectorAll('.magnetic').forEach(function (btn) {
    var strength = 18;
    btn.addEventListener('mousemove', function (e) {
      var rect = btn.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: (x / rect.width) * strength, y: (y / rect.height) * strength, duration: 0.4, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', function () {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    });
  });
})();
